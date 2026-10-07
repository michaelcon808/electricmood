// Data for the header menu, built from config/site-structure.ts + the published post index.
import { sections, shared, silos } from '../config/site-structure';
import { getFeaturedPosts } from './content';
import { paths } from './site';

export type NavSection = {
  slug: string;
  label: string;
  description: string;
  path: string;
  featured: { title: string; path: string }[];
};
export type NavSilo = { slug: string; label: string; description: string; path: string; sections: NavSection[] };
export type NavData = { silos: NavSilo[]; shared: { slug: string; label: string; path: string }[] };

export function getNavData(): NavData {
  return {
    silos: silos.map((silo) => ({
      slug: silo.slug,
      label: silo.label,
      description: silo.description,
      path: paths.silo(silo.slug),
      sections: sections.map((section) => ({
        slug: section.slug,
        label: section.label,
        description: section.description,
        path: paths.section(silo.slug, section.slug),
        featured: getFeaturedPosts(silo.slug, 3, section.slug).map((p) => ({ title: p.title, path: p.path })),
      })),
    })),
    shared: shared.map((s) => ({ slug: s.slug, label: s.label, path: s.path })),
  };
}
