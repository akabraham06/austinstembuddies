import { useAuth } from './auth-context';

interface FetchOptions extends RequestInit {
  body?: any;
}

export function useAuthFetch() {
  const { token } = useAuth();

  const authFetch = async (url: string, options: FetchOptions = {}) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
    };

    const response = await fetch(url, config);
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  };

  return authFetch;
} 