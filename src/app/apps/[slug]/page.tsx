import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionPage } from "../../_components/section-views";
import { getSectionEntry, getSectionPages } from "@/lib/sections";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const pages = getSectionPages("apps");
  // a static export needs at least one path; a placeholder 404s when nothing is published
  return pages.length ? pages.map((e) => ({ slug: e.slug })) : [{ slug: "_none" }];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = getSectionEntry("apps", slug);
  return entry ? { title: entry.title, description: entry.tagline } : { title: "Page Not Found" };
}

export default async function AppsPage({ params }: Params) {
  const { slug } = await params;
  const entry = getSectionEntry("apps", slug);
  if (!entry) return notFound();
  return <SectionPage section="apps" entry={entry} />;
}
