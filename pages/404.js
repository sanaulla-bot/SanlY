import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page not found - SanlY</title>
      </Head>
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <div className="text-8xl mb-6">ðŸ“º</div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            404
          </h1>
          <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
            This page isn&apos;t available
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            The page you requested can&apos;t be found. Try going back to the homepage.
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-sm font-medium"
            style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          >
            Go Home
          </Link>
        </div>
      </Layout>
    </>
  );
}
