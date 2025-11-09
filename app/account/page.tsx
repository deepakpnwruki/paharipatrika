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
  const [googleExtra, setGoogleExtra] = useState<{ name: string; mobile: string } | null>(null);
  const [googleData, setGoogleData] = useState<any>(null);

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

  // Google One Tap handler (simulate)
  useEffect(() => {
    // window.google.accounts.id.initialize({ ... })
    // window.google.accounts.id.prompt();
    // window.google.accounts.id.onCredentialResponse = (response) => { ... };
    // For demo, not implemented
  }, []);



  async function saveGoogleSignup(name: string, email: string, mobile: string, sub: string, picture?: string) {
    const res = await fetch("/api/account/google-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, sub, picture }),
    });
    return res.json();
  }



  const handleGoogleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!googleExtra?.name || !googleExtra?.mobile) {
      setError("Name and mobile are required.");
      return;
    }
    if (!googleData) {
      setError("Google data missing");
      return;
    }
    const res = await saveGoogleSignup(
      googleExtra.name,
      googleData.email,
      googleExtra.mobile,
      googleData.sub,
      googleData.picture
    );
    if (res && res.user) {
      setProfile(res.user);
      setGoogleExtra(null);
      setGoogleData(null);
    } else {
      setError(res?.message || "Signup failed");
    }
  };


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

  // Google One Tap extra info form (simulate)
  if (googleData && !profile) {
    return (
      <div className="login-container">
        <h2 className="login-title">Complete Google Signup</h2>
        <form className="login-form" onSubmit={handleGoogleSignup}>
          <input
            type="text"
            placeholder="Name"
            value={googleExtra?.name || ""}
            onChange={e => setGoogleExtra({ ...googleExtra, name: e.target.value, mobile: googleExtra?.mobile || "" })}
            required
          />
          <input
            type="text"
            placeholder="Mobile"
            value={googleExtra?.mobile || ""}
            onChange={e => setGoogleExtra({ ...googleExtra, name: googleExtra?.name || "", mobile: e.target.value })}
            required
          />
          <button className="login-continue-btn" type="submit">Finish Signup</button>
        </form>
        {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
      </div>
    );
  }

  // Mobile signup form
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