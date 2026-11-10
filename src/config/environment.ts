type EnvironmentConfig = {
  apiBaseUrl: string;
  appVersion: string;
  enableMockServices: boolean;
};

const baseConfig: EnvironmentConfig = {
  apiBaseUrl: 'https://api.byaheko.app/v1',
  appVersion: '1.0.0',
  enableMockServices: true,
};

export const environment: EnvironmentConfig = baseConfig;