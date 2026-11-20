// CMS-edited section entries: products, solutions, apps and the Commons editorial pages.
// Each collection is a folder of Markdown files with front matter, edited in Pages CMS (.pages.yml).
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

export type SectionName = "products" | "solutions" | "apps" | "commons";

export type SectionEntry = {
  slug: string;
  title: string;
  navTitle?: string;
  tagline?: string;
  status: "live" | "coming";
  published: boolean;
  order?: number;
  // a static demo served from public/ (e.g. /demos/lqa-dog-act/), embedded on the entry's page
  demo?: string;
  demoTitle?: string;
  demoNote?: string;
  content: string;
};

export const SECTIONS: Record<SectionName, { dir: string; title: string; base: string }> = {
  products: { dir: "_products", title: "Products", base: "/products" },
  solutions: { dir: "_solutions", title: "Solutions", base: "/solutions" },
  apps: { dir: "_apps", title: "Apps", base: "/apps" },
  commons: { dir: "_commons", title: "Commons", base: "/commons" },
};

// Unpublished entries are hidden from the live site. Build with NEXT_PUBLIC_SHOW_DRAFTS=1 to preview them.
export const SHOW_DRAFTS = process.env.NEXT_PUBLIC_SHOW_DRAFTS === "1";

export function getSectionEntries(section: SectionName): SectionEntry[] {
  const dir = join(process.cwd(), SECTIONS[section].dir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(join(dir, f), "utf8"));
      return {
        ...data,
        slug: data.slug || f.replace(/\.md$/, ""),
        status: data.status === "coming" ? "coming" : "live",
        published: data.published === true,
        content,
      } as SectionEntry;
    })
    .filter((e) => e.published || SHOW_DRAFTS)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
}

// Entries that have a page of their own: live ones. A "coming" entry is listed but not linked.
export function getSectionPages(section: SectionName): SectionEntry[] {
  return getSectionEntries(section).filter((e) => e.status === "live");
}

export function getSectionEntry(section: SectionName, slug: string): SectionEntry | null {
  return getSectionPages(section).find((e) => e.slug === slug) ?? null;
}
