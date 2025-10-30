import Link from 'next/link';
import { wpFetch } from '../lib/graphql';
import { PAGES_QUERY } from '../lib/queries';

export const revalidate = Number(process.env.REVALIDATE_SECONDS ?? 300);

export default async function FooterLinks(){
  const data = await wpFetch<{ pages:{ nodes:{ title:string; uri:string }[] } }>(PAGES_QUERY, { first: 10 }, revalidate, 'footerpages');
  const pages = data?.pages?.nodes || [];
  if (pages.length === 0) return null;
  return (
    <div className="footer-links">
      {pages.map(p => <Link key={p.uri} href={p.uri}>{p.title}</Link>)}
    </div>
  );
}
