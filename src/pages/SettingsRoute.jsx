import { SettingsPage } from '../components/templates/SettingsPage.jsx';
import { useSettingsSlice } from '../store';

export function SettingsRoute() {
  const { settings, updateSettings } = useSettingsSlice();
  return (
    <SettingsPage
      settings={ settings }
      onChange={ (patch) => updateSettings(patch) }
      onSave={ () => {} }
    />
  );
}
