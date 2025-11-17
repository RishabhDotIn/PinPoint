import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Api, setAccessToken, clearAccessToken } from '../api.js';

const AuthContext = createContext({ me:null, loading:true, setMe:()=>{}, logout: async ()=>{} });

export function AuthProvider({ children }){
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try {
        // Try refresh then load me
        await Api.refreshToken();
        const data = await Api.getMe();
        if (!data || data.error) setMe(null); else setMe(data);
      } catch { setMe(null); }
      finally { setLoading(false); }
    })();
  },[]);

  const logout = async ()=>{
    try { await Api.logout(); } catch {}
    clearAccessToken();
    setMe(null);
  };

  const value = useMemo(()=>({ me, setMe, loading, logout }), [me, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){ return useContext(AuthContext); }
