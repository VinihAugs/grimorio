@echo off
chcp 65001 >nul
echo ========================================
echo   GERADOR DE APK - NECRO-TOME (GRADLE)
echo ========================================
echo.

REM Verifica se a pasta android existe
if not exist "android" (
    echo [ERRO] A pasta android não existe!
    echo        Execute primeiro o script gerar-apk.bat
    pause
    exit /b 1
)

REM Verifica se Java está instalado
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Java não encontrado! Instale o Java JDK 17 ou superior.
    pause
    exit /b 1
)

REM Verifica se ANDROID_HOME está configurado
if "%ANDROID_HOME%"=="" (
    echo [AVISO] ANDROID_HOME não está configurado.
    echo         Configure a variável de ambiente ANDROID_HOME.
    echo.
)

echo [1/2] Construindo o projeto web...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao construir o projeto!
    pause
    exit /b 1
)

echo.
echo [2/2] Sincronizando arquivos com Android...
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
echo ========================================
echo   APK GERADO COM SUCESSO!
echo ========================================
echo.
echo O APK está em:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Para instalar no celular:
echo 1. Transfira o arquivo app-debug.apk para o celular
echo 2. No celular, ative "Fontes desconhecidas" nas configurações
echo 3. Abra o arquivo APK e instale
echo.
pause

