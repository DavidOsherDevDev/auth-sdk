import { useState, useCallback } from 'react';
import { User, UserRole, UseUsersReturn, AuthError } from '../types';
import { ApiService } from '../services/api.service';
import { useAuth } from '../providers/AuthProvider';

export const useUsers = (): UseUsersReturn => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Create API service instance (should ideally be shared/memoized)
  const apiService = new ApiService({ 
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000' 
  });

  const fetchUsers = useCallback(async (
    page = 1, 
    limit = 20, 
    filters?: any
  ): Promise<void> => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await apiService.getUsers(page, limit, filters);
      
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const searchUsers = useCallback(async (query: string): Promise<void> => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await apiService.searchUsers(query);
      setUsers(result);
      
      // Reset pagination for search results
      setPagination({
        page: 1,
        limit: result.length,
        total: result.length,
        totalPages: 1,
      });
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateUser = useCallback(async (
    uid: string, 
    data: Partial<User>
  ): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const updatedUser = await apiService.updateUser(uid, data);
      
      // Update user in the list
      setUsers(prev => prev.map(user => 
        user.uid === uid ? updatedUser : user
      ));
      
      return true;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Failed to update user');
      return false;
    }
  }, [token]);

  const changeUserRole = useCallback(async (
    uid: string, 
    role: UserRole
  ): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      await apiService.changeUserRole(uid, role);
      
      // Update user role in the list
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, role } : user
      ));
      
      return true;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Failed to change user role');
      return false;
    }
  }, [token]);

  const deleteUser = useCallback(async (uid: string): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      await apiService.deleteUser(uid);
      
      // Remove user from the list
      setUsers(prev => prev.filter(user => user.uid !== uid));
      
      return true;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Failed to delete user');
      return false;
    }
  }, [token]);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    searchUsers,
    updateUser,
    changeUserRole,
    deleteUser,
  };
};

export default useUsers;