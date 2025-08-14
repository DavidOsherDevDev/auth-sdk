import React, { useState } from 'react';
import { LoginFormProps } from '../types';
import { useAuth } from '../hooks';

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  className = '',
  showRegisterLink = true,
}) => {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setLocalError(null);

    // Validation
    if (!email || !password) {
      const errorMsg = 'Please fill in all fields';
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    if (!email.includes('@')) {
      const errorMsg = 'Please enter a valid email address';
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    try {
      const success = await login(email, password);
      
      if (success) {
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = error || 'Login failed';
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
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {showRegisterLink && (
        <div>
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={() => console.log('Navigate to register')}>
              Sign up
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;