export const dynamic = 'force-static';

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { DOC_TABS } from '@/lib/l4-docs';
import { getDocumentList } from '@/lib/l4-docs-server';
import { getAllPages, getAllPosts } from '@/lib/api';
import { getSectionEntries, getSectionPages, SECTIONS } from '@/lib/sections';
import { getInstruments, getJurisdictions } from '@/lib/commons';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Site root
  entries.push({ url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 });

  // L4 markdown docs root
  entries.push({ url: `${SITE_URL}/l4/index.md`, changeFrequency: 'weekly', priority: 0.9 });

  // Tab roots
  for (const tab of DOC_TABS) {
    if (tab.slug) {
      entries.push({
        url: `${SITE_URL}/l4/${tab.slug}.md`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // Company and CMS pages
  for (const page of getAllPages()) {
    entries.push({ url: `${SITE_URL}/${page.slug}`, changeFrequency: 'monthly', priority: 0.6 });
  }
  entries.push({ url: `${SITE_URL}/posts`, changeFrequency: 'weekly', priority: 0.6 });
  for (const post of getAllPosts()) {
    entries.push({ url: `${SITE_URL}/posts/${post.slug}`, changeFrequency: 'yearly', priority: 0.5 });
  }

  // Products, solutions, apps (published entries only; "coming" ones have no page)
  for (const section of ['products', 'solutions', 'apps'] as const) {
    if (getSectionEntries(section).length) {
      entries.push({ url: `${SITE_URL}${SECTIONS[section].base}`, changeFrequency: 'monthly', priority: 0.7 });
    }
    for (const e of getSectionPages(section)) {
      entries.push({ url: `${SITE_URL}${SECTIONS[section].base}/${e.slug}`, changeFrequency: 'monthly', priority: 0.7 });
    }
  }

  // Commons: home, editorial pages, jurisdictions and every instrument
  entries.push({ url: `${SITE_URL}/commons`, changeFrequency: 'weekly', priority: 0.8 });
  for (const e of getSectionPages('commons')) {
    if (e.slug !== 'index') entries.push({ url: `${SITE_URL}/commons/${e.slug}`, changeFrequency: 'monthly', priority: 0.6 });
  }
  for (const j of getJurisdictions()) {
    entries.push({ url: `${SITE_URL}/commons/${j.code}`, changeFrequency: 'weekly', priority: 0.7 });
    for (const i of getInstruments(j.code).filter((x) => x.encodings.length)) {
      entries.push({ url: `${SITE_URL}/commons/${j.code}/${i.type}/${i.slug}`, changeFrequency: 'monthly', priority: 0.5 });
    }
  }

  // All documentation pages
  const docs = getDocumentList();
  for (const doc of docs) {
    const segments = doc
      .replace(/\.md$/, '')
      .replace(/\/README$/, '')
      .split('/')
      .filter(Boolean);

    if (segments.length > 0) {
      entries.push({
        url: `${SITE_URL}/l4/${segments.join('/')}.md`,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
