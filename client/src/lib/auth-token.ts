const TOKEN_KEY = "necro_tome_auth_token";

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  console.log("🔑 Token salvo no localStorage");
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  console.log("🔑 Token removido do localStorage");
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

