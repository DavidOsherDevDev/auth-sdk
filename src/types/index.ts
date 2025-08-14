import React, { ReactNode } from 'react';

// User roles
export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Permissions
export enum Permission {
  READ_PROFILE = 'read:profile',
  WRITE_PROFILE = 'write:profile',
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  MANAGE_ROLES = 'manage:roles',
  ADMIN_ACCESS = 'admin:access',
  SUPER_ADMIN_ACCESS = 'super_admin:access'
}

// User interface
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    loginCount: number;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  customData: Record<string, any>;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// Auth methods
export interface AuthMethods {
  login: (email: string, password: string) => Promise<boolean>;
  loginWithFirebase: (idToken: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

// Auth context type - explicitly defined
export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithFirebase: (idToken: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

// Register data
export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  role?: UserRole;
  customData?: Record<string, any>;
}

// Auth provider props
export interface AuthProviderProps {
  children: ReactNode;
  apiUrl: string;
  onAuthChange?: (user: User | null) => void;
  onError?: (error: string) => void;
}

// Protected route props
export interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  redirectTo?: string;
}

// Component props
export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showRegisterLink?: boolean;
}

export interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showLoginLink?: boolean;
  defaultRole?: UserRole;
}

export interface ProfileFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export interface UserListProps {
  onUserSelect?: (user: User) => void;
  pageSize?: number;
  className?: string;
}

export interface UserStatsProps {
  className?: string;
  refreshInterval?: number;
}

// SDK Configuration
export interface SdkConfig {
  apiUrl: string;
  tokenStorageKey?: string;
  refreshTokenStorageKey?: string;
  autoRefresh?: boolean;
  onTokenExpired?: () => void;
}

// Error types
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: any;
}

// Hook return types - explicitly defined
export interface UseAuthReturn {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithFirebase: (idToken: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

export interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchUsers: (page?: number, limit?: number, filters?: any) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  updateUser: (uid: string, data: Partial<User>) => Promise<boolean>;
  changeUserRole: (uid: string, role: UserRole) => Promise<boolean>;
  deleteUser: (uid: string) => Promise<boolean>;
}

export interface UseStatsReturn {
  stats: {
    total: number;
    byRole: Record<UserRole, number>;
    active: number;
    inactive: number;
    newThisMonth: number;
  } | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Form validation
export interface ValidationRules {
  email?: {
    required?: boolean;
    pattern?: RegExp;
    message?: string;
  };
  password?: {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    message?: string;
  };
  displayName?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    message?: string;
  };
}

// Theme customization
export interface ThemeConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  borderRadius?: string;
  fontFamily?: string;
}

export default {
  UserRole,
  Permission,
  AuthErrorCode,
};