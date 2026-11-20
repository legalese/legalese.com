import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import { join } from "path";
import { COMMONS_REPO, getInstrument, getInstruments, getJurisdiction, getJurisdictions, percent, TYPE_LABELS } from "@/lib/commons";
import Container from "../../../../_components/container";
import Header from "../../../../_components/header";
import { PageHeader } from "../../../../_components/page-header";
import { Breadcrumb, DRAFT_NOTE, Stat } from "../../../_components/commons-views";

type Params = { params: Promise<{ code: string; type: string; slug: string }> };

export async function generateStaticParams() {
  // Pages are built for encoded instruments; the rest are listed on the jurisdiction page until they are encoded.
  return getJurisdictions().flatMap((j) =>
    getInstruments(j.code).filter((i) => i.encodings.length).map((i) => ({ code: j.code, type: i.type, slug: i.slug })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code, type, slug } = await params;
  const i = getInstrument(code, type, slug), j = getJurisdiction(code);
  if (!i || !j) return { title: "Page Not Found" };
  return {
    title: `${i.title} — ${j.name} — Commons`,
    description: i.encodings.length
      ? `${i.title} (${j.name}) in Legalese Commons: its source text and ${i.encodings.length} L4 encoding${i.encodings.length > 1 ? "s" : ""}.`
      : `${i.title} (${j.name}) in Legalese Commons: indexed${i.sourced ? " and its text sourced" : ""}; not yet encoded in L4.`,
  };
}

export default async function InstrumentPage({ params }: Params) {
  const { code, type, slug } = await params;
  const i = getInstrument(code, type, slug), j = getJurisdiction(code);
  if (!i || !j) return notFound();
  const tree = (p: string) => `${COMMONS_REPO}/tree/main/${p}`;
  // a live form for this instrument, if one has been built: public/demos/interact/<code>/<slug>/
  const interactPath = join(process.cwd(), "public", "demos", "interact", code, slug, "index.html");
  const interact = fs.existsSync(interactPath) ? `/demos/interact/${code}/${slug}/` : null;

  return (
    <main>
      <Container>
        <Header />
        <article className="mb-32">
          <Breadcrumb items={[{ href: "/commons", label: "Commons" }, { href: `/commons/${code}`, label: j.name }, { label: TYPE_LABELS[i.type].many }]} />
          <PageHeader title={i.title} />
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat value={TYPE_LABELS[i.type].one} label={j.name} />
              <Stat value={i.pages ? `${i.pages}` : "—"} label={i.pagesExact ? "pages" : "pages (estimated)"} />
              <Stat value={i.sections ? `${i.sections}` : "—"} label="sections" />
              <Stat value={i.sections ? percent(i.encodedSections, i.sections) : i.encodings.length ? "encoded" : "—"} label="of sections encoded" />
            </div>

            {interact && (
              <section className="mb-12">
                <h2 className="mb-2 text-2xl font-bold font-merriweather">Ask your questions</h2>
                <p className="mb-4 text-sm text-gray-600">
                  Answer the questions and each decision is worked out by this encoding, running live on Legalese Cloud. Open a decision to see why.{" "}
                  <a href={interact} target="_blank" rel="noopener noreferrer" className="text-accent underline">Open it full screen</a>.
                </p>
                <iframe src={interact} title={`${i.title}: ask your questions`} loading="lazy"
                  className="h-[85vh] min-h-[640px] w-full rounded-lg border border-gray-200" />
              </section>
            )}

            <section className="mb-10">
              <h2 className="mb-3 text-2xl font-bold font-merriweather">Source</h2>
              <ul className="space-y-1 text-sm">
                {i.source && (
                  <li>Official text: <a href={i.source} className="text-accent underline" target="_blank" rel="noopener noreferrer">{i.provider || new URL(i.source).hostname}</a></li>
                )}
                <li>{i.sourced ? "The text is deposited in Commons, with its licence and provenance." : "The text is not yet deposited in Commons."}{" "}
                  <a href={tree(i.repo)} className="text-accent underline" target="_blank" rel="noopener noreferrer">Open in the repository</a></li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="mb-3 text-2xl font-bold font-merriweather">Encodings</h2>
              {i.encodings.length === 0 ? (
                <p className="text-sm text-gray-600">Not yet encoded in L4.</p>
              ) : (
                <div className="space-y-4">
                  {i.encodings.map((e) => (
                    <div key={e.path} className="rounded-lg border border-gray-200 p-5">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#1e7a3c" }} />
                        <h3 className="font-bold">Encoding</h3>
                        <span className="font-mono text-xs text-gray-500">{e.name}</span>
                        {e.status && <span className="rounded border border-gray-300 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{e.status}</span>}
                      </div>
                      {e.scope && <p className="mb-2 text-sm text-gray-700"><span className="text-gray-500">Scope: </span>{e.scope}</p>}
                      {e.edition && <p className="mb-2 text-sm text-gray-700"><span className="text-gray-500">Edition encoded: </span>{e.edition}</p>}
                      <p className="text-sm text-gray-600">
                        {typeof e.assertions === "number" && <>{e.assertions} worked cases pass. </>}
                        <a href={tree(e.path)} className="text-accent underline" target="_blank" rel="noopener noreferrer">Read the L4 and its notes</a>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <p className="text-sm text-gray-500">{DRAFT_NOTE}</p>
          </div>
        </article>
      </Container>
    </main>
  );
}
