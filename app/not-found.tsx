import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container notfound-container">
      <h1 className="notfound-title">404</h1>
      <h2 className="notfound-subtitle">पेज नहीं मिला</h2>
      <p className="notfound-message">क्षमा करें, आपके द्वारा खोजा गया पेज मौजूद नहीं है।</p>
      <Link href="/" className="notfound-btn">होमपेज पर जाएं</Link>
    </div>
  );
}
