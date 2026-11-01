// Tells Bing, Yandex and other IndexNow engines that pages changed, so they recrawl them quickly
// (this also replaces stale results such as the domain's old "for sale" page).
// Usage, after a deploy: node scripts/indexnow.mjs            (submits every URL in the live sitemap)
//                        node scripts/indexnow.mjs /some/path/ (submits specific paths)
// The key file public/9f01c2efcd3250b98e32c59e340fa02c.txt must be live at https://electricmood.com/9f01c2efcd3250b98e32c59e340fa02c.txt.
const HOST = 'electricmood.com';
const KEY = '9f01c2efcd3250b98e32c59e340fa02c';

const paths = process.argv.slice(2);
let urls;
if (paths.length) urls = paths.map((p) => `https://${HOST}${p.startsWith('/') ? p : '/' + p}`);
else {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: submitted ${urls.length} URL(s) -> HTTP ${res.status} ${res.statusText}`);
if (res.status >= 400) process.exit(1);
