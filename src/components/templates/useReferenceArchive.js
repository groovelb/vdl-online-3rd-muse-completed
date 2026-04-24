import { useMemo, useState } from 'react';
import { fileToDataUrl, resizeDataUrl, imageUrlToBase64DataUrl } from '../../utils/museAi';
import { runAutoTag } from '../../utils/museAiTasks';
import { useReferencesSlice } from '../../store';

const EMPTY_TAGS = {
  color: [],
  typography: [],
  layout: [],
  gradient: [],
  visualDirection: { genre: [], style: [], subject: [] },
};

/**
 * useReferenceArchive 훅
 *
 * ArchivePage의 store 의존 로직(업로드 + T1 태깅 + 삭제 + 재시도)을 캡슐화한다.
 * store 모드가 꺼져 있으면 외부 주입된 references / onUploadFile 만 사용한다.
 *
 * 동작 흐름:
 * 1. store 모드일 때 사용자가 파일을 드롭하면 Storage + DB insert 후 백그라운드로 T1 태깅
 * 2. 다중 파일은 동시 3개 배치 처리 — rate limit 방어
 * 3. 업로드 중/에러/완료 상태를 uploadState로 표면화
 * 4. _tagError 카드에서 "다시 시도" 호출 시 T1 태깅만 재수행
 *
 * @param {object}   params
 * @param {boolean}  params.useStoreMode - store 직접 사용 여부
 * @param {array}    [params.externalReferences] - store 미사용 시 표시할 레퍼런스
 * @param {function} [params.onUploadFile] - store 미사용 시 호스트로 위임할 업로드 콜백
 * @returns {{
 *   references: array,
 *   uploadState: { isUploading: boolean, error: ?string, lastId: ?string },
 *   pendingCount: number,
 *   handleUploadFile: (file: File) => Promise<void>,
 *   handleUploadFiles: (files: FileList|File[]) => Promise<void>,
 *   retryTagging: (ref: object) => Promise<void>,
 *   removeReference: (id: string) => Promise<void>,
 * }}
 */
