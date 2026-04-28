import { SettingsPage } from '../components/templates/SettingsPage.jsx';
import { useSettingsSlice, useReferencesSlice, useProjectsSlice } from '../store';
import { useAuth } from '../hooks/auth';
import { isAdminUser } from '../config/betaLimits';

export function SettingsRoute() {
  const { settings, updateSettings } = useSettingsSlice();
  const { references } = useReferencesSlice();
  const { projects } = useProjectsSlice();
  const { user } = useAuth();
  const usage = isAdminUser(user)
    ? null
    : { references: references.length, projects: projects.length };
  return (
    <SettingsPage
      settings={ settings }
      usage={ usage }
      onChange={ (patch) => updateSettings(patch) }
      onSave={ () => {} }
    />
  );
}
