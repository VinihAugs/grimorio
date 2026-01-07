@echo off
chcp 65001 >nul
echo ========================================
echo   INSTALADOR DE JAVA 17 (LTS)
echo ========================================
echo.
echo Este script irá baixar e instalar o Java 17 LTS (Eclipse Temurin)
echo que é necessário para compilar o APK do projeto.
echo.
echo Opções:
echo 1. Baixar e instalar automaticamente (requer permissões de administrador)
echo 2. Abrir página de download no navegador
echo 3. Cancelar
echo.
set /p opcao="Escolha uma opção (1, 2 ou 3): "

if "%opcao%"=="1" goto baixar
if "%opcao%"=="2" goto abrir_navegador
if "%opcao%"=="3" goto fim
goto fim

:baixar
echo.
echo [INFO] Baixando Java 17 LTS (Eclipse Temurin)...
echo.
echo Por favor, baixe manualmente o instalador do Java 17:
echo https://adoptium.net/temurin/releases/?version=17
echo.
echo Ou use o Chocolatey (se instalado):
echo choco install temurin17jdk
echo.
echo Após instalar, configure a variável JAVA_HOME:
echo setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
echo setx PATH "%PATH%;%JAVA_HOME%\bin"
echo.
goto fim

:abrir_navegador
echo.
echo Abrindo página de download do Java 17...
start https://adoptium.net/temurin/releases/?version=17
echo.
echo Após baixar e instalar:
echo 1. Configure JAVA_HOME apontando para a pasta de instalação
echo 2. Adicione %JAVA_HOME%\bin ao PATH
echo 3. Reinicie o terminal e execute: java -version
echo.
goto fim

:fim
pause

