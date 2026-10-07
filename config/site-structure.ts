// SINGLE SOURCE OF TRUTH for the site's silo structure.
// Edit this file to rename a silo/section or change a description. Menus, hubs, breadcrumbs,
// sitemap and the frontmatter validation all read from here — nothing else hard-codes them.
//
//   Home → Silo hub → Section hub → Post        (+ shared: Tools, Learn)
import { z } from 'zod';
import { paths } from '../lib/site';

const SILOS = [
  {
    slug: 'electric-scooters',
    label: 'Electric scooters',
    shortLabel: 'Scooter',
    description: 'Buying guides, accessories and how-tos for electric scooters, from commuter picks to theft protection.',
  },
  {
    slug: 'electric-bikes',
    label: 'Electric bikes',
    shortLabel: 'E-bike',
    description: 'Buying guides, accessories and how-tos for electric bikes, from passenger seats to the laws where you ride.',
  },
  {
    slug: 'electric-skateboards',
    label: 'Electric skateboards',
    shortLabel: 'E-skateboard',
    description: 'Buying guides, accessories and how-tos for electric skateboards, from the best brands to keeping them running.',
  },
] as const;

/** The same three sections exist in every silo. */
const SECTIONS = [
  {
    slug: 'buying-guides',
    label: 'Buying guides',
    description: 'Our top picks and comparisons to help you choose the right one.',
  },
  {
    slug: 'accessories',
    label: 'Accessories',
    description: 'Locks, chargers, trackers and gear that make riding safer and easier.',
  },
  {
    slug: 'guides',
    label: 'Guides',
    description: 'How-tos, fixes, maintenance and the rules of the road.',
  },
] as const;

/** Pages that sit outside the silos; every silo hub links to them. */
const SHARED = [
  { slug: 'tools', label: 'Tools', description: 'Calculators and finders', path: paths.tools },
  { slug: 'learn', label: 'Learn', description: 'Battery safety, rules, travel', path: paths.learn },
] as const;

export type SiloSlug = (typeof SILOS)[number]['slug'];
export type SectionSlug = (typeof SECTIONS)[number]['slug'];
export type Silo = (typeof SILOS)[number];
export type Section = (typeof SECTIONS)[number];
export type SharedItem = (typeof SHARED)[number];

// Validate the structure when the module loads, so a typo fails the build immediately.
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slugs use lowercase letters, numbers and hyphens');
const node = z.object({ slug, label: z.string().min(1), description: z.string().min(10).max(200) });
const unique = (items: readonly { slug: string }[]) => new Set(items.map((i) => i.slug)).size === items.length;

z.object({
  silos: z.array(node.extend({ shortLabel: z.string().min(1) })).min(1).refine(unique, 'duplicate silo slug'),
  sections: z.array(node).min(1).refine(unique, 'duplicate section slug'),
  shared: z
    .array(node.extend({ path: z.string().startsWith('/').endsWith('/') }))
    .min(1)
    .refine(unique, 'duplicate shared slug'),
}).parse({ silos: SILOS, sections: SECTIONS, shared: SHARED });

export const silos: readonly Silo[] = SILOS;
export const sections: readonly Section[] = SECTIONS;
export const shared: readonly SharedItem[] = SHARED;

export const SILO_SLUGS = SILOS.map((s) => s.slug) as unknown as readonly [SiloSlug, ...SiloSlug[]];
export const SECTION_SLUGS = SECTIONS.map((s) => s.slug) as unknown as readonly [SectionSlug, ...SectionSlug[]];

export const getSilo = (slug: string): Silo | undefined => SILOS.find((s) => s.slug === slug);
export const getSection = (slug: string): Section | undefined => SECTIONS.find((s) => s.slug === slug);

export function getAllSiloSectionPairs(): { silo: Silo; section: Section }[] {
  return SILOS.flatMap((silo) => SECTIONS.map((section) => ({ silo, section })));
}

/** Section hub page heading, e.g. "Scooter accessories", "E-bike guides". Menus use the plain section label. */
export const sectionHeading = (silo: Silo, section: Section) => `${silo.shortLabel} ${section.label.toLowerCase()}`;

/* ---------------- Breadcrumbs (labels always come from this config, never from URLs) ---------------- */

export type Crumb = { label: string; path: string };

export type BreadcrumbTarget =
  | { kind: 'silo'; silo: string }
  | { kind: 'section'; silo: string; section: string }
  | { kind: 'post'; silo: string; section: string; title: string; slug: string }
  | { kind: 'shared'; shared: 'tools' | 'learn'; item?: { title: string; slug: string } }
  | { kind: 'page'; label: string; path: string };

const HOME: Crumb = { label: 'Home', path: paths.home };

function mustSilo(slug: string) {
  const s = getSilo(slug);
  if (!s) throw new Error(`Unknown silo "${slug}" (see config/site-structure.ts)`);
  return s;
}
function mustSection(slug: string) {
  const s = getSection(slug);
  if (!s) throw new Error(`Unknown section "${slug}" (see config/site-structure.ts)`);
  return s;
}

/** Full trail including Home. The last item is the current page. */
export function buildBreadcrumbs(t: BreadcrumbTarget): Crumb[] {
  switch (t.kind) {
    case 'silo': {
      const silo = mustSilo(t.silo);
      return [HOME, { label: silo.label, path: paths.silo(silo.slug) }];
    }
    case 'section': {
      const silo = mustSilo(t.silo);
      const section = mustSection(t.section);
      return [
        HOME,
        { label: silo.label, path: paths.silo(silo.slug) },
        { label: section.label, path: paths.section(silo.slug, section.slug) },
      ];
    }
    case 'post': {
      const silo = mustSilo(t.silo);
      const section = mustSection(t.section);
      return [
        HOME,
        { label: silo.label, path: paths.silo(silo.slug) },
        { label: section.label, path: paths.section(silo.slug, section.slug) },
        { label: t.title, path: paths.post(t.slug) },
      ];
    }
    case 'shared': {
      const item = shared.find((s) => s.slug === t.shared)!;
      const trail: Crumb[] = [HOME, { label: item.label, path: item.path }];
      if (t.item) {
        trail.push({
          label: t.item.title,
          path: t.shared === 'tools' ? paths.tool(t.item.slug) : paths.learnPage(t.item.slug),
        });
      }
      return trail;
    }
    case 'page':
      return [HOME, { label: t.label, path: t.path }];
  }
}
