import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#b80000' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#666' }}>
        पेज नहीं मिला
      </h2>
      <p style={{ marginBottom: '2rem', color: '#888' }}>
        क्षमा करें, आपके द्वारा खोजा गया पेज मौजूद नहीं है।
      </p>
      <Link
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          background: '#b80000',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block',
        }}
      >
        होमपेज पर जाएं
      </Link>
    </div>
  );
}
