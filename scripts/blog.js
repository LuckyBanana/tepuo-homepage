/**
 * Tē Pūō — Blog / Journal
 * Loads articles from Supabase and renders them dynamically.
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

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateISO(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().slice(0, 10);
}

function renderArticleCard(post, { featured = false, delay = 0 } = {}) {
  const delayAttr = delay ? ` data-animate-delay="${delay}"` : '';
  const featuredClass = featured ? ' blog-card--featured' : '';

  return `
    <article class="blog-card${featuredClass} animate-on-scroll"${delayAttr}>
      ${post.image_url ? `
      <div class="blog-card-image">
        <img
          src="${escapeHtml(post.image_url)}"
          alt="${escapeHtml(post.image_alt || post.title)}"
          loading="lazy"
        >
      </div>` : ''}
      <div class="blog-card-content">
        <div class="blog-card-meta">
          ${post.category ? `<span class="blog-card-category">${escapeHtml(post.category)}</span>` : ''}
          <time class="blog-card-date" datetime="${formatDateISO(post.published_at)}">${formatDate(post.published_at)}</time>
        </div>
        <h2 class="blog-card-title">${escapeHtml(post.title)}</h2>
        ${post.excerpt ? `<p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        <span class="blog-card-readmore">Lire l'article</span>
      </div>
    </article>
  `;
}

async function loadBlogPosts() {
  const container = document.getElementById('blog-container');

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=*&order=published_at.desc`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) throw new Error(`Erreur ${res.status}`);

    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = '<p class="blog-empty">Aucun article pour le moment. Revenez bientôt !</p>';
      return;
    }

    // Separate featured post from the rest
    const featured = posts.find(p => p.is_featured) || posts[0];
    const others = posts.filter(p => p.id !== featured.id);

    let html = renderArticleCard(featured, { featured: true });

    if (others.length > 0) {
      html += '<div class="blog-grid">';
      others.forEach((post, i) => {
        html += renderArticleCard(post, { delay: i * 100 });
      });
      html += '</div>';
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="blog-empty">Impossible de charger les articles. ${escapeHtml(err.message)}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadBlogPosts);
