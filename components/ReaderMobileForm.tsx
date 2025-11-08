
"use client";
import React, { useState } from "react";

export default function ReaderMobileForm() {
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!/^\+?[0-9]{10,15}$/.test(mobile)) {
      setMessage("Please enter a valid mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://cms.paharipatrika.in/wp-json/reader/v1/save-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (data.success) setMessage("Thank you!");
      else setMessage(data.message || "Error");
      if (data.success) setMobile("");
    } catch {
      setMessage("Network error");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth: 340, margin: '24px auto', padding: 16, border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafbfc'}}>
      <label htmlFor="reader_mobile" style={{display: 'block', marginBottom: 8}}>Enter your mobile number for updates:</label>
      <input
        type="text"
        id="reader_mobile"
        name="reader_mobile"
        value={mobile}
        onChange={e => setMobile(e.target.value)}
        pattern="^\+?[0-9]{10,15}$"
        required
        style={{width: '100%', padding: 8, marginBottom: 12, fontSize: '1rem'}}
      />
      <button type="submit" disabled={loading} style={{padding: '8px 16px', fontSize: '1rem'}}>
        {loading ? "Submitting..." : "Submit"}
      </button>
      <div style={{marginTop: 12, color: '#b80000'}}>{message}</div>
    </form>
  );
}
