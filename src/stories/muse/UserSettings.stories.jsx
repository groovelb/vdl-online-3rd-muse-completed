import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { defaultUserSettings } from '../../data/muse';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';

export default {
  title: 'MUSE/Data/UserSettings',
  parameters: { layout: 'padded' },
};

export const Docs = {
  render: () => (
    <>
      <DocumentTitle
        title="UserSettings Dataset"
        status="Available"
        note="Default user settings for MUSE"
        brandName="MUSE"
        systemName="Data"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          UserSettings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
          MUSE 기본 설정 값 (singleton). `defaultUserSettings`로 import.
        </Typography>

        <SectionTitle title="스키마" />
        <TableContainer sx={ { mb: 4 } }>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600 } }>Field</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Type</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Default</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>aiModel</TableCell>
                <TableCell>string</TableCell>
                <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ defaultUserSettings.aiModel }</TableCell>
                <TableCell>태깅/분석에 사용할 AI 모델</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>storageMode</TableCell>
                <TableCell>local | cloud</TableCell>
                <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ defaultUserSettings.storageMode }</TableCell>
                <TableCell>데이터 저장 위치</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>themeMode</TableCell>
                <TableCell>light | dark | system</TableCell>
                <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ defaultUserSettings.themeMode }</TableCell>
                <TableCell>MUSE UI 테마</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>isAutoTagEnabled</TableCell>
                <TableCell>boolean</TableCell>
                <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ String(defaultUserSettings.isAutoTagEnabled) }</TableCell>
                <TableCell>아카이빙 시 자동 태깅</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle title="현재 값" />
        <Box
          component="pre"
          sx={ {
            m: 0,
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 2,
            fontSize: 12,
            fontFamily: 'monospace',
            overflow: 'auto',
          } }
        >
          { JSON.stringify(defaultUserSettings, null, 2) }
        </Box>
      </PageContainer>
    </>
  ),
};
