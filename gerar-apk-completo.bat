@echo off
chcp 65001 >nul
echo ========================================
echo   GERADOR DE APK - Morsmordre (teste1)
echo ========================================
echo.

REM Configurar Java 17
if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
    set "PATH=%JAVA_HOME%\bin;%PATH%"
    echo [INFO] Java 17 configurado
)

REM Verificar Java
java -version 2>&1 | findstr /C:"version \"1.8" >nul
if %ERRORLEVEL% EQU 0 (
    echo [AVISO] Java 8 detectado. Tentando usar Java 17...
    if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
        set "PATH=%JAVA_HOME%\bin;%PATH%"
    ) else (
        echo [ERRO] Java 17 não encontrado. Execute atualizar-java.bat primeiro.
        pause
        exit /b 1
    )
)

REM Verificar Android SDK
set "SDK_FOUND=0"
set "SDK_PATH="

REM Verificar locais comuns
if exist "%LOCALAPPDATA%\Android\Sdk" (
    set "SDK_PATH=%LOCALAPPDATA%\Android\Sdk"
    set "SDK_FOUND=1"
) else if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
    set "SDK_PATH=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
    set "SDK_FOUND=1"
) else if exist "%ANDROID_HOME%" (
    set "SDK_PATH=%ANDROID_HOME%"
    set "SDK_FOUND=1"
) else if exist "C:\Android\Sdk" (
    set "SDK_PATH=C:\Android\Sdk"
    set "SDK_FOUND=1"
)

if %SDK_FOUND%==0 (
    echo [ERRO] Android SDK não encontrado!
    echo.
    echo Para gerar o APK, você precisa do Android SDK:
    echo.
    echo Opção 1 - Instalar Android Studio (Recomendado):
    echo   1. Baixe em: https://developer.android.com/studio
    echo   2. Instale o Android Studio
    echo   3. Abra o Android Studio e vá em Tools ^> SDK Manager
    echo   4. Instale o Android SDK (geralmente em %%LOCALAPPDATA%%\Android\Sdk)
    echo   5. Execute este script novamente
    echo.
    echo Opção 2 - Instalar apenas SDK Command Line Tools:
    echo   1. Baixe em: https://developer.android.com/studio#command-tools
    echo   2. Extraia para C:\Android\Sdk
    echo   3. Execute este script novamente
    echo.
    echo Opção 3 - Se você já tem o SDK instalado:
    echo   Execute: instalar-android-sdk.bat
    echo.
    pause
    exit /b 1
)

echo [INFO] Android SDK encontrado em: %SDK_PATH%
setx ANDROID_HOME "%SDK_PATH%" >nul 2>&1
set "ANDROID_HOME=%SDK_PATH%"

REM Criar local.properties
echo sdk.dir=%SDK_PATH:\=\\% > android\local.properties
echo [INFO] local.properties criado

echo.
echo [1/4] Construindo o projeto web...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao construir o projeto!
    pause
    exit /b 1
)

echo.
echo [2/4] Sincronizando arquivos com Android...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao sincronizar arquivos!
    pause
    exit /b 1
)

echo.
echo [3/4] Gerando APK com Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao gerar APK!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Renomeando APK para teste1.apk...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "teste1.apk" >nul
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo   APK GERADO COM SUCESSO!
        echo ========================================
        echo.
        echo O APK foi salvo como: teste1.apk
        echo Localização: %CD%\teste1.apk
        echo Tamanho: 
        for %%A in ("teste1.apk") do echo   %%~zA bytes
        echo.
        echo ========================================
        echo   COMO INSTALAR NO CELULAR
        echo ========================================
        echo.
        echo Método 1 - Via USB (ADB):
        echo   1. Ative "Depuração USB" nas opções de desenvolvedor do celular
        echo   2. Conecte o celular ao computador via USB
        echo   3. Execute: adb install teste1.apk
        echo.
        echo Método 2 - Transferência Manual:
        echo   1. Transfira o arquivo teste1.apk para o celular (USB, email, etc)
        echo   2. No celular, abra o arquivo
        echo   3. Se aparecer "Bloqueado por Play Protect", clique em "Instalar mesmo assim"
        echo   4. Se necessário, ative "Fontes desconhecidas" nas configurações
        echo   5. Siga as instruções na tela para instalar
        echo.
        echo Método 3 - Via WiFi (se ADB estiver configurado):
        echo   1. Conecte celular e PC na mesma rede WiFi
        echo   2. Execute: adb connect IP_DO_CELULAR:5555
        echo   3. Execute: adb install teste1.apk
        echo.
    ) else (
        echo [ERRO] Falha ao renomear APK!
        echo O APK original está em: android\app\build\outputs\apk\debug\app-debug.apk
    )
) else (
    echo [ERRO] APK não encontrado em: android\app\build\outputs\apk\debug\app-debug.apk
    echo Verifique os erros acima.
)

pause

