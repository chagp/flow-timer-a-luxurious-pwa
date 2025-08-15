import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flowtimer.app',
  appName: 'Flow Timer',
  webDir: 'dist',
  server: {
    url: process.env.CAP_DEV_URL || undefined,
    cleartext: true,
  },
  ios: {
    contentInset: 'never'
  }
};

export default config;
