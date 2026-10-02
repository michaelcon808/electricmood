export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  // Escape "<" so content can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
