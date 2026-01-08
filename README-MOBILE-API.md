# Configuração da API para Mobile

## Problema

Quando o app roda no celular (via Capacitor), as requisições para `/api/*` não encontram o servidor backend porque o app mobile não tem acesso ao servidor local do desenvolvimento.

## Solução

O código agora detecta automaticamente se está rodando no Capacitor e usa uma URL base configurável para a API.

## Configuração

### Para Desenvolvimento Local (Testando no Celular)

1. Descubra o IP da sua máquina na rede local:
   - **Windows**: Execute `ipconfig` no CMD e procure por "IPv4 Address"
   - **Mac/Linux**: Execute `ifconfig` ou `ip addr` e procure pelo IP da sua interface de rede

2. Configure o `capacitor.config.ts`:
```typescript
server: {
  url: 'http://SEU_IP_LOCAL:5000',
  cleartext: true
}
```

3. Certifique-se de que o servidor está rodando e acessível na rede local:
   - O servidor deve estar escutando em `0.0.0.0` (não apenas `localhost`)
   - Verifique o firewall para permitir conexões na porta 5000

### Para Produção

Para produção, você **DEVE** definir a variável de ambiente `VITE_API_URL` durante o build:

```bash
# Exemplo para build de produção
VITE_API_URL=https://seu-servidor.com npm run build
```

Ou crie um arquivo `.env.production` na raiz do projeto:

```env
VITE_API_URL=https://seu-servidor.com
```

Depois execute:
```bash
npm run build
```

## Como Funciona

O código em `client/src/lib/api-config.ts`:

1. **Detecta automaticamente** se está rodando no Capacitor
2. **No mobile**: Usa `VITE_API_URL` se definido, ou tenta detectar a URL do servidor
3. **No navegador**: Usa URLs relativas (funciona com proxy do Vite ou servidor integrado)

## Verificação

Para verificar se está funcionando:

1. Abra o console do navegador/celular
2. Procure por mensagens de aviso sobre API URL não configurada
3. As requisições devem ir para a URL correta (verifique no Network tab)

## Troubleshooting

### Erro: "Erro no servidor: <!DOCTYPE html>"

Isso significa que o app está recebendo HTML em vez de JSON. Possíveis causas:

1. **URL da API incorreta**: Verifique se `VITE_API_URL` está configurado corretamente
2. **Servidor não acessível**: Verifique se o servidor está rodando e acessível na rede
3. **CORS**: Certifique-se de que o servidor permite requisições do app mobile

### Como verificar a URL sendo usada

Adicione um `console.log` temporário em `api-config.ts`:

```typescript
export function getApiBaseUrl(): string {
  // ... código existente ...
  console.log('API Base URL:', baseUrl); // Adicione esta linha
  return baseUrl;
}
```

