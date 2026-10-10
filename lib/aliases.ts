// Old slug -> live slug (config/slug-aliases.json). Articles still link to slugs that were merged or renamed;
// instead of editing article text, those links are resolved here. Change a target in the JSON in one place.
import raw from '../config/slug-aliases.json';

export type SlugAlias = { old: string; new: string; status?: string };

export const SLUG_ALIASES: readonly SlugAlias[] = raw;

const byOld = new Map(SLUG_ALIASES.map((a) => [a.old, a.new]));

/** The live slug for a possibly old slug. A slug that isn't an alias comes back unchanged. */
export function resolveSlugAlias(slug: string): string {
  return byOld.get(slug) ?? slug;
}
