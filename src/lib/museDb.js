/**
 * MUSE DB ↔ Frontend 매퍼
 *
 * DB 는 snake_case, 프론트는 camelCase. jsonb 필드(tags, layers)는 구조가 동일.
 * 이미지 thumbnailUrl 은 storage_path 로부터 signed URL 생성.
 */

import { supabase } from './supabase';

const BUCKET = 'references';
const SIGNED_URL_TTL = 3600; // 1h

export async function getSignedUrl(storagePath) {
  if (!storagePath) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL);
  if (error) return null;
  return data?.signedUrl || null;
}

export async function mapReferenceFromDb(row) {
  const thumbnailUrl = row.storage_path
    ? await getSignedUrl(row.storage_path)
    : (row.thumbnail_url || null);
  return {
    id: row.id,
    source: row.source,
    storagePath: row.storage_path || null,
    thumbnailUrl,
    title: row.title || '',
    tags: row.tags || {},
    dominantColors: row.dominant_colors || [],
    extracted: row.extracted || {},
    createdAt: row.created_at,
  };
}

export function mapReferenceToDb(ref, userId) {
  return {
    id: ref.id,
    user_id: userId,
    source: ref.source || 'file',
    storage_path: ref.storagePath || null,
    thumbnail_url: ref.storagePath ? null : (ref.thumbnailUrl || null),
    title: ref.title || null,
    tags: ref.tags || {},
    dominant_colors: ref.dominantColors || [],
    extracted: ref.extracted || {},
  };
}

export function mapProjectFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    intent: row.intent || '',
    type: row.type,
    referenceIds: Array.isArray(row.project_references)
      ? row.project_references.map((pr) => pr.reference_id)
      : [],
    createdAt: row.created_at,
  };
}

export function mapProjectToDb(project, userId) {
  return {
    id: project.id,
    user_id: userId,
    name: project.name,
    intent: project.intent || '',
    type: project.type,
  };
}

export function mapAnalysisFromDb(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    layers: row.layers || {},
    status: row.status || 'done',
    updatedAt: row.updated_at,
  };
}

export function mapAnalysisToDb(analysis) {
  return {
    id: analysis.id,
    project_id: analysis.projectId,
    layers: analysis.layers || {},
    status: analysis.status || 'done',
  };
}

export function mapSettingsFromDb(row) {
  if (!row) {
    return {
      aiModel: 'claude-sonnet-4-6',
      storageMode: 'cloud',
      themeMode: 'system',
      isAutoTagEnabled: true,
    };
  }
  return {
    aiModel: row.ai_model,
    storageMode: row.storage_mode,
    themeMode: row.theme_mode,
    isAutoTagEnabled: row.is_auto_tag_enabled,
  };
}

export function mapSettingsToDb(patch) {
  const out = {};
  if ('aiModel' in patch) out.ai_model = patch.aiModel;
  if ('storageMode' in patch) out.storage_mode = patch.storageMode;
  if ('themeMode' in patch) out.theme_mode = patch.themeMode;
  if ('isAutoTagEnabled' in patch) out.is_auto_tag_enabled = patch.isAutoTagEnabled;
  return out;
}

/**
 * 파일 업로드 → Storage 에 저장 + storage_path 반환
 */
export async function uploadReferenceImage(file, userId, referenceId) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/${referenceId}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
  if (error) throw error;
  return path;
}

export async function deleteReferenceImage(storagePath) {
  if (!storagePath) return;
  await supabase.storage.from(BUCKET).remove([storagePath]);
}
