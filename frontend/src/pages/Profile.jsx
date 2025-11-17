import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Api } from '../api.js';

export default function Profile(){
  const { me, setMe, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [campusId, setCampusId] = useState('');
  const [roll, setRoll] = useState('');
  const [phone, setPhone] = useState('');
  const [campuses, setCampuses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(()=>{
    if (!me) return;
    const p = me.profile || {};
    setEmail(me.email || '');
    setName(p.name || me.name || '');
    setCampusId(p.campusId || me.campusId || '');
    setRoll(p.rollNumber || me.rollNumber || '');
    setPhone(p.phone || me.phone || '');
    (async ()=>{
      try{ setCampuses(await Api.getCampuses('') || []); } catch{ setCampuses([]); }
    })();
  }, [me]);

  const validate = ()=>{
    const e = {};
    if (!name) e.name = 'Please enter your name';
    if (!campusId) e.campus = 'Please select your campus';
    if (!roll) e.roll = 'Please enter roll number';
    if (!/^\d{10}$/.test(phone || '')) e.phone = 'Please enter a valid 10-digit phone number';
    setErrors(e); return Object.keys(e).length === 0;
  };

  async function handleSave(){
    setMsg('');
    if (!validate()) return;
    setSaving(true);
    try{
      const payload = { name, campusId, rollNumber: roll, phone, profile: { name, campusId, rollNumber: roll, phone } };
      const updated = await Api.updateMe(payload);
      if (!updated || updated.error){ setMsg(updated?.error?.message || 'Failed to save'); }
      else { setMe(updated); setMsg('Saved'); }
    }catch{ setMsg('Failed to save'); }
    finally{ setSaving(false); }
  }

  if (!me) return (
    <div className="auth-page">
      <main className="page-content">
        <section className="auth-wrapper">
          <div className="auth-hero"><span className="auth-badge"><i className="fas fa-user"></i> Profile</span><h1 className="auth-title">Complete your profile</h1><p className="auth-sub">Provide your details so we can personalize your PinPoint experience.</p></div>
          <div className="auth-card"><a className="btn btn-primary" href="/register">Go to Login</a></div>
        </section>
      </main>
    </div>
  );

  return (
    <div className="auth-page">
      <main className="page-content">
        <section className="auth-wrapper">
          <div className="auth-hero">
            <span className="auth-badge"><i className="fas fa-user"></i> Profile</span>
            <h1 className="auth-title">Complete your profile</h1>
            <p className="auth-sub">Provide your details so we can personalize your PinPoint experience.</p>
          </div>
          <div className="auth-card" id="profile-card">
            <div className="d-flex align-items-center mb-3">
              <img alt="Profile" src="https://cdn-icons-png.flaticon.com/512/847/847969.png" width="56" height="56" style={{borderRadius:'50%', marginRight:'12px', background:'#0c0f2d'}} />
              <div className="text-muted" style={{fontSize:'12px'}}>Default avatar (you can update later)</div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className="form-control" value={email} disabled />
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" type="text" className={`form-control${errors.name?' error':''}`} value={name} onChange={(e)=>setName(e.target.value)} placeholder="John Doe" />
            </div>

            <div className="form-group">
              <label htmlFor="campus">University / Campus</label>
              <select id="campus" className={`form-control${errors.campus?' error':''}`} value={campusId} onChange={(e)=>setCampusId(e.target.value)}>
                <option value="">Select your campus</option>
                {(campuses||[]).map(c=> <option key={c._id||c.id||c.slug} value={c._id||c.id||''}>{c.name||c.slug}</option>)}
              </select>
              {errors.campus ? <div className="form-note error" style={{display:'block'}}>{errors.campus}</div> : null}
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="roll">Roll Number</label>
                <input id="roll" type="text" className={`form-control${errors.roll?' error':''}`} value={roll} onChange={(e)=>setRoll(e.target.value)} placeholder="e.g., 23BCS1234" />
                {errors.roll ? <div className="form-note error" style={{display:'block'}}>{errors.roll}</div> : null}
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" type="tel" className={`form-control${errors.phone?' error':''}`} value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="e.g., 9876543210" />
                {errors.phone ? <div className="form-note error" style={{display:'block'}}>{errors.phone}</div> : null}
              </div>
            </div>

            <button className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save & Continue'}</button>
            <div className="mt-3 text-muted" style={{fontSize:'12px'}}>You can change this later from your account settings.</div>
            <hr style={{borderColor:'rgba(255,255,255,0.1)', margin:'20px 0'}} />
            <button className="btn btn-outline-danger btn-block" style={{borderColor:'#dc3545', color:'#dc3545'}} onClick={logout}>
              <i className="fas fa-sign-out-alt mr-2"></i> Logout
            </button>
            {msg && <div className="form-note" style={{display:'block', marginTop:'8px'}}>{msg}</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
