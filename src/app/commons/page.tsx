import { Metadata } from "next";
import Link from "next/link";
import { getJurisdictions, COMMONS_REPO } from "@/lib/commons";
import { getSectionEntries, getSectionPages } from "@/lib/sections";
import markdownToHtml from "@/lib/markdownToHtml";
import Container from "../_components/container";
import Header from "../_components/header";
import { PageContent } from "../_components/page-content";
import { PageHeader } from "../_components/page-header";
import { DRAFT_NOTE, JurisdictionCard, Stat } from "./_components/commons-views";

export const metadata: Metadata = {
  title: "Commons",
  description: "Legalese Commons: the statute book as executable law. Every Act indexed, its text sourced, and its rules encoded in L4.",
};

export default async function CommonsHome() {
  const jurisdictions = getJurisdictions();
  const intro = getSectionEntries("commons").find((e) => e.slug === "index");
  const pages = getSectionPages("commons").filter((e) => e.slug !== "index");
  const html = intro ? await markdownToHtml(intro.content) : "";
  const total = (k: "instruments" | "sourced" | "encoded" | "sections" | "encodedSections") =>
    jurisdictions.reduce((s, j) => s + j[k], 0);
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <main>
      <Container>
        <Header />
        <article className="mb-32">
          <PageHeader title={intro?.title || "Commons"} />
          <div className="mx-auto max-w-5xl">
            {intro?.tagline && <p className="-mt-8 mb-8 text-xl text-gray-600">{intro.tagline}</p>}
            <div className="mb-10 grid grid-cols-2 gap-6 rounded-lg bg-gray-50 p-6 sm:grid-cols-5">
              <Stat value={fmt(jurisdictions.length)} label="jurisdictions" />
              <Stat value={fmt(total("instruments"))} label="instruments indexed" />
              <Stat value={fmt(total("sourced"))} label="texts sourced" />
              <Stat value={fmt(total("encoded"))} label="encoded in L4" />
              <Stat value={fmt(total("encodedSections"))} label="sections encoded" />
            </div>
            <h2 className="mb-4 text-2xl font-bold font-merriweather">Jurisdictions</h2>
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {jurisdictions.map((j) => <JurisdictionCard key={j.code} j={j} />)}
            </div>
            {html && <div className="mb-12"><PageContent content={html} /></div>}
            {pages.length > 0 && (
              <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
                {pages.map((p) => (
                  <Link key={p.slug} href={`/commons/${p.slug}`} className="block rounded-lg border border-gray-200 p-6 transition-colors hover:border-accent">
                    <h2 className="mb-2 text-xl font-bold font-merriweather">{p.title}</h2>
                    {p.tagline && <p className="text-sm text-gray-600">{p.tagline}</p>}
                  </Link>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500">
              {DRAFT_NOTE} The library is open source at{" "}
              <a href={COMMONS_REPO} className="text-accent underline" target="_blank" rel="noopener noreferrer">github.com/legalese/commons</a>.
            </p>
          </div>
        </article>
      </Container>
    </main>
  );
}
