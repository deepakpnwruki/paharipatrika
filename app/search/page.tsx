import { wpFetch } from '../../lib/graphql';
import PostCard from '../../components/PostCard';
import { POSTS_QUERY } from '../../lib/queries';

export const revalidate = 300;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function getQueryParam(searchParams: { [key:string]: string | string[] | undefined }){
  const q = searchParams['q'];
  return Array.isArray(q) ? q[0] || '' : (q || '');
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }){
  const resolvedParams = await searchParams;
  const q = getQueryParam(resolvedParams);
  let posts: any[] = [];
  if (q && q.trim()) {
    try {
      // fallback: use POSTS_QUERY and filter client-side minimal (WPGraphQL has search arg but we keep deps minimal)
      const data = await wpFetch<{ posts: any }>(POSTS_QUERY, { first: 20 }, revalidate, `searchseed`);
      const nodes = data.posts?.nodes ?? [];
      const normalizedQuery = q.toLowerCase().trim();
      posts = nodes.filter((n:any)=> (n.title||'').toLowerCase().includes(normalizedQuery));
    } catch (error) {
    }
  }
  return (
    <div className="container">
      <h1>Search</h1>
      <form action="/search" method="get" className="search-form">
        <input name="q" defaultValue={q} placeholder="Search articles..." className="search-input" />
        <button type="submit" className="search-btn">Search</button>
      </form>
      {!q && <p className="meta">Tip: Try searching for a headline or keyword.</p>}
      {q && <p className="meta">Showing results for: <strong>{q}</strong></p>}
      <section className="card search-card">
        {q && posts.length === 0 && <p className="search-no-results">No results.</p>}
        {posts.map((p:any)=> <PostCard key={p.id} post={p} />)}
      </section>
    </div>
  );
}
