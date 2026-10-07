import { POST_TYPE_LABELS, type PostType } from '@/lib/constants';
import { ACCENT } from './accents';

/** Money = coral, Info = gray, Comparison = neutral outline. */
export function PostTypeBadge({ type }: { type: PostType }) {
  const style =
    type === 'money'
      ? ACCENT.money.badge
      : type === 'info'
        ? ACCENT.info.badge
        : 'border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300';
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{POST_TYPE_LABELS[type]}</span>;
}
