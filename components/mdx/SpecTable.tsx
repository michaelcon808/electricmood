/** <SpecTable title="Specifications" specs={[{ label: "Range", value: "40 km" }]} /> */
export function SpecTable({ specs, title = 'Specifications' }: { specs: { label: string; value: string }[]; title?: string }) {
  if (!specs?.length) return null;
  return (
    <section className="not-prose my-6" aria-label={title}>
      {title && <h3 className="mb-3 text-lg font-bold">{title}</h3>}
      <div className="card overflow-hidden">
        <dl className="divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
          {specs.map((s) => (
            <div key={s.label} className="grid grid-cols-[40%_1fr] gap-4 px-4 py-3">
              <dt className="font-medium text-neutral-500">{s.label}</dt>
              <dd className="font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
