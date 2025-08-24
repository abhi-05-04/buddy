import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { env } from '../env';

// Create axios instances for each service
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    // headers: { // COMMENTED OUT FOR DEVELOPMENT
    //   'Content-Type': 'application/json',
    // },
  });

  // Add auth header if JWT is present (COMMENTED OUT FOR DEVELOPMENT)
  // if (env.VITE_JWT) {
  //   instance.defaults.headers.common['Authorization'] = `Bearer ${env.VITE_JWT}`;
  // }

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add auth header to each request if JWT is present (COMMENTED OUT FOR DEVELOPMENT)
      // if (env.VITE_JWT && !config.headers.Authorization) {
      //   config.headers.Authorization = `Bearer ${env.VITE_JWT}`;
      // }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor with retry logic
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      
      // Retry on network errors (1-2 attempts)
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        if (originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          console.warn(`Retrying request to ${originalRequest.url}`);
          return instance(originalRequest);
        }
      }

      // Handle auth errors (COMMENTED OUT FOR DEVELOPMENT)
      // if (error.response?.status === 401 || error.response?.status === 403) {
      //   console.error('Authentication error:', error.response.status);
      //   // Could trigger auth refresh or redirect to settings
      // }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Export configured instances
export const agentClient = createAxiosInstance(env.VITE_AGENT_URL);
export const toolsClient = createAxiosInstance(env.VITE_TOOLS_URL);
export const memoryClient = createAxiosInstance(env.VITE_MEMORY_URL);

// Helper function to update JWT token (COMMENTED OUT FOR DEVELOPMENT)
export const updateJwtToken = (token: string) => {
  // if (token) {
  //   agentClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //   toolsClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //   memoryClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  // } else {
  //   delete agentClient.defaults.headers.common['Authorization'];
  //   delete toolsClient.defaults.headers.common['Authorization'];
  //   delete memoryClient.defaults.headers.common['Authorization'];
  // }
};

// Helper function to update base URLs
export const updateBaseUrls = (agentUrl: string, toolsUrl: string, memoryUrl: string) => {
  agentClient.defaults.baseURL = agentUrl;
  toolsClient.defaults.baseURL = toolsUrl;
  memoryClient.defaults.baseURL = memoryUrl;
};
