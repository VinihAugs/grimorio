@echo off
echo ========================================
echo Gerando APK do Morsmordre
echo ========================================
echo.

echo [1/3] Construindo o projeto web...
call npm run build
if errorlevel 1 (
    echo ERRO: Falha ao construir o projeto web
    pause
    exit /b 1
)

echo.
echo [2/3] Sincronizando com Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERRO: Falha ao sincronizar com Capacitor
    pause
    exit /b 1
)

echo.
echo [3/3] Gerando APK com Gradle...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERRO: Falha ao gerar o APK
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo APK gerado com sucesso!
echo ========================================
echo.
echo O APK esta localizado em:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Voce pode instalar este APK diretamente no seu dispositivo Android!
echo.
pause

