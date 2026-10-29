'use client';

import { useEffect, useRef } from 'react';

interface DocContentProps {
  html: string;
}

const EDITOR_ORIGIN = 'https://play.legalese.com';

export default function DocContent({ html }: DocContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  // True once the editor has answered: these docs are in its sidebar
  const inEditorRef = useRef(false);

  // The editor shows these docs in an iframe. Ask the parent whether it is the
  // editor; postMessage only delivers to a parent of that origin.
  useEffect(() => {
    if (window.parent === window) return;
    const ancestor = window.location.ancestorOrigins?.[0];
    if (ancestor !== undefined && ancestor !== EDITOR_ORIGIN) return;

    const onMessage = (event: MessageEvent) => {
      if (
        event.origin === EDITOR_ORIGIN &&
        event.source === window.parent &&
        event.data?.type === 'l4-editor-host'
      ) {
        inEditorRef.current = true;
      }
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'l4-docs-hello' }, EDITOR_ORIGIN);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Add "Run code" buttons to L4 code blocks
  useEffect(() => {
    if (!contentRef.current) return;

    // Find all embedded L4 file blocks (marked with language-l4-file) that haven't been wrapped yet
    // This excludes inline ```l4``` blocks written directly in markdown
    const codeBlocks = contentRef.current.querySelectorAll('pre code.language-l4-file');
    
    codeBlocks.forEach((codeElement) => {
      const preElement = codeElement.parentElement;
      if (!preElement) return;

      // Check if already wrapped
      if (preElement.hasAttribute('data-l4-wrapped')) return;
      preElement.setAttribute('data-l4-wrapped', 'true');

      // Get the code content
      const codeContent = codeElement.textContent || '';
      const encodedContent = encodeURIComponent(codeContent);
      // In the fragment, which never leaves the browser: as a query, a long
      // program makes a URL over CloudFront's 8,192-byte limit.
      const playgroundUrl = `https://play.legalese.com/#program=${encodedContent}`;

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'l4-code-wrapper rounded-lg border border-gray-200 overflow-hidden mb-4';

      // Create header with "Run code" button
      const header = document.createElement('div');
      header.className = 'bg-gray-100 px-4 py-2 text-sm font-mono text-gray-600 border-b border-gray-200 flex items-center justify-between';
      header.innerHTML = `
        <span class="text-xs text-gray-400">L4</span>
        <a href="${playgroundUrl}" target="l4-code" class="l4-run-button inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c8376a] hover:bg-[#a62d56] rounded transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Run code
        </a>
      `;

      // In the editor's sidebar, open the example in that editor instead of a
      // new tab. A modified click still opens a tab.
      header.querySelector('a')?.addEventListener('click', (event) => {
        if (!inEditorRef.current) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        window.parent.postMessage({ type: 'l4-open-program', program: codeContent }, EDITOR_ORIGIN);
      });

      // Create content wrapper
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'max-h-[60vh] overflow-auto';

      // Wrap the pre element
      preElement.parentElement?.insertBefore(wrapper, preElement);
      preElement.classList.add('!m-0', '!rounded-none', '!border-0');
      contentWrapper.appendChild(preElement);
      wrapper.appendChild(header);
      wrapper.appendChild(contentWrapper);
    });
  }, [html]);

  return (
    <div
      ref={contentRef}
      className="doc-content max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}