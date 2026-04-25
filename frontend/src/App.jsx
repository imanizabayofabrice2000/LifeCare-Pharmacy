// src/App.jsx ✅ FINAL FIXED - Three-Dot Theme Menu + Full CRUD
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// === ♿ ACCESSIBILITY THEMES ===
const a11yThemes = {
  default: {
    '--bg': 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)',
    '--sidebar': '#0f172a', '--sidebar-hover': '#1e293b', '--sidebar-text': '#e2e8f0',
    '--header': '#ffffff', '--card': '#ffffff', '--text': '#0f172a', '--text-muted': '#64748b',
    '--border': '#e2e8f0', '--primary': '#0ea5e9', '--primary-hover': '#0284c7',
    '--accent': '#10b981', '--accent-hover': '#059669', '--success': '#10b981',
    '--warning': '#f59e0b', '--danger': '#ef4444', '--shadow': '0 8px 32px rgba(0,0,0,0.1)',
    '--glass': 'rgba(255, 255, 255, 0.85)', '--font-size': '16px', '--font-family': "'Inter', system-ui, sans-serif",
    '--input-bg': '#ffffff', '--input-text': '#0f172a', '--input-border': '#cbd5e1',
    '--touch-target': '44px'
  },
  highContrast: {
    '--bg': '#000000', '--sidebar': '#000000', '--sidebar-hover': '#333333', '--sidebar-text': '#ffffff',
    '--header': '#000000', '--card': '#1a1a1a', '--text': '#ffffff', '--text-muted': '#cccccc',
    '--border': '#ffffff', '--primary': '#00ffff', '--primary-hover': '#00cccc',
    '--accent': '#00ff00', '--accent-hover': '#00cc00', '--success': '#00ff00',
    '--warning': '#ffff00', '--danger': '#ff0000', '--shadow': 'none',
    '--glass': '#1a1a1a', '--font-size': '18px', '--font-family': "'Inter', system-ui, sans-serif",
    '--input-bg': '#000000', '--input-text': '#ffffff', '--input-border': '#ffffff',
    '--touch-target': '44px'
  },
  largeText: {
    '--bg': 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)',
    '--sidebar': '#0f172a', '--sidebar-hover': '#1e293b', '--sidebar-text': '#e2e8f0',
    '--header': '#ffffff', '--card': '#ffffff', '--text': '#0f172a', '--text-muted': '#64748b',
    '--border': '#e2e8f0', '--primary': '#0ea5e9', '--primary-hover': '#0284c7',
    '--accent': '#10b981', '--accent-hover': '#059669', '--success': '#10b981',
    '--warning': '#f59e0b', '--danger': '#ef4444', '--shadow': '0 8px 32px rgba(0,0,0,0.1)',
    '--glass': 'rgba(255, 255, 255, 0.85)', '--font-size': '22px', '--font-family': "'Inter', system-ui, sans-serif",
    '--input-bg': '#ffffff', '--input-text': '#0f172a', '--input-border': '#cbd5e1',
    '--touch-target': '48px'
  },
  dyslexia: {
    '--bg': '#fffdf5', '--sidebar': '#1a1a2e', '--sidebar-hover': '#16213e', '--sidebar-text': '#f1f1f1',
    '--header': '#fffdf5', '--card': '#fffdf5', '--text': '#1a1a2e', '--text-muted': '#4a4a6a',
    '--border': '#d4c5a0', '--primary': '#0f766e', '--primary-hover': '#0d5c56',
    '--accent': '#10b981', '--accent-hover': '#059669', '--success': '#16a34a',
    '--warning': '#ca8a04', '--danger': '#dc2626', '--shadow': '0 4px 16px rgba(0,0,0,0.08)',
    '--glass': 'rgba(255, 253, 245, 0.9)', '--font-size': '18px', '--font-family': "'OpenDyslexic', 'Comic Sans MS', cursive, sans-serif",
    '--input-bg': '#fffdf5', '--input-text': '#1a1a2e', '--input-border': '#d4c5a0',
    '--touch-target': '44px'
  },
  colorBlind: {
    '--bg': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    '--sidebar': '#0f172a', '--sidebar-hover': '#1e293b', '--sidebar-text': '#f8fafc',
    '--header': '#ffffff', '--card': '#ffffff', '--text': '#0f172a', '--text-muted': '#475569',
    '--border': '#cbd5e1', '--primary': '#2563eb', '--primary-hover': '#1d4ed8',
    '--accent': '#7c3aed', '--accent-hover': '#6d28d9', '--success': '#059669',
    '--warning': '#d97706', '--danger': '#dc2626', '--shadow': '0 8px 32px rgba(0,0,0,0.1)',
    '--glass': 'rgba(255, 255, 255, 0.9)', '--font-size': '16px', '--font-family': "'Inter', system-ui, sans-serif",
    '--input-bg': '#ffffff', '--input-text': '#0f172a', '--input-border': '#cbd5e1',
    '--touch-target': '44px'
  }
};

