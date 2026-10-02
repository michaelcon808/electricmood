export function RatingBadge({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const tone =
    rating >= 4.5 ? 'bg-brand-600' : rating >= 3.5 ? 'bg-lime-600' : rating >= 2.5 ? 'bg-amber-500' : 'bg-red-600';
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm', lg: 'px-4 py-2 text-2xl' };
  return (
    <span
      className={`not-prose inline-flex items-baseline gap-0.5 rounded-lg font-extrabold text-white shadow ${tone} ${sizes[size]}`}
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {rating.toFixed(1)}
      <span className="text-[0.7em] font-semibold opacity-80">/5</span>
    </span>
  );
}
