import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  RegisterData, 
  ApiResponse, 
  AuthError, 
  AuthErrorCode, 
  UserRole,
  SdkConfig 
} from '../types';

export class ApiService {
  private api: AxiosInstance;
  private config: SdkConfig;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: SdkConfig) {
    this.config = config;
    
    this.api = axios.create({
      baseURL: config.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load tokens from storage
    this.loadTokensFromStorage();

    // Setup interceptors
    this.setupInterceptors();
  }

  private loadTokensFromStorage(): void {
    const tokenKey = this.config.tokenStorageKey || 'spirit_ai_token';
    const refreshTokenKey = this.config.refreshTokenStorageKey || 'spirit_ai_refresh_token';
    
    this.token = localStorage.getItem(tokenKey);
    this.refreshToken = localStorage.getItem(refreshTokenKey);
  }

  private saveTokensToStorage(token: string, refreshToken: string): void {
    const tokenKey = this.config.tokenStorageKey || 'spirit_ai_token';
    const refreshTokenKey = this.config.refreshTokenStorageKey || 'spirit_ai_refresh_token';
    
    this.token = token;
    this.refreshToken = refreshToken;
    
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(refreshTokenKey, refreshToken);
  }

  private clearTokensFromStorage(): void {
    const tokenKey = this.config.tokenStorageKey || 'spirit_ai_token';
    const refreshTokenKey = this.config.refreshTokenStorageKey || 'spirit_ai_refresh_token';
    
    this.token = null;
    this.refreshToken = null;
    
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshTokenKey);
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && this.refreshToken && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const success = await this.refreshAccessToken();
            if (success) {
              originalRequest.headers.Authorization = `Bearer ${this.token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokensFromStorage();
            if (this.config.onTokenExpired) {
              this.config.onTokenExpired();
            }
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): AuthError {
    if (error.response) {
      const { data } = error.response;
      return {
        code: this.mapErrorCode(data.error?.code || 'UNKNOWN_ERROR'),
        message: data.message || 'An error occurred',
        details: data.error?.details,
      };
    } else if (error.request) {
      return {
        code: AuthErrorCode.NETWORK_ERROR,
        message: 'Network error occurred',
      };
    } else {
      return {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: error.message || 'Unknown error occurred',
      };
    }
  }

  private mapErrorCode(code: string): AuthErrorCode {
    const codeMap: Record<string, AuthErrorCode> = {
      'INVALID_CREDENTIALS': AuthErrorCode.INVALID_CREDENTIALS,
      'TOKEN_EXPIRED': AuthErrorCode.TOKEN_EXPIRED,
      'INSUFFICIENT_PERMISSIONS': AuthErrorCode.INSUFFICIENT_PERMISSIONS,
      'VALIDATION_ERROR': AuthErrorCode.VALIDATION_ERROR,
      'USER_NOT_FOUND': AuthErrorCode.USER_NOT_FOUND,
      'EMAIL_ALREADY_EXISTS': AuthErrorCode.EMAIL_ALREADY_EXISTS,
    };

    return codeMap[code] || AuthErrorCode.UNKNOWN_ERROR;
  }

  // Authentication methods
  async register(userData: RegisterData): Promise<{ user: User; token: string; refreshToken: string }> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/api/auth/register', userData);
    
    if (response.data.success) {
      const { token, refreshToken, user } = response.data.data;
      this.saveTokensToStorage(token, refreshToken);
      return { user, token, refreshToken };
    }

    throw new Error(response.data.message || 'Registration failed');
  }

  async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/api/auth/login', {
      email,
      password,
    });

    if (response.data.success) {
      const { token, refreshToken, user } = response.data.data;
      this.saveTokensToStorage(token, refreshToken);
      return { user, token, refreshToken };
    }

    throw new Error(response.data.message || 'Login failed');
  }

  async loginWithFirebase(idToken: string): Promise<{ user: User; token: string; refreshToken: string }> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/api/auth/login/firebase', {
      idToken,
    });

    if (response.data.success) {
      const { token, refreshToken, user } = response.data.data;
      this.saveTokensToStorage(token, refreshToken);
      return { user, token, refreshToken };
    }

    throw new Error(response.data.message || 'Firebase login failed');
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response: AxiosResponse<ApiResponse> = await this.api.post('/api/auth/refresh', {
      refreshToken: this.refreshToken,
    });

    if (response.data.success) {
      const { token } = response.data.data;
      const tokenKey = this.config.tokenStorageKey || 'spirit_ai_token';
      this.token = token;
      localStorage.setItem(tokenKey, token);
      return true;
    }

    this.clearTokensFromStorage();
    return false;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/api/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    this.clearTokensFromStorage();
  }

  async verifyToken(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response: AxiosResponse<ApiResponse> = await this.api.get('/api/auth/verify');
      
      if (response.data.success) {
        return response.data.data.user;
      }
    } catch (error) {
      this.clearTokensFromStorage();
    }

    return null;
  }

  // User profile methods
  async getProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse> = await this.api.get('/api/users/profile');
    
    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to get profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse> = await this.api.patch('/api/users/profile', data);
    
    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to update profile');
  }

  // Admin methods
  async getUsers(page = 1, limit = 20, filters?: any): Promise<{
    users: User[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response: AxiosResponse<ApiResponse> = await this.api.get(`/api/users?${params}`);
    
    if (response.data.success) {
      return {
        users: response.data.data,
        pagination: response.data.pagination!,
      };
    }

    throw new Error(response.data.message || 'Failed to get users');
  }

  async getUserById(uid: string): Promise<User> {
    const response: AxiosResponse<ApiResponse> = await this.api.get(`/api/users/${uid}`);
    
    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to get user');
  }

  async updateUser(uid: string, data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse> = await this.api.patch(`/api/users/${uid}`, data);
    
    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to update user');
  }

  async changeUserRole(uid: string, role: UserRole): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await this.api.patch(`/api/users/${uid}/role`, {
      role,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change user role');
    }
  }

  async deleteUser(uid: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/api/users/${uid}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete user');
    }
  }

  async searchUsers(query: string, limit = 20): Promise<User[]> {
    const response: AxiosResponse<ApiResponse> = await this.api.get(`/api/users/search`, {
      params: { q: query, limit },
    });
    
    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to search users');
  }

  async getUserStats(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
    active: number;
    inactive: number;
    newThisMonth: number;
  }> {
    const response: AxiosResponse<ApiResponse> = await this.api.get('/api/users/stats');
    
    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to get user stats');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  // Utility methods
  hasToken(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }
}

export default ApiService;