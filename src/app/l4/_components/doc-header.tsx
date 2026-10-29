'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CMS_NAME } from '@/lib/constants';
import { DOC_TABS } from '@/lib/l4-docs';
import { usePathname } from 'next/navigation';
import DocSearch from './doc-search';

interface DocHeaderProps {
  onMenuToggle?: () => void;
  hasNavigation?: boolean;
}

export default function DocHeader({ onMenuToggle, hasNavigation = true }: DocHeaderProps) {
  const pathname = usePathname();
  
  // Determine active tab from pathname
  const getActiveTab = () => {
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length <= 1) return ''; // /l4 -> Overview
    const firstSegment = pathParts[1];
    const tab = DOC_TABS.find(t => t.slug === firstSegment);
    return tab ? tab.slug : '';
  };
  
  const activeTab = getActiveTab();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center h-14 px-4 lg:px-6">
        {/* Mobile menu button */}
        {hasNavigation && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            aria-label="Open navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {/* Left: Logo - matches sidebar width on desktop */}
        <div className="lg:w-64 flex-shrink-0 pr-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/assets/logos/legalese-logo.png"
              alt="§"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="hidden sm:inline text-xl font-bold tracking-tight font-merriweather">{CMS_NAME}</span>
          </Link>
        </div>
        
        {/* Center: Search aligned with main content column */}
        <div className="flex-1 flex justify-end md:justify-start mr-0 md:mr-4">
          <DocSearch />
        </div>
        
        {/* Right: Navigation + Online IDE button */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <nav className="hidden md:flex items-center gap-1">
            {DOC_TABS.map((tab) => (
              <Link
                key={tab.slug}
                href={`/l4${tab.slug ? `/${tab.slug}` : ''}`}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.slug
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
          
          <a
            href="https://play.legalese.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
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
      </div>
      
      {/* Mobile tabs */}
      <div className="md:hidden overflow-x-auto border-t border-gray-100">
        <nav className="flex px-4 py-2 gap-1">
          {DOC_TABS.map((tab) => (
            <Link
              key={tab.slug}
              href={`/l4${tab.slug ? `/${tab.slug}` : ''}`}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.slug
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
