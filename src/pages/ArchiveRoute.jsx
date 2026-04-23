import { useNavigate } from 'react-router-dom';
import { ArchivePage } from '../components/templates/ArchivePage.jsx';
import { MuseNav } from './MuseNav.jsx';

export function ArchiveRoute() {
  const navigate = useNavigate();
  return (
    <ArchivePage
      useStoreMode
      logo={ <MuseNav /> }
      onNewProject={ () => navigate('/projects/new') }
    />
  );
}
