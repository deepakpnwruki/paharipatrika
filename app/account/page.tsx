"use client";
import React, { useState, useEffect, useRef } from "react";
import "./account.css";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  provider: "google";
  picture?: string;
};


function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/account/profile");
        if (!res.ok) return null;
        const data = await res.json();
        setProfile(data.user || null);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Google One Tap integration
  useEffect(() => {
    if (profile) return; // Don't show One Tap if already signed in
    // Load Google script
    if (!(window as any).google && !document.getElementById('google-onetap-js')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-onetap-js';
      document.body.appendChild(script);
      script.onload = initializeOneTap;
    } else {
      initializeOneTap();
    }

    function initializeOneTap() {
      if (!(window as any).google || profile) return;
      (window as any).google.accounts.id.initialize({
        client_id: '995344648059-mcie9n87elmccoa4fb75tk8se87h1ft1.apps.googleusercontent.com',
        callback: async (response: any) => {
          try {
            // Decode JWT
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const data = JSON.parse(jsonPayload);
            // Send to backend
            const res = await fetch('/api/account/google-signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: data.email,
                name: data.name,
                sub: data.sub,
                picture: data.picture
              })
            });
            const result = await res.json();
            if (result && result.user) {
              setProfile(result.user);
            } else {
              setError(result?.message || 'Signup failed');
            }
          } catch (e) {
            setError('Google login failed');
          }
        },
        ux_mode: 'popup',
      });
      (window as any).google.accounts.id.renderButton(
        googleButtonRef.current,
        { theme: 'outline', size: 'large', width: 320 }
      );
      (window as any).google.accounts.id.prompt();
    }
    // Cleanup
    return () => {
      if ((window as any).google && (window as any).google.accounts.id) {
        (window as any).google.accounts.id.cancel();
      }
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="login-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (profile) {
    return (
      <div className="login-container" style={{ maxWidth: 420, margin: '48px auto', background: '#fff', borderRadius: 18, boxShadow: '0 6px 32px rgba(0,0,0,0.10)', padding: '40px 32px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {profile.picture && (
          <img src={profile.picture} alt="Profile" style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 18, boxShadow: '0 2px 8px #eee' }} />
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
      <div ref={googleButtonRef} style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }} />
      <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Sign in with Google to continue</p>
      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
    </div>
  );
}

export default AccountPage;