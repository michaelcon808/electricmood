// Accent colours from the structure diagrams. Full class strings so Tailwind can see them.
//   silo hubs: purple · section hubs: teal · money posts: coral · info posts: gray · shared pages: gray
export const ACCENT = {
  silo: {
    border: 'border-violet-300 dark:border-violet-700',
    bar: 'border-t-4 border-t-violet-500',
    soft: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
    hover: 'hover:border-violet-500',
    link: 'text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-100',
  },
  section: {
    border: 'border-teal-300 dark:border-teal-700',
    bar: 'border-t-4 border-t-teal-500',
    soft: 'bg-teal-50 dark:bg-teal-900/20',
    text: 'text-teal-700 dark:text-teal-300',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
    hover: 'hover:border-teal-500',
    link: 'text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100',
  },
  money: {
    border: 'border-coral-500',
    soft: 'bg-coral-50 dark:bg-coral-700/15',
    text: 'text-coral-700 dark:text-coral-100',
    badge: 'bg-coral-100 text-coral-700 dark:bg-coral-700/30 dark:text-coral-100',
  },
  info: {
    border: 'border-neutral-300 dark:border-neutral-700',
    soft: 'bg-neutral-100 dark:bg-neutral-800/60',
    text: 'text-neutral-700 dark:text-neutral-300',
    badge: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  },
  shared: {
    border: 'border-neutral-300 dark:border-neutral-700',
    soft: 'bg-neutral-100 dark:bg-neutral-800/60',
    hover: 'hover:border-neutral-500',
  },
} as const;
