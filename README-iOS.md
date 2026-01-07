# Como Gerar o App iOS do Necro-Tome

## ⚠️ Requisitos Importantes

**Você PRECISA de um Mac com macOS para gerar apps iOS!**

1. **macOS** (versão 12.0 ou superior)
2. **Xcode** (versão 14.0 ou superior)
   - Instale via App Store
   - Abra o Xcode uma vez para aceitar os termos
3. **Conta de Desenvolvedor Apple**
   - Gratuita: Permite testar no seu próprio iPhone
   - Paga ($99/ano): Permite publicar na App Store e usar TestFlight
4. **Node.js** (versão 18 ou superior)

## Método Rápido (Script)

### No macOS:

1. Dê permissão de execução:
   ```bash
   chmod +x gerar-ios.sh
   chmod +x gerar-ipa.sh
   ```

2. Execute o script de configuração:
   ```bash
   ./gerar-ios.sh
   ```

3. Para gerar o IPA:
   ```bash
   ./gerar-ipa.sh
   ```

## Método Manual

### 1. Instalar Capacitor iOS

```bash
npm install --save @capacitor/ios
```

### 2. Construir o Projeto

```bash
npm run build
```

### 3. Inicializar Capacitor (primeira vez)

```bash
npx cap init "Necro-Tome" "com.necro.tome" --web-dir="dist/public"
```

### 4. Adicionar Plataforma iOS

```bash
npx cap add ios
```

### 5. Sincronizar Arquivos

```bash
npx cap sync ios
```

### 6. Abrir no Xcode

```bash
npx cap open ios
```

Ou abra manualmente: `ios/App/App.xcworkspace`

## Gerar o IPA

### Via Xcode (Recomendado)

1. **Abrir o projeto no Xcode:**
   ```bash
   open ios/App/App.xcworkspace
   ```

2. **Configurar Signing:**
   - Selecione o projeto "App" no navegador
   - Vá em "Signing & Capabilities"
   - Selecione seu Team
   - Xcode criará automaticamente um Bundle Identifier

3. **Selecionar dispositivo:**
   - No topo, selecione "Any iOS Device" (não simulador)

4. **Criar Archive:**
   - Menu: `Product > Archive`
   - Aguarde o build terminar

5. **Distribuir o App:**
   - Na janela Organizer que abrir:
     - Clique em "Distribute App"
     - Escolha o método de distribuição

## Métodos de Distribuição

### 1. TestFlight (Recomendado para Testes)

**Requisitos:** Conta de desenvolvedor paga ($99/ano)

1. No Organizer, escolha "App Store Connect"
2. Siga o assistente
3. O app será enviado para App Store Connect
4. Acesse [App Store Connect](https://appstoreconnect.apple.com)
5. Vá em "TestFlight"
6. Adicione testadores internos ou externos
7. Testadores receberão um email com link para instalar

**Vantagens:**
- Fácil de distribuir para testadores
- Atualizações automáticas
- Feedback integrado

### 2. Development (Instalação Direta)

**Requisitos:** Conta de desenvolvedor (gratuita ou paga)

1. No Organizer, escolha "Development"
2. Selecione os dispositivos que podem instalar
3. O .ipa será salvo
4. Transfira para o iPhone via:
   - **Xcode:** Window > Devices and Simulators > Instalar
   - **iTunes/Finder:** Arraste o .ipa
   - **AirDrop:** Compartilhe o arquivo

**Limitações:**
- Apenas 3 dispositivos por conta gratuita
- App expira em 7 dias (gratuita) ou 1 ano (paga)
- Precisa reinstalar quando expirar

### 3. Ad Hoc

**Requisitos:** Conta de desenvolvedor paga

Similar ao Development, mas permite até 100 dispositivos e não expira.

### 4. App Store

**Requisitos:** Conta de desenvolvedor paga + revisão da Apple

Para publicar na App Store oficial.

## Configuração do Servidor para Mobile

Se você quiser que o app acesse um servidor local, edite `capacitor.config.ts`:

```typescript
server: {
  url: 'http://SEU_IP_LOCAL:5000',
  cleartext: true
}
```

**Importante para iOS:**
- iOS requer HTTPS por padrão
- Para HTTP local, adicione exceção no `Info.plist`:
  ```xml
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
  </dict>
  ```

## Troubleshooting

### Erro: "No signing certificate found"

**Solução:**
1. Abra Xcode > Preferences > Accounts
2. Adicione sua conta Apple
3. Selecione seu Team no projeto

### Erro: "Bundle identifier already exists"

**Solução:**
1. Mude o Bundle ID em `capacitor.config.ts`
2. Ou use um ID único como: `com.seunome.necro-tome`

### Erro: "Provisioning profile not found"

**Solução:**
1. No Xcode, vá em Signing & Capabilities
2. Marque "Automatically manage signing"
3. Xcode criará o perfil automaticamente

### App não abre no iPhone

**Solução:**
1. No iPhone: Settings > General > VPN & Device Management
2. Confie no desenvolvedor
3. Tente abrir o app novamente

## Diferenças entre Android e iOS

| Aspecto | Android | iOS |
|---------|---------|-----|
| Sistema Operacional | Windows/Mac/Linux | Apenas macOS |
| Ferramenta | Android Studio | Xcode |
| Custo | Gratuito | Gratuito (teste) / $99/ano (publicação) |
| Distribuição | APK direto | TestFlight ou App Store |
| Assinatura | Opcional (debug) | Obrigatória |

## Links Úteis

- [App Store Connect](https://appstoreconnect.apple.com)
- [TestFlight](https://developer.apple.com/testflight/)
- [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)
- [Apple Developer](https://developer.apple.com)

