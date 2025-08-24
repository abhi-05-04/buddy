import { ChatEvent } from '../types/chat';

export async function* postSSE<TEvent = ChatEvent>(
  url: string, 
  body: any, 
  headers: Record<string, string> = {},
  signal?: AbortSignal
): AsyncGenerator<TEvent, void, unknown> {
  const ctrl = new AbortController();
  
  // Combine abort signals
  if (signal) {
    signal.addEventListener('abort', () => ctrl.abort());
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
      ...headers 
    },
    body: JSON.stringify(body),
    signal: ctrl.signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`SSE start failed: ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buf += decoder.decode(value, { stream: true });
      let idx;
      
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        
        // Parse lines starting with "data:"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data) {
              try {
                const parsed = JSON.parse(data) as TEvent;
                yield parsed;
              } catch (e) {
                console.warn('Failed to parse SSE data:', data, e);
              }
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Helper function to create a cancellable SSE stream
export function createSSEStream<TEvent = ChatEvent>(
  url: string,
  body: any,
  headers: Record<string, string> = {}
) {
  const abortController = new AbortController();
  
  const stream = postSSE<TEvent>(url, body, headers, abortController.signal);
  
  return {
    stream,
    cancel: () => abortController.abort(),
  };
}
