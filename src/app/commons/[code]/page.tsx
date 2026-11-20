import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMMONS_REPO, getInstruments, getJurisdiction, getJurisdictions, percent, TYPE_LABELS, Instrument } from "@/lib/commons";
import { getSectionEntry, getSectionPages } from "@/lib/sections";
import markdownToHtml from "@/lib/markdownToHtml";
import Container from "../../_components/container";
import Header from "../../_components/header";
import { PageContent } from "../../_components/page-content";
import { PageHeader } from "../../_components/page-header";
import { Breadcrumb, DRAFT_NOTE, JurisdictionStats } from "../_components/commons-views";
import StatuteMap from "../_components/statute-map";

// /commons/<x> is either a jurisdiction (au, au-wa, sg …) or a Commons page (live-simulation, contribute).
// Jurisdiction codes always begin with a two-letter country code; page names never begin with a two-letter word.
type Params = { params: Promise<{ code: string }> };

export async function generateStaticParams() {
  return [
    ...getJurisdictions().map((j) => ({ code: j.code })),
    ...getSectionPages("commons").filter((e) => e.slug !== "index").map((e) => ({ code: e.slug })),
  ];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code } = await params;
  const j = getJurisdiction(code);
  if (j) return { title: `${j.name} — Commons`, description: `The ${j.name} statute book in Legalese Commons: ${j.instruments} instruments indexed, ${j.encoded} encoded in L4.` };
  const page = getSectionEntry("commons", code);
  return page ? { title: `${page.title} — Commons`, description: page.tagline } : { title: "Page Not Found" };
}

function InstrumentRow({ code, i }: { code: string; i: Instrument }) {
  const first = i.encodings.length > 0;
  return (
    <li className="flex break-inside-avoid items-baseline justify-between gap-4 border-b border-gray-100 py-1.5 text-sm">
      {first ? (
        <Link href={`/commons/${code}/${i.type}/${i.slug}`} className="hover:text-accent">{i.title}</Link>
      ) : (
        <a href={`${COMMONS_REPO}/tree/main/${i.repo}`} className="text-gray-700 hover:text-accent" target="_blank" rel="noopener noreferrer">{i.title}</a>
      )}
      <span className="shrink-0 text-xs text-gray-500">
        {first && (
          <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle" title="Encoded"
            style={{ background: "#1e7a3c" }} />
        )}
        {first ? (i.sections ? `${percent(i.encodedSections, i.sections)} of ${i.sections} sections` : "encoded") : i.sourced ? "sourced" : "indexed"}
      </span>
    </li>
  );
}

export default async function CommonsCodePage({ params }: Params) {
  const { code } = await params;
  const j = getJurisdiction(code);

  if (!j) {
    const page = getSectionEntry("commons", code);
    if (!page) return notFound();
    const html = await markdownToHtml(page.content || "");
    return (
      <main>
        <Container>
          <Header />
          <article className="mb-32">
            <Breadcrumb items={[{ href: "/commons", label: "Commons" }, { label: page.title }]} />
            <PageHeader title={page.title} />
            {page.tagline && <p className="mx-auto -mt-8 mb-10 max-w-4xl text-xl text-gray-600">{page.tagline}</p>}
            <PageContent content={html} />
          </article>
        </Container>
      </main>
    );
  }

  const items = getInstruments(code);
  const byType = (Object.keys(TYPE_LABELS) as Instrument["type"][])
    .map((t) => ({ t, list: items.filter((i) => i.type === t) }))
    .filter((g) => g.list.length);

  return (
    <main>
      <Container>
        <Header />
        <article className="mb-32">
          <Breadcrumb items={[{ href: "/commons", label: "Commons" }, { label: j.name }]} />
          <PageHeader title={j.name} />
          <div className="mx-auto max-w-5xl">
            <div className="mb-10"><JurisdictionStats j={j} /></div>
            {j.mapActs > 0 && (
              <section className="mb-12">
                <h2 className="mb-2 text-2xl font-bold font-merriweather">Statute map</h2>
                <p className="mb-4 text-sm text-gray-600">
                  Every Act, one line each. A line&apos;s length grows with the Act&apos;s page count; inside it, each section is a slice
                  sized by its text, coloured where an L4 encoding covers it. Hover for detail; click an encoded Act to open its page. Encoded instruments link to their page; the others link to their folder in the repository.
                </p>
                <StatuteMap code={code} base={`/commons/${code}`} />
              </section>
            )}
            {byType.map((g) => (
              <section key={g.t} className="mb-12">
                <h2 className="mb-4 text-2xl font-bold font-merriweather">
                  {TYPE_LABELS[g.t].many} <span className="text-base font-normal text-gray-500">({g.list.length.toLocaleString("en-US")})</span>
                </h2>
                <ul className="columns-1 gap-10 md:columns-2">{g.list.map((i) => <InstrumentRow key={i.slug} code={code} i={i} />)}</ul>
              </section>
            ))}
            <p className="text-sm text-gray-500">{DRAFT_NOTE}</p>
          </div>
        </article>
      </Container>
    </main>
  );
}
