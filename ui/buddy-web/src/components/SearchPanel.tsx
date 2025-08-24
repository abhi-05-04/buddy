import { useState } from 'react';
import { toolsClient } from '../lib/http';
import { SearchResult, ToolExecutionRequest } from '../types/chat';
import { Search, ExternalLink, AlertCircle } from 'lucide-react';

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      // Try the search endpoint first
      const request: ToolExecutionRequest = {
        input: query.trim(),
      };

      const response = await toolsClient.post('/api/tools/execute/web_search', request);
      
      if (response.data.success) {
        // The WebSearchTool returns a string result, not JSON
        const resultText = response.data.result;
        setResults([{
          title: 'Search Results',
          url: '#',
          snippet: resultText,
        }]);
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openResult = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Web Search</h2>

      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start md:items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 md:mt-0 flex-shrink-0" />
          <span className="text-red-700 text-sm md:text-base">{error}</span>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Enter your search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-10 md:pl-12 text-sm md:text-base"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="btn-primary flex items-center justify-center px-4 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
          >
            <Search className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="space-y-4 md:space-y-6">
        {loading && (
          <div className="text-center py-6 md:py-8">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm md:text-base">Searching...</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-3">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </h3>
            <div className="space-y-3 md:space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 md:p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base truncate">
                        {result.title}
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm mb-2 leading-relaxed">
                        {result.snippet}
                      </p>
                      <div className="text-xs text-gray-400">
                        {result.url !== '#' && result.url}
                      </div>
                    </div>
                    <button
                      onClick={() => openResult(result.url)}
                      className="ml-2 md:ml-4 p-1 md:p-2 text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-6 md:py-8 text-gray-500 text-sm md:text-base">
            No results found for "{query}"
          </div>
        )}

        {!loading && results.length === 0 && !query && (
          <div className="text-center py-6 md:py-8 text-gray-500 text-sm md:text-base">
            Enter a search query to get started
          </div>
        )}
      </div>
    </div>
  );
}
