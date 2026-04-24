import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectListPage } from '../components/templates/ProjectListPage.jsx';
import { useProjectsSlice, useReferencesSlice } from '../store';
import { MuseNav } from './MuseNav.jsx';
import { UserMenu } from './UserMenu.jsx';

export function ProjectListRoute() {
  const navigate = useNavigate();
  const { projects, removeProject } = useProjectsSlice();
  const { references } = useReferencesSlice();

  // 프로젝트 카드 썸네일을 현재 store references에서 즉시 파생
  const refMap = useMemo(() => Object.fromEntries(references.map((r) => [r.id, r])), [references]);
  const projectsWithThumbnails = useMemo(
    () => projects.map((p) => ({
      ...p,
      thumbnails: (p.referenceIds || [])
        .slice(0, 4)
        .map((id) => refMap[id]?.thumbnailUrl)
        .filter(Boolean),
    })),
    [projects, refMap],
  );

  return (
    <ProjectListPage
      logo={<MuseNav />}
      headerEnd={<UserMenu />}
      projects={projectsWithThumbnails}
      onSelectProject={(id) => navigate(`/projects/${id}`)}
      onNewProject={() => navigate('/projects/new')}
      onDeleteProject={(id) => {
        if (window.confirm('이 프로젝트를 삭제할까요?')) removeProject(id);
      }}
    />
  );
}
