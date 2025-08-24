import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/app';
import { agentClient } from '../lib/http';
import { createSSEStream } from '../lib/sse';
import { ChatEvent, ChatRequest } from '../types/chat';
import { Copy, StopCircle, Send, AlertCircle } from 'lucide-react';

interface SSEConsoleProps {
  onTranscriptUpdate?: (transcript: string) => void;
}

export default function SSEConsole({ onTranscriptUpdate }: SSEConsoleProps) {
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { 
    sessionId, 
    processChatEvent, 
    setStreaming, 
    setTranscript: setStoreTranscript 
  } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;

    const request: ChatRequest = {
      sessionId,
      message: message.trim(),
    };

    setIsStreaming(true);
    setStreaming(true);
    setError(null);
    setTranscript('');
    
    try {
      const { stream, cancel } = createSSEStream<ChatEvent>(
        `${agentClient.defaults.baseURL}/api/chat/stream`,
        request,
        // agentClient.defaults.headers as Record<string, string> // COMMENTED OUT FOR DEVELOPMENT
        {} // Empty headers for development
      );

      abortControllerRef.current = new AbortController();
      abortControllerRef.current.signal.addEventListener('abort', cancel);

      for await (const event of stream) {
        processChatEvent(event);
        
        switch (event.type) {
          case 'token':
            setTranscript(prev => prev + event.token);
            break;
          case 'tool_call':
            // Could show tool call indicator
            break;
          case 'tool_result':
            // Could show tool result
            break;
          case 'done':
            setIsStreaming(false);
            setStreaming(false);
            setStoreTranscript(transcript);
            if (onTranscriptUpdate) {
              onTranscriptUpdate(transcript);
            }
            return;
        }
      }
    } catch (err) {
      console.error('SSE Error:', err);
      setError(err instanceof Error ? err.message : 'Streaming failed');
      setIsStreaming(false);
      setStreaming(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setStreaming(false);
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStreaming) {
        handleStop();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isStreaming]);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold">Chat with Buddy</h2>
        <div className="flex items-center space-x-2">
          {transcript && (
            <button
              onClick={copyTranscript}
              className="btn-secondary flex items-center px-3 py-2 text-sm"
              title="Copy transcript"
            >
              <Copy className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Copy</span>
            </button>
          )}
          {isStreaming && (
            <button
              onClick={handleStop}
              className="btn-danger flex items-center px-3 py-2 text-sm"
              title="Stop streaming (Esc)"
            >
              <StopCircle className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start md:items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 md:mt-0 flex-shrink-0" />
          <span className="text-red-700 text-sm md:text-base">{error}</span>
        </div>
      )}

      <div className="mb-4">
        <div className="bg-gray-50 rounded-lg p-3 md:p-4 min-h-[150px] md:min-h-[200px] max-h-[300px] md:max-h-[400px] overflow-y-auto">
          {transcript ? (
            <div className="whitespace-pre-wrap text-gray-900 text-sm md:text-base leading-relaxed">{transcript}</div>
          ) : (
            <div className="text-gray-500 italic text-sm md:text-base">
              {isStreaming ? 'Buddy is thinking...' : 'Start a conversation with Buddy'}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isStreaming}
          className="input flex-1 text-sm md:text-base"
          autoFocus
        />
        <button
          type="submit"
          disabled={!message.trim() || isStreaming}
          className="btn-primary flex items-center justify-center px-4 py-2 md:py-3 text-sm md:text-base"
        >
          <Send className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
          Send
        </button>
      </form>

      {isStreaming && (
        <div className="mt-2 text-xs md:text-sm text-gray-500 text-center sm:text-left">
          Press Esc to stop streaming
        </div>
      )}
    </div>
  );
}
