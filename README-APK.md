# Como Gerar o APK do Necro-Tome

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Java JDK** (versão 17 ou superior)
   - Download: https://adoptium.net/
3. **Android Studio** (opcional, mas recomendado)
   - Download: https://developer.android.com/studio
4. **Android SDK** configurado
   - Configure a variável de ambiente `ANDROID_HOME`
   - Exemplo: `C:\Users\SeuUsuario\AppData\Local\Android\Sdk`

## Método Rápido (Script .bat)

1. Execute o arquivo `gerar-apk.bat`
2. O script irá:
   - Instalar dependências
   - Instalar Capacitor
   - Construir o projeto
   - Configurar Android
3. Siga as instruções no final do script

## Método Manual

### 1. Instalar Capacitor

```bash
npm install --save @capacitor/core @capacitor/cli @capacitor/android
```

### 2. Construir o Projeto

```bash
npm run build
```

### 3. Inicializar Capacitor (primeira vez)

```bash
npx cap init "Necro-Tome" "com.necro.tome" --web-dir="dist/public"
```

### 4. Adicionar Plataforma Android

```bash
npx cap add android
```

### 5. Sincronizar Arquivos

```bash
npx cap sync android
```

### 6. Gerar o APK

**Opção A: Usando Android Studio (Recomendado)**
1. Abra o Android Studio
2. File → Open → Selecione a pasta `android`
3. Aguarde o Gradle sincronizar
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

**Opção B: Usando Gradle via linha de comando**
```bash
cd android
.\gradlew assembleDebug
```
O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

## Instalando no Celular

1. Transfira o arquivo `app-debug.apk` para o seu celular
2. No celular, vá em Configurações → Segurança
3. Ative "Fontes desconhecidas" ou "Instalar apps de fontes desconhecidas"
4. Abra o arquivo APK no celular e instale

## Notas Importantes

- O APK gerado será um **debug APK** (não assinado)
- Para produção, você precisará criar um **release APK** assinado
- Certifique-se de que o servidor backend está acessível do celular
- Se estiver testando localmente, use o IP da sua máquina na rede local

## Configuração do Servidor para Mobile

Se você quiser que o app acesse um servidor local, edite `capacitor.config.ts`:

```typescript
server: {
  url: 'http://SEU_IP_LOCAL:5000',
  cleartext: true
}
```

Substitua `SEU_IP_LOCAL` pelo IP da sua máquina na rede local.

