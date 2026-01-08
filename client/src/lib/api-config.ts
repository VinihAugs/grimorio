/**
 * Configuração da URL base da API
 * Detecta automaticamente se está rodando no Capacitor (mobile) ou no navegador
 */

// Verifica se está rodando no Capacitor
function isCapacitor(): boolean {
  try {
    // Verifica se o Capacitor está disponível
    if (typeof window !== 'undefined') {
      // @ts-ignore - Capacitor pode não estar disponível em todos os ambientes
      if (window.Capacitor !== undefined || (window as any).Capacitor !== undefined) {
        return true;
      }
      
      // Verifica se está em um ambiente mobile nativo pela URL
      const origin = window.location.origin;
      if (origin.startsWith('capacitor://') || 
          origin.startsWith('ionic://') ||
          origin.startsWith('file://')) {
        return true;
      }
      
      // Verifica pelo user agent (menos confiável, mas útil como fallback)
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

/**
 * Obtém a URL base da API
 * - No mobile (Capacitor): usa a variável de ambiente VITE_API_URL ou URL padrão
 * - No navegador: usa URL relativa (será resolvida pelo proxy do Vite ou servidor)
 */
export function getApiBaseUrl(): string {
  // Se estiver rodando no Capacitor (mobile), precisa de uma URL absoluta
  if (isCapacitor()) {
    // Tenta usar variável de ambiente primeiro (melhor opção para produção)
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      return envUrl.replace(/\/$/, ''); // Remove barra final se houver
    }
    
    // Se não houver variável de ambiente, tenta detectar a URL do servidor
    // No Capacitor, se o servidor estiver configurado no capacitor.config.ts,
    // o window.location.origin apontará para essa URL
    const origin = window.location.origin;
    
    // Se a origem for file:// ou capacitor://, o servidor não está configurado
    // e precisamos de uma URL externa explícita
    if (origin.startsWith('file://') || origin.startsWith('capacitor://')) {
      // Para desenvolvimento local, você DEVE configurar capacitor.config.ts
      // Para produção, você DEVE definir VITE_API_URL
      console.error('❌ API URL não configurada para mobile!');
      console.error('📱 Para desenvolvimento local:');
      console.error('   1. Descubra o IP da sua máquina (ipconfig no Windows, ifconfig no Mac/Linux)');
      console.error('   2. Configure capacitor.config.ts com:');
      console.error('      server: { url: "http://SEU_IP:5000", cleartext: true }');
      console.error('   3. Execute: npx cap sync');
      console.error('📦 Para produção:');
      console.error('   Defina VITE_API_URL durante o build:');
      console.error('   VITE_API_URL=https://seu-servidor.com npm run build');
      console.error('');
      console.error('⚠️ Usando fallback localhost - isso NÃO funcionará no celular!');
      return 'http://localhost:5000'; // Fallback - não funcionará no mobile!
    }
    
    // Se origin for http://localhost, também não funcionará no mobile real
    // mas pode funcionar no emulador
    if (origin.startsWith('http://localhost')) {
      console.warn('⚠️ Usando localhost - isso só funcionará no emulador!');
      console.warn('   Para dispositivo real, configure capacitor.config.ts ou VITE_API_URL');
    }
    
    return origin;
  }
  
  // No navegador, usa URL relativa (será resolvida pelo proxy/servidor)
  return '';
}

/**
 * Cria uma URL completa para um endpoint da API
 */
export function apiUrl(endpoint: string): string {
  // Se a URL já for absoluta (começa com http:// ou https://), retorna como está
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Cria headers com autenticação para requisições
 */
export async function getAuthHeaders(additionalHeaders: HeadersInit = {}): Promise<HeadersInit> {
  const { getToken } = await import("./auth-token");
  const token = getToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

