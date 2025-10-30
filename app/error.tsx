'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>कुछ गलत हो गया!</h2>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        {error.message || 'पेज लोड करने में समस्या हुई'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '0.5rem 1rem',
          background: '#b80000',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        पुनः प्रयास करें
      </button>
    </div>
  );
}
