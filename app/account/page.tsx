"use client";
import './account.css';
import React, { useState } from 'react';
import Link from 'next/link';
export default function AccountPage() {
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Mobile submit handler must be defined before use
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!/^\d{10}$/.test(mobile)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://cms.paharipatrika.in/wp-json/reader/v1/save-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '+91' + mobile }),
      });
      const data = await res.json();
      if (data && typeof data === 'object') {
        if (data.success) {
          setMessage('Thank you!');
          setMobile("");
        } else if (data.message) {
          setMessage(data.message);
        } else {
          setMessage('Submission failed. Please try again.');
        }
      } else {
        setMessage('Unexpected response from server.');
      }
    } catch (err) {
  setMessage('Network error');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="login-container">
        <h1 className="login-title">Log in or sign up</h1>
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
          <button type="submit" className="login-continue-btn" disabled={loading} style={{width: '100%', fontSize: '1.1rem', padding: '12px 0', margin: '12px 0 0 0'}}>
            {loading ? 'Submitting...' : 'Continue'}
          </button>
          <p className="login-terms small" style={{textAlign: 'center', margin: '16px 0 0 0', fontSize: '0.97rem', color: '#666'}}>
            After completing login, you agree to our
            <Link href="/terms" className="login-link"> Terms</Link> &amp;
            <Link href="/privacy" className="login-link"> Privacy Policy</Link>.
          </p>
          {message && (
            <div className="login-message" style={{ marginTop: 16, color: '#b80000', minHeight: 24, textAlign: 'center', fontWeight: 500 }}>{message}</div>
          )}
        </form>
      </div>
    </>
  );
}
