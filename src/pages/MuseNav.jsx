import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth, useSignOut } from '../hooks/auth';

const NAV_ITEMS = [
  { to: '/archive', label: 'Archive' },
  { to: '/projects', label: 'Projects' },
  { to: '/settings', label: 'Settings' },
];

export function MuseNav() {
  const { user } = useAuth();
  const { signOut } = useSignOut();

  return (
    <Box sx={ { display: 'flex', alignItems: 'center', gap: 3, width: '100%' } }>
      <NavLink to="/archive" style={ { textDecoration: 'none' } }>
        <Typography variant="h6" sx={ { fontWeight: 700, color: 'text.primary' } }>
          MUSE
        </Typography>
      </NavLink>
      <Box sx={ { display: 'flex', gap: 2 } }>
        { NAV_ITEMS.map((item) => (
          <NavLink
            key={ item.to }
            to={ item.to }
            style={ { textDecoration: 'none' } }
          >
            { ({ isActive }) => (
              <Typography
                variant="body2"
                sx={ {
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'text.primary' : 'text.secondary',
                  '&:hover': { color: 'text.primary' },
                } }
              >
                { item.label }
              </Typography>
            ) }
          </NavLink>
        )) }
      </Box>
      { user && (
        <Box sx={ { ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 } }>
          <Typography variant="body2" color="text.secondary">
            { user.email }
          </Typography>
          <Button size="small" variant="text" onClick={ signOut }>
            로그아웃
          </Button>
        </Box>
      ) }
    </Box>
  );
}
