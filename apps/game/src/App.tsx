import { Navigate, Route, Routes } from 'react-router';
import MainMenuPage, { SettingsPage, UpcomingModePage } from './pages/MainMenuPage';
import CampaignPage from './pages/CampaignPage';
import StagePage from './pages/StagePage';

import { LightingProvider } from './components/LightingPreferences';

export default function App() {
  return (
    <LightingProvider>
      <Routes>
        <Route path="/" element={<MainMenuPage />} />
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/flow" element={<UpcomingModePage mode="flow" />} />
        <Route path="/challenge" element={<UpcomingModePage mode="challenge" />} />
        <Route path="/stage/:stageId" element={<StagePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LightingProvider>
  );
}