const applyA11yTheme = (name) => {
  const theme = a11yThemes[name] || a11yThemes.default;
  Object.entries(theme).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  localStorage.setItem('epms_a11y_theme', name);
};

// === 🎨 CLEAN CSS - NO TYPOS ===
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font-family); font-size: var(--font-size); -webkit-tap-highlight-color: transparent; }
  body { background: var(--bg); color: var(--text); transition: background 0.3s ease, color 0.3s ease; min-height: 100vh; line-height: 1.5; }
  button, .btn, input, select, a { min-height: var(--touch-target); min-width: var(--touch-target); display: inline-flex; align-items: center; justify-content: center; }
  
  /* SIDEBAR */
  .sidebar { width: 260px; background: var(--sidebar); color: var(--sidebar-text); position: fixed; top: 0; bottom: 0; left: 0; z-index: 100; display: flex; flex-direction: column; box-shadow: 4px 0 20px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
  .sidebar-header { padding: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .sidebar-brand { font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; flex: 1; }
  .sidebar-brand-icon { font-size: 22px; }
  .sidebar-toggle { background: none; border: none; color: var(--sidebar-text); font-size: 24px; cursor: pointer; padding: 8px; display: none; }
  .nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
  .nav-link { padding: 12px 14px; border-radius: 10px; color: var(--sidebar-text); text-decoration: none; display: flex; align-items: center; gap: 10px; font-weight: 500; font-size: 14px; transition: background 0.2s; }
  .nav-link:hover, .nav-link.active { background: var(--sidebar-hover); }
  .nav-icon { font-size: 18px; min-width: 20px; text-align: center; }
  .sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.1); }
  
  /* MAIN LAYOUT */
  .main { margin-left: 260px; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.3s ease; }
  .header { background: var(--header); border-bottom: 1px solid var(--border); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 90; }
  .page-title { font-size: 18px; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
  .header-actions { display: flex; align-items: center; gap: 8px; }
  
  /* THEME DROPDOWN */
  .theme-dropdown-wrapper { position: relative; }
  .theme-toggle-btn { background: var(--card); border: 2px solid var(--border); border-radius: 10px; padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text); transition: all 0.2s; }
  .theme-toggle-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
  .theme-dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 8px; background: var(--card); border: 2px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); padding: 8px; min-width: 180px; z-index: 100; animation: slideDown 0.2s ease; display: none; flex-direction: column; gap: 4px; }
  .theme-dropdown-menu.active { display: flex; }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .theme-option { padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 10px; transition: background 0.2s; }
  .theme-option:hover { background: var(--primary-light); }
  .theme-option.active { background: var(--primary); color: white; }
  .theme-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--border); }
  
  /* USER PROFILE */
  .user-profile { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; cursor: pointer; }
  .user-profile:hover { background: var(--border); }
  .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
  .user-info { display: none; }
  .user-name { font-weight: 600; font-size: 12px; }
  .user-role { font-size: 10px; color: var(--text-muted); }
  
  /* CONTENT & CARDS */
  .content { padding: 16px; flex: 1; }
  .card { background: var(--glass); backdrop-filter: blur(12px); border: 2px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); padding: 16px; margin-bottom: 16px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 8px; }
  .card-title { font-size: 18px; font-weight: 700; }
  
  /* FORMS */
  .split-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
  .form-section { position: static; }
  .form-group { margin-bottom: 14px; }
  .form-label { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.3px; }
  .form-input, .form-select { width: 100%; padding: 10px 12px; border: 2px solid var(--input-border); border-radius: 10px; background: var(--input-bg); color: var(--input-text); font-size: 14px; transition: 0.2s; }
  .form-input::placeholder { color: var(--text-muted); opacity: 0.7; }
  .form-input:focus, .form-select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(14,165,233,0.15); }
  
  /* BUTTONS */
  .btn { padding: 10px 16px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; }
  .btn-primary { background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; }
  .btn-accent { background: var(--accent); color: white; }
  .btn-danger { background: var(--danger); color: white; }
  .btn-outline { background: transparent; border: 2px solid var(--border); color: var(--text); }
  .btn-sm { padding: 8px 12px; font-size: 12px; border-radius: 8px; }
  
  /* TABLES */
  .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -16px; padding: 0 16px; }
  .data-table { width: 100%; border-collapse: collapse; min-width: 600px; }
  .data-table th, .data-table td { padding: 12px 8px; text-align: left; border-bottom: 1px solid var(--border); font-size: 13px; }
  .data-table th { background: rgba(14,165,233,0.08); font-weight: 700; color: var(--primary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }
  .data-table tr:hover { background: rgba(14,165,233,0.05); }
  .actions { display: flex; gap: 6px; flex-wrap: wrap; }
  
  /* AUTH PAGES */
  .auth-container, .register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .auth-card, .register-card { background: var(--glass); backdrop-filter: blur(20px); border: 2px solid rgba(255,255,255,0.3); border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); width: 100%; max-width: 400px; padding: 24px; }
  .auth-logo { font-size: 24px; margin-bottom: 6px; text-align: center; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .auth-subtitle { text-align: center; color: var(--text-muted); margin-bottom: 20px; font-size: 14px; line-height: 1.5; }
  .auth-form { display: flex; flex-direction: column; gap: 12px; }
  .auth-footer { text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-muted); }
  .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
  .register-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
  
  /* TOAST & BADGES */
  .toast { position: fixed; bottom: 16px; right: 16px; left: 16px; max-width: 400px; margin: 0 auto; padding: 12px 16px; border-radius: 10px; color: white; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.2); animation: slideIn 0.3s ease; z-index: 200; font-size: 13px; text-align: center; }
  .toast-success { background: var(--success); }
  .toast-error { background: var(--danger); }
  @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .badge { padding: 4px 10px; border-radius: 16px; font-size: 11px; font-weight: 700; display: inline-block; }
  .badge-blue { background: rgba(14,165,233,0.15); color: var(--primary); }
  .badge-green { background: rgba(16,185,129,0.15); color: var(--accent); }
  .empty { text-align: center; padding: 32px 16px; color: var(--text-muted); font-size: 14px; }
  
  /* DASHBOARD STATS */
  .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .stat-card { background: var(--card); padding: 14px; border-radius: 10px; text-align: center; border-left: 3px solid var(--primary); }
  .stat-icon { font-size: 20px; margin-bottom: 4px; }
  .stat-value { font-size: 18px; font-weight: 800; }
  .stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
  
  /* MOBILE OVERLAY */
  .mobile-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 99; display: none; }
  .mobile-overlay.active { display: block; }
  
  /* BREAKPOINTS */
  @media (min-width: 768px) {
    .sidebar-toggle { display: block; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 13px; }
    .user-role { font-size: 11px; }
    .page-title { font-size: 20px; max-width: none; }
    .card { padding: 20px; }
    .card-title { font-size: 19px; }
    .stats-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1024px) {
    .sidebar { width: 260px; }
    .main { margin-left: 260px; }
    .split-grid { grid-template-columns: 340px 1fr; }
    .form-section { position: sticky; top: 80px; }
    .register-grid { grid-template-columns: 1fr 1fr; }
    .stats-grid { grid-template-columns: repeat(6, 1fr); }
    .user-info { display: flex; }
  }
  @media (min-width: 1440px) {
    .content { padding: 24px; max-width: 1400px; margin: 0 auto; width: 100%; }
    .card { padding: 24px; }
  }
  @media print {
    .sidebar, .header, .btn, .actions, .theme-dropdown-menu { display: none !important; }
    .main { margin-left: 0 !important; }
    .card { box-shadow: none; border: 1px solid #000; }
    .data-table { min-width: auto; }
  }
`;

// === 🔌 API SETUP ===
const api = axios.create({ baseURL: 'http://localhost:5000/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('epms_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401 || err.response?.status === 403) {
    localStorage.removeItem('epms_token');
    localStorage.removeItem('epms_user');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

// === 🔔 TOAST ===
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast toast-${type}`}><span>{type === 'success' ? '✅' : '❌'}</span>{msg}</div>;
}

