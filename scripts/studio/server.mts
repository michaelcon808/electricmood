/**
 * ElectricMood Studio: a LOCAL editor for posts.  Run: npm run studio  →  http://localhost:4321
 *
 * - Never deployed: it is not part of `next build` and only listens on 127.0.0.1.
 * - "Add / Save" validates with the SAME rules as the build (zod schema + lib/post-checks.ts)
 *   and then writes content/posts/<slug>.mdx. It never runs git — you commit when you choose.
 * - Live preview: the post is rendered by the real site components through a dev-only page
 *   (app/(site)/studio-preview/page.dev.tsx) on the Next dev server, which this script starts.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import matter from 'gray-matter';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import { sections, silos } from '../../config/site-structure';
import { buildPost, isPublished, POSTS_DIR, type Post } from '../../lib/content';
import { contentIssues, referenceIssues, type Issue } from '../../lib/post-checks';
import { frontmatterSchema } from '../../lib/schema';
import { POST_TYPES, DEFAULT_AUTHOR } from '../../lib/constants';
import { TOOLS } from '../../lib/tools';
import { cleanData, serializePost } from './serialize';

const ROOT = process.cwd();
const PORT = Number(process.env.STUDIO_PORT || 4321);
const NEXT_PORT = 3000;
const NEXT_URL = `http://localhost:${NEXT_PORT}`;
const PREVIEW_DIR = path.join(ROOT, '.studio');
const PREVIEW_FILE = path.join(PREVIEW_DIR, 'preview.json');
const UI_FILE = path.join(ROOT, 'scripts', 'studio', 'index.html');
const MAX_BODY = 2 * 1024 * 1024;

/* ---------------- env (.env.local) ---------------- */

function readEnvFile(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const name of ['.env', '.env.local']) {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  return env;
}
const ENV = { ...readEnvFile(), ...process.env } as Record<string, string | undefined>;

/* ---------------- posts on disk ---------------- */

type Listed = { file: string; post?: Post; data: Record<string, unknown>; body: string; invalid?: string };

/** Every post file, including invalid ones (so they can be opened and fixed in the studio). */
function readAll(): Listed[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
      const parsed = frontmatterSchema.safeParse(data);
      return parsed.success
        ? { file, post: buildPost(parsed.data, content, file), data, body: content }
        : { file, data, body: content, invalid: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
    });
}

const toolSlugs = new Set(TOOLS.map((t) => t.slug));
const toDay = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v);

/** Turn what the form sent into frontmatter, dropping fields that don't apply to the post type. */
function normalize(raw: Record<string, unknown>): Record<string, unknown> {
  const d = { ...raw };
  if (d.postType !== 'info') delete d.moneyPost;
  if (d.postType !== 'money') delete d.rating;
  if (d.author === DEFAULT_AUTHOR) delete d.author;
  if (typeof d.rating === 'string') d.rating = d.rating === '' ? undefined : Number(d.rating);
  return cleanData(d);
}

async function mdxError(body: string): Promise<{ message: string; line?: number } | null> {
  try {
    await compile(body, { remarkPlugins: [remarkGfm] });
    return null;
  } catch (e) {
    const err = e as { reason?: string; message?: string; line?: number; place?: { line?: number; start?: { line?: number } } };
    const line = err.line ?? err.place?.line ?? err.place?.start?.line;
    return { message: `${line ? `Line ${line}: ` : ''}${err.reason ?? err.message ?? String(e)}`, line };
  }
}

