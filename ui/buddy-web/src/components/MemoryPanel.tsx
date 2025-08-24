import { useState, useEffect } from 'react';
import { memoryClient } from '../lib/http';
import { MemoryMessage, ContextRequest } from '../types/chat';
import { useAppStore } from '../store/app';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function MemoryPanel() {
  const [messages, setMessages] = useState<MemoryMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sessionId } = useAppStore();

  useEffect(() => {
    fetchMemory();
  }, [sessionId]);

  const fetchMemory = async () => {
    try {
      setLoading(true);
      const request: ContextRequest = {
        sessionId,
        limit: 20,
      };

      const response = await memoryClient.post('/api/memory/context', request);
      setMessages(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching memory:', err);
      setError('Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'user':
        return <span className="badge-user">User</span>;
      case 'assistant':
        return <span className="badge-assistant">Assistant</span>;
      case 'tool':
        return <span className="badge-tool">Tool</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-800">{role}</span>;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold">Conversation Memory</h2>
        <button
          onClick={fetchMemory}
          disabled={loading}
          className="btn-secondary flex items-center justify-center px-4 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start md:items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 md:mt-0 flex-shrink-0" />
          <span className="text-red-700 text-sm md:text-base">{error}</span>
        </div>
      )}

      <div className="text-xs md:text-sm text-gray-600 mb-4">
        Session: {sessionId.slice(0, 8)}...
      </div>

      <div className="space-y-3 md:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">
            No conversation history found for this session
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="border border-gray-200 rounded-lg p-3 md:p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-1 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  {getRoleBadge(message.role)}
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
              <div className="text-gray-900 whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
