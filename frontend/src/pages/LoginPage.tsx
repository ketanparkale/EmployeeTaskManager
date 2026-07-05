import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login, clearError } from '../features/auth/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  // Clear any stale error when the page opens.
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Once we have a logged-in user, move to the dashboard.
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    dispatch(login({ email, password, rememberMe }));
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign in</h2>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 400 }}>
            <input
              type="checkbox"
              style={{ width: 'auto' }}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
        </div>

        {error && <div className="error">{error}</div>}

        <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
