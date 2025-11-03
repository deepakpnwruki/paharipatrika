'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container error-container">
      <h2 className="error-title">कुछ गलत हो गया!</h2>
      <p className="error-message">{error.message || 'पेज लोड करने में समस्या हुई'}</p>
      <button onClick={() => reset()} className="error-btn">पुनः प्रयास करें</button>
    </div>
  );
}

