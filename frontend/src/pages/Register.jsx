import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', department: 'Computer Engineering', campusId: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (e) => setForm((old) => ({ ...old, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters long.');
    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, department: form.department, campusId: form.campusId });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="auth-page">
    <div className="auth-brand"><Logo dark/><div className="brand-copy"><h1>Your work belongs<br/>in the <i>archive.</i></h1><p>Create your campus student account to submit projects, discover previous work and help the next batch build better.</p><div className="auth-stats"><span><b>01</b> Create account</span><span><b>02</b> Submit projects</span><span><b>03</b> Build together</span></div></div><small>Campus Project Intelligence Platform</small></div>
    <div className="auth-form"><Link to="/" className="back">← Back to home</Link><div className="form-card"><h2>Create account</h2><p>Register as a student to get started.</p>
      <form onSubmit={submit}>
        <label>Full name<input name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={update} minLength={2} required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@campus.edu" value={form.email} onChange={update} required /></label>
        <label>Department<select name="department" value={form.department} onChange={update}><option>Computer Engineering</option><option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>Electrical Engineering</option><option>Mechanical Engineering</option><option>Civil Engineering</option><option>Other</option></select></label>
        <label>Student / Campus ID <small style={{display:'inline',marginLeft:5}}>(optional)</small><input name="campusId" placeholder="e.g. CSE2026-001" value={form.campusId} onChange={update} /></label>
        <label>Password<input name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update} minLength={8} required /></label>
        <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Enter password again" value={form.confirmPassword} onChange={update} minLength={8} required /></label>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn dark full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <div className="form-bottom">Already have an account? <Link to="/login">Sign in</Link></div>
    </div></div>
  </div>;
}
