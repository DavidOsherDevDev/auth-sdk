import React, { useEffect, useState } from 'react';
import { UserListProps, User, UserRole } from '../types';
import { useUsers } from '../hooks';

export const UsersList: React.FC<UserListProps> = ({
  onUserSelect,
  pageSize = 20,
  className = '',
}) => {
  const { 
    users, 
    loading, 
    error, 
    pagination, 
    fetchUsers, 
    searchUsers, 
    updateUser, 
    changeUserRole, 
    deleteUser 
  } = useUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Load users on component mount
  useEffect(() => {
    fetchUsers(1, pageSize);
  }, [fetchUsers, pageSize]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchUsers(query);
    } else {
      await fetchUsers(1, pageSize);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const success = await changeUserRole(userId, newRole);
    if (success) {
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
    }
  };

  const handlePageChange = (page: number) => {
    if (!searchQuery.trim()) {
      fetchUsers(page, pageSize);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getRoleBadgeProps = (role: UserRole) => {
    const roleConfig = {
      [UserRole.USER]: { text: 'User', variant: 'default' },
      [UserRole.PREMIUM]: { text: 'Premium', variant: 'premium' },
      [UserRole.MODERATOR]: { text: 'Moderator', variant: 'moderator' },
      [UserRole.ADMIN]: { text: 'Admin', variant: 'admin' },
      [UserRole.SUPER_ADMIN]: { text: 'Super Admin', variant: 'super-admin' },
    };
    return roleConfig[role] || roleConfig[UserRole.USER];
  };

  return (
    <div className={className}>
      {/* Search Header */}
      <div>
        <h2>Users Management</h2>
        <div>
          <input
            type="text"
            placeholder="Search users by email, name, or ID..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={loading}
          />
          <button 
            onClick={() => fetchUsers(1, pageSize)} 
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div role="alert">
          Error: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div>
          Loading users...
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.uid}
                  onClick={() => handleUserClick(user)}
                  data-selected={selectedUser?.uid === user.uid}
                >
                  <td>
                    <div>
                      {user.photoURL && (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || user.email}
                          width="32"
                          height="32"
                        />
                      )}
                      <div>
                        <div>{user.displayName || 'No name'}</div>
                        <div>{user.uid}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>
                      {user.email}
                      {user.metadata.emailVerified && (
                        <span title="Email verified">✓</span>
                      )}
                    </div>
                  </td>

                  <td>
                    {editingUser === user.uid ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                        onBlur={() => setEditingUser(null)}
                        autoFocus
                      >
                        {Object.values(UserRole).map((role) => (
                          <option key={role} value={role}>
                            {getRoleBadgeProps(role).text}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUser(user.uid);
                        }}
                        data-role-variant={getRoleBadgeProps(user.role).variant}
                      >
                        {getRoleBadgeProps(user.role).text}
                      </span>
                    )}
                  </td>

                  <td>
                    <span data-status={user.isActive ? 'active' : 'inactive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    {formatDate(user.metadata.createdAt)}
                  </td>

                  <td>
                    {user.metadata.lastLoginAt 
                      ? formatDate(user.metadata.lastLoginAt)
                      : 'Never'
                    }
                  </td>

                  <td>
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingUser(user.uid)}
                        disabled={editingUser === user.uid}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.uid)}
                        data-action="delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && !loading && (
            <div>
              {searchQuery ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div>
          <div>
            Showing {users.length} of {pagination.total} users
          </div>
          <div>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              Previous
            </button>
            
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Selected User Details */}
      {selectedUser && (
        <div>
          <h3>User Details</h3>
          <dl>
            <dt>ID</dt>
            <dd>{selectedUser.uid}</dd>
            
            <dt>Email</dt>
            <dd>{selectedUser.email}</dd>
            
            <dt>Display Name</dt>
            <dd>{selectedUser.displayName || 'Not set'}</dd>
            
            <dt>Phone</dt>
            <dd>{selectedUser.phone || 'Not set'}</dd>
            
            <dt>Role</dt>
            <dd>{getRoleBadgeProps(selectedUser.role).text}</dd>
            
            <dt>Status</dt>
            <dd>{selectedUser.isActive ? 'Active' : 'Inactive'}</dd>
            
            <dt>Login Count</dt>
            <dd>{selectedUser.metadata.loginCount}</dd>
            
            <dt>Created</dt>
            <dd>{formatDate(selectedUser.metadata.createdAt)}</dd>
            
            <dt>Last Updated</dt>
            <dd>{formatDate(selectedUser.metadata.updatedAt)}</dd>
            
            <dt>Permissions</dt>
            <dd>
              {selectedUser.permissions.map((permission) => (
                <span key={permission}>{permission}</span>
              ))}
            </dd>
          </dl>
          
          <button onClick={() => setSelectedUser(null)}>
            Close Details
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersList;