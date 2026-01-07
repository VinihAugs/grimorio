@echo off
chcp 65001 >nul
echo ========================================
echo   GERADOR DE APP iOS - NECRO-TOME
echo ========================================
echo.
echo [AVISO] Este script requer macOS e Xcode!
echo         Execute este script em um Mac com Xcode instalado.
echo.

REM Verifica se está no macOS (Windows não pode gerar iOS apps)
if "%OS%"=="Windows_NT" (
    echo [ERRO] Este script deve ser executado em macOS!
    echo        Para gerar apps iOS, você precisa:
    echo        1. Um Mac com macOS instalado
    echo        2. Xcode instalado (via App Store)
    echo        3. Conta de desenvolvedor Apple (gratuita ou paga)
    echo.
    echo        Alternativa: Use o script gerar-ios.sh no Mac
    pause
    exit /b 1
)

REM Verifica se Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js não encontrado! Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verifica se Xcode está instalado
where xcodebuild >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Xcode não encontrado!
    echo        Instale o Xcode via App Store.
    pause
    exit /b 1
)

echo [1/6] Instalando dependências do projeto...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependências!
    pause
    exit /b 1
)

echo.
echo [2/6] Instalando Capacitor iOS...
call npm install --save @capacitor/ios
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar Capacitor iOS!
    pause
    exit /b 1
)

echo.
echo [3/6] Construindo o projeto web...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao construir o projeto!
    pause
    exit /b 1
)

echo.
echo [4/6] Inicializando Capacitor (se necessário)...
if not exist "capacitor.config.ts" (
    call npx cap init "Necro-Tome" "com.necro.tome" --web-dir="dist/public"
    if %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao inicializar Capacitor!
        pause
        exit /b 1
    )
)

echo.
echo [5/6] Adicionando plataforma iOS (se necessário)...
if not exist "ios" (
    call npx cap add ios
    if %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao adicionar plataforma iOS!
        pause
        exit /b 1
    )
)

echo.
echo [6/6] Sincronizando arquivos com iOS...
call npx cap sync ios
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao sincronizar arquivos!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   CONFIGURAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo Próximos passos:
echo.
echo 1. Abra o Xcode
echo 2. File ^> Open ^> Selecione a pasta "ios/App"
echo 3. Selecione o projeto "App" no navegador
echo 4. Configure seu Team/Signing em "Signing ^& Capabilities"
echo 5. Selecione um dispositivo ou simulador
echo 6. Product ^> Archive (para gerar .ipa)
echo 7. Window ^> Organizer ^> Distribute App (para TestFlight)
echo.
echo OU use o script gerar-ipa.sh para gerar via linha de comando
echo.
pause