/** Validate a post exactly like the build would, plus "would saving this break another post?". */
async function check(rawData: Record<string, unknown>, body: string, file?: string) {
  const data = normalize(rawData);
  const errors: Issue[] = [];
  const warnings: Issue[] = [];

  const parsed = frontmatterSchema.safeParse(data);
  const friendly = contentIssues(data, body);
  // Cross-field rules zod only runs once every basic field is valid — check them up front so they show immediately.
  if (data.postType === 'info' && !data.moneyPost) friendly.push({ field: 'moneyPost', message: 'Info posts need a money post to point readers to' });
  if (!parsed.success) {
    const covered = new Set(friendly.map((i) => i.field));
    for (const i of parsed.error.issues) {
      const field = String(i.path[0] ?? 'form');
      if (covered.has(field)) continue; // a clearer message for this field is already listed
      const message = /received undefined/.test(i.message) ? 'This field is required' : i.message;
      if (!errors.some((e) => e.field === field && e.message === message)) errors.push({ field, message });
    }
  }
  errors.push(...friendly.filter((i, n) => !friendly.slice(0, n).some((j) => j.field === i.field && j.message === i.message)));
  const mdx = await mdxError(body);
  if (mdx) errors.push({ field: 'body', message: `MDX syntax error — ${mdx.message}` });

  let post: Post | undefined;
  if (parsed.success) {
    post = buildPost(parsed.data, body, file ?? '(new post)');
    const liveKeys = (ps: Post[]) => new Set(ps.filter((p) => isPublished(p)).map((p) => p.key));
    const onDisk = readAll().flatMap((x) => (x.post ? [x.post] : [])); // includes the old version when editing
    const others = onDisk.filter((p) => p.file !== file);
    const all = [...others, post];
    const live = liveKeys(all);
    for (const issue of referenceIssues(post, all, live, toolSlugs)) (issue.level === 'warning' ? warnings : errors).push(issue);

    // Would this change break another post (e.g. renaming a slug that others point to, or making it a draft)?
    const liveBefore = liveKeys(onDisk);
    for (const other of others) {
      const before = referenceIssues(other, onDisk, liveBefore, toolSlugs).map((i) => i.message);
      // Anything that starts failing (or becomes pending) in ANOTHER post because of this change is surfaced as a blocker.
      for (const issue of referenceIssues(other, all, live, toolSlugs)) {
        if (!before.includes(issue.message)) errors.push({ field: 'slug', message: `This would break ${other.file}: ${issue.message}` });
      }
    }

    if (post.draft) warnings.push({ field: 'draft', message: 'Draft: this post will NOT appear on the site until you untick Draft.' });
    else if (!isPublished(post)) warnings.push({ field: 'date', message: `Future date: it goes live on the first build on or after ${post.dateISO.slice(0, 10)}.` });
    if (post.postType === 'money' && post.affiliateLinks.length === 0 && !post.hasAffiliateLinks) {
      warnings.push({ field: 'affiliateLinks', message: 'Money post without affiliate links.' });
    }
  }
  return { data, post, errors, warnings };
}

function targetFile(post: Post, existing?: string): string {
  if (existing) return existing;
  for (const name of [`${post.slug}.mdx`, `${post.silo}-${post.section}-${post.slug}.mdx`]) {
    if (!fs.existsSync(path.join(POSTS_DIR, name))) return name;
  }
  throw new Error(`A file for ${post.key} already exists`);
}

/* ---------------- HTTP ---------------- */

