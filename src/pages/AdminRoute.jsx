import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { PageContainer } from '../components/layout/PageContainer.jsx';
import { ImageCard } from '../components/card/ImageCard.jsx';
import { useAuth } from '../hooks/auth';
import { supabase } from '../lib/supabase';
import { flattenTags } from '../data/muse';

/**
 * AdminRoute — 어드민 전용 페이지
 *
 * 어드민 사용자에게만 노출. 좌측 사용자 목록(전체 가입자) → 선택하면 우측에서
 * 해당 유저의 references / projects 를 탭으로 확인. 모든 데이터 조회는 admin RLS
 * 를 신뢰 (RLS 정책: is_admin() 가드).
 */
export function AdminRoute() {
  const { isAdmin, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [tab, setTab] = useState('references');

  const [refs, setRefs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    let canceled = false;
    setLoadingUsers(true);
    supabase
      .rpc('admin_list_users')
      .then(({ data, error }) => {
        if (canceled) return;
        if (error) {
          setUsersError(error.message || String(error));
          setUsers([]);
        } else {
          setUsers(data || []);
          if ((data || []).length > 0) setSelectedUserId(data[0].id);
        }
      })
      .finally(() => {
        if (!canceled) setLoadingUsers(false);
      });
    return () => { canceled = true; };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedUserId) return;
    let canceled = false;
    setDetailLoading(true);
    setDetailError(null);
    Promise.all([
      supabase.from('reference_items').select('*').eq('user_id', selectedUserId).order('created_at', { ascending: false }),
      supabase.from('projects').select('*').eq('user_id', selectedUserId).order('created_at', { ascending: false }),
    ])
      .then(([refRes, projRes]) => {
        if (canceled) return;
        if (refRes.error) throw refRes.error;
        if (projRes.error) throw projRes.error;
        setRefs(refRes.data || []);
        setProjects(projRes.data || []);
      })
      .catch((e) => {
        if (canceled) return;
        setDetailError(e?.message || String(e));
        setRefs([]);
        setProjects([]);
      })
      .finally(() => {
        if (!canceled) setDetailLoading(false);
      });
    return () => { canceled = true; };
  }, [isAdmin, selectedUserId]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId],
  );

  if (authLoading) {
    return (
      <PageContainer>
        <Box sx={ { py: 10, textAlign: 'center' } }>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }
  if (!isAdmin) return <Navigate to="/archive" replace />;

  return (
    <PageContainer>
      <Box sx={ { py: { xs: 3, md: 5 } } }>
        <Typography variant="h3" sx={ { fontWeight: 700, letterSpacing: '-0.02em', mb: 1 } }>
          Admin
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
          모든 사용자의 references / projects 를 조회합니다. 읽기 전용.
        </Typography>

        { usersError && <Alert severity="error" sx={ { mb: 3 } }>{ usersError }</Alert> }

        <Box
          sx={ {
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
            gap: 3,
            alignItems: 'start',
          } }
        >
          {/* 좌: 사용자 목록 */}
          <Box
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
              overflow: 'hidden',
            } }
          >
            <Box sx={ { px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' } }>
              <Typography variant="subtitle2" sx={ { fontWeight: 700 } }>
                Users ({ users.length })
              </Typography>
            </Box>
            { loadingUsers ? (
              <Box sx={ { p: 3, textAlign: 'center' } }><CircularProgress size={ 20 } /></Box>
            ) : users.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={ { p: 3 } }>
                사용자가 없습니다.
              </Typography>
            ) : (
              <Stack divider={ <Box sx={ { borderTop: '1px solid', borderColor: 'divider' } } /> }>
                { users.map((u) => {
                  const isSelected = u.id === selectedUserId;
                  return (
                    <Box
                      key={ u.id }
                      role="button"
                      tabIndex={ 0 }
                      onClick={ () => setSelectedUserId(u.id) }
                      onKeyDown={ (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedUserId(u.id);
                        }
                      } }
                      sx={ {
                        cursor: 'pointer',
                        px: 2,
                        py: 1.5,
                        bgcolor: isSelected ? 'primary.50' : 'transparent',
                        borderLeft: '3px solid',
                        borderLeftColor: isSelected ? 'primary.main' : 'transparent',
                        '&:hover': { bgcolor: isSelected ? 'primary.50' : 'action.hover' },
                      } }
                    >
                      <Typography variant="body2" sx={ { fontWeight: 600 } }>
                        { u.nickname || '(이름 없음)' }
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={ { display: 'block' } }>
                        { u.email }
                      </Typography>
                      <Box sx={ { display: 'flex', gap: 0.5, mt: 0.5 } }>
                        <Chip label={ `Ref ${u.reference_count}` } size="small" variant="outlined" sx={ { height: 18, fontSize: '0.65rem' } } />
                        <Chip label={ `Proj ${u.project_count}` } size="small" variant="outlined" sx={ { height: 18, fontSize: '0.65rem' } } />
                      </Box>
                    </Box>
                  );
                }) }
              </Stack>
            ) }
          </Box>

          {/* 우: 상세 */}
          <Box>
            { selectedUser && (
              <Box sx={ { mb: 3 } }>
                <Typography variant="h5" sx={ { fontWeight: 700 } }>
                  { selectedUser.nickname || '(이름 없음)' }
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  { selectedUser.email } · { selectedUser.id }
                </Typography>
              </Box>
            ) }

            <Tabs value={ tab } onChange={ (_e, v) => setTab(v) } sx={ { mb: 2 } }>
              <Tab value="references" label={ `References (${refs.length})` } />
              <Tab value="projects" label={ `Projects (${projects.length})` } />
            </Tabs>

            { detailError && <Alert severity="error" sx={ { mb: 2 } }>{ detailError }</Alert> }
            { detailLoading ? (
              <Box sx={ { py: 6, textAlign: 'center' } }><CircularProgress size={ 24 } /></Box>
            ) : tab === 'references' ? (
              refs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">레퍼런스 없음</Typography>
              ) : (
                <Box
                  sx={ {
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
                    gap: 2,
                  } }
                >
                  { refs.map((r) => (
                    <ImageCard
                      key={ r.id }
                      src={ r.thumbnail_url }
                      title={ r.title }
                      tags={ flattenTags({ tags: r.tags }).slice(0, 3) }
                      dominantColors={ r.dominant_colors || [] }
                    />
                  )) }
                </Box>
              )
            ) : (
              projects.length === 0 ? (
                <Typography variant="body2" color="text.secondary">프로젝트 없음</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>이름</TableCell>
                      <TableCell>모드</TableCell>
                      <TableCell>의도</TableCell>
                      <TableCell>생성</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    { projects.map((p) => (
                      <TableRow key={ p.id } hover>
                        <TableCell sx={ { fontWeight: 600 } }>{ p.name }</TableCell>
                        <TableCell>
                          <Chip label={ p.mode || '-' } size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={ { color: 'text.secondary', fontSize: '0.8rem' } }>{ p.intent }</TableCell>
                        <TableCell sx={ { color: 'text.secondary', fontSize: '0.8rem' } }>
                          { p.created_at ? new Date(p.created_at).toLocaleString() : '' }
                        </TableCell>
                      </TableRow>
                    )) }
                  </TableBody>
                </Table>
              )
            ) }
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
