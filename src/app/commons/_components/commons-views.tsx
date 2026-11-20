import Link from "next/link";
import { Jurisdiction, percent } from "@/lib/commons";

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="mx-auto mb-4 max-w-5xl text-sm text-gray-500" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5">/</span>}
          {it.href ? <Link href={it.href} className="hover:text-accent">{it.label}</Link> : <span className="text-gray-700">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString("en-US");

export function JurisdictionStats({ j }: { j: Jurisdiction }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      <Stat value={fmt(j.instruments)} label="indexed" />
      <Stat value={fmt(j.sourced)} label="text sourced" />
      <Stat value={fmt(j.encoded)} label="encoded in L4" />
      <Stat value={percent(j.encodedSections, j.sections)} label={`of ${fmt(j.sections)} sections encoded`} />
    </div>
  );
}

export function JurisdictionCard({ j }: { j: Jurisdiction }) {
  const enc = j.sections ? j.encodedSections / j.sections : 0;
  return (
    <Link href={`/commons/${j.code}`} className="block rounded-lg border border-gray-200 p-6 transition-colors hover:border-accent">
      <div className="mb-1 font-mono text-xs uppercase tracking-wider text-gray-500">/{j.code}</div>
      <h2 className="mb-4 text-xl font-bold font-merriweather">{j.name}</h2>
      <dl className="mb-4 grid grid-cols-3 gap-2 text-sm">
        <div><dt className="text-gray-500">Indexed</dt><dd className="font-semibold tabular-nums">{fmt(j.instruments)}</dd></div>
        <div><dt className="text-gray-500">Sourced</dt><dd className="font-semibold tabular-nums">{fmt(j.sourced)}</dd></div>
        <div><dt className="text-gray-500">Encoded</dt><dd className="font-semibold tabular-nums">{fmt(j.encoded)}</dd></div>
      </dl>
      <div className="h-2 overflow-hidden rounded bg-gray-100" aria-hidden>
        <div className="h-full bg-[#1e7a3c]" style={{ width: `${Math.max(enc > 0 ? 1 : 0, Math.round(100 * enc))}%` }} />
      </div>
      <div className="mt-1 text-xs text-gray-500">{percent(j.encodedSections, j.sections)} of sections encoded</div>
    </Link>
  );
}

export const DRAFT_NOTE =
  "Every encoding in Commons is a draft, and none has yet been verified against its source by a named reviewer. The figures show how much of the statute book is in executable form, not how much is verified.";
