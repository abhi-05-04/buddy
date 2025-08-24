import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActivityEntry, Metrics, ChatEvent } from '../types/chat';
import { env } from '../env';

interface AppState {
  // Session management
  sessionId: string;
  // jwt: string; // COMMENTED OUT FOR DEVELOPMENT
  baseUrls: {
    agent: string;
    tools: string;
    memory: string;
  };
  ttsAutoplay: boolean;
  
  // Activity tracking
  activity: ActivityEntry[];
  metrics: Metrics;
  
  // Chat state
  isStreaming: boolean;
  currentTranscript: string;
  
  // Actions
  setSessionId: (sessionId: string) => void;
  // setJwt: (jwt: string) => void; // COMMENTED OUT FOR DEVELOPMENT
  setBaseUrls: (urls: { agent: string; tools: string; memory: string }) => void;
  setTtsAutoplay: (autoplay: boolean) => void;
  addActivity: (entry: Omit<ActivityEntry, 'id'>) => void;
  resetActivity: () => void;
  resetMetrics: () => void;
  setStreaming: (streaming: boolean) => void;
  setTranscript: (transcript: string) => void;
  processChatEvent: (event: ChatEvent) => void;
  newSession: () => void;
}

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: generateSessionId(),
      // jwt: env.VITE_JWT, // COMMENTED OUT FOR DEVELOPMENT
      baseUrls: {
        agent: env.VITE_AGENT_URL,
        tools: env.VITE_TOOLS_URL,
        memory: env.VITE_MEMORY_URL,
      },
      ttsAutoplay: env.VITE_TTS_AUTOPLAY,
      
      activity: [],
      metrics: {
        openaiCalls: 0,
        searchCalls: 0,
        tokensEmitted: 0,
        toolCalls: 0,
      },
      
      isStreaming: false,
      currentTranscript: '',
      
      // Actions
      setSessionId: (sessionId) => set({ sessionId }),
      // setJwt: (jwt) => set({ jwt }), // COMMENTED OUT FOR DEVELOPMENT
      setBaseUrls: (baseUrls) => set({ baseUrls }),
      setTtsAutoplay: (ttsAutoplay) => set({ ttsAutoplay }),
      
      addActivity: (entry) => set((state) => ({
        activity: [
          ...state.activity,
          {
            ...entry,
            id: `${entry.timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          },
        ],
      })),
      
      resetActivity: () => set({ activity: [] }),
      resetMetrics: () => set({
        metrics: {
          openaiCalls: 0,
          searchCalls: 0,
          tokensEmitted: 0,
          toolCalls: 0,
        },
      }),
      
      setStreaming: (isStreaming) => set({ isStreaming }),
      setTranscript: (currentTranscript) => set({ currentTranscript }),
      
      processChatEvent: (event) => {
        const { addActivity } = get();
        
        // Add to activity log
        addActivity({
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          type: event.type,
          payload: event,
        });
        
        // Update metrics based on event type
        set((state) => {
          const newMetrics = { ...state.metrics };
          
          switch (event.type) {
            case 'token':
              newMetrics.tokensEmitted++;
              break;
            case 'tool_call':
              newMetrics.toolCalls++;
              if (event.toolName.toLowerCase().includes('search')) {
                newMetrics.searchCalls++;
              }
              break;
            case 'done':
              newMetrics.openaiCalls++;
              break;
          }
          
          return { metrics: newMetrics };
        });
      },
      
      newSession: () => set({
        sessionId: generateSessionId(),
        activity: [],
        currentTranscript: '',
        isStreaming: false,
      }),
    }),
    {
      name: 'buddy-app-storage',
      partialize: (state) => ({
        // jwt: state.jwt, // COMMENTED OUT FOR DEVELOPMENT
        baseUrls: state.baseUrls,
        ttsAutoplay: state.ttsAutoplay,
        metrics: state.metrics,
      }),
    }
  )
);
