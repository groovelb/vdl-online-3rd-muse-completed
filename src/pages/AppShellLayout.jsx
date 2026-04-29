import { useEffect } from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AppShell } from '../components/layout/AppShell.jsx';
import { MuseNav } from './MuseNav.jsx';
import { UserMenu } from './UserMenu.jsx';
import { BetaNoticeDialog } from './auth/BetaNoticeDialog.jsx';
import { ArchiveRoute } from './ArchiveRoute.jsx';
import { ProjectListRoute } from './ProjectListRoute.jsx';
import { useReferencesSlice } from '../store';
import { preloadImages, evictUnused } from '../utils/imagePreloadCache.js';

/**
 * AppShellLayout — Protected 라우트 공통 레이아웃 + keep-alive
 *
 * 라우트 이동마다 컴포넌트가 unmount/remount 되며 발생하는 이미지 깜빡임을 막기 위해
 * 핵심 탐색 라우트(/archive, /projects)를 항상 마운트한 상태로 두고 display 만 토글한다.
 * 그 외 라우트(/projects/new, /projects/:id, /settings, /admin)는 일반 Outlet 으로 흐른다.
 *
 * 부수 효과:
 * - references.thumbnailUrl 을 메모리 캐시에 preload
 * - keep-alive 라우트의 DOM, 스크롤 외 상태, MUI Masonry 측정 결과 보존 → 재방문 시 깜빡임 0
 */
export function AppShellLayout() {
  const { references } = useReferencesSlice();

  useEffect(() => {
    const urls = (references || []).map((r) => r.thumbnailUrl).filter(Boolean);
    preloadImages(urls);
    evictUnused(urls);
  }, [references]);

  const isArchive = !!useMatch('/archive');
  const isProjectList = !!useMatch('/projects');
  // keep-alive 라우트 중 하나가 활성이면 Outlet 은 숨김 (이중 렌더 방지)
  const showOutlet = !isArchive && !isProjectList;

  return (
    <AppShell
      logo={ <MuseNav /> }
      headerPersistent={ <UserMenu /> }
    >
      <Box sx={ { display: isArchive ? 'block' : 'none' } }>
        <ArchiveRoute />
      </Box>
      <Box sx={ { display: isProjectList ? 'block' : 'none' } }>
        <ProjectListRoute />
      </Box>
      { showOutlet && <Outlet /> }
      <BetaNoticeDialog />
    </AppShell>
  );
}
