import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.volo.app',
  appName: 'Volo',
  webDir: 'out', // Next.js static export directory
  server: {
    androidScheme: 'https',
    // For development, use localhost (change this for production)
    url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000',
    cleartext: true, // Allow HTTP in development
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      keystorePassword: undefined,
      releaseType: 'AAB' as const, // Generate AAB for Play Store (or 'APK' for direct install)
    },
  },
};

export default config;
