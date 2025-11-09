"use client";
import './account.css';


import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type UserProfile = {
  email?: string;
  display_name?: string;
  picture?: string;
  mobile?: string;
  name?: string;
  ID?: string;
};
import Link from 'next/link';
export default function AccountPage() {
  // Store intended return URL if present in query string
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo');
      if (returnTo) {
        localStorage.setItem('returnToAfterAuth', returnTo);
      }
    }
  }, []);
  const [mobile, setMobile] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userSignedIn, setUserSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateName, setUpdateName] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Check localStorage for Google One Tap or mobile login
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        const parsed = JSON.parse(profile);
        // Consider user signed in if either mobile or ID is present
        if (parsed && (parsed.mobile || parsed.ID)) {
          setUserSignedIn(true);
          setUserProfile(parsed);
        }
      }
    }

    // Listen for Google One Tap login event
    const handler = async (e: Event) => {
  // @ts-expect-error Google One Tap event detail shape is not typed
      const response = e.detail;
      function parseJwt(token: string) {
        try {
          return JSON.parse(atob(token.split('.')[1]));
        } catch {
          return null;
        }
      }
      const payload = parseJwt(response.credential);
      if (payload && payload.email) {
        try {
          const res = await fetch('https://cms.paharipatrika.in/wp-json/reader/v1/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              sub: payload.sub
            })
          });
          const data = await res.json();
          if (data.success && data.user && data.user.ID) {
            setUserSignedIn(true);
            setUserProfile({
              email: data.user.email,
              display_name: data.user.display_name,
              picture: payload.picture,
              ID: data.user.ID
            });
            localStorage.setItem('userSignedUp', 'true');
            localStorage.setItem('userProfile', JSON.stringify({
              email: data.user.email,
              display_name: data.user.display_name,
              picture: payload.picture,
              ID: data.user.ID
            }));
            // Redirect to comment page if needed
            const returnTo = localStorage.getItem('returnToAfterAuth');
            if (returnTo) {
              localStorage.removeItem('returnToAfterAuth');
              window.location.href = returnTo;
            }
          }
        } catch {
          setMessage('Google login failed. Please try again.');
        }
      }
    };
    window.addEventListener('google-one-tap-credential', handler);
    return () => window.removeEventListener('google-one-tap-credential', handler);
  }, []);

  // Mobile submit handler must be defined before use
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!/^\d{10}$/.test(mobile)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!signupEmail || !/^\S+@\S+\.\S+$/.test(signupEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://cms.paharipatrika.in/wp-json/reader/v1/save-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '+91' + mobile, email: signupEmail })
      });
      const data = await res.json();
      if (data && typeof data === 'object') {
        if (data.success && data.user && data.user.mobile) {
          setUserSignedIn(true);
          setUserProfile({
            mobile: data.user.mobile,
            name: data.user.name,
            email: data.user.email
          });
          localStorage.setItem('userSignedUp', 'true');
          localStorage.setItem('userProfile', JSON.stringify({
            mobile: data.user.mobile,
            name: data.user.name,
            email: data.user.email
          }));
          // Only show update form if missing name or email
          if (!data.user.name || !data.user.email) {
            setShowUpdateForm(true);
            setUpdateName(data.user.name || "");
            setUpdateEmail(data.user.email || "");
            setMessage(data.message || 'Mobile registered.');
          } else {
            setShowUpdateForm(false);
            setMessage(data.message || 'Mobile registered.');
            // Redirect to comment page if needed
            const returnTo = localStorage.getItem('returnToAfterAuth');
            if (returnTo) {
              localStorage.removeItem('returnToAfterAuth');
              window.location.href = returnTo;
            }
          }
        } else if (data.success) {
          setMessage('Thank you!');
        } else if (data.message) {
          setMessage(data.message);
        } else {
          setMessage('Submission failed. Please try again.');
        }
      } else {
        setMessage('Unexpected response from server.');
      }
    } catch {
      setMessage('Network error');
    }
    setLoading(false);
  };

  // Handle update name/email for existing mobile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch('https://cms.paharipatrika.in/wp-json/reader/v1/save-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: userProfile?.mobile,
          name: updateName,
          email: updateEmail
        })
      });
      const data = await res.json();
      if (data.success && data.user && data.user.mobile) {
        setUserSignedIn(true);
        setUserProfile({
          mobile: data.user.mobile,
          name: data.user.name,
          email: data.user.email
        });
        localStorage.setItem('userSignedUp', 'true');
        localStorage.setItem('userProfile', JSON.stringify({
          mobile: data.user.mobile,
          name: data.user.name,
          email: data.user.email
        }));
        setShowUpdateForm(false);
        setMessage('Profile updated and signed in!');
        // Redirect to comment page if needed
        const returnTo = localStorage.getItem('returnToAfterAuth');
        if (returnTo) {
          localStorage.removeItem('returnToAfterAuth');
          window.location.href = returnTo;
        }
      } else {
        setMessage(data.message || 'Update failed.');
      }
    } catch {
      setMessage('Network error');
    }
    setLoading(false);
  };

  if (userSignedIn && userProfile) {
    if (editMode) {
      return (
        <div className="login-container">
          <h1 className="login-title">Edit Profile</h1>
          <form className="login-form" onSubmit={async (e) => {
            e.preventDefault();
            setMessage("");
            setLoading(true);
            try {
              const res = await fetch('https://cms.paharipatrika.in/wp-json/reader/v1/save-mobile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  mobile: userProfile.mobile,
                  name: updateName,
                  email: updateEmail
                })
              });
              const data = await res.json();
              if (data.success && data.user) {
                setUserProfile({
                  ...userProfile,
                  name: data.user.name,
                  email: data.user.email
                });
                localStorage.setItem('userProfile', JSON.stringify({
                  ...userProfile,
                  name: data.user.name,
                  email: data.user.email
                }));
                setEditMode(false);
                setMessage('Profile updated!');
              } else {
                setMessage(data.message || 'Update failed.');
              }
            } catch {
              setMessage('Network error');
            }
            setLoading(false);
          }}>
            <input
              type="text"
              className="login-phone-input"
              placeholder="Your Name"
              value={updateName}
              onChange={e => setUpdateName(e.target.value)}
              style={{marginBottom: 12}}
            />
            <input
              type="email"
              className="login-phone-input"
              placeholder="Your Email"
              value={updateEmail}
              onChange={e => setUpdateEmail(e.target.value)}
              style={{marginBottom: 12}}
            />
            <button type="submit" className="login-continue-btn" disabled={loading} style={{width: '100%', fontSize: '1.1rem', padding: '12px 0', margin: '12px 0 0 0'}}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="login-continue-btn" style={{background:'#888',marginTop:8}} onClick={() => setEditMode(false)}>Cancel</button>
            {message && (
              <div className="login-message" style={{ marginTop: 16, color: '#b80000', minHeight: 24, textAlign: 'center', fontWeight: 500 }}>{message}</div>
            )}
          </form>
        </div>
      );
    }
    return (
      <div className="account-container beautiful-account" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f8f8',
      }}>
        <div className="account-card" style={{
          maxWidth: 370,
          width: '100%',
          margin: '0 auto',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 3px 16px #0001',
          padding: 28,
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: 20 }}>
            {(userProfile && userProfile.picture) ? (
              <Image
                src={userProfile.picture}
                alt="Profile"
                width={72}
                height={72}
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2.5px solid #e0e0e0',
                  boxShadow: '0 2px 8px #0001',
                  background: '#fafafa',
                }}
                priority
              />
            ) : (
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#ececec',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                color: '#bbb',
                margin: '0 auto',
                boxShadow: '0 2px 8px #0001',
              }}>
                <span>👤</span>
              </div>
            )}
          </div>
          <h2 className="account-welcome" style={{
            fontWeight: 700,
            fontSize: 17,
            marginBottom: 8,
            color: '#222',
            letterSpacing: 0.1,
          }}>
            {userProfile ? (userProfile.name || userProfile.display_name || userProfile.mobile || userProfile.email) : ''}
          </h2>
          <div style={{ margin: '0 auto 8px auto', maxWidth: 220 }}>
            {userProfile && userProfile.email && (
              <div style={{
                background: '#f5f5f5',
                borderRadius: 6,
                padding: '5px 0',
                marginBottom: 4,
                fontSize: 13,
                color: '#444',
                fontWeight: 500,
              }}>{userProfile.email}</div>
            )}
            {userProfile && userProfile.mobile && (
              <div style={{
                background: '#f5f5f5',
                borderRadius: 6,
                padding: '5px 0',
                fontSize: 13,
                color: '#444',
                fontWeight: 500,
              }}>{userProfile.mobile}</div>
            )}
          </div>
          <div className="account-actions" style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button className="account-logout-btn" style={{
              background: '#e53935',
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              padding: '7px 16px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }} onClick={() => {
              localStorage.removeItem('userSignedUp');
              localStorage.removeItem('userProfile');
              setUserSignedIn(false);
              setUserProfile(null);
              setShowUpdateForm(false);
              setUpdateName("");
              setUpdateEmail("");
              window.location.href = '/';
            }}>Log out</button>
            <button className="account-logout-btn" style={{
              background:'#f5c518',
              color:'#222',
              border:'none',
              borderRadius:7,
              padding:'7px 16px',
              fontWeight:600,
              fontSize: 14,
              cursor:'pointer',
            }} onClick={() => {
              setEditMode(true);
              setUpdateName(userProfile ? (userProfile.name || userProfile.display_name || '') : '');
              setUpdateEmail(userProfile ? (userProfile.email || '') : '');
            }}>Edit Profile</button>
          </div>
        </div>
      </div>
    );
  }

  if (showUpdateForm && userProfile) {
    // Only show update form if missing name or email
    if (!userProfile.name || !userProfile.email) {
      return (
        <div className="login-container">
          <h1 className="login-title">Update your profile</h1>
          {message && (
            <div className={message === 'Network error' ? 'network-error-box' : 'login-message'} style={message === 'Network error' ? { marginBottom: 16, color: '#fff', background: '#b80000', padding: '12px', borderRadius: 8, textAlign: 'center', fontWeight: 600 } : { marginTop: 16, color: '#b80000', minHeight: 24, textAlign: 'center', fontWeight: 500 }}>
              {message}
            </div>
          )}
          <form className="login-form" onSubmit={handleUpdateProfile}>
            <div className="login-phone-group" style={{gap: 0, padding: '0 0 0 8px', marginBottom: 16}}>
              <span className="login-phone-country-code">{userProfile.mobile}</span>
            </div>
            <input
              type="text"
              className="login-phone-input"
              placeholder="Your Name"
              value={updateName}
              onChange={e => setUpdateName(e.target.value)}
              style={{marginBottom: 12}}
            />
            <input
              type="email"
              className="login-phone-input"
              placeholder="Your Email"
              value={updateEmail}
              onChange={e => setUpdateEmail(e.target.value)}
              style={{marginBottom: 12}}
            />
            <button type="submit" className="login-continue-btn" disabled={loading} style={{width: '100%', fontSize: '1.1rem', padding: '12px 0', margin: '12px 0 0 0'}}>
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>
        </div>
      );
    } else {
      // If user has name and email, skip update form
      setShowUpdateForm(false);
    }
  }

  return (
    <>
      <div className="login-container">
        <h1 className="login-title">Log in or sign up</h1>
        {message && (
          <div className={message === 'Network error' ? 'network-error-box' : 'login-message'} style={message === 'Network error' ? { marginBottom: 16, color: '#fff', background: '#b80000', padding: '12px', borderRadius: 8, textAlign: 'center', fontWeight: 600 } : { marginTop: 16, color: '#b80000', minHeight: 24, textAlign: 'center', fontWeight: 500 }}>
            {message}
          </div>
        )}
        <form className="login-form" onSubmit={handleMobileSubmit}>
          <div className="login-phone-group" style={{gap: 0, padding: '0 0 0 8px', marginBottom: 16}}>
            <span className="login-phone-flag" aria-hidden="true" style={{marginRight: 8}}>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 85.48" width="22" height="14" style={{borderRadius:'2px',boxShadow:'0 0 1px #aaa', marginRight: '6px'}}><g><path fill="#FF9933" d="M6.71,0h109.46c3.7,0.02,6.71,3.05,6.71,6.75v71.98c0,3.71-3.04,6.75-6.75,6.75l-109.42,0 C3.02,85.46,0,82.43,0,78.73V6.75C0,3.05,3.01,0.02,6.71,0L6.71,0z"/><polygon fill="#fff" points="0,28.49 122.88,28.49 122.88,56.99 0,56.99 0,28.49"/><path fill="#128807" d="M0,56.99h122.88v21.74c0,3.71-3.04,6.75-6.75,6.75l-109.42,0C3.02,85.46,0,82.43,0,78.73V56.99L0,56.99z"/><path fill="#000088" d="M72.84,42.74c0-6.3-5.1-11.4-11.4-11.4s-11.4,5.1-11.4,11.4c0,6.29,5.1,11.4,11.4,11.4 S72.84,49.04,72.84,42.74L72.84,42.74z"/><path fill="#fff" d="M71.41,42.74c0-5.51-4.46-9.97-9.97-9.97s-9.97,4.46-9.97,9.97c0,5.51,4.46,9.97,9.97,9.97 S71.41,48.25,71.41,42.74L71.41,42.74z"/><path fill="#000088" d="M63.43,42.74c0-1.1-0.89-2-1.99-2s-1.99,0.89-1.99,2c0,1.1,0.89,1.99,1.99,1.99S63.43,43.84,63.43,42.74L63.43,42.74z"/></g></svg>
              <span className="login-phone-country-code">+91</span>
            </span>
            <input
              type="tel"
              className="login-phone-input"
              placeholder="Enter your phone number"
              maxLength={10}
              pattern="[0-9]{10}"
              required
              inputMode="numeric"
              style={{flex: 1, minWidth: 0, fontSize: '1.1rem', border: 'none', background: 'transparent', outline: 'none', padding: '12px 8px'}}
              value={mobile}
              onChange={e => {
                // Only allow digits
                const val = e.target.value.replace(/[^0-9]/g, "");
                setMobile(val);
              }}
            />
          </div>
          <input
            type="email"
            className="login-phone-input"
            placeholder="Enter your email address"
            required
            style={{width: '100%', fontSize: '1.1rem', marginBottom: 12, padding: '12px 8px'}}
            value={signupEmail}
            onChange={e => setSignupEmail(e.target.value)}
          />
          <button type="submit" className="login-continue-btn" disabled={loading} style={{width: '100%', fontSize: '1.1rem', padding: '12px 0', margin: '12px 0 0 0'}}>
            {loading ? 'Submitting...' : 'Continue'}
          </button>
          <p className="login-terms small" style={{textAlign: 'center', margin: '16px 0 0 0', fontSize: '0.97rem', color: '#666'}}>
            After completing login, you agree to our
            <Link href="/terms" className="login-link"> Terms</Link> &amp;
            <Link href="/privacy" className="login-link"> Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </>
  );
}
