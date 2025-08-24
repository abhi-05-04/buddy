// Chat Request/Response Types
export interface ChatRequest {
  sessionId: string;
  message: string;
  attachments?: any[];
}

// Chat Event Union Type
export type ChatEvent = TokenEvent | ToolCallEvent | ToolResultEvent | DoneEvent;

export interface TokenEvent {
  type: 'token';
  token: string;
  sessionId: string;
  timestamp: number;
}

export interface ToolCallEvent {
  type: 'tool_call';
  toolName: string;
  toolInput: string;
  sessionId: string;
  timestamp: number;
}

export interface ToolResultEvent {
  type: 'tool_result';
  toolName: string;
  result: string;
  success: boolean;
  sessionId: string;
  timestamp: number;
}

export interface DoneEvent {
  type: 'done';
  summary?: string;
  sessionId: string;
  timestamp: number;
}

// Memory Types
export interface MemoryMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: number;
}

export interface ContextRequest {
  sessionId: string;
  limit?: number;
}

// Notes Types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}

// Search Types
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Activity Types
export interface ActivityEntry {
  id: string;
  timestamp: number;
  sessionId: string;
  type: string;
  payload: any;
}

export interface Metrics {
  openaiCalls: number;
  searchCalls: number;
  tokensEmitted: number;
  toolCalls: number;
}

// Voice Types
export interface VoiceSttRequest {
  file: File;
}

export interface VoiceTtsRequest {
  text: string;
}

// Tool Types
export interface ToolResult {
  success: boolean;
  result: string;
  error?: string;
}

export interface ToolExecutionRequest {
  input: string;
}
