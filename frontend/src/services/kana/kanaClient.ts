import axios, { AxiosInstance, AxiosError } from 'axios';

const KANA_API_URL = import.meta.env.VITE_KANA_API_URL || 'https://api.kanalabs.io';
const KANA_WS_URL = import.meta.env.VITE_KANA_WS_URL || 'wss://ws.kanalabs.io';

// Create axios instance for Kana Labs API
export const kanaClient: AxiosInstance = axios.create({
  baseURL: KANA_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Request interceptor
kanaClient.interceptors.request.use(
  (config) => {
    console.log(`[Kana API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Kana API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
kanaClient.interceptors.response.use(
  (response) => {
    console.log(`[Kana API] Response from ${response.config.url}:`, response.status);
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      console.error('[Kana API] Error response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error('[Kana API] No response received:', error.message);
    } else {
      console.error('[Kana API] Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleKanaError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return `Kana API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      return 'No response from Kana API. Please check your connection.';
    }
  }
  return 'An unexpected error occurred with Kana API.';
};

// WebSocket connection manager
export class KanaWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    try {
      this.ws = new WebSocket(KANA_WS_URL);

      this.ws.onopen = () => {
        console.log('[Kana WS] Connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('[Kana WS] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Kana WS] Error:', error);
        if (onError) onError(error);
      };

      this.ws.onclose = () => {
        console.log('[Kana WS] Disconnected');
        this.attemptReconnect(onMessage, onError);
      };
    } catch (error) {
      console.error('[Kana WS] Connection failed:', error);
    }
  }

  private attemptReconnect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[Kana WS] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      
      setTimeout(() => {
        this.connect(onMessage, onError);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('[Kana WS] Max reconnect attempts reached');
    }
  }

  subscribe(channel: string, params?: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        channel,
        ...params,
      }));
    }
  }

  unsubscribe(channel: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        channel,
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const isKanaConfigured = (): boolean => {
  return Boolean(KANA_API_URL);
};