// === 🔐 LOGIN PAGE ===
function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await api.post('/auth/login', { Email: form.email, Password: form.password });
      localStorage.setItem('epms_token', res.data.token);
      localStorage.setItem('epms_user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.error || 'Login failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">💊 LifeCare</div>
        <p className="auth-subtitle">Welcome back! Access your secure pharmacy dashboard.</p>
        {msg && <div className="toast toast-error" style={{ position: 'relative', marginBottom: '12px' }}>{msg}</div>}
        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" className="form-input" required placeholder="staff@lifecare.rw" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" required placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? '🔐 Signing in...' : '🔐 Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          New staff? <Link to="/register">Create account →</Link>
        </p>
      </div>
    </div>
  );
}

// === ✨ REGISTER PAGE ===
function RegisterPage() {
  const [form, setForm] = useState({ FirstName: '', LastName: '', Email: '', Password: '', ConfirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await api.post('/auth/register', form);
      setMsg('✅ Account created! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.error || 'Registration failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="auth-logo">✨ Join LifeCare</div>
        <p className="auth-subtitle">Create your staff account. All fields required.</p>
        {msg && <div className="toast toast-error" style={{ position: 'relative', marginBottom: '12px' }}>{msg}</div>}
        <form onSubmit={submit} className="auth-form">
          <div className="register-grid">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input name="FirstName" className="form-input" required placeholder="Jean" value={form.FirstName} onChange={e => setForm({...form, FirstName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input name="LastName" className="form-input" required placeholder="Mugabo" value={form.LastName} onChange={e => setForm({...form, LastName: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="Email" type="email" className="form-input" required placeholder="jean@lifecare.rw" value={form.Email} onChange={e => setForm({...form, Email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="Password" type="password" className="form-input" required placeholder="Min. 8 characters" value={form.Password} onChange={e => setForm({...form, Password: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input name="ConfirmPassword" type="password" className="form-input" required placeholder="Re-enter password" value={form.ConfirmPassword} onChange={e => setForm({...form, ConfirmPassword: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-accent" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? '✨ Creating...' : '✨ Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Have account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}

// === 🗂️ LAYOUT with Three-Dot Theme Dropdown ===
function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('epms_user') || '{}');
  const [a11yTheme, setA11yTheme] = useState(localStorage.getItem('epms_a11y_theme') || 'default');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const titleMap = { '/dashboard': 'Dashboard', '/medicine': 'Medicine', '/stock': 'Stock', '/sales': 'Sales', '/suppliers': 'Suppliers', '/reports': 'Reports' };
  const navs = [
    { p: '/dashboard', l: 'Dashboard', i: '🏠' },
    { p: '/medicine', l: 'Medicine', i: '💊' },
    { p: '/stock', l: 'Stock', i: '📦' },
    { p: '/sales', l: 'Sales', i: '💰' },
    { p: '/suppliers', l: 'Suppliers', i: '👥' },
    { p: '/reports', l: 'Reports', i: '📊' }
  ];

  const handleA11yChange = (theme) => {
    setA11yTheme(theme);
    applyA11yTheme(theme);
    localStorage.setItem('epms_a11y_theme', theme);
    setThemeMenuOpen(false); // ✅ Close dropdown after selection
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleThemeMenu = () => setThemeMenuOpen(!themeMenuOpen);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.theme-dropdown-wrapper')) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="app">
      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>
          <span className="sidebar-brand-icon">💊</span>
          <span className="sidebar-brand">LifeCare</span>
        </div>
        <nav className="nav">
          {navs.map(n => (
            <Link 
              key={n.p} 
              to={n.p} 
              className={`nav-link ${location.pathname === n.p ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{n.i}</span>{n.l}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button 
            className="btn btn-danger" 
            style={{ width: '100%', fontSize: '13px' }} 
            onClick={() => { 
              localStorage.removeItem('epms_token'); 
              localStorage.removeItem('epms_user'); 
              navigate('/login'); 
              setSidebarOpen(false); 
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="main">
        <header className="header">
          <button className="sidebar-toggle" onClick={toggleSidebar} style={{ display: 'block', marginRight: '8px' }}>☰</button>
          <h1 className="page-title">{titleMap[location.pathname] || 'Dashboard'}</h1>
          <div className="header-actions">
            
            {/* ✅ THREE-DOT THEME DROPDOWN */}
            <div className="theme-dropdown-wrapper">
              <button 
                className="theme-toggle-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  toggleThemeMenu(); 
                }} 
                title="Change Theme"
              >
                🎨 Theme
              </button>
              <div className={`theme-dropdown-menu ${themeMenuOpen ? 'active' : ''}`}>
                {[
                  { key: 'default', label: 'Default', color: '#0ea5e9' },
                  { key: 'highContrast', label: 'High Contrast', color: '#00ffff' },
                  { key: 'largeText', label: 'Large Text', color: '#10b981' },
                  { key: 'dyslexia', label: 'Dyslexia', color: '#0f766e' },
                  { key: 'colorBlind', label: 'Color Blind', color: '#2563eb' }
                ].map(t => (
                  <div 
                    key={t.key} 
                    className={`theme-option ${a11yTheme === t.key ? 'active' : ''}`} 
                    onClick={() => handleA11yChange(t.key)}
                  >
                    <span className="theme-dot" style={{ background: t.color }}></span>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
            
            {/* User Profile */}
            <div className="user-profile" onClick={() => navigate('/dashboard')}>
              <div className="user-avatar">
                {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || '')}
              </div>
              <div className="user-info">
                <span className="user-name">{user.firstName || 'User'}</span>
                <span className="user-role">{user.role || 'Staff'}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

function Protected({ children }) {
  return localStorage.getItem('epms_token') ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

// === 📝 CRUD PAGE (Mobile Optimized) ===
function CRUDPage({ title, collection, columns, formFields, idKey }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${collection}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
    } catch (err) {
      console.error(`Failed to load ${collection}:`, err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/${collection}/${editId}`, form);
        setToast({ msg: '✅ Updated!', type: 'success' });
      } else {
        const res = await api.post(`/${collection}`, form);
        if (res.data && res.data[idKey]) {
          setItems(prev => {
            const exists = prev.some(i => i[idKey] === res.data[idKey]);
            return exists ? prev : [...prev, res.data];
          });
        }
        setToast({ msg: '✅ Added!', type: 'success' });
      }
      setForm({});
      setEditId(null);
      await load();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Operation failed';
      setToast({ msg: `❌ ${errMsg}`, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Delete this ${title}?`)) {
      try {
        await api.delete(`/${collection}/${id}`);
        setItems(prev => prev.filter(it => it[idKey] !== id));
        setToast({ msg: '✅ Deleted!', type: 'success' });
        await load();
      } catch (err) {
        setToast({ msg: `❌ ${err.response?.data?.error || 'Delete failed'}`, type: 'error' });
      }
    }
  };

  return (
    <div className="split-grid">
      {/* FORM SECTION */}
      <div className="card form-section">
        <h3 style={{ marginBottom: '16px', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {editId ? '✏️ Edit' : '➕ Add'} <span className="badge badge-blue">{title}</span>
        </h3>
        <form onSubmit={submit}>
          {formFields.map(f => (
            <div className="form-group" key={f.name}>
              <label className="form-label">{f.label}</label>
              {f.type === 'select' ? (
                <select 
                  name={f.name} 
                  value={form[f.name] || ''} 
                  onChange={e => setForm({...form, [e.target.name]: e.target.value})} 
                  className="form-select" 
                  required 
                  disabled={!!editId}
                >
                  <option value="">Select...</option>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input 
                  type={f.type || 'text'} 
                  name={f.name} 
                  value={form[f.name] || ''} 
                  onChange={e => setForm({...form, [e.target.name]: e.target.value})} 
                  className="form-input" 
                  required 
                  placeholder={f.label}
                />
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-accent" style={{ flex: 1, minWidth: '120px' }}>
              {editId ? '🔄 Update' : '✨ Save'}
            </button>
            {editId && (
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => { setEditId(null); setForm({}); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST SECTION */}
      <div className="card" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontWeight: '700', fontSize: '16px' }}>📋 {title} Records</h3>
          <span className="badge badge-green">{items.length} items</span>
        </div>
        {loading ? (
          <p className="empty">⏳ Loading...</p>
        ) : items.length === 0 ? (
          <p className="empty">📦 No records yet. Add your first item!</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it[idKey]}>
                    {columns.map(c => <td key={c.key}>{c.render ? c.render(it[c.key], it) : it[c.key]}</td>)}
                    <td className="actions">
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => { setEditId(it[idKey]); setForm({...it}); }}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDelete(it[idKey])}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// === 📄 PAGES ===
function MedicinePage() { 
  return <CRUDPage 
    title="Medicine" 
    collection="medicines" 
    columns={[
      {key:'MedicineID',label:'ID'},
      {key:'Name',label:'Name'},
      {key:'Category',label:'Category'},
      {key:'ExpiryDate',label:'Expiry',render:v=>new Date(v).toLocaleDateString()}
    ]} 
    formFields={[
      {name:'Name',label:'Medicine Name'},
      {name:'Category',label:'Category'},
      {name:'ExpiryDate',label:'Expiry Date',type:'date'}
    ]} 
    idKey="MedicineID" 
  />; 
}

function StockPage() { 
  const [meds, setMeds] = useState([]);
  useEffect(() => { 
    api.get('/medicines').then(r => setMeds(Array.isArray(r.data) ? r.data : [])); 
  }, []);
  return <CRUDPage 
    title="Stock" 
    collection="stocks" 
    columns={[
      {key:'StockID',label:'ID'},
      {key:'MedicineID',label:'Medicine',render:id=>meds.find(m=>m.MedicineID==id)?.Name||`#${id}`},
      {key:'QuantityAvailable',label:'Qty'},
      {key:'UnitPrice',label:'Price ($)',render:v=>`$${v}`}
    ]} 
    formFields={[
      {name:'MedicineID',label:'Medicine',type:'select',options:meds.map(m=>({value:m.MedicineID,label:`${m.Name} (ID: ${m.MedicineID})`}))},
      {name:'QuantityAvailable',label:'Quantity',type:'number'},
      {name:'UnitPrice',label:'Unit Price ($)',type:'number'}
    ]} 
    idKey="StockID" 
  />; 
}

function SuppliersPage() { 
  return <CRUDPage 
    title="Supplier" 
    collection="suppliers" 
    columns={[
      {key:'SupplierID',label:'ID'},
      {key:'SupplierName',label:'Name'},
      {key:'Contact',label:'Contact'}
    ]} 
    formFields={[
      {name:'SupplierName',label:'Supplier Name'},
      {name:'Contact',label:'Contact'}
    ]} 
    idKey="SupplierID" 
  />; 
}

function SalesPage() { 
  const [meds, setMeds] = useState([]);
  useEffect(() => { 
    api.get('/medicines').then(r => setMeds(Array.isArray(r.data) ? r.data : [])); 
  }, []);
  return <CRUDPage 
    title="Sale" 
    collection="sales" 
    columns={[
      {key:'SaleID',label:'ID'},
      {key:'MedicineID',label:'Medicine',render:id=>meds.find(m=>m.MedicineID==id)?.Name||`#${id}`},
      {key:'CustomerName',label:'Customer'},
      {key:'QuantitySold',label:'Qty'},
      {key:'TotalAmount',label:'Amount ($)',render:v=>`$${v}`},
      {key:'SaleDate',label:'Date',render:v=>new Date(v).toLocaleString()}
    ]} 
    formFields={[
      {name:'MedicineID',label:'Medicine',type:'select',options:meds.map(m=>({value:m.MedicineID,label:m.Name}))},
      {name:'CustomerName',label:'Customer'},
      {name:'QuantitySold',label:'Quantity',type:'number'},
      {name:'TotalAmount',label:'Amount ($)',type:'number'}
    ]} 
    idKey="SaleID" 
  />; 
}

function ReportsPage() { 
  const [sales, setSales] = useState([]);
  useEffect(() => { 
    api.get('/sales').then(r => setSales(Array.isArray(r.data) ? r.data : [])); 
  }, []);
  const rev = sales.reduce((s,i)=>s+Number(i.TotalAmount||0),0);
  const qty = sales.reduce((s,i)=>s+Number(i.QuantitySold||0),0);
  return (
    <div className="card">
      <h3 style={{ marginBottom: '12px', fontWeight: '700', fontSize: '16px' }}>📊 Sales Analytics</h3>
      <div className="stats-grid">
        {[
          {i:'💵',l:'Revenue',v:`$${rev.toFixed(2)}`,c:'var(--primary)'},
          {i:'📦',l:'Items Sold',v:qty,c:'var(--accent)'},
          {i:'🧮',l:'Avg/Sale',v:sales.length?`$${(rev/sales.length).toFixed(2)}`:'$0',c:'var(--text-muted)'}
        ].map((s,k)=>(
          <div key={k} className="stat-card" style={{ borderLeftColor: s.c }}>
            <div className="stat-icon">{s.i}</div>
            <div className="stat-value">{s.v}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  ); 
}

function DashboardPage() { 
  return (
    <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
      <h2 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: '800' }}>👋 Welcome</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
        Manage your pharmacy efficiently.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <Link to="/medicine"><button className="btn btn-primary btn-sm">💊 Medicines</button></Link>
        <Link to="/stock"><button className="btn btn-outline btn-sm">📦 Stock</button></Link>
        <Link to="/sales"><button className="btn btn-outline btn-sm">💰 Sales</button></Link>
      </div>
    </div>
  ); 
}

// === 🚀 MAIN APP ===
export default function App() {
  useEffect(() => { 
    const s = document.createElement('style'); 
    s.textContent = css; 
    document.head.appendChild(s); 
    applyA11yTheme(localStorage.getItem('epms_a11y_theme') || 'default');
    return () => document.head.removeChild(s); 
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/medicine" element={<Protected><MedicinePage /></Protected>} />
        <Route path="/stock" element={<Protected><StockPage /></Protected>} />
        <Route path="/sales" element={<Protected><SalesPage /></Protected>} />
        <Route path="/suppliers" element={<Protected><SuppliersPage /></Protected>} />
        <Route path="/reports" element={<Protected><ReportsPage /></Protected>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}