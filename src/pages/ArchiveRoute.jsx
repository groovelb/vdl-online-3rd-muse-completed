import { useNavigate } from 'react-router-dom';
import { ArchivePage } from '../components/templates/ArchivePage.jsx';

export function ArchiveRoute() {
  const navigate = useNavigate();
  return (
    <ArchivePage
      useStoreMode
      onNewProject={ () => navigate('/projects/new') }
    />
  );
}
