import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  AuthState, 
  AuthContextType, 
  AuthProviderProps, 
  User, 
  RegisterData, 
  UserRole,
  AuthError,
  AuthErrorCode 
} from '../types';
import { ApiService } from '../services/api.service';

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_REFRESH_TOKEN'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER':
      const user = action.payload;
      return {
        ...state,
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || false,
        isSuperAdmin: user?.role === UserRole.SUPER_ADMIN || false,
        loading: false,
        error: null,
      };
    
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    
    case 'SET_REFRESH_TOKEN':
      return { ...state, refreshToken: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false,
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  apiUrl,
  onAuthChange,
  onError 
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const apiService = new ApiService({ apiUrl });

  // Handle authentication change
  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(state.user);
    }
  }, [state.user, onAuthChange]);

  // Handle errors
  useEffect(() => {
    if (state.error && onError) {
      onError(state.error);
    }
  }, [state.error, onError]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        if (apiService.hasToken()) {
          const user = await apiService.verifyToken();
          
          if (user) {
            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'SET_TOKEN', payload: apiService.getToken() });
            dispatch({ type: 'SET_REFRESH_TOKEN', payload: apiService.getRefreshToken() });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Auth methods
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { user, token, refreshToken } = await apiService.login(email, password);
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_REFRESH_TOKEN', payload: refreshToken });
      
      return true;
    } catch (error) {
      const authError = error as AuthError;
      dispatch({ type: 'SET_ERROR', payload: authError.message || 'Login failed' });
      return false;
    }
  }, []);

  const loginWithFirebase = useCallback(async (idToken: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { user, token, refreshToken } = await apiService.loginWithFirebase(idToken);
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_REFRESH_TOKEN', payload: refreshToken });
      
      return true;
    } catch (error) {
      const authError = error as AuthError;
      dispatch({ type: 'SET_ERROR', payload: authError.message || 'Firebase login failed' });
      return false;
    }
  }, []);

  const register = useCallback(async (userData: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { user, token, refreshToken } = await apiService.register(userData);
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_REFRESH_TOKEN', payload: refreshToken });
      
      return true;
    } catch (error) {
      const authError = error as AuthError;
      dispatch({ type: 'SET_ERROR', payload: authError.message || 'Registration failed' });
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await apiService.refreshAccessToken();
      
      if (success) {
        dispatch({ type: 'SET_TOKEN', payload: apiService.getToken() });
        return true;
      } else {
        dispatch({ type: 'LOGOUT' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      return false;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      const updatedUser = await apiService.updateProfile(data);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      return true;
    } catch (error) {
      const authError = error as AuthError;
      dispatch({ type: 'SET_ERROR', payload: authError.message || 'Profile update failed' });
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    refreshToken: state.refreshToken,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin,
    isSuperAdmin: state.isSuperAdmin,
    login,
    loginWithFirebase,
    register,
    logout,
    refreshAccessToken,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthProvider;