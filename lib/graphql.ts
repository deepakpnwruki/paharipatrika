type Vars = Record<string, any> | undefined;

// Performance monitoring
const ENABLE_PERF_LOGS = process.env.ENABLE_GRAPHQL_PERF_LOGS === 'true';

export async function wpFetch<T>(query: string, variables?: Vars, revalidate?: number, tag?: string): Promise<T> {
  const endpoint = process.env.WP_GRAPHQL_ENDPOINT || process.env.WP_GRAPHQL_URL;
  if (!endpoint) {
    console.error('Missing WP_GRAPHQL_ENDPOINT environment variable');
    throw new Error('WordPress GraphQL endpoint not configured');
  }
  const rv = revalidate ?? Number(process.env.REVALIDATE_SECONDS ?? 300);

  // NEW: timeout + retry
  // Prefer WP_GRAPHQL_TIMEOUT_MS; fall back to WP_FETCH_TIMEOUT_MS, then default
  const timeoutMs = Number(process.env.WP_GRAPHQL_TIMEOUT_MS ?? process.env.WP_FETCH_TIMEOUT_MS ?? 10000);
  const maxRetries = Number(process.env.WP_FETCH_RETRIES ?? 3); // Increased retries

  // Extract query name for logging
  const queryName = query.match(/(?:query|mutation)\s+(\w+)/)?.[1] || 'UnnamedQuery';
  const totalStartTime = Date.now();

  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const attemptStartTime = Date.now();
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          'User-Agent': 'PahariPatrika/1.0',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
        next: { revalidate: rv, tags: tag ? [tag] : undefined },
        keepalive: true
      });
      clearTimeout(t);

      const fetchDuration = Date.now() - attemptStartTime;

      if (!res.ok) {
        if (ENABLE_PERF_LOGS) {
          console.warn(`⚠️  [${queryName}] HTTP ${res.status} in ${fetchDuration}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        }
        // Retry only on 5xx
        if (res.status >= 500 && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // Increased delay
          continue;
        }
        console.error(`WPGraphQL HTTP Error: ${res.status} ${res.statusText}`);
        throw new Error(`WordPress GraphQL request failed: ${res.status}`);
      }

      const json = await res.json();
  // totalDuration removed as it was unused

      // Performance logging
      if (ENABLE_PERF_LOGS) {
  // status variable removed as it was unused
  // ...existing code...
      }

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
      
      const attemptDuration = Date.now() - attemptStartTime;
      if (ENABLE_PERF_LOGS) {
        console.error(`❌ [${queryName}] Failed in ${attemptDuration}ms (attempt ${attempt + 1}/${maxRetries + 1}):`, error instanceof Error ? error.message : error);
      }
      
      // Retry aborted/network/5xx only
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // Increased delay
        continue;
      }
    }
  }
  
  const totalDuration = Date.now() - totalStartTime;
  console.error(`❌ [${queryName}] All retries failed after ${totalDuration}ms:`, lastErr);
  throw lastErr as Error;
}
