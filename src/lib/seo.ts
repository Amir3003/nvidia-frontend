import { useEffect } from 'react';

const SITE = 'https://www.qadamhub.com';

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)?.setAttribute('content', content);
}

function apply(title: string, url: string) {
  document.title = title;
  setLink('canonical', url);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:title', title);
  setMeta('name', 'twitter:url', url);
  setMeta('name', 'twitter:title', title);
}

// The values in index.html (the student landing), restored when a page with its own meta unmounts.
// Fixed here because the prerendered /students page starts with its own head.
const DEFAULT_TITLE = 'Grants, scholarships and hackathons for students | QADAM Hub';
const DEFAULT_URL = `${SITE}/students`;

// Per-page title and canonical URL for public pages. Titles follow "what it is | QADAM Hub".
export function usePageMeta(title: string, path: string) {
  useEffect(() => {
    apply(title, `${SITE}${path}`);
    return () => apply(DEFAULT_TITLE, DEFAULT_URL);
  }, [title, path]);
}
