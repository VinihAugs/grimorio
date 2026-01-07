@echo off
chcp 65001 >nul
echo ========================================
echo   GERADOR DE APK - NECRO-TOME (teste1)
echo ========================================
echo.

REM Configura Java 17 se disponível
if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
    set "PATH=%JAVA_HOME%\bin;%PATH%"
)

REM Verifica se Java 11+ está disponível
java -version 2>&1 | findstr /C:"version \"1.8" >nul
if %ERRORLEVEL% EQU 0 (
    echo [AVISO] Java 8 detectado. Tentando usar Java 17...
    if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
        set "PATH=%JAVA_HOME%\bin;%PATH%"
        java -version
    ) else (
        echo [ERRO] Java 11+ não encontrado. Execute atualizar-java.bat primeiro.
        pause
        exit /b 1
    )
)

REM Verifica se a pasta android existe
if not exist "android" (
    echo [ERRO] A pasta android não existe!
    echo        Execute primeiro o script gerar-apk.bat
    pause
    exit /b 1
)

echo [1/3] Construindo o projeto web...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao construir o projeto!
    pause
    exit /b 1
)

echo.
echo [2/3] Sincronizando arquivos com Android...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao sincronizar arquivos!
    pause
    exit /b 1
)

echo.
echo [3/3] Gerando APK com Gradle...
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
        echo.
        echo Para instalar no celular:
        echo 1. Transfira o arquivo teste1.apk para o celular
        echo 2. No celular, ative "Fontes desconhecidas" nas configurações
        echo 3. Abra o arquivo APK e instale
        echo.
    ) else (
        echo [ERRO] Falha ao renomear APK!
        echo O APK original está em: android\app\build\outputs\apk\debug\app-debug.apk
    )
) else (
    echo [ERRO] APK não encontrado em: android\app\build\outputs\apk\debug\app-debug.apk
)

pause

