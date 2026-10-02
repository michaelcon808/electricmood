export function ProsCons({ pros = [], cons = [] }: { pros?: string[]; cons?: string[] }) {
  if (!pros.length && !cons.length) return null;
  return (
    <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
      {pros.length > 0 && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-700/40 dark:bg-brand-700/10">
          <h3 className="mb-3 font-bold text-brand-700 dark:text-brand-400">Pros</h3>
          <ul className="space-y-2 text-sm">
            {pros.map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden className="font-bold text-brand-600">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {cons.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-900/10">
          <h3 className="mb-3 font-bold text-red-700 dark:text-red-400">Cons</h3>
          <ul className="space-y-2 text-sm">
            {cons.map((c) => (
              <li key={c} className="flex gap-2">
                <span aria-hidden className="font-bold text-red-600">✕</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
