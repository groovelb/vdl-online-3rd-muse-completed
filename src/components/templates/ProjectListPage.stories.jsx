import { ProjectListPage } from './ProjectListPage';
import { projectsWithThumbnails } from '../../data/muse';

export default {
  title: 'Page/ProjectListPage',
  component: ProjectListPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export const Default = {
  render: () => (
    <ProjectListPage
      projects={ projectsWithThumbnails }
      onSelectProject={ () => {} }
      onNewProject={ () => {} }
      onEditProject={ () => {} }
      onDeleteProject={ () => {} }
    />
  ),
};

export const EmptyState = {
  render: () => (
    <ProjectListPage
      projects={ [] }
      onNewProject={ () => {} }
    />
  ),
};
