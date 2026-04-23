import { useState } from 'react';
import { ProjectDetailPage } from './ProjectDetailPage';
import {
  projectsWithThumbnails,
  getAnalysisResult,
  references as allReferences,
} from '../../data/muse';

export default {
  title: 'Page/ProjectDetailPage',
  component: ProjectDetailPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

const PROJECT = projectsWithThumbnails[0];
const INITIAL_ANALYSIS = getAnalysisResult(PROJECT.id).layers;

export const Default = {
  render: () => {
    const [analysis, setAnalysis] = useState(INITIAL_ANALYSIS);

    const handleUpdate = (layerKey, id, patch) => {
      setAnalysis((prev) => ({
        ...prev,
        [layerKey]: (prev[layerKey] || [])
          .map((t) => (t.id === id ? { ...t, ...patch } : t))
          .filter((t) => !t._removed),
      }));
    };

    return (
      <ProjectDetailPage
        project={ PROJECT }
        analysis={ analysis }
        references={ allReferences }
        onUpdateToken={ handleUpdate }
        onBack={ () => {} }
      />
    );
  },
};

/** 프로젝트 2 — Fintech Dashboard 샘플 */
export const DashboardProject = {
  render: () => {
    const project = projectsWithThumbnails[1];
    const [analysis, setAnalysis] = useState(getAnalysisResult(project.id).layers);

    return (
      <ProjectDetailPage
        project={ project }
        analysis={ analysis }
        references={ allReferences }
        onUpdateToken={ (layer, id, patch) =>
          setAnalysis((prev) => ({
            ...prev,
            [layer]: prev[layer].map((t) => (t.id === id ? { ...t, ...patch } : t)),
          }))
        }
      />
    );
  },
};

/** 최소 샘플 — 컬러 하나만 */
export const Minimal = {
  render: () => {
    const [analysis, setAnalysis] = useState({
      color: [
        { id: 'p', label: 'Primary', hex: '#4F46E5', role: 'primary', isEnabled: true, emphasis: 2 },
      ],
      typography: [],
      layout: [],
      gradient: [],
      visualDirection: { markdown: '# Minimal Project\n\n(간단한 샘플)', tags: { genre: [], style: [], subject: [] } },
    });

    return (
      <ProjectDetailPage
        project={ { id: 'p-min', name: 'Minimal Project', intent: '단일 컬러만 추출', type: 'brand', referenceIds: [] } }
        analysis={ analysis }
        references={ [] }
        onUpdateToken={ (layer, id, patch) =>
          setAnalysis((prev) => ({
            ...prev,
            [layer]: prev[layer].map((t) => (t.id === id ? { ...t, ...patch } : t)),
          }))
        }
      />
    );
  },
};
