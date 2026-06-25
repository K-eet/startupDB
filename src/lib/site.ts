// Canonical site origin for metadata, robots, and sitemap — kept in one place so
// the three never drift. Override per environment with NEXT_PUBLIC_SITE_URL
// (e.g. a custom domain); falls back to the Firebase App Hosting URL.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'https://studio--studio-7465988978-5ed5b.us-central1.hosted.app';
