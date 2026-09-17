import { useState } from 'react';
import { SettingsPage } from './SettingsPage';
import { defaultUserSettings } from '../../data/muse';
import { withAppShell } from '../../stories/decorators/museDecorators.jsx';

export default {
  title: 'Custom Component/7. Shell & Routes/SettingsPage',
  component: SettingsPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withAppShell],
};

export const Default = {
  render: () => {
    const [settings, setSettings] = useState(defaultUserSettings);
    return (
      <SettingsPage
        settings={ settings }
        onChange={ (patch) => setSettings((prev) => ({ ...prev, ...patch })) }
        onSave={ () => {} }
      />
    );
  },
};

export const CloudStorage = {
  render: () => {
    const [settings, setSettings] = useState({
      ...defaultUserSettings,
      storageMode: 'cloud',
      aiModel: 'claude-opus-4-7',
    });
    return (
      <SettingsPage
        settings={ settings }
        onChange={ (patch) => setSettings((prev) => ({ ...prev, ...patch })) }
        onSave={ () => {} }
      />
    );
  },
};
