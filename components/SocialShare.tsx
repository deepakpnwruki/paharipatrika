'use client';
import React from 'react';
function enc(s:string){ return encodeURIComponent(s || ''); }
export default function SocialShare({ url, title }:{ url:string; title:string; }){
  const links = [
    { name:'Facebook', href:`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name:'Twitter', href:`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
    { name:'WhatsApp', href:`https://api.whatsapp.com/send?text=${enc(title)}%20${enc(url)}` },
    { name:'Telegram', href:`https://t.me/share/url?url=${enc(url)}&text=${enc(title)}` },
  ];
  return (<div style={{display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap', margin:'1rem 0'}}>
    <span style={{fontWeight:600}}>Share:</span>
    {links.map(l=>(
      <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer"
         style={{padding:'0.4rem 0.7rem', border:'1px solid #e5e7eb', borderRadius:8, textDecoration:'none'}}>
        {l.name}
      </a>
    ))}
  </div>);
}
