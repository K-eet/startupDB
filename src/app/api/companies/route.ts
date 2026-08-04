import { gzipSync } from 'zlib';
import { NextRequest, NextResponse } from 'next/server';
import { getDirectoryCompanies } from '@/lib/directory-data';

// Must not be prerendered at build time — the Admin SDK needs runtime credentials.
// Caching is handled by the CDN via the Cache-Control header below, plus the
// hour-long server cache inside getDirectoryCompanies (shared with / and /companies).
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const companies = await getDirectoryCompanies();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // CDN caches for 5 minutes, serves stale while revalidating for a day
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      Vary: 'Accept-Encoding',
    };

    // App Hosting's Next.js adapter doesn't compress responses, so gzip here
    // (~1.3 MB JSON -> ~170 KB on the wire)
    const body = JSON.stringify(companies);
    if (request.headers.get('accept-encoding')?.includes('gzip')) {
      return new NextResponse(gzipSync(body) as unknown as BodyInit, {
        headers: { ...headers, 'Content-Encoding': 'gzip' },
      });
    }

    return new NextResponse(body, { headers });
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}
