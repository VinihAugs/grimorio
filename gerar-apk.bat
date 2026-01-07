@echo off
chcp 65001 >nul
echo ========================================
echo   GERADOR DE APK - Morsmordre
echo ========================================
echo.

REM Configurar Java 17
if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
    set "PATH=%JAVA_HOME%\bin;%PATH%"
)

REM Verificar Android SDK
set "SDK_PATH="
if exist "%LOCALAPPDATA%\Android\Sdk" (
    set "SDK_PATH=%LOCALAPPDATA%\Android\Sdk"
) else if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
    set "SDK_PATH=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
) else if not "%ANDROID_HOME%"=="" (
    set "SDK_PATH=%ANDROID_HOME%"
) else if exist "C:\Android\Sdk" (
    set "SDK_PATH=C:\Android\Sdk"
)

if "%SDK_PATH%"=="" (
    echo [AVISO] Android SDK não encontrado automaticamente.
    echo.
    echo Para gerar o APK, você precisa instalar o Android SDK.
    echo.
    echo Opções:
    echo 1. Instalar Android Studio (Recomendado - Mais fácil)
    echo 2. Instalar apenas SDK Command Line Tools
    echo 3. Se você já tem o SDK instalado, digite o caminho
    echo 4. Cancelar
    echo.
    set /p opcao="Escolha uma opção (1-4): "
    
    if "%opcao%"=="1" (
        echo.
        echo Abrindo página de download do Android Studio...
        start https://developer.android.com/studio
        echo.
        echo Após instalar o Android Studio:
        echo 1. Abra o Android Studio
        echo 2. Vá em Tools ^> SDK Manager
        echo 3. Instale o Android SDK
        echo 4. Execute este script novamente
        pause
        exit /b 0
    ) else if "%opcao%"=="2" (
        echo.
        echo Abrindo página de download do SDK Command Line Tools...
        start https://developer.android.com/studio#command-tools
        echo.
        echo Após baixar:
        echo 1. Extraia para C:\Android\Sdk
        echo 2. Execute: instalar-android-sdk.bat
        echo 3. Execute este script novamente
        pause
        exit /b 0
    ) else if "%opcao%"=="3" (
        echo.
        set /p SDK_PATH="Digite o caminho completo do Android SDK: "
        if "%SDK_PATH%"=="" (
            echo [ERRO] Caminho não pode estar vazio!
            pause
            exit /b 1
        )
        if not exist "%SDK_PATH%" (
            echo [ERRO] Caminho não encontrado: %SDK_PATH%
            pause
            exit /b 1
        )
    ) else (
        echo Cancelado.
        exit /b 0
    )
)

REM Configurar SDK
if not "%SDK_PATH%"=="" (
    echo [INFO] Android SDK: %SDK_PATH%
    setx ANDROID_HOME "%SDK_PATH%" >nul 2>&1
    set "ANDROID_HOME=%SDK_PATH%"
    echo sdk.dir=%SDK_PATH:\=\\% > android\local.properties
    echo [INFO] local.properties criado
)

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
    echo.
    echo [ERRO] Falha ao gerar APK!
    echo.
    echo Possíveis causas:
    echo - Android SDK não está configurado corretamente
    echo - Falta alguma dependência do SDK
    echo - Verifique os erros acima
    echo.
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
        echo   ✓ APK GERADO COM SUCESSO!
        echo ========================================
        echo.
        echo Arquivo: teste1.apk
        echo Localização: %CD%\teste1.apk
        echo.
        for %%A in ("teste1.apk") do (
            set /a tamanho=%%~zA/1024/1024
            echo Tamanho: %%~zA bytes (~!tamanho! MB)
        )
        echo.
        echo ========================================
        echo   COMO INSTALAR NO CELULAR
        echo ========================================
        echo.
        echo Método 1 - Via USB (ADB):
        echo   1. Ative "Depuração USB" nas opções de desenvolvedor
        echo   2. Conecte o celular ao PC via USB
        echo   3. Execute: adb install teste1.apk
        echo.
        echo Método 2 - Transferência Manual:
        echo   1. Transfira teste1.apk para o celular (USB, email, etc)
        echo   2. No celular, abra o arquivo
        echo   3. Se aparecer "Bloqueado por Play Protect", clique em "Instalar mesmo assim"
        echo   4. Se necessário, ative "Fontes desconhecidas" nas configurações
        echo   5. Siga as instruções na tela
        echo.
        echo Método 3 - Via WiFi (ADB):
        echo   1. Conecte celular e PC na mesma rede WiFi
        echo   2. Execute: adb connect IP_DO_CELULAR:5555
        echo   3. Execute: adb install teste1.apk
        echo.
    ) else (
        echo [ERRO] Falha ao renomear APK!
        echo O APK está em: android\app\build\outputs\apk\debug\app-debug.apk
    )
) else (
    echo [ERRO] APK não encontrado!
    echo Verifique os erros acima.
)

pause
