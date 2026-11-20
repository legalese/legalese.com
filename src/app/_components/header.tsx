import Link from "next/link";
import Image from "next/image";
import { CMS_NAME } from "@/lib/constants";
import { getHeaderPages, getHeaderExternalLinks } from "@/lib/api";
import { getSectionEntries } from "@/lib/sections";
import { getJurisdictions } from "@/lib/commons";
import { SectionMenu } from "./section-menu";

const Header = () => {
  const headerPages = getHeaderPages();
  const headerExternalLinks = getHeaderExternalLinks();
  // Products, Solutions and Apps appear once they have a published entry (edited in Pages CMS).
  const products = getSectionEntries("products");
  const solutions = getSectionEntries("solutions");
  const apps = getSectionEntries("apps");
  const commonsLinks = [
    ...getJurisdictions().map((j) => ({ href: `/commons/${j.code}`, label: j.name })),
    ...getSectionEntries("commons")
      .filter((e) => e.slug !== "index" && e.status === "live")
      .map((e) => ({ href: `/commons/${e.slug}`, label: e.navTitle || e.title })),
  ];

  return (
    <header className="flex flex-col md:flex-row items-center justify-between py-8 mb-6">
      <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
        <Image
          src="/assets/logos/legalese-logo.png"
          alt="§"
          width={42}
          height={42}
          className="rounded"
        />
        <span className="text-2xl font-bold tracking-tight font-merriweather">{CMS_NAME}</span>
      </Link>
      <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-4 md:mt-0">
        {products.length > 0 && <SectionMenu section="products" entries={products} />}
        {solutions.length > 0 && <SectionMenu section="solutions" entries={solutions} />}
        {apps.length > 0 && <SectionMenu section="apps" entries={apps} />}
        <SectionMenu section="commons" entries={[]} extra={commonsLinks} />
        {headerPages.map((page) => (
          <Link 
            key={page.slug}
            href={`/${page.slug}`} 
            className="text-sm font-medium hover:text-accent transition-colors font-merriweather"
          >
            {page.navTitle || page.title}
          </Link>
        ))}
        <Link href="/posts" className="text-sm font-medium hover:text-accent transition-colors font-merriweather">
          Blog
        </Link>
        {headerExternalLinks.map((link, i) => {
          // Only the last item in the row gets the accent color and arrow
          const isLast = i === headerExternalLinks.length - 1;
          return (
            <a
              key={link.slug}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                isLast
                  ? "text-sm font-medium text-accent hover:text-accent-hover transition-colors font-merriweather"
                  : "text-sm font-medium hover:text-accent transition-colors font-merriweather"
              }
            >
              {link.navTitle || link.title}{isLast && " →"}
            </a>
          );
        })}
      </nav>
    </header>
  );
};

export default Header;
