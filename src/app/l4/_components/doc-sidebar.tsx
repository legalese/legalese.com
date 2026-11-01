'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem, NavSection } from '@/lib/l4-docs';

interface DocSidebarProps {
  sections: NavSection[];
  baseRoute?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DocSidebar({ sections, baseRoute = '/l4', isOpen = true, onClose }: DocSidebarProps) {
  const pathname = usePathname();

  // Sub-pages show only for the branch you are in (progressive discovery);
  // the chevron opens or closes any other branch until you navigate again.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setToggled({});
  }, [pathname]);

  const hrefFor = (item: NavItem) =>
    item.href.startsWith('/') ? item.href : [baseRoute, item.href].filter(Boolean).join('/');
  const isActive = (item: NavItem) => {
    const href = hrefFor(item);
    return pathname === href || pathname === `${href}/`;
  };
  const containsActive = (item: NavItem): boolean =>
    isActive(item) || (item.children ?? []).some(containsActive);

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const active = isActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const expanded = hasChildren && (toggled[item.href] ?? containsActive(item));

    return (
      <li key={item.href} className="my-0.5">
        <div className="flex items-center">
          <Link
            href={hrefFor(item)}
            className={`flex-1 block py-1.5 px-3 text-sm rounded-md transition-colors ${
              active
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            style={{ paddingLeft: `${12 + depth * 12}px` }}
            aria-current={active ? 'page' : undefined}
          >
            {item.title}
          </Link>
          {hasChildren && (
            <button
              type="button"
              onClick={() => setToggled((t) => ({ ...t, [item.href]: !expanded }))}
              className="ml-1 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-expanded={expanded}
              aria-label={`${expanded ? 'Hide' : 'Show'} pages under ${item.title}`}
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        {expanded && (
          <ul className="mt-0.5">
            {item.children!.map((child) => renderNavItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  const renderSections = () =>
    sections.map((section, index) => (
      <div key={section.title || `section-${index}`} className={index > 0 ? 'mt-8' : ''}>
        {section.title && (
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            {section.title}
          </h3>
        )}
        <ul className="space-y-0.5">
          {section.items.map((item) => renderNavItem(item))}
        </ul>
      </div>
    ));

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Sidebar - sticky */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <nav className="sticky top-14 h-[calc(100vh-3.5rem)] border-r border-gray-200 bg-gray-50 flex flex-col overflow-y-auto">
          <div className="px-4 pb-4 pt-6 flex-1">
            {renderSections()}
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar - fixed overlay */}
      <nav className={`
        lg:hidden fixed inset-y-0 left-0 z-50
        w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50
        flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-4 pb-4 pt-6 flex-1 overflow-y-auto">
          {renderSections()}
        </div>

        {/* Mobile Online IDE button */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <a
            href="https://play.legalese.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Web IDE
          </a>
        </div>
      </nav>
    </>
  );
}
