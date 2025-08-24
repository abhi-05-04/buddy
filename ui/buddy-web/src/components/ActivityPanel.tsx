import { useState } from 'react';
import { useAppStore } from '../store/app';
import { ActivityEntry } from '../types/chat';
import { Download, Filter, Search, RefreshCw } from 'lucide-react';

export default function ActivityPanel() {
  const { activity, metrics, resetActivity, resetMetrics } = useAppStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const exportActivity = () => {
    const dataStr = JSON.stringify(activity, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buddy-activity-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredActivity = activity.filter(entry => {
    const matchesType = filterType === 'all' || entry.type === filterType;
    const matchesSearch = searchQuery === '' || 
      JSON.stringify(entry.payload).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'token':
        return '🔤';
      case 'tool_call':
        return '🔧';
      case 'tool_result':
        return '✅';
      case 'done':
        return '🏁';
      default:
        return '📝';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'token':
        return 'bg-blue-100 text-blue-800';
      case 'tool_call':
        return 'bg-purple-100 text-purple-800';
      case 'tool_result':
        return 'bg-green-100 text-green-800';
      case 'done':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold">Activity Log</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={exportActivity}
            disabled={activity.length === 0}
            className="btn-secondary flex items-center justify-center px-3 py-2 text-sm"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
          <button
            onClick={resetActivity}
            className="btn-secondary flex items-center justify-center px-3 py-2 text-sm"
          >
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-blue-600">{metrics.openaiCalls}</div>
          <div className="text-xs md:text-sm text-blue-700">OpenAI Calls</div>
        </div>
        <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-purple-600">{metrics.searchCalls}</div>
          <div className="text-xs md:text-sm text-purple-700">Search Calls</div>
        </div>
        <div className="bg-green-50 p-3 md:p-4 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-green-600">{metrics.toolCalls}</div>
          <div className="text-xs md:text-sm text-green-700">Tool Calls</div>
        </div>
        <div className="bg-orange-50 p-3 md:p-4 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-orange-600">{metrics.tokensEmitted}</div>
          <div className="text-xs md:text-sm text-orange-700">Tokens Emitted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 md:pl-12 text-sm md:text-base"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input text-sm md:text-base"
          >
            <option value="all">All Events</option>
            <option value="token">Tokens</option>
            <option value="tool_call">Tool Calls</option>
            <option value="tool_result">Tool Results</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3 md:space-y-4 max-h-[400px] md:max-h-[500px] overflow-y-auto">
        {filteredActivity.length === 0 ? (
          <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">
            {activity.length === 0 ? 'No activity yet' : 'No events match your filters'}
          </div>
        ) : (
          filteredActivity.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-3 md:p-4"
            >
              <div className="flex items-start space-x-2 md:space-x-3">
                <div className="text-xl md:text-2xl flex-shrink-0">{getEventIcon(entry.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                    <span className={`badge ${getEventColor(entry.type)} text-xs`}>
                      {entry.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900">
                    <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(entry.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
