import { useState, useCallback, useEffect } from 'react';
import { UserRole, UseStatsReturn, AuthError } from '../types';
import { ApiService } from '../services/api.service';
import { useAuth } from '../providers/AuthProvider';

export const useStats = (autoRefresh = false, refreshInterval = 30000): UseStatsReturn => {
  const { token } = useAuth();
  const [stats, setStats] = useState<{
    total: number;
    byRole: Record<UserRole, number>;
    active: number;
    inactive: number;
    newThisMonth: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create API service instance
  const apiService = new ApiService({ 
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000' 
  });

  const refresh = useCallback(async (): Promise<void> => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await apiService.getUserStats();
      setStats(result);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && token) {
      refresh();
      
      const interval = setInterval(refresh, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, token, refresh]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
};

export default useStats;