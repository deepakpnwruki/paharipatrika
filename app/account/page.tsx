"use client";
import React, { useState, useEffect } from "react";
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

  // Google One Tap handler (placeholder)
  useEffect(() => {
    // TODO: Integrate real Google One Tap here
  }, []);

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
      {/* Google One Tap button/logic would go here */}
      <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Sign in with Google to continue</p>
      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
    </div>
  );
}

export default AccountPage;