export function useReferenceArchive({ useStoreMode, externalReferences, onUploadFile }) {
  const storeSlice = useReferencesSlice();
  const references = useMemo(
    () => (useStoreMode ? storeSlice.references : (externalReferences || [])),
    [useStoreMode, storeSlice.references, externalReferences],
  );

  const [uploadState, setUploadState] = useState({
    isUploading: false,
    error: null,
    lastId: null,
  });

  const pendingCount = useMemo(
    () => references.filter((r) => r._pending).length,
    [references],
  );

  /**
   * 단일 파일 처리: Storage 업로드 + DB insert → 백그라운드 T1 태깅 → updateReference.
   * Storage/DB 실패 시 1회 재시도 (네트워크 일시 장애 방어).
   */
  const uploadOne = async (file) => {
    const dataUrl = await fileToDataUrl(file);
    const resized = await resizeDataUrl(dataUrl, 512);

    const basePayload = {
      file,
      source: 'file',
      tags: EMPTY_TAGS,
      dominantColors: [],
      extracted: {},
      title: file.name?.replace(/\.[^.]+$/, '') || 'Untitled',
      _pending: true,
    };

    const addWithRetry = async () => {
      try {
        return await storeSlice.addReference(basePayload);
      } catch (e) {
        console.warn('[uploadOne] 1차 실패, 재시도', file.name, e);
        await new Promise((r) => setTimeout(r, 500));
        return await storeSlice.addReference(basePayload);
      }
    };

    const ref = await addWithRetry();

    // T1 태깅 실패는 reference 자체 삭제하지 않음 — _tagError 표시 후 수동 편집 가능
    try {
      const result = await runAutoTag({ imageUrl: resized });
      await storeSlice.updateReference(ref.id, {
        tags: result.tags,
        dominantColors: result.dominantColors,
        title: result.title,
        extracted: result.extracted || {},
        _pending: false,
      });
    } catch (tagError) {
      await storeSlice.updateReference(ref.id, {
        _pending: false,
        _tagError: tagError?.message || String(tagError),
      });
    }
    return ref;
  };

  /** concurrency 제한 배치 실행 — 병렬 폭주로 인한 rate limit/timeout 방어 */
  const runWithConcurrency = async (items, limit, fn) => {
    const results = new Array(items.length);
    let cursor = 0;
    const worker = async () => {
      while (cursor < items.length) {
        const i = cursor;
        cursor += 1;
        try {
          results[i] = { status: 'fulfilled', value: await fn(items[i]), item: items[i] };
        } catch (e) {
          results[i] = { status: 'rejected', reason: e, item: items[i] };
        }
      }
    };
    await Promise.all(Array(Math.min(limit, items.length)).fill(null).map(worker));
    return results;
  };

  /** 단일 파일 업로드 (FileDropzone multiple=false 경로 또는 외부 주입 모드) */
  const handleUploadFile = async (file) => {
    if (!file) return;
    if (!useStoreMode) { onUploadFile?.(file); return; }
    setUploadState({ isUploading: true, error: null, lastId: null });
    try {
      const ref = await uploadOne(file);
      setUploadState({ isUploading: false, error: null, lastId: ref.id });
    } catch (e) {
      setUploadState({ isUploading: false, error: e?.message || String(e), lastId: null });
    }
  };

  /**
   * 다중 파일: 동시 3개씩 배치 처리.
   *   - 무제한 병렬이면 Supabase Storage / Anthropic API rate limit 시 drop 발생
   *   - 최종 실패한 파일명 리스트를 사용자에게 표시
   */
  const handleUploadFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (!useStoreMode) {
      list.forEach((f) => onUploadFile?.(f));
      return;
    }
    setUploadState({ isUploading: true, error: null, lastId: null });

    const results = await runWithConcurrency(list, 3, (f) => uploadOne(f));
    const failed = results.filter((r) => r.status === 'rejected');
    const lastOk = [...results].reverse().find((r) => r.status === 'fulfilled');

    let errorMsg = null;
    if (failed.length) {
      const names = failed.map((r) => r.item?.name || '?').slice(0, 3).join(', ');
      const more = failed.length > 3 ? ` 외 ${failed.length - 3}장` : '';
      errorMsg = `${failed.length}장 업로드 실패: ${names}${more}`;
      console.warn(
        '[handleUploadFiles] 실패 목록',
        failed.map((r) => ({ name: r.item?.name, reason: r.reason?.message })),
      );
    }

    setUploadState({
      isUploading: false,
      error: errorMsg,
      lastId: lastOk?.value?.id || null,
    });
  };

  /**
   * _tagError 카드의 "다시 시도" — T1 호출 재수행.
   *   성공: tags/extracted 채워지고 _tagError 초기화
   *   실패: 새 에러로 갱신
   */
  const retryTagging = async (ref) => {
    try {
      await storeSlice.updateReference(ref.id, { _pending: true, _tagError: null });
      const dataUrl = await imageUrlToBase64DataUrl(ref.thumbnailUrl);
      const resized = await resizeDataUrl(dataUrl, 512);
      const result = await runAutoTag({ imageUrl: resized });
      await storeSlice.updateReference(ref.id, {
        tags: result.tags,
        dominantColors: result.dominantColors,
        title: result.title,
        extracted: result.extracted || {},
        _pending: false,
        _tagError: null,
      });
    } catch (e) {
      await storeSlice.updateReference(ref.id, {
        _pending: false,
        _tagError: e?.message || String(e),
      });
    }
  };

  const removeReference = async (id) => {
    await storeSlice.removeReference(id);
  };

  return {
    references,
    uploadState,
    pendingCount,
    handleUploadFile,
    handleUploadFiles,
    retryTagging,
    removeReference,
  };
}
