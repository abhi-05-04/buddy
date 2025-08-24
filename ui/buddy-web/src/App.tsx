import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAppStore } from './store/app';
import { 
  MessageSquare, 
  Mic, 
  FileText, 
  Search, 
  Brain, 
  Activity, 
  Settings,
  Plus
} from 'lucide-react';
import ChatPage from './pages/ChatPage';
import VoicePage from './pages/VoicePage';
import NotesPage from './pages/NotesPage';
import SearchPage from './pages/SearchPage';
import MemoryPage from './pages/MemoryPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';

const navigation = [
  { name: 'Chat', href: '/', icon: MessageSquare },
  { name: 'Voice', href: '/voice', icon: Mic },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Memory', href: '/memory', icon: Brain },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function NavBar() {
  const location = useLocation();
  const { sessionId, newSession } = useAppStore();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Buddy</h1>
            <div className="ml-6 flex items-center space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Session: {sessionId.slice(0, 8)}...
            </div>
            <button
              onClick={newSession}
              className="btn-secondary flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/voice" element={<VoicePage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
