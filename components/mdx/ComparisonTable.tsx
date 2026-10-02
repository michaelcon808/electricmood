/**
 * <ComparisonTable
 *   headers={["", "Model A", "Model B"]}
 *   rows={[["Range", "40 km", "55 km"], ["Weight", "14 kg", "19 kg"]]}
 *   highlight={2}   // optional: 1-based column to highlight as the winner
 * />
 */
export function ComparisonTable({
  headers,
  rows,
  caption,
  highlight,
}: {
  headers: string[];
  rows: string[][];
  caption?: string;
  highlight?: number;
}) {
  if (!headers?.length || !rows?.length) return null;
  const hl = (i: number) => (highlight && i === highlight - 1 ? 'bg-brand-50 dark:bg-brand-700/10' : '');
  return (
    <div className="not-prose card my-6 overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        {caption && <caption className="p-4 text-left font-semibold">{caption}</caption>}
        <thead className="bg-neutral-100 dark:bg-neutral-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" className={`px-4 py-3 font-semibold ${hl(i)}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row" className="px-4 py-3 font-semibold">
                    {cell}
                  </th>
                ) : (
                  <td key={c} className={`px-4 py-3 ${hl(c)}`}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
