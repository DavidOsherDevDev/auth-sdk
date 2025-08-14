import React, { useState } from 'react';
import { RegisterFormProps, UserRole } from '../types';
import { useAuth } from '../hooks';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  className = '',
  showLoginLink = true,
  defaultRole = UserRole.USER,
}) => {
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, displayName } = formData;

    if (!email || !password || !displayName) {
      return 'Please fill in all required fields';
    }

    if (!email.includes('@')) {
      return 'Please enter a valid email address';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setLocalError(null);

    // Validation
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      if (onError) onError(validationError);
      return;
    }

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        role: defaultRole,
      });
      
      if (success) {
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = error || 'Registration failed';
        setLocalError(errorMsg);
        if (onError) onError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred';
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
    }
  };

  const displayError = localError || error;

  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="displayName">Full Name *</label>
          <input
            id="displayName"
            type="text"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Enter your full name"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
            required
          />
          <small>
            Password must be at least 8 characters with uppercase, lowercase, number, and special character
          </small>
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            disabled={loading}
            required
          />
        </div>

        {displayError && (
          <div role="alert">
            {displayError}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {showLoginLink && (
        <div>
          <p>
            Already have an account?{' '}
            <button type="button" onClick={() => console.log('Navigate to login')}>
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;