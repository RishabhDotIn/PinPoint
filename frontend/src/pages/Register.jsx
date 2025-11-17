import React, { useState } from 'react';
import { Api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const { setMe } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('email'); // 'email' | 'login' | 'register'

  async function handleContinue(){
    setError('');
    const allowedDomain = '@chitkara.edu.in';
    if (!email) { setError('Enter email'); return; }
    if (!email.toLowerCase().endsWith(allowedDomain)) { setError('Only Chitkara University email is allowed.'); return; }
    try{
      setLoading(true);
      const res = await Api.checkEmail(email);
      if (res?.exists && res?.hasPassword) setPhase('login');
      else setPhase('register');
    } catch (e){
      setError('');
      setPhase('login');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(){
    setError('');
    if (!password) { setError('Enter your password'); return; }
    try{
      setLoading(true);
      const data = await Api.login(email, password);
      console.log('login response', data);
      if (data && data.accessToken){
        const me = await Api.getMe();
        setMe(me && !me.error ? me : null);
        if (me && !me.error && (me.profileCompleted || me.profile?.campusId)) navigate('/', { replace: true });
        else navigate('/profile', { replace: true });
      } else {
        const msg = (data && (data.message || data.error?.message)) || 'Login failed';
        setError(msg);
      }
    } catch {
      setError('Login failed');
    } finally { setLoading(false); }
  }

  async function handleRegister(){
    setError('');
    if (!password) { setError('Set a password'); return; }
    try{
      setLoading(true);
      const data = await Api.register(email, password, '');
      console.log('register response', data);
      if (data && data.accessToken){
        const me = await Api.getMe();
        setMe(me && !me.error ? me : null);
        navigate('/profile', { replace: true });
      } else {
        const msg = (data && (data.message || data.error?.message)) || 'Registration failed';
        setError(msg);
      }
    } catch {
      setError('Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <main className="page-content">
        <section className="auth-wrapper">
          {/* Hero */}
          <div className="auth-hero">
            <span className="auth-badge"><i className="fas fa-lock"></i> Secure Password Login</span>
            <h1 className="auth-title">Sign in or Create your PinPoint account</h1>
            <p className="auth-sub">Use your college email and a password. Passwords are stored securely using strong hashing.</p>
          </div>

          {/* Card */}
          <div className="auth-card" id="form-container">
            {loading && (
              <div className="auth-loading" style={{display:'flex'}} aria-live="polite" aria-busy="true">
                <div className="auth-loading-box">
                  <div className="spinner" role="status" aria-label="Loading"></div>
                  <div className="auth-loading-text">Working...</div>
                </div>
              </div>
            )}
            <h2 className="mb-2">Welcome</h2>
            <div className="auth-help">Enter your college email and password to sign in or register.</div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className={`form-control${error && phase==='email' ? ' error' : ''}`} placeholder="your@chitkara.edu.in" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            {phase !== 'email' && (
              <div className="form-group mt-3">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" className={`form-control${error && phase!=='email' ? ' error' : ''}`} placeholder="Your password" value={password} onChange={(e)=>setPassword(e.target.value)} />
              </div>
            )}
            {error ? (<div className="form-note error" style={{display:'block'}}>{error}</div>) : null}
            {phase === 'email' && (
              <button type="button" className="btn btn-primary btn-block mt-2" onClick={handleContinue}>Continue</button>
            )}
            {phase === 'login' && (
              <div className="d-flex mt-2">
                <button type="button" className="btn btn-primary btn-block mr-2" onClick={handleLogin}>Login</button>
                <button type="button" className="btn btn-success btn-block" onClick={()=>setPhase('register')}>Switch to Register</button>
              </div>
            )}
            {phase === 'register' && (
              <div className="d-flex mt-2">
                <button type="button" className="btn btn-success btn-block" onClick={handleRegister}>Set Password & Register</button>
                <button type="button" className="btn btn-primary btn-block ml-2" onClick={()=>setPhase('login')}>Switch to Login</button>
              </div>
            )}
            <div className="mt-3 text-muted" style={{fontSize:'12px'}}>
              By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
