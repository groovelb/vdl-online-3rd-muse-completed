import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth, useSignOut } from '../hooks/auth';
import { useSettingsSlice } from '../store';

/**
 * UserMenu — GNB 우측: ThemeSelector + 아바타 드롭다운(Settings/로그아웃 포함)
 */
export function UserMenu() {
  const { user } = useAuth();
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  if (!user) return null;

  const initial = (user.email || '?').charAt(0).toUpperCase();

  const goSettings = () => {
    setAnchor(null);
    navigate('/settings');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <ThemeSelector />
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        size="small"
        aria-label="계정 메뉴"
        sx={{ p: 0.5 }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {initial}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 2 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            로그인 계정
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={goSettings} sx={{ py: 1.25 }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => { setAnchor(null); signOut(); }}
          sx={{ py: 1.25 }}
        >
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText>로그아웃</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: SettingsBrightnessIcon },
  { value: 'light', label: 'Light', icon: LightModeIcon },
  { value: 'dark', label: 'Dark', icon: DarkModeIcon },
];

/**
 * ThemeSelector — GNB 우측 인라인 테마 선택기
 *
 * 현재 모드 아이콘 → 클릭 시 system/light/dark 메뉴.
 * settings.themeMode 와 양방향 바인딩.
 */
function ThemeSelector() {
  const { settings, updateSettings } = useSettingsSlice();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const current = settings?.themeMode || 'system';
  const CurrentIcon = (THEME_OPTIONS.find((o) => o.value === current) || THEME_OPTIONS[0]).icon;

  const select = (value) => {
    setAnchor(null);
    if (value !== current) updateSettings({ themeMode: value });
  };

  return (
    <>
      <Tooltip title={`테마: ${current}`}>
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          size="small"
          aria-label="테마 선택"
          aria-haspopup="menu"
          aria-expanded={open}
          sx={{ color: 'text.secondary' }}
        >
          <CurrentIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 160, borderRadius: 2 } } }}
      >
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <MenuItem
              key={opt.value}
              selected={opt.value === current}
              onClick={() => select(opt.value)}
              sx={{ py: 1 }}
            >
              <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
              <ListItemText>{opt.label}</ListItemText>
              {opt.value === current && <CheckIcon fontSize="small" sx={{ ml: 1, color: 'primary.main' }} />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
