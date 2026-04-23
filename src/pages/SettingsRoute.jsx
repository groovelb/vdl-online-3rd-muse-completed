import { SettingsPage } from '../components/templates/SettingsPage.jsx';
import { useSettingsSlice } from '../store';
import { MuseNav } from './MuseNav.jsx';

export function SettingsRoute() {
  const { settings, updateSettings } = useSettingsSlice();
  return (
    <SettingsPage
      logo={ <MuseNav /> }
      settings={ settings }
      onChange={ (patch) => updateSettings(patch) }
      onSave={ () => {} }
    />
  );
}
