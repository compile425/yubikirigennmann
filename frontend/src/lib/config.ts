// CI/CDで使用される環境変数
// Docker環境では api:3000、ローカル環境では localhost:3001
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api');

// その他の設定
export const APP_CONFIG = {
  API_TIMEOUT: 10000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;
