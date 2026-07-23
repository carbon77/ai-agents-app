import { Route, Routes } from 'react-router-dom';
import { AgentsPage } from './pages/AgentsPage';
import { ChatPage } from './pages/ChatPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AgentsPage />} />
      <Route path="/chat/:agentId" element={<ChatPage />} />
    </Routes>
  );
}
