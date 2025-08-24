interface Env {
  VITE_AGENT_URL: string;
  VITE_TOOLS_URL: string;
  VITE_MEMORY_URL: string;
  // VITE_JWT: string; // COMMENTED OUT FOR DEVELOPMENT
  VITE_TTS_AUTOPLAY: boolean;
}

function getEnvVar(key: keyof Env, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

function getBooleanEnvVar(key: keyof Env, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key, defaultValue.toString());
  return value.toLowerCase() === 'true';
}

export const env: Env = {
  VITE_AGENT_URL: getEnvVar('VITE_AGENT_URL', 'http://localhost:8080'),
  VITE_TOOLS_URL: getEnvVar('VITE_TOOLS_URL', 'http://localhost:8083'),
  VITE_MEMORY_URL: getEnvVar('VITE_MEMORY_URL', 'http://localhost:8082'),
  // VITE_JWT: getEnvVar('VITE_JWT', ''), // COMMENTED OUT FOR DEVELOPMENT
  VITE_TTS_AUTOPLAY: getBooleanEnvVar('VITE_TTS_AUTOPLAY', true),
};

// Validate URLs
Object.entries(env).forEach(([key, value]) => {
  if (key.includes('URL') && value) {
    try {
      new URL(value);
    } catch {
      console.warn(`Invalid URL in ${key}: ${value}`);
    }
  }
});
