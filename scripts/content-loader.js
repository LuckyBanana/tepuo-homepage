/**
 * Tē Pūō — Content Loader
 *
 * Loads editable content from Supabase site_content table
 * and applies it to elements with data-content attributes.
 *
 * Attributes:
 *   data-content="section.field_key"     → sets textContent (or innerHTML for textarea)
 *   data-content-src="section.field_key"  → sets img src
 *   data-content-alt="section.field_key"  → sets img alt
 *   data-content-href="section.field_key" → sets href
 *   data-content-list="section.field_key" → renders JSON array as <li> items
 */

import { CONFIG } from './config.js';

const SUPABASE_URL = CONFIG.supabase.url;
const ANON_KEY = CONFIG.supabase.anonKey;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Convert textarea content (paragraphs separated by \n\n) to HTML <p> tags.
 */
function textToParagraphs(text) {
  return text
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => `<p>${escapeHtml(p.trim())}</p>`)
    .join('');
}

export async function loadPageContent(pageName) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_content?page=eq.${pageName}&select=section,field_key,content_type,value&order=sort_order`,
      { headers: { 'apikey': ANON_KEY } }
    );

    if (!res.ok) return;

    const rows = await res.json();
    if (!rows.length) return;

    // Build lookup map: "section.field_key" → { value, content_type }
    const content = new Map();
    for (const row of rows) {
      content.set(`${row.section}.${row.field_key}`, {
        value: row.value || '',
        type: row.content_type,
      });
    }

    // Apply text content
    document.querySelectorAll('[data-content]').forEach(el => {
      const entry = content.get(el.dataset.content);
      if (!entry) return;

      if (entry.type === 'textarea') {
        el.innerHTML = textToParagraphs(entry.value);
      } else {
        el.textContent = entry.value;
      }
    });

    // Apply image src
    document.querySelectorAll('[data-content-src]').forEach(el => {
      const entry = content.get(el.dataset.contentSrc);
      if (entry?.value) el.src = entry.value;
    });

    // Apply image alt
    document.querySelectorAll('[data-content-alt]').forEach(el => {
      const entry = content.get(el.dataset.contentAlt);
      if (entry?.value) el.alt = entry.value;
    });

    // Apply href
    document.querySelectorAll('[data-content-href]').forEach(el => {
      const entry = content.get(el.dataset.contentHref);
      if (entry?.value) el.href = entry.value;
    });

    // Apply lists
    document.querySelectorAll('[data-content-list]').forEach(el => {
      const entry = content.get(el.dataset.contentList);
      if (!entry?.value) return;
      try {
        const items = JSON.parse(entry.value);
        if (Array.isArray(items)) {
          el.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
        }
      } catch { /* keep original content */ }
    });

  } catch {
    // Graceful degradation: if Supabase is unreachable, keep original HTML content
  }
}

// Auto-detect page from data-page attribute or URL
function autoLoad() {
  const main = document.querySelector('[data-page]');
  if (main) {
    loadPageContent(main.dataset.page);
  }
}

document.addEventListener('DOMContentLoaded', autoLoad);
