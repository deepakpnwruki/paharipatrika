"use client";
import React, { useState, useEffect, useRef } from "react";
import "./account.css";

type UserProfile = {
  id?: number;
  name: string;
  email: string;
  provider?: "google";
  picture?: string;
  sub?: string;
};


function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read user from localStorage (persisted by global One Tap)
  useEffect(() => {
    function getUserProfile() {
      try {
        const item = localStorage.getItem('pp_google_user');
        return item ? JSON.parse(item) : null;
      } catch { return null; }
    }
    const user = getUserProfile();
    if (user && user.email) {
      setProfile(user);
      setLoading(false);
    } else {
      setProfile(null);
      setLoading(false);
    }
    // Listen for One Tap login event (for instant hydration)
    function handleGoogleUser(e: any) {
      if (e && e.detail && e.detail.user) {
        setProfile(e.detail.user);
      }
    }
    window.addEventListener('pp-google-user', handleGoogleUser);
    return () => window.removeEventListener('pp-google-user', handleGoogleUser);
  }, []);

  // Logout handler
  function handleLogout() {
    try { localStorage.removeItem('pp_google_user'); } catch {}
    setProfile(null);
    // Optionally, reload to trigger One Tap again
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="login-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (profile) {
    return (
      <div className="login-container" style={{ maxWidth: 420, margin: '48px auto', background: '#fff', borderRadius: 18, boxShadow: '0 6px 32px rgba(0,0,0,0.10)', padding: '40px 32px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 18, right: 18 }}>
          <button onClick={handleLogout} style={{ background: '#f2f2f2', border: 'none', borderRadius: 8, padding: '6px 16px', color: '#b80000', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 1px 4px #eee' }}>Logout</button>
        </div>
        {profile.picture && (
          <img src={profile.picture} alt="Profile" style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 18, boxShadow: '0 2px 8px #eee', objectFit: 'cover' }} />
        )}
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>{profile.name}</h2>
        <p style={{ color: '#666', fontSize: '1.13rem', marginBottom: 4 }}>{profile.email}</p>
        <span style={{ background: '#f2f2f2', color: '#b80000', fontWeight: 600, borderRadius: 8, padding: '4px 14px', fontSize: '0.98rem', marginBottom: 18 }}>Google Account</span>
      </div>
    );
  }

  // Only Google One Tap signup remains
  return (
    <div className="login-container">
      <h2 className="login-title">Sign Up / Log In</h2>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
        <div id="g_id_onload"
          data-client_id="995344648059-mcie9n87elmccoa4fb75tk8se87h1ft1.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="popup"
          data-callback=""
        ></div>
        <div className="g_id_signin" data-type="standard" data-shape="rectangular" data-theme="outline" data-text="sign_in_with" data-size="large" data-logo_alignment="left"></div>
      </div>
      <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Sign in with Google to continue</p>
      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
    </div>
  );
}

export default AccountPage;