import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { ThemeExportDialog } from './ThemeExportDialog';
import {
  projects as allProjects,
  getAnalysisResult,
  references as allReferences,
} from '../../data/muse';

export default {
  title: 'Component/9. Overlay & Feedback/ThemeExportDialog',
  component: ThemeExportDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

const SAMPLE_PROJECT = allProjects[0];
const SAMPLE_ANALYSIS = getAnalysisResult(SAMPLE_PROJECT.id)?.layers;

/** 기본 — Editorial Minimal 프로젝트 샘플 */
export const Default = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Box sx={ { minHeight: 400 } }>
        <Button variant="contained" onClick={ () => setOpen(true) }>
          Export 다이얼로그 열기
        </Button>
        <ThemeExportDialog
          open={ open }
          onClose={ () => setOpen(false) }
          project={ SAMPLE_PROJECT }
          analysis={ SAMPLE_ANALYSIS }
          references={ allReferences }
        />
      </Box>
    );
  },
};

/** Fintech Dashboard 프로젝트 */
export const DashboardProject = {
  render: () => {
    const project = allProjects[1];
    const analysis = getAnalysisResult(project.id)?.layers;
    const [open, setOpen] = useState(true);
    return (
      <Box sx={ { minHeight: 400 } }>
        <ThemeExportDialog
          open={ open }
          onClose={ () => setOpen(false) }
          project={ project }
          analysis={ analysis }
          references={ allReferences }
        />
      </Box>
    );
  },
};

/** Primary 컬러 누락 경고 */
export const MissingPrimaryWarning = {
  render: () => {
    const [open, setOpen] = useState(true);
    const analysis = {
      color: [
        { id: 'c1', label: 'Muted', hex: '#7A798E', isEnabled: true, emphasis: 0 },
      ],
      typography: [],
      layout: [],
      gradient: [],
      visualDirection: { markdown: '', tags: { genre: [], style: [], subject: [] } },
    };
    return (
      <Box sx={ { minHeight: 400 } }>
        <ThemeExportDialog
          open={ open }
          onClose={ () => setOpen(false) }
          project={ { id: 'p-warn', name: 'Missing Primary', intent: '...', type: 'brand', referenceIds: [] } }
          analysis={ analysis }
          references={ [] }
        />
      </Box>
    );
  },
};
