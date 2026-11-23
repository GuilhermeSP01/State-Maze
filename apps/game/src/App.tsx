import { Navigate, Route, Routes } from 'react-router';
import MainMenuPage from './pages/MainMenuPage';
import StagePage from './pages/StagePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenuPage />} />
      <Route path="/stage/:stageId" element={<StagePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
