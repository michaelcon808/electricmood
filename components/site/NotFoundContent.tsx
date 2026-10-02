import Link from 'next/link';

export function NotFoundContent() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page ran out of battery.</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn-primary">
          Home
        </Link>
        <Link href="/blog/" className="btn-secondary">
          All articles
        </Link>
      </div>
    </div>
  );
}
