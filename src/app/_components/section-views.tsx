import Link from "next/link";
import markdownToHtml from "@/lib/markdownToHtml";
import { SECTIONS, SectionEntry, SectionName } from "@/lib/sections";
import Container from "./container";
import Header from "./header";
import { PageContent } from "./page-content";
import { PageHeader } from "./page-header";

export function ComingTag() {
  return (
    <span className="ml-2 inline-block rounded border border-gray-300 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-gray-500">
      Coming
    </span>
  );
}

// Cards for every entry in a section. Live entries link to their page; "coming" entries are listed, not linked.
export function SectionCards({ section, entries }: { section: SectionName; entries: SectionEntry[] }) {
  const base = SECTIONS[section].base;
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((e) => {
        const inner = (
          <>
            <h2 className="mb-2 text-xl font-bold font-merriweather">
              {e.title}
              {e.status === "coming" && <ComingTag />}
            </h2>
            {e.tagline && <p className="text-sm text-gray-600">{e.tagline}</p>}
          </>
        );
        return e.status === "live" ? (
          <Link key={e.slug} href={`${base}/${e.slug}`}
            className="block rounded-lg border border-gray-200 p-6 transition-colors hover:border-accent">
            {inner}
          </Link>
        ) : (
          <div key={e.slug} className="rounded-lg border border-dashed border-gray-200 p-6 text-gray-500">
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export function SectionIndex({ section, entries, intro }: { section: SectionName; entries: SectionEntry[]; intro?: string }) {
  return (
    <main>
      <Container>
        <Header />
        <article className="mb-32">
          <PageHeader title={SECTIONS[section].title} />
          <div className="mx-auto max-w-4xl">
            {intro && <p className="mb-10 text-lg text-gray-600">{intro}</p>}
            {entries.length ? <SectionCards section={section} entries={entries} /> : <p className="text-gray-500">Nothing here yet.</p>}
          </div>
        </article>
      </Container>
    </main>
  );
}

export async function SectionPage({ section, entry }: { section: SectionName; entry: SectionEntry }) {
  const content = await markdownToHtml(entry.content || "");
  return (
    <main>
      <Container>
        <Header />
        <article className="mb-32">
          <div className="mx-auto mb-4 max-w-4xl text-sm text-gray-500">
            <Link href={SECTIONS[section].base} className="hover:text-accent">{SECTIONS[section].title}</Link>
          </div>
          <PageHeader title={entry.title} />
          {entry.tagline && <p className="mx-auto -mt-8 mb-10 max-w-4xl text-xl text-gray-600">{entry.tagline}</p>}
          <PageContent content={content} />
          {entry.demo && (
            <section className="mx-auto mt-12 max-w-6xl">
              <h2 className="mb-2 text-2xl font-bold font-merriweather">{entry.demoTitle || "Try it"}</h2>
              <p className="mb-4 text-sm text-gray-600">
                {entry.demoNote || "This demo runs entirely in your browser. It uses no AI and sends nothing anywhere."}{" "}
                <a href={entry.demo} target="_blank" rel="noopener noreferrer" className="text-accent underline">Open it full screen</a>.
              </p>
              <iframe src={entry.demo} title={entry.demoTitle || `${entry.title} demo`} loading="lazy"
                className="h-[80vh] min-h-[560px] w-full rounded-lg border border-gray-200" />
            </section>
          )}
        </article>
      </Container>
    </main>
  );
}
