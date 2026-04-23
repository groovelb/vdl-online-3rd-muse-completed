import { useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useAuth, useSignOut } from '../hooks/auth';

/**
 * UserMenu — 우측 상단 아바타 드롭다운
 *
 * 이메일/계정 정보는 dropdown 내부로 이동 → GNB 상단이 깔끔.
 */
export function UserMenu() {
  const { user } = useAuth();
  const { signOut } = useSignOut();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  if (!user) return null;

  const initial = (user.email || '?').charAt(0).toUpperCase();

  return (
    <>
      <IconButton
        onClick={ (e) => setAnchor(e.currentTarget) }
        size="small"
        aria-label="계정 메뉴"
        sx={ { p: 0.5 } }
      >
        <Avatar
          sx={ {
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '0.85rem',
            fontWeight: 600,
          } }
        >
          { initial }
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={ anchor }
        open={ open }
        onClose={ () => setAnchor(null) }
        anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
        transformOrigin={ { vertical: 'top', horizontal: 'right' } }
        slotProps={ { paper: { sx: { mt: 1, minWidth: 220, borderRadius: 2 } } } }
      >
        <Box sx={ { px: 2, py: 1.5 } }>
          <Typography variant="caption" color="text.secondary" sx={ { display: 'block' } }>
            로그인 계정
          </Typography>
          <Typography variant="body2" sx={ { fontWeight: 500, wordBreak: 'break-all' } }>
            { user.email }
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={ () => { setAnchor(null); signOut(); } }
          sx={ { py: 1.25 } }
        >
          로그아웃
        </MenuItem>
      </Menu>
    </>
  );
}
