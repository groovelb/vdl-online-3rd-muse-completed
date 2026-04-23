import { SettingsPage } from '../components/templates/SettingsPage.jsx';
import { useSettingsSlice } from '../store';
import { MuseNav } from './MuseNav.jsx';
import { UserMenu } from './UserMenu.jsx';

export function SettingsRoute() {
  const { settings, updateSettings } = useSettingsSlice();
  return (
    <SettingsPage
      logo={ <MuseNav /> }
      headerEnd={ <UserMenu /> }
      settings={ settings }
      onChange={ (patch) => updateSettings(patch) }
      onSave={ () => {} }
    />
  );
}
