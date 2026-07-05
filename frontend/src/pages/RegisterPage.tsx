import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { register } from '../features/auth/authSlice';
import type { Role } from '../types';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('Employee');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');

  // Field-level validation messages we compute on the client.
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  // Same password rule the backend enforces: 8+ chars, upper, lower, number.
  const passwordOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError('');

    if (!passwordOk) {
      setValidationError('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    try {
      // unwrap() throws if the thunk failed, so we can await success/failure.
      await dispatch(register({ fullName, email, password, role, department, designation })).unwrap();
      setSuccess('Registration successful! Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      // The API error is already stored in Redux and shown below.
    }
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit} style={{ maxWidth: 460 }}>
        <h2>Create account</h2>

        <div className="form-group">
          <label>Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Confirm password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Department</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Designation</label>
            <input value={designation} onChange={(e) => setDesignation(e.target.value)} required />
          </div>
        </div>

        {validationError && <div className="error">{validationError}</div>}
        {error && <div className="error">{error}</div>}
        {success && <div style={{ color: '#166534', fontSize: '0.9rem' }}>{success}</div>}

        <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {loading ? 'Creating…' : 'Register'}
        </button>

        <p className="muted" style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
