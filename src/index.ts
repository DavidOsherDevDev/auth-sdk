// Main exports for Spirit AI Auth SDK

// Providers
export { AuthProvider, useAuth } from './providers/AuthProvider';

// Hooks
export { useUsers, useStats } from './hooks';

// Components
export {
  ProtectedRoute,
  LoginForm,
  RegisterForm,
  ProfileForm,
  UsersList,
  UserStats,
} from './components';

// Services
export { ApiService } from './services/api.service';

// Types and Enums
export {
  UserRole,
  Permission,
  AuthErrorCode,
} from './types';

export type {
  User,
  AuthState,
  AuthContextType,
  UseAuthReturn,
  UseUsersReturn,
  UseStatsReturn,
  RegisterData,
  AuthProviderProps,
  ProtectedRouteProps,
  LoginFormProps,
  RegisterFormProps,
  ProfileFormProps,
  UserListProps,
  UserStatsProps,
  SdkConfig,
  AuthError,
  ApiResponse,
  ValidationRules,
  ThemeConfig,
} from './types';