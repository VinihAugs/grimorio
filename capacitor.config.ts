import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.necro.tome',
  appName: 'Morsmordre',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Para desenvolvimento local, descomente as linhas abaixo e ajuste o IP
    // url: 'http://SEU_IP_LOCAL:5000',
    // cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
  },
  ios: {
    scheme: 'Morsmordre',
    contentInset: 'automatic',
  },
};

export default config;

