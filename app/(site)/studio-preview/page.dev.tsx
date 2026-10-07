// DEV-ONLY route (/studio-preview/): renders the post currently open in the studio.
// The ".dev.tsx" extension means `next build` ignores this file (see next.config.js).
import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { buildPost } from '@/lib/content';
import { formatIssues, frontmatterSchema } from '@/lib/schema';
import { MdxContent } from '@/components/mdx/MdxContent';
import { PostArticle } from '@/components/site/PostArticle';
import { PreviewScrollKeeper } from '@/components/studio/PreviewScrollKeeper';

export const metadata: Metadata = { title: 'Studio preview', robots: { index: false, follow: false } };

const PREVIEW_FILE = path.join(process.cwd(), '.studio', 'preview.json');

type PreviewPayload = { data: Record<string, unknown>; body: string; mdxError?: string };

function Banner({ tone, children }: { tone: 'info' | 'error'; children: React.ReactNode }) {
  const style =
    tone === 'error'
      ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200'
      : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200';
  return <div className={`container-page mt-4 rounded-lg border px-4 py-3 text-sm ${style}`}>{children}</div>;
}

export default async function StudioPreviewPage() {
  if (!fs.existsSync(PREVIEW_FILE)) {
    return <Banner tone="info">Nothing to preview yet. Start typing in the studio.</Banner>;
  }
  const { data, body, mdxError } = JSON.parse(fs.readFileSync(PREVIEW_FILE, 'utf8')) as PreviewPayload;

  if (mdxError) {
    return (
      <Banner tone="error">
        <strong>The body has an MDX error, so it can’t be previewed:</strong>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{mdxError}</pre>
      </Banner>
    );
  }

  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    // Show the body anyway so writing isn't blocked by unfinished fields.
    return (
      <>
        <Banner tone="info">
          <strong>Preview — some fields are incomplete,</strong> so only the body is shown:
          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{formatIssues(parsed.error)}</pre>
        </Banner>
        <PreviewScrollKeeper />
        <div className="container-page py-8">
          <div className="mx-auto max-w-3xl">
            <MdxContent post={{ content: body }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PreviewScrollKeeper />
      <Banner tone="info">Preview — not saved. This is exactly how the post page will look.</Banner>
      <PostArticle post={buildPost(parsed.data, body, 'studio-preview.mdx')} />
    </>
  );
}
