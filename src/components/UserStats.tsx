import React, { useEffect } from 'react';
import { UserStatsProps, UserRole } from '../types';
import { useStats } from '../hooks';

export const UserStats: React.FC<UserStatsProps> = ({
  className = '',
  refreshInterval = 0, // 0 means no auto-refresh
}) => {
  const { stats, loading, error, refresh } = useStats(refreshInterval > 0, refreshInterval);

  // Load stats on component mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames = {
      [UserRole.USER]: 'Users',
      [UserRole.PREMIUM]: 'Premium Users',
      [UserRole.MODERATOR]: 'Moderators', 
      [UserRole.ADMIN]: 'Administrators',
      [UserRole.SUPER_ADMIN]: 'Super Administrators',
    };
    return roleNames[role] || role;
  };

  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className={className}>
        <div>Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div role="alert">
          Error loading statistics: {error}
        </div>
        <button onClick={refresh}>
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={className}>
        <div>No statistics available.</div>
        <button onClick={refresh}>
          Load Statistics
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div>
        <h2>User Statistics</h2>
        <button onClick={refresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Overview Cards */}
      <div>
        <div data-stat-type="total">
          <div>
            <h3>Total Users</h3>
            <div>{formatNumber(stats.total)}</div>
          </div>
        </div>

        <div data-stat-type="active">
          <div>
            <h3>Active Users</h3>
            <div>{formatNumber(stats.active)}</div>
            <small>{calculatePercentage(stats.active, stats.total)}% of total</small>
          </div>
        </div>

        <div data-stat-type="inactive">
          <div>
            <h3>Inactive Users</h3>
            <div>{formatNumber(stats.inactive)}</div>
            <small>{calculatePercentage(stats.inactive, stats.total)}% of total</small>
          </div>
        </div>

        <div data-stat-type="new">
          <div>
            <h3>New This Month</h3>
            <div>{formatNumber(stats.newThisMonth)}</div>
            <small>{calculatePercentage(stats.newThisMonth, stats.total)}% of total</small>
          </div>
        </div>
      </div>

      {/* Users by Role */}
      <div>
        <h3>Users by Role</h3>
        <div>
          {Object.entries(stats.byRole).map(([role, count]) => (
            <div key={role} data-role={role}>
              <div>
                <span>{getRoleDisplayName(role as UserRole)}</span>
                <span>{formatNumber(count)}</span>
              </div>
              <div>
                <div 
                  style={{ width: `${calculatePercentage(count, stats.total)}%` }}
                  data-progress-bar
                  data-role={role}
                />
              </div>
              <small>{calculatePercentage(count, stats.total)}%</small>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div>
        <h3>Activity Summary</h3>
        <dl>
          <dt>Total Registered Users</dt>
          <dd>{formatNumber(stats.total)}</dd>
          
          <dt>Active Users</dt>
          <dd>
            {formatNumber(stats.active)} 
            ({calculatePercentage(stats.active, stats.total)}%)
          </dd>
          
          <dt>Inactive Users</dt>
          <dd>
            {formatNumber(stats.inactive)} 
            ({calculatePercentage(stats.inactive, stats.total)}%)
          </dd>
          
          <dt>New Users This Month</dt>
          <dd>
            {formatNumber(stats.newThisMonth)}
            ({calculatePercentage(stats.newThisMonth, stats.total)}%)
          </dd>
          
          <dt>User Retention Rate</dt>
          <dd>{calculatePercentage(stats.active, stats.total)}%</dd>
        </dl>
      </div>

      {/* Quick Actions */}
      <div>
        <h3>Quick Actions</h3>
        <div>
          <button onClick={() => window.location.href = '/admin/users'}>
            View All Users
          </button>
          <button onClick={() => window.location.href = '/admin/users/export'}>
            Export User Data
          </button>
          <button onClick={() => window.location.href = '/admin/analytics'}>
            View Analytics
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div>
        <small>
          Last updated: {new Date().toLocaleString()}
          {refreshInterval > 0 && (
            <span> • Auto-refresh every {Math.round(refreshInterval / 1000)}s</span>
          )}
        </small>
      </div>
    </div>
  );
};

export default UserStats;