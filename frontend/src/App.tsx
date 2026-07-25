import { Route, Routes } from 'react-router-dom';
import { AgentsPage } from './pages/AgentsPage';
import { CalendaryPage } from './pages/CalendaryPage';
import { ChatPage } from './pages/ChatPage';
import { ModelsPage } from './pages/ModelsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AgentsPage />} />
      <Route path="/models" element={<ModelsPage />} />
      <Route path="/chat/calendar" element={<CalendaryPage />} />
      <Route path="/chat/:agentId" element={<ChatPage />} />
    </Routes>
  );
}
