import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import { AppShell } from '../layout/AppShell.jsx';
import { PageContainer } from '../layout/PageContainer.jsx';
import { MoodboardCard } from '../card/MoodboardCard.jsx';

const TYPE_LABEL = {
  landing: '랜딩',
  dashboard: '대시보드',
  mobile: '모바일',
  brand: '브랜드',
};

/**
 * ProjectListPage 템플릿
 *
 * MUSE 프로젝트 목록 화면. MoodboardCard를 2x2 썸네일 그리드로 사용해
 * 각 프로젝트의 레퍼런스 미리보기 + 이름 + 유형을 표시.
 *
 * Props:
 * @param {array} projects - 프로젝트 목록 [{ id, name, intent?, type, thumbnails[], createdAt? }] [Required]
 * @param {function} onSelectProject - 프로젝트 클릭 (id) => void [Optional]
 * @param {function} onNewProject - 새 프로젝트 버튼 클릭 [Optional]
 * @param {function} onEditProject - 편집 (id) => void [Optional]
 * @param {function} onDeleteProject - 삭제 (id) => void [Optional]
 * @param {node} logo - AppShell 로고 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProjectListPage
 *   projects={ projects }
 *   onSelectProject={ (id) => navigate(`/projects/${id}`) }
 *   onNewProject={ () => navigate('/projects/new') }
 * />
 */
export function ProjectListPage({
  projects,
  onSelectProject,
  onNewProject,
  onEditProject,
  onDeleteProject,
  logo,
  sx,
}) {
  return (
    <AppShell
      logo={ logo || <Typography variant="h6" sx={ { fontWeight: 700 } }>MUSE</Typography> }
      headerPersistent={
        <Button
          variant="contained"
          color="primary"
          startIcon={ <AddIcon /> }
          onClick={ onNewProject }
        >
          새 프로젝트
        </Button>
      }
      sx={ sx }
    >
      <PageContainer>
        {/* Hero */}
        <Box sx={ { py: { xs: 4, md: 8 } } }>
          <Typography variant="h2" sx={ { mb: 1 } }>Projects</Typography>
          <Typography variant="body1" color="text.secondary" sx={ { maxWidth: 640 } }>
            의도에 따라 큐레이션된 레퍼런스 묶음과 토큰 분석 결과
          </Typography>
        </Box>

        {/* Grid */}
        { projects.length === 0 ? (
          <Box
            sx={ {
              py: 10,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 3,
            } }
          >
            <Typography variant="body1" color="text.secondary" sx={ { mb: 2 } }>
              아직 생성된 프로젝트가 없습니다
            </Typography>
            <Button variant="contained" color="primary" startIcon={ <AddIcon /> } onClick={ onNewProject }>
              첫 프로젝트 만들기
            </Button>
          </Box>
        ) : (
          <Grid container spacing={ 3 }>
            { projects.map((project) => (
              <Grid key={ project.id } size={ { xs: 12, sm: 6, md: 4, lg: 3 } }>
                <Box sx={ { position: 'relative' } }>
                  <MoodboardCard
                    id={ project.id }
                    name={ project.name }
                    description={ project.intent }
                    items={ (project.thumbnails || []).map((src, i) => ({
                      id: `${project.id}-thumb-${i}`,
                      src,
                    })) }
                    createdAt={ project.createdAt }
                    onClick={ () => onSelectProject?.(project.id) }
                    onEdit={ onEditProject ? () => onEditProject(project.id) : undefined }
                    onDelete={ onDeleteProject ? () => onDeleteProject(project.id) : undefined }
                  />
                  { project.type && (
                    <Chip
                      label={ TYPE_LABEL[project.type] || project.type }
                      size="small"
                      color="primary"
                      variant="filled"
                      sx={ {
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        pointerEvents: 'none',
                      } }
                    />
                  ) }
                </Box>
              </Grid>
            )) }
          </Grid>
        ) }

        <Box sx={ { height: 64 } } />
      </PageContainer>
    </AppShell>
  );
}
