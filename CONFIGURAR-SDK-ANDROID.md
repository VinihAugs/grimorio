# 📱 Configuração do Android SDK - Passo a Passo

## Você está na tela do Android SDK Manager

### Passo 1: Instalar Plataformas Android

Na aba **"SDK Platforms"** (que você já está vendo):

1. **Marque pelo menos UMA destas opções:**
   - ✅ **Android 13.0 (Tiramisu)** - API Level 33 (Recomendado - mais recente)
   - ✅ **Android 12.0 (S)** - API Level 31
   - ✅ **Android 11.0 (R)** - API Level 30

2. **Também marque:**
   - ✅ **Android SDK Platform** (aparece quando você marca uma versão)
   - ✅ **Sources for Android** (opcional, mas útil)

### Passo 2: Instalar Ferramentas

1. **Clique na aba "SDK Tools"** (ao lado de "SDK Platforms")

2. **Marque estas ferramentas ESSENCIAIS:**
   - ✅ **Android SDK Build-Tools**
   - ✅ **Android SDK Platform-Tools**
   - ✅ **Android SDK Command-line Tools (latest)**
   - ✅ **Android Emulator** (opcional - só se quiser testar no emulador)
   - ✅ **Intel x86 Emulator Accelerator (HAXM installer)** (opcional)

### Passo 3: Instalar

1. Clique em **"Apply"** ou **"OK"**
2. Uma janela aparecerá mostrando o que será instalado
3. Clique em **"OK"** para confirmar
4. Aguarde a instalação (pode demorar alguns minutos)

### Passo 4: Verificar Instalação

Após a instalação:
1. Clique em **"OK"** para fechar o SDK Manager
2. Volte para o terminal/prompt de comando
3. Execute: `gerar-apk.bat`

## Resumo Rápido

**Mínimo necessário:**
- ✅ Uma plataforma Android (API 30, 31 ou 33)
- ✅ Android SDK Build-Tools
- ✅ Android SDK Platform-Tools
- ✅ Android SDK Command-line Tools

**Depois de instalar, execute:**
```bash
gerar-apk.bat
```

