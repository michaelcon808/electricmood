export type FaqItem = { question: string; answer: string };

/** Native <details> accordion — no client JS. FAQPage JSON-LD is emitted from frontmatter `faqs`. */
export function FAQ({ items, title = 'Frequently asked questions' }: { items: FaqItem[]; title?: string }) {
  if (!items?.length) return null;
  return (
    <section className="not-prose my-8" aria-label={title}>
      <h2 className="mb-3 text-2xl font-bold">{title}</h2>
      <div className="card divide-y divide-neutral-200 dark:divide-neutral-800">
        {items.map((f) => (
          <details key={f.question} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {f.question}
              <span aria-hidden className="text-xl text-brand-600 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
