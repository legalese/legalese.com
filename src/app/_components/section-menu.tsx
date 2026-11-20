import Link from "next/link";
import { SECTIONS, SectionEntry, SectionName } from "@/lib/sections";

// A header menu with a dropdown, CSS only (opens on hover and on keyboard focus).
// Live entries link to their page; "coming" entries are plain text with a tag, not links.
export function SectionMenu({ section, entries, extra }: {
  section: SectionName;
  entries: SectionEntry[];
  extra?: { href: string; label: string }[];
}) {
  const { title, base } = SECTIONS[section];
  return (
    <div className="group relative">
      <Link href={base} className="text-sm font-medium hover:text-accent transition-colors font-merriweather" aria-haspopup="true">
        {title}
      </Link>
      <div className="invisible absolute left-1/2 top-full z-40 w-60 -translate-x-1/2 pt-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <ul className="rounded-lg border border-gray-200 bg-white py-2 shadow-md">
          {entries.map((e) => (
            <li key={e.slug}>
              {e.status === "live" ? (
                <Link href={`${base}/${e.slug}`} className="block px-4 py-1.5 text-sm hover:bg-gray-50 hover:text-accent">
                  {e.navTitle || e.title}
                </Link>
              ) : (
                <span className="block px-4 py-1.5 text-sm text-gray-400">
                  {e.navTitle || e.title}
                  <span className="ml-2 rounded border border-gray-300 px-1 text-[9px] font-semibold uppercase tracking-wider">Coming</span>
                </span>
              )}
            </li>
          ))}
          {extra?.map((x) => (
            <li key={x.href}>
              <Link href={x.href} className="block px-4 py-1.5 text-sm hover:bg-gray-50 hover:text-accent">{x.label}</Link>
            </li>
          ))}
          <li className="mt-1 border-t border-gray-100 pt-1">
            <Link href={base} className="block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-accent">
              {section === "commons" ? "Commons home" : `All ${title.toLowerCase()}`}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
