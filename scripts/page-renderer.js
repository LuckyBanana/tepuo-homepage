/**
 * Tē Pūō — Dynamic Page Renderer
 *
 * Loads a page and its blocks from Supabase based on the ?slug= parameter
 * and renders them into the page.
 */

import { CONFIG } from './config.js';

const SUPABASE_URL = CONFIG.supabase.url;
const ANON_KEY = CONFIG.supabase.anonKey;

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function textToParagraphs(text) {
  if (!text) return '';
  return text
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => `<p>${escapeHtml(p.trim())}</p>`)
    .join('');
}

function renderBlock(block) {
  const d = block.data || {};

  switch (block.block_type) {
    case 'hero': {
      let html = `<section class="block block--hero">`;
      if (d.title) html += `<h1 class="block-title">${escapeHtml(d.title)}</h1>`;
      if (d.subtitle) html += `<p class="block-subtitle">${escapeHtml(d.subtitle)}</p>`;
      if (d.cta_text && d.cta_url) html += `<a href="${escapeHtml(d.cta_url)}" class="btn btn-primary">${escapeHtml(d.cta_text)}</a>`;
      if (d.image_url) html += `<img src="${escapeHtml(d.image_url)}" alt="${escapeHtml(d.image_alt || d.title || '')}" loading="lazy">`;
      html += `</section>`;
      return html;
    }

    case 'text': {
      let html = `<section class="block block--text">`;
      if (d.title) html += `<h2 class="block-title">${escapeHtml(d.title)}</h2>`;
      if (d.content) html += `<div class="block-content">${textToParagraphs(d.content)}</div>`;
      html += `</section>`;
      return html;
    }

    case 'image_text': {
      const posClass = d.image_position === 'right' ? ' image-right' : '';
      let html = `<section class="block block--image-text${posClass}">`;
      html += `<div>`;
      if (d.image_url) html += `<img src="${escapeHtml(d.image_url)}" alt="${escapeHtml(d.image_alt || '')}" loading="lazy">`;
      html += `</div><div>`;
      if (d.title) html += `<h2 class="block-title">${escapeHtml(d.title)}</h2>`;
      if (d.content) html += `<div class="block-content">${textToParagraphs(d.content)}</div>`;
      html += `</div></section>`;
      return html;
    }

    case 'gallery': {
      let html = `<section class="block block--gallery">`;
      if (d.title) html += `<h2 class="block-title">${escapeHtml(d.title)}</h2>`;
      if (d.images?.length) {
        html += `<div class="gallery-grid">`;
        for (const img of d.images) {
          const url = typeof img === 'string' ? img : img.url;
          const alt = typeof img === 'string' ? '' : (img.alt || '');
          html += `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy">`;
        }
        html += `</div>`;
      }
      html += `</section>`;
      return html;
    }

    case 'cta': {
      let html = `<section class="block block--cta">`;
      if (d.title) html += `<h2 class="block-title">${escapeHtml(d.title)}</h2>`;
      if (d.text) html += `<div class="block-content">${textToParagraphs(d.text)}</div>`;
      if (d.button_text && d.button_url) html += `<a href="${escapeHtml(d.button_url)}" class="btn btn-primary">${escapeHtml(d.button_text)}</a>`;
      html += `</section>`;
      return html;
    }

    default:
      return '';
  }
}

async function loadPage() {
  const container = document.getElementById('page-content');
  const slug = new URLSearchParams(window.location.search).get('slug');

  if (!slug) {
    container.innerHTML = '<div class="page-error">Aucun slug spécifié.</div>';
    return;
  }

  try {
    // Fetch page
    const pagesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/pages?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&select=*`,
      { headers: { 'apikey': ANON_KEY } }
    );

    if (!pagesRes.ok) throw new Error(`Erreur ${pagesRes.status}`);
    const pages = await pagesRes.json();

    if (!pages.length) {
      container.innerHTML = '<div class="page-error">Page introuvable.</div>';
      document.title = 'Page introuvable — Tē Pūō';
      return;
    }

    const page = pages[0];
    document.title = `${page.title} — Tē Pūō`;
    if (page.meta_description) {
      document.getElementById('meta-description')?.setAttribute('content', page.meta_description);
    }

    // Fetch blocks
    const blocksRes = await fetch(
      `${SUPABASE_URL}/rest/v1/page_blocks?page_id=eq.${page.id}&select=*&order=sort_order`,
      { headers: { 'apikey': ANON_KEY } }
    );

    if (!blocksRes.ok) throw new Error(`Erreur ${blocksRes.status}`);
    const blocks = await blocksRes.json();

    if (!blocks.length) {
      container.innerHTML = '<div class="page-error">Cette page n\'a pas encore de contenu.</div>';
      return;
    }

    container.className = 'dynamic-page';
    container.innerHTML = blocks.map(renderBlock).join('');

  } catch (err) {
    container.innerHTML = `<div class="page-error">Impossible de charger la page. ${escapeHtml(err.message)}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadPage);
