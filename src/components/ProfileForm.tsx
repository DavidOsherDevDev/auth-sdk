import React, { useState, useEffect } from 'react';
import { ProfileFormProps } from '../types';
import { useAuth } from '../hooks';

export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const { user, updateProfile, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    preferences: {
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phone: user.phone || '',
        preferences: {
          language: user.preferences?.language || 'en',
          timezone: user.preferences?.timezone || 'UTC',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true,
            sms: user.preferences?.notifications?.sms ?? false,
          },
        },
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child, grandchild] = field.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        if (parent === 'preferences') {
          if (child === 'notifications' && grandchild) {
            newData.preferences = {
              ...prev.preferences,
              notifications: {
                ...prev.preferences.notifications,
                [grandchild]: value,
              },
            };
          } else {
            newData.preferences = {
              ...prev.preferences,
              [child]: value,
            };
          }
        }
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      return 'Display name is required';
    }

    if (formData.displayName.length < 2) {
      return 'Display name must be at least 2 characters';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      return 'Please enter a valid phone number';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setLocalError(null);
    setIsSubmitting(true);

    // Validation
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      if (onError) onError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await updateProfile({
        displayName: formData.displayName,
        phone: formData.phone || undefined,
        preferences: formData.preferences,
      });
      
      if (success) {
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = error || 'Profile update failed';
        setLocalError(errorMsg);
        if (onError) onError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred';
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;
  const isLoading = loading || isSubmitting;

  if (!user) {
    return (
      <div className={className}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <section>
          <h3>Basic Information</h3>
          
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              readOnly
            />
            <small>Email cannot be changed</small>
          </div>

          <div>
            <label htmlFor="displayName">Display Name *</label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Enter your display name"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              disabled={isLoading}
            />
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h3>Preferences</h3>
          
          <div>
            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={formData.preferences.language}
              onChange={(e) => handleInputChange('preferences.language', e.target.value)}
              disabled={isLoading}
            >
              <option value="en">English</option>
              <option value="he">עברית</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div>
            <label htmlFor="timezone">Timezone</label>
            <select
              id="timezone"
              value={formData.preferences.timezone}
              onChange={(e) => handleInputChange('preferences.timezone', e.target.value)}
              disabled={isLoading}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Jerusalem">Jerusalem</option>
            </select>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3>Notification Preferences</h3>
          
          <div>
            <label>
              <input
                type="checkbox"
                checked={formData.preferences.notifications.email}
                onChange={(e) => handleInputChange('preferences.notifications.email', e.target.checked)}
                disabled={isLoading}
              />
              Email Notifications
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={formData.preferences.notifications.push}
                onChange={(e) => handleInputChange('preferences.notifications.push', e.target.checked)}
                disabled={isLoading}
              />
              Push Notifications
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={formData.preferences.notifications.sms}
                onChange={(e) => handleInputChange('preferences.notifications.sms', e.target.checked)}
                disabled={isLoading}
              />
              SMS Notifications
            </label>
          </div>
        </section>

        {displayError && (
          <div role="alert">
            {displayError}
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;