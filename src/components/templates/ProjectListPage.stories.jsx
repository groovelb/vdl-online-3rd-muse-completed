import { ProjectListPage } from './ProjectListPage';
import { projectsWithThumbnails } from '../../data/muse';
import { withAppShell } from '../../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/2. Project & Wizard/ProjectListPage',
  component: ProjectListPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withAppShell],
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
