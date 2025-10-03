import axios, { AxiosInstance, AxiosError } from 'axios';

const NODIT_API_KEY = import.meta.env.VITE_NODIT_API_KEY;
const NODIT_BASE_URL = import.meta.env.VITE_NODIT_BASE_URL || 'https://aptos-testnet.nodit.io/v1';

// Create axios instance with default config
export const noditClient: AxiosInstance = axios.create({
  baseURL: NODIT_BASE_URL,
  headers: {
    'X-API-KEY': NODIT_API_KEY || '',
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
noditClient.interceptors.request.use(
  (config) => {
    console.log(`[Nodit API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Nodit API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
noditClient.interceptors.response.use(
  (response) => {
    console.log(`[Nodit API] Response from ${response.config.url}:`, response.status);
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('[Nodit API] Error response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });

      // Handle rate limiting
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        console.warn(`[Nodit API] Rate limited. Retry after: ${retryAfter}s`);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('[Nodit API] No response received:', error.message);
    } else {
      // Error in request setup
      console.error('[Nodit API] Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleNoditError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return `Nodit API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      return 'No response from Nodit API. Please check your connection.';
    }
  }
  return 'An unexpected error occurred with Nodit API.';
};

// Check if Nodit is configured
export const isNoditConfigured = (): boolean => {
  return Boolean(NODIT_API_KEY && NODIT_API_KEY !== 'your_nodit_api_key_here');
};
