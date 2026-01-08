declare global {
  interface Window {
    Capacitor?: any;
  }
}

function isCapacitor(): boolean {
  try {
    if (typeof window !== 'undefined') {
      if (window.Capacitor !== undefined || (window as any).Capacitor !== undefined) {
        return true;
      }
      
      const origin = window.location.origin;
      if (origin.startsWith('capacitor://') || 
          origin.startsWith('ionic://') ||
          origin.startsWith('file://')) {
        return true;
      }
      
      const ua = navigator.userAgent || '';
      if (/android|ios|iphone|ipad/i.test(ua) && !/chrome|safari|firefox/i.test(ua)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function getApiBaseUrl(): string {
  if (isCapacitor()) {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      return envUrl.replace(/\/$/, '');
    }
    
    const origin = window.location.origin;
    
    if (origin.startsWith('file://') || origin.startsWith('capacitor://')) {
      return 'http://localhost:5000';
    }
    
    return origin;
  }
  
  return '';
}

export function apiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

export async function getAuthHeaders(additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const { getToken } = await import("./auth-token");
  const token = getToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}