const json = (res: http.ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

function readJson(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('Request too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/** Only accept existing post file names — no paths, no traversal. */
function safeFile(name: unknown): string | undefined {
  if (typeof name !== 'string' || !/^[a-z0-9][a-z0-9-]*\.mdx?$/.test(name)) return undefined;
  return fs.existsSync(path.join(POSTS_DIR, name)) ? name : undefined;
}

const server = http.createServer(async (req, res) => {
  try {
    // Block other websites (DNS rebinding / cross-site requests) from talking to the studio.
    const host = req.headers.host ?? '';
    if (host !== `localhost:${PORT}` && host !== `127.0.0.1:${PORT}`) return json(res, 403, { error: 'Forbidden host' });
    if (req.method === 'POST' && (req.headers['x-studio'] !== '1' || !String(req.headers['content-type']).startsWith('application/json'))) {
      return json(res, 403, { error: 'Forbidden' });
    }

    const url = new URL(req.url ?? '/', `http://${host}`);

    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(fs.readFileSync(UI_FILE, 'utf8'));
    }

    if (req.method === 'GET' && url.pathname === '/api/meta') {
      return json(res, 200, {
        silos: silos.map((s) => ({ slug: s.slug, label: s.label, shortLabel: s.shortLabel })),
        sections: sections.map((s) => ({ slug: s.slug, label: s.label })),
        postTypes: POST_TYPES,
        tools: TOOLS.map((t) => ({ slug: t.slug, name: t.name })),
        defaultAuthor: DEFAULT_AUTHOR,
        cloudinary: { cloudName: ENV.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '', uploadPreset: ENV.STUDIO_CLOUDINARY_UPLOAD_PRESET || '' },
        siteUrl: NEXT_URL,
        previewUrl: `${NEXT_URL}/studio-preview/`,
        today: new Date().toISOString().slice(0, 10),
      });
    }

    if (req.method === 'GET' && url.pathname === '/api/posts') {
      const list = readAll().map(({ file, post, data, invalid }) => ({
        file,
        invalid,
        title: String(data.title ?? file),
        key: post?.key,
        slug: post?.slug ?? data.slug,
        silo: post?.silo ?? data.silo,
        section: post?.section ?? data.section,
        postType: post?.postType ?? data.postType,
        path: post?.path,
        draft: post ? post.draft : data.draft === true,
        live: post ? isPublished(post) : false,
        date: toDay(data.date),
      }));
      return json(res, 200, { posts: list });
    }

    if (req.method === 'GET' && url.pathname === '/api/post') {
      const file = safeFile(url.searchParams.get('file'));
      if (!file) return json(res, 404, { error: 'Post not found' });
      const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
      const formData = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toDay(v)]));
      return json(res, 200, { file, data: formData, body: content.replace(/^\s*\n/, '') });
    }

    if (req.method === 'POST' && url.pathname === '/api/check') {
      const { data, body, file } = await readJson(req);
      const r = await check((data ?? {}) as Record<string, unknown>, String(body ?? ''), safeFile(file));
      return json(res, 200, { errors: r.errors, warnings: r.warnings, path: r.post?.path });
    }

    if (req.method === 'POST' && url.pathname === '/api/preview') {
      const { data, body } = await readJson(req);
      const text = String(body ?? '');
      const mdx = await mdxError(text);
      fs.mkdirSync(PREVIEW_DIR, { recursive: true });
      fs.writeFileSync(
        PREVIEW_FILE,
        JSON.stringify({ data: normalize((data ?? {}) as Record<string, unknown>), body: text, mdxError: mdx?.message }),
      );
      return json(res, 200, { ok: true, mdxError: mdx?.message });
    }

    if (req.method === 'POST' && url.pathname === '/api/save') {
      const { data, body, file: rawFile } = await readJson(req);
      const file = safeFile(rawFile);
      if (rawFile && !file) return json(res, 404, { error: 'The post you were editing no longer exists' });
      const text = String(body ?? '');
      const r = await check((data ?? {}) as Record<string, unknown>, text, file);
      if (r.errors.length || !r.post) return json(res, 422, { errors: r.errors, warnings: r.warnings });

      const name = targetFile(r.post, file);
      const output = serializePost(r.data, text);

      // Round-trip: the file we are about to write must parse back to a valid post.
      const back = matter(output);
      const reparsed = frontmatterSchema.safeParse(back.data);
      if (!reparsed.success) return json(res, 500, { error: 'Internal error: the written file would not parse back. Nothing was saved.' });

      fs.writeFileSync(path.join(POSTS_DIR, name), output);
      console.log(`✓ saved content/posts/${name}`);
      return json(res, 200, {
        ok: true,
        file: name,
        path: r.post.path,
        live: isPublished(r.post),
        warnings: r.warnings,
      });
    }

    return json(res, 404, { error: 'Not found' });
  } catch (e) {
    console.error('[studio]', e);
    return json(res, 500, { error: (e as Error).message || 'Internal error' });
  }
});

/* ---------------- start (and the Next dev server for previews) ---------------- */

async function nextIsUp(): Promise<boolean> {
  try {
    await fetch(NEXT_URL, { signal: AbortSignal.timeout(1500) });
    return true;
  } catch {
    return false;
  }
}

let nextProc: ChildProcess | undefined;

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`\n⚡ ElectricMood Studio → http://localhost:${PORT}\n   (local only; writes to content/posts/, never commits)\n`);
  if (await nextIsUp()) {
    console.log(`   Using the dev server already running at ${NEXT_URL} for previews.`);
  } else if (process.env.STUDIO_NO_NEXT !== '1') {
    console.log(`   Starting the Next dev server at ${NEXT_URL} for live previews…`);
    nextProc = spawn(path.join(ROOT, 'node_modules', '.bin', 'next'), ['dev', '-p', String(NEXT_PORT)], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });
    const prefix = (d: Buffer) => process.stdout.write(d.toString().replace(/^(?=.)/gm, '   [next] '));
    nextProc.stdout?.on('data', prefix);
    nextProc.stderr?.on('data', prefix);
  }
});

server.on('error', (e: NodeJS.ErrnoException) => {
  console.error(e.code === 'EADDRINUSE' ? `Port ${PORT} is in use — is the studio already running?` : e);
  process.exit(1);
});

const stop = () => {
  nextProc?.kill('SIGTERM');
  server.close();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
