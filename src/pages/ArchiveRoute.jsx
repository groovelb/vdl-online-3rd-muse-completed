import { useNavigate } from 'react-router-dom';
import { ArchivePage } from '../components/templates/ArchivePage.jsx';
import { MuseNav } from './MuseNav.jsx';
import { UserMenu } from './UserMenu.jsx';

export function ArchiveRoute() {
  const navigate = useNavigate();
  return (
    <ArchivePage
      useStoreMode
      logo={ <MuseNav /> }
      headerEnd={ <UserMenu /> }
      onNewProject={ () => navigate('/projects/new') }
    />
  );
}
