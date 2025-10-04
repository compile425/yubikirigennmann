// CI/CDで使用される環境変数
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api';

// その他の設定
export const APP_CONFIG = {
  API_TIMEOUT: 10000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;
