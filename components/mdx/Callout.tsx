const styles = {
  info: { box: 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-900/20', icon: 'ℹ️', label: 'Note' },
  tip: { box: 'border-brand-400 bg-brand-50 dark:border-brand-700 dark:bg-brand-700/10', icon: '💡', label: 'Tip' },
  warning: { box: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20', icon: '⚠️', label: 'Warning' },
  danger: { box: 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-900/20', icon: '⛔', label: 'Important' },
} as const;

/** <Callout type="tip" title="Optional title">Markdown **content**</Callout> */
export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: keyof typeof styles;
  title?: string;
  children: React.ReactNode;
}) {
  const s = styles[type] ?? styles.info;
  return (
    <aside role="note" className={`my-6 rounded-xl border-l-4 px-5 py-4 [&>div>*:first-child]:mt-0 [&>div>*:last-child]:mb-0 ${s.box}`}>
      <p className="not-prose mb-1 font-bold">
        <span aria-hidden>{s.icon}</span> {title ?? s.label}
      </p>
      <div>{children}</div>
    </aside>
  );
}
