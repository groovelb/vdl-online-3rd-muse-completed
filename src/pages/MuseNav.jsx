import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAuth } from '../hooks/auth';

const NAV_ITEMS = [
  { to: '/archive', label: 'Archive' },
  { to: '/projects', label: 'Projects' },
];

/**
 * MuseNav — GNB 좌측 영역 (로고 + 네비게이션)
 *
 * 유저 메뉴는 `<UserMenu>` 로 분리되어 AppShell 의 headerPersistent 로 우측 배치.
 */
export function MuseNav() {
  const { isAdmin } = useAuth();
  const items = isAdmin ? [...NAV_ITEMS, { to: '/admin', label: 'Admin' }] : NAV_ITEMS;
  return (
    <Box sx={ { display: 'flex', alignItems: 'center', gap: 4 } }>
      <NavLink to="/archive" style={ { textDecoration: 'none' } }>
        <Typography variant="h6" sx={ { fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' } }>
          MUSE
        </Typography>
      </NavLink>
      <Box sx={ { display: 'flex', gap: 3 } }>
        { items.map((item) => (
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
                  transition: 'color 150ms',
                  '&:hover': { color: 'text.primary' },
                } }
              >
                { item.label }
              </Typography>
            ) }
          </NavLink>
        )) }
      </Box>
    </Box>
  );
}
