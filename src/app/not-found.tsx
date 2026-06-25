import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <Button asChild>
          <Link href="/">Back to directory</Link>
        </Button>
      </div>
    </div>
  );
}
