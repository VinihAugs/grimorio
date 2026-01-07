# 🚀 Instalação Rápida do Android SDK

Para gerar o APK, você precisa do Android SDK. Siga um destes métodos:

## Método 1: Android Studio (Recomendado - Mais Fácil)

1. **Baixe o Android Studio:**
   - Acesse: https://developer.android.com/studio
   - Baixe e instale o Android Studio

2. **Configure o SDK:**
   - Abra o Android Studio
   - Vá em **Tools > SDK Manager**
   - Na aba **SDK Platforms**, marque:
     - Android 13.0 (Tiramisu) ou superior
   - Na aba **SDK Tools**, marque:
     - Android SDK Build-Tools
     - Android SDK Platform-Tools
     - Android SDK Command-line Tools
   - Clique em **Apply** e aguarde a instalação

3. **Localização do SDK:**
   - O SDK será instalado em: `%LOCALAPPDATA%\Android\Sdk`
   - (Geralmente: `C:\Users\SeuUsuario\AppData\Local\Android\Sdk`)

4. **Execute o script novamente:**
   ```bash
   gerar-apk-completo.bat
   ```

## Método 2: SDK Command Line Tools (Mais Leve)

1. **Baixe o SDK Command Line Tools:**
   - Acesse: https://developer.android.com/studio#command-tools
   - Baixe a versão para Windows

2. **Extraia e configure:**
   - Extraia para: `C:\Android\Sdk`
   - Execute: `instalar-android-sdk.bat`
   - Siga as instruções na tela

## Método 3: Via Winget (Windows 10/11)

```bash
winget install Google.AndroidStudio
```

Depois, abra o Android Studio e configure o SDK como no Método 1.

## Verificar Instalação

Após instalar, execute:
```bash
echo %ANDROID_HOME%
```

Se mostrar um caminho, está configurado! Execute `gerar-apk-completo.bat` novamente.

