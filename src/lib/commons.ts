// Legalese Commons: the open library of law and its L4 encodings (github.com/legalese/commons).
// The data in data/commons/ is generated from a Commons checkout by the workbench script
// site/build_commons_site_data.py; this module only reads it.
import fs from "fs";
import { join } from "path";

export type Encoding = {
  name: string;
  status?: string;
  gates: boolean;
  assertions?: number | null;
  scope: string;
  edition: string;
  path: string;
};

export type Instrument = {
  slug: string;
  type: "act" | "sl" | "bill" | "case" | "doctrine" | "policy";
  title: string;
  year: number | null;
  pages: number | null;
  pagesExact: boolean;
  sections: number;
  encodedSections: number;
  sourced: boolean;
  source?: string | null;
  provider?: string | null;
  encodings: Encoding[];
  repo: string;
};

export type Jurisdiction = {
  code: string;
  name: string;
  instruments: number;
  acts: number;
  sourced: number;
  encoded: number;
  sections: number;
  encodedSections: number;
  pages: number;
  mapActs: number;
};

export const COMMONS_REPO = "https://github.com/legalese/commons";

export const TYPE_LABELS: Record<Instrument["type"], { one: string; many: string }> = {
  act: { one: "Act", many: "Acts" },
  sl: { one: "Subsidiary legislation", many: "Subsidiary legislation" },
  bill: { one: "Bill", many: "Bills" },
  case: { one: "Case", many: "Cases" },
  doctrine: { one: "Doctrine", many: "Doctrines" },
  policy: { one: "Published policy", many: "Published policies" },
};

const dataDir = join(process.cwd(), "data", "commons");

export function getJurisdictions(): Jurisdiction[] {
  const p = join(dataDir, "index.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8")) as Jurisdiction[];
}

export function getJurisdiction(code: string): Jurisdiction | null {
  return getJurisdictions().find((j) => j.code === code) ?? null;
}

const cache = new Map<string, Instrument[]>();

export function getInstruments(code: string): Instrument[] {
  if (cache.has(code)) return cache.get(code)!;
  const p = join(dataDir, `${code}.json`);
  const list = fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as Instrument[]) : [];
  list.sort((a, b) => a.title.localeCompare(b.title));
  cache.set(code, list);
  return list;
}

export function getInstrument(code: string, type: string, slug: string): Instrument | null {
  return getInstruments(code).find((i) => i.type === type && i.slug === slug) ?? null;
}

export function percent(n: number, d: number): string {
  if (!d) return "0%";
  const p = (100 * n) / d;
  return p > 0 && p < 1 ? "<1%" : `${Math.round(p)}%`;
}
