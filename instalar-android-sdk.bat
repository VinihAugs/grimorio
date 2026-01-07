@echo off
chcp 65001 >nul
echo ========================================
echo   INSTALADOR DE ANDROID SDK
echo ========================================
echo.
echo O Android SDK é necessário para compilar APKs.
echo.
echo Opções:
echo 1. Instalar Android Studio (recomendado - inclui SDK)
echo 2. Instalar apenas Android SDK Command Line Tools
echo 3. Configurar SDK existente
echo.
set /p opcao="Escolha uma opção (1, 2 ou 3): "

if "%opcao%"=="1" goto android_studio
if "%opcao%"=="2" goto sdk_tools
if "%opcao%"=="3" goto configurar
goto fim

:android_studio
echo.
echo Abrindo página de download do Android Studio...
start https://developer.android.com/studio
echo.
echo Após instalar o Android Studio:
echo 1. Abra o Android Studio
echo 2. Vá em Tools ^> SDK Manager
echo 3. Instale o Android SDK e as ferramentas necessárias
echo 4. O SDK será instalado em: %%LOCALAPPDATA%%\Android\Sdk
echo.
goto fim

:sdk_tools
echo.
echo Para instalar apenas o SDK Command Line Tools:
echo 1. Baixe em: https://developer.android.com/studio#command-tools
echo 2. Extraia para uma pasta (ex: C:\Android\Sdk)
echo 3. Execute este script novamente e escolha opção 3
echo.
start https://developer.android.com/studio#command-tools
goto fim

:configurar
echo.
set /p sdk_path="Digite o caminho completo do Android SDK (ex: C:\Users\SeuUsuario\AppData\Local\Android\Sdk): "
if "%sdk_path%"=="" (
    echo [ERRO] Caminho não pode estar vazio!
    pause
    exit /b 1
)

if not exist "%sdk_path%" (
    echo [ERRO] Caminho não encontrado: %sdk_path%
    pause
    exit /b 1
)

echo.
echo Configurando Android SDK...
setx ANDROID_HOME "%sdk_path%"
setx PATH "%PATH%;%sdk_path%\platform-tools;%sdk_path%\tools;%sdk_path%\tools\bin"

echo sdk.dir=%sdk_path:\=\\% > android\local.properties
echo.
echo ========================================
echo   ANDROID SDK CONFIGURADO!
echo ========================================
echo.
echo ANDROID_HOME: %sdk_path%
echo.
echo IMPORTANTE: Feche e reabra o terminal para aplicar as mudanças.
echo.
goto fim

:fim
pause

