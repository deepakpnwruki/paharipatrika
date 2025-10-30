type Vars = Record<string, any> | undefined;

export async function wpFetch<T>(query: string, variables?: Vars, revalidate?: number, tag?: string): Promise<T> {
  const endpoint = process.env.WP_GRAPHQL_ENDPOINT || process.env.WP_GRAPHQL_URL;
  if (!endpoint) {
    console.error('Missing WP_GRAPHQL_ENDPOINT environment variable');
    throw new Error('WordPress GraphQL endpoint not configured');
  }
  const rv = revalidate ?? Number(process.env.REVALIDATE_SECONDS ?? 300);

  // NEW: timeout + retry
  const timeoutMs = Number(process.env.WP_FETCH_TIMEOUT_MS ?? 10000);
  const maxRetries = Number(process.env.WP_FETCH_RETRIES ?? 1);

  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'EduNews/1.0'
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
        next: { revalidate: rv, tags: tag ? [tag] : undefined }
      });
      clearTimeout(t);

      if (!res.ok) {
        // Retry only on 5xx
        if (res.status >= 500 && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
          continue;
        }
        console.error(`WPGraphQL HTTP Error: ${res.status} ${res.statusText}`);
        throw new Error(`WordPress GraphQL request failed: ${res.status}`);
      }

      const json = await res.json();
      if (json.errors) {
        // Bubble the first error message
        const msg = Array.isArray(json.errors) && json.errors[0]?.message ? json.errors[0].message : 'GraphQL query failed';
        console.error('GraphQL Errors:', json.errors);
        throw new Error(msg);
      }
      return json.data as T;
    } catch (error) {
      clearTimeout(t);
      lastErr = error;
      // Retry aborted/network/5xx only
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
    }
  }
  console.error('WordPress GraphQL fetch error:', lastErr);
  throw lastErr as Error;
}
