import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { API_BASE_URL, APP_CONFIG } from './config';

// ==================== 型定義 ====================

export interface PromiseItem {
  id: number;
  content: string;
  due_date: string;
  type: string;
  creator_id: number;
  rating?: number;
  evaluation_text?: string;
  evaluation_date?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  is_inviter?: boolean;
}

export interface EvaluatedPromise {
  id: number;
  content: string;
  due_date: string;
  type: string;
  creator_id: number;
  rating: number;
  evaluation_date: string;
  evaluator_name: string;
}

export interface PendingPromise {
  id: number;
  content: string;
  due_date: string;
  type: string;
  creator_id: number;
  creator_name: string;
  created_at: string;
}

export interface ApiError {
  errors?: string[];
  error?: string;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  status: number;
}

export type PromiseType = 'my_promise' | 'our_promise' | 'partner_promise';

export interface CreatePromiseData {
  content: string;
  due_date: string | null;
  type: PromiseType;
  promise_id: number | null;
}

export interface EvaluationData {
  rating: number;
  evaluation_text: string;
}

// ==================== APIクライアント ====================

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: APP_CONFIG.API_TIMEOUT,
      headers: APP_CONFIG.DEFAULT_HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = unknown>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async post<T = unknown>(
    url: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async put<T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async delete<T = unknown>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  private handleError<T>(error: unknown): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = error.response?.data || {
        error: error.message,
      };
      return {
        error: apiError,
        status: error.response?.status || 500,
      };
    }

    return {
      error: { error: 'Unknown error occurred' },
      status: 500,
    };
  }
}

export const apiClient = new ApiClient();
