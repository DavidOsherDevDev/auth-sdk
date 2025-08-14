import React from 'react';
import { ProtectedRouteProps, UserRole, Permission } from '../types';
import { useAuth } from '../hooks';

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Please log in to access this page.</div>,
  requiredRole,
  requiredPermissions,
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    // Check if user has higher role privileges
    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.USER]: 1,
      [UserRole.PREMIUM]: 2,
      [UserRole.MODERATOR]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.SUPER_ADMIN]: 5,
    };

    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return <div>You don't have permission to access this page.</div>;
    }
  }

  // Check permission requirements
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = user.permissions || [];
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return <div>You don't have the required permissions to access this page.</div>;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;