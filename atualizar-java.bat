@echo off
chcp 65001 >nul
echo ========================================
echo   ATUALIZADOR DE JAVA
echo ========================================
echo.

REM Verifica versão atual do Java
echo Verificando versão atual do Java...
java -version 2>&1
echo.

REM Verifica se Chocolatey está instalado
where choco >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Chocolatey detectado!
    echo.
    echo Deseja instalar/atualizar o Java 17 usando Chocolatey? (S/N)
    set /p usar_choco="> "
    if /i "%usar_choco%"=="S" (
        echo.
        echo [1/2] Instalando Java 17 LTS (Eclipse Temurin)...
        choco install temurin17jdk -y
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo [2/2] Configurando variáveis de ambiente...
            setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot" 2>nul
            setx PATH "%PATH%;%JAVA_HOME%\bin" 2>nul
            echo.
            echo ========================================
            echo   JAVA INSTALADO COM SUCESSO!
            echo ========================================
            echo.
            echo IMPORTANTE: Feche e reabra o terminal para aplicar as mudanças.
            echo Depois, execute: java -version
            echo.
            pause
            exit /b 0
        ) else (
            echo [ERRO] Falha ao instalar via Chocolatey.
            echo.
        )
    )
)

echo.
echo ========================================
echo   OPÇÕES DE INSTALAÇÃO
echo ========================================
echo.
echo Opção 1 - Download Manual (Recomendado):
echo   1. Acesse: https://adoptium.net/temurin/releases/?version=17
echo   2. Baixe o Windows x64 Installer (.msi)
echo   3. Execute o instalador
echo   4. O instalador configurará automaticamente o PATH
echo.
echo Opção 2 - Via Chocolatey (se instalado):
echo   choco install temurin17jdk -y
echo.
echo Opção 3 - Via Winget (Windows 10/11):
echo   winget install EclipseAdoptium.Temurin.17.JDK
echo.
echo Após instalar, feche e reabra o terminal.
echo.
set /p abrir="Deseja abrir a página de download agora? (S/N): "
if /i "%abrir%"=="S" (
    start https://adoptium.net/temurin/releases/?version=17
)

echo.
echo Verificando se Winget está disponível...
where winget >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [INFO] Winget detectado!
    echo Deseja instalar o Java 17 usando Winget? (S/N)
    set /p usar_winget="> "
    if /i "%usar_winget%"=="S" (
        echo.
        echo Instalando Java 17 via Winget...
        winget install EclipseAdoptium.Temurin.17.JDK
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ========================================
            echo   JAVA INSTALADO COM SUCESSO!
            echo ========================================
            echo.
            echo IMPORTANTE: Feche e reabra o terminal para aplicar as mudanças.
            echo Depois, execute: java -version
            echo.
            pause
            exit /b 0
        )
    )
)

pause

