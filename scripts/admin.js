/**
 * Tē Pūō — Admin Interface
 *
 * Handles authentication via Supabase Auth REST API
 * and CRUD operations for collections, jewelry, and sales points.
 */

import { CONFIG } from './config.js';

const SUPABASE_URL = CONFIG.supabase.url;
const ANON_KEY = CONFIG.supabase.anonKey;
const SESSION_KEY = 'tepuo_admin_session';

// ============================================================================
// AUTH
// ============================================================================

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function getAccessToken() {
  const session = getSession();
  return session?.access_token ?? null;
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || err.msg || 'Identifiants incorrects');
  }

  const data = await res.json();
  saveSession(data);
  return data;
}

function signOut() {
  clearSession();
  showLogin();
}

// ============================================================================
// API (Authenticated CRUD)
// ============================================================================

async function apiFetch(endpoint, options = {}) {
  const token = getAccessToken();
  if (!token) {
    signOut();
    throw new Error('Non authentifié');
  }

  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
  const headers = {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    signOut();
    throw new Error('Session expirée, veuillez vous reconnecter');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

async function apiList(table) {
  return apiFetch(`/${table}?select=*&order=created_at.desc`);
}

async function apiInsert(table, data) {
  return apiFetch(`/${table}`, {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(data),
  });
}

async function apiUpdate(table, id, data) {
  return apiFetch(`/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(data),
  });
}

async function apiDelete(table, id) {
  return apiFetch(`/${table}?id=eq.${id}`, {
    method: 'DELETE',
  });
}

async function uploadImage(file) {
  const token = getAccessToken();
  if (!token) throw new Error('Non authentifié');

  const ext = file.name.split('.').pop();
  const filename = `${crypto.randomUUID()}.${ext}`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/jewelry-images/${filename}`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur lors du téléchargement de l\'image');
  }

  return `${SUPABASE_URL}/storage/v1/object/public/jewelry-images/${filename}`;
}

// ============================================================================
// STATE
// ============================================================================

let collectionsCache = [];
let jewelryCache = [];
let salesPointsCache = [];
let blogPostsCache = [];
let pagesCache = [];
let currentContentPage = 'home';
let pendingDeleteAction = null;

const PAGE_LABELS = { home: 'Accueil', atelier: 'L\'Atelier', entretien: 'Entretien' };
const SECTION_LABELS = {
  hero: 'Hero', story: 'Notre histoire', technique: 'Technique dorodango',
  philosophy: 'Philosophie', intro: 'Introduction', process: 'Processus',
  step_1: 'Étape 1', step_2: 'Étape 2', step_3: 'Étape 3', step_4: 'Étape 4', step_5: 'Étape 5',
  materials: 'Matériaux', material_1: 'Matériau 1', material_2: 'Matériau 2',
  material_3: 'Matériau 3', material_4: 'Matériau 4', cta: 'Appel à l\'action',
  tips: 'Conseils', tip_1: 'Conseil 1', tip_2: 'Conseil 2', tip_3: 'Conseil 3', tip_4: 'Conseil 4',
  dos_donts: 'Bonnes pratiques', dos: 'À faire', donts: 'À éviter', restoration: 'Restauration',
};

const BLOCK_TYPES = {
  hero: 'Hero',
  text: 'Texte',
  image_text: 'Image + Texte',
  gallery: 'Galerie',
  cta: 'Appel à l\'action',
};

// ============================================================================
// UI - SCREENS
// ============================================================================

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('admin-dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');

  const session = getSession();
  const emailEl = document.getElementById('admin-user-email');
  if (emailEl && session?.user?.email) {
    emailEl.textContent = session.user.email;
  }

  loadAllData();
}

// ============================================================================
// UI - TOASTS
// ============================================================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ============================================================================
// UI - TABS
// ============================================================================

function initTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const tabId = `tab-${tab.dataset.tab}`;
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// ============================================================================
// UI - MODALS
// ============================================================================

function openModal(title, bodyHtml, onSubmit) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalError = document.getElementById('modal-error');
  const form = document.getElementById('modal-form');

  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  modalError.classList.add('hidden');
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');

  const firstInput = modalBody.querySelector('input, select, textarea');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('modal-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enregistrement...';
    modalError.classList.add('hidden');

    try {
      await onSubmit(form);
      closeModal();
    } catch (err) {
      modalError.textContent = err.message;
      modalError.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enregistrer';
    }
  };
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  document.getElementById('modal-form').onsubmit = null;
}

function openConfirmDelete(message, onConfirm) {
  const overlay = document.getElementById('confirm-overlay');
  const messageEl = document.getElementById('confirm-message');
  messageEl.textContent = message;
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  pendingDeleteAction = onConfirm;
}

function closeConfirm() {
  const overlay = document.getElementById('confirm-overlay');
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  pendingDeleteAction = null;
}

// ============================================================================
// UI - SVG ICONS (inline, no external dependency)
// ============================================================================

const ICON_EDIT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const ICON_DELETE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

// ============================================================================
// COLLECTIONS - CRUD UI
// ============================================================================

async function loadCollections() {
  const container = document.getElementById('collections-list');
  container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p class="loading-text">Chargement...</p></div>';

  try {
    collectionsCache = await apiList('collections');
    renderCollections();
  } catch (err) {
    container.innerHTML = `<div class="admin-empty-state"><p>Erreur de chargement</p><span>${err.message}</span></div>`;
  }
}

function renderCollections() {
  const container = document.getElementById('collections-list');

  if (collectionsCache.length === 0) {
    container.innerHTML = '<div class="admin-empty-state"><p>Aucune collection</p><span>Ajoutez votre première collection</span></div>';
    return;
  }

  container.innerHTML = collectionsCache.map(c => `
    <div class="entity-card" data-id="${c.id}">
      <div class="entity-card-body">
        <p class="entity-card-name">${escapeHtml(c.name)}</p>
        <p class="entity-card-detail">${escapeHtml(c.description || 'Aucune description')}</p>
      </div>
      <div class="entity-card-actions">
        <button class="btn-icon" data-action="edit" data-entity="collection" data-id="${c.id}" aria-label="Modifier ${escapeHtml(c.name)}">${ICON_EDIT}</button>
        <button class="btn-icon btn-icon--danger" data-action="delete" data-entity="collection" data-id="${c.id}" aria-label="Supprimer ${escapeHtml(c.name)}">${ICON_DELETE}</button>
      </div>
    </div>
  `).join('');
}

function openCollectionForm(collection = null) {
  const isEdit = !!collection;
  const title = isEdit ? 'Modifier la collection' : 'Nouvelle collection';

  const html = `
    <div class="form-group">
      <label for="field-name" class="form-label">Nom *</label>
      <input type="text" id="field-name" class="form-input" value="${escapeAttr(collection?.name || '')}" required>
    </div>
    <div class="form-group">
      <label for="field-description" class="form-label">Description</label>
      <textarea id="field-description" class="form-textarea">${escapeHtml(collection?.description || '')}</textarea>
    </div>
  `;

  openModal(title, html, async () => {
    const name = document.getElementById('field-name').value.trim();
    const description = document.getElementById('field-description').value.trim();

    if (!name) throw new Error('Le nom est requis');

    const data = { name, description: description || null };

    if (isEdit) {
      await apiUpdate('collections', collection.id, data);
      showToast('Collection modifiée');
    } else {
      await apiInsert('collections', data);
      showToast('Collection ajoutée');
    }

    await loadCollections();
  });
}

async function deleteCollection(id) {
  const item = collectionsCache.find(c => c.id === id);
  openConfirmDelete(`Supprimer la collection « ${item?.name || ''} » ?`, async () => {
    try {
      await apiDelete('collections', id);
      showToast('Collection supprimée');
      await loadCollections();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ============================================================================
// JEWELRY - CRUD UI
// ============================================================================

async function loadJewelry() {
  const container = document.getElementById('jewelry-list');
  container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p class="loading-text">Chargement...</p></div>';

  try {
    jewelryCache = await apiList('jewelry');
    renderJewelry();
  } catch (err) {
    container.innerHTML = `<div class="admin-empty-state"><p>Erreur de chargement</p><span>${err.message}</span></div>`;
  }
}

function getCollectionName(collectionId) {
  const col = collectionsCache.find(c => c.id === collectionId);
  return col ? col.name : '—';
}

function renderJewelry() {
  const container = document.getElementById('jewelry-list');

  if (jewelryCache.length === 0) {
    container.innerHTML = '<div class="admin-empty-state"><p>Aucun bijou</p><span>Ajoutez votre premier bijou</span></div>';
    return;
  }

  container.innerHTML = jewelryCache.map(j => `
    <div class="entity-card" data-id="${j.id}">
      ${j.image_url ? `<img class="entity-card-image" src="${escapeAttr(j.image_url)}" alt="${escapeAttr(j.name)}">` : ''}
      <div class="entity-card-body">
        <p class="entity-card-name">${escapeHtml(j.name)}</p>
        <p class="entity-card-detail">${escapeHtml(j.description || 'Aucune description')}</p>
        <span class="entity-card-badge">${escapeHtml(getCollectionName(j.collection_id))}</span>
      </div>
      <div class="entity-card-actions">
        <button class="btn-icon" data-action="edit" data-entity="jewelry" data-id="${j.id}" aria-label="Modifier ${escapeHtml(j.name)}">${ICON_EDIT}</button>
        <button class="btn-icon btn-icon--danger" data-action="delete" data-entity="jewelry" data-id="${j.id}" aria-label="Supprimer ${escapeHtml(j.name)}">${ICON_DELETE}</button>
      </div>
    </div>
  `).join('');
}

function openJewelryForm(jewelry = null) {
  const isEdit = !!jewelry;
  const title = isEdit ? 'Modifier le bijou' : 'Nouveau bijou';

  const collectionsOptions = collectionsCache.map(c =>
    `<option value="${c.id}" ${jewelry?.collection_id === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
  ).join('');

  const html = `
    <div class="form-group">
      <label for="field-name" class="form-label">Nom *</label>
      <input type="text" id="field-name" class="form-input" value="${escapeAttr(jewelry?.name || '')}" required>
    </div>
    <div class="form-group">
      <label for="field-description" class="form-label">Description</label>
      <textarea id="field-description" class="form-textarea">${escapeHtml(jewelry?.description || '')}</textarea>
    </div>
    <div class="form-group">
      <label for="field-collection" class="form-label">Collection</label>
      <select id="field-collection" class="form-select">
        <option value="">— Aucune —</option>
        ${collectionsOptions}
      </select>
    </div>
    <div class="form-group">
      <label for="field-image" class="form-label">Image</label>
      <input type="file" id="field-image" class="form-file-input" accept="image/jpeg,image/png,image/webp">
      <p class="form-hint">JPG, PNG ou WebP (max 5 Mo)</p>
      ${jewelry?.image_url ? `<img class="image-preview" src="${escapeAttr(jewelry.image_url)}" alt="Aperçu">` : ''}
    </div>
    <div class="form-group">
      <label for="field-image-url" class="form-label">ou URL de l'image</label>
      <input type="url" id="field-image-url" class="form-input" value="${escapeAttr(jewelry?.image_url || '')}" placeholder="https://...">
    </div>
  `;

  openModal(title, html, async () => {
    const name = document.getElementById('field-name').value.trim();
    const description = document.getElementById('field-description').value.trim();
    const collectionId = document.getElementById('field-collection').value || null;
    const fileInput = document.getElementById('field-image');
    let imageUrl = document.getElementById('field-image-url').value.trim();

    if (!name) throw new Error('Le nom est requis');

    // Upload image if file selected
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.size > 5 * 1024 * 1024) throw new Error('L\'image ne doit pas dépasser 5 Mo');
      imageUrl = await uploadImage(file);
    }

    if (!imageUrl && !isEdit) throw new Error('Une image est requise');

    const data = {
      name,
      description: description || null,
      collection_id: collectionId,
    };
    if (imageUrl) data.image_url = imageUrl;

    if (isEdit) {
      await apiUpdate('jewelry', jewelry.id, data);
      showToast('Bijou modifié');
    } else {
      await apiInsert('jewelry', data);
      showToast('Bijou ajouté');
    }

    await loadJewelry();
  });
}

async function deleteJewelry(id) {
  const item = jewelryCache.find(j => j.id === id);
  openConfirmDelete(`Supprimer le bijou « ${item?.name || ''} » ?`, async () => {
    try {
      await apiDelete('jewelry', id);
      showToast('Bijou supprimé');
      await loadJewelry();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ============================================================================
// SALES POINTS - CRUD UI
// ============================================================================

async function loadSalesPoints() {
  const container = document.getElementById('sales-points-list');
  container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p class="loading-text">Chargement...</p></div>';

  try {
    salesPointsCache = await apiList('sales_points');
    renderSalesPoints();
  } catch (err) {
    container.innerHTML = `<div class="admin-empty-state"><p>Erreur de chargement</p><span>${err.message}</span></div>`;
  }
}

function renderSalesPoints() {
  const container = document.getElementById('sales-points-list');

  if (salesPointsCache.length === 0) {
    container.innerHTML = '<div class="admin-empty-state"><p>Aucun point de vente</p><span>Ajoutez votre premier point de vente</span></div>';
    return;
  }

  container.innerHTML = salesPointsCache.map(sp => `
    <div class="entity-card" data-id="${sp.id}">
      <div class="entity-card-body">
        <p class="entity-card-name">${escapeHtml(sp.name)}</p>
        <p class="entity-card-detail">${escapeHtml(sp.address || 'Aucune adresse')}</p>
        <span class="entity-card-badge">${sp.latitude}, ${sp.longitude}</span>
      </div>
      <div class="entity-card-actions">
        <button class="btn-icon" data-action="edit" data-entity="sales_point" data-id="${sp.id}" aria-label="Modifier ${escapeHtml(sp.name)}">${ICON_EDIT}</button>
        <button class="btn-icon btn-icon--danger" data-action="delete" data-entity="sales_point" data-id="${sp.id}" aria-label="Supprimer ${escapeHtml(sp.name)}">${ICON_DELETE}</button>
      </div>
    </div>
  `).join('');
}

function openSalesPointForm(salesPoint = null) {
  const isEdit = !!salesPoint;
  const title = isEdit ? 'Modifier le point de vente' : 'Nouveau point de vente';

  const html = `
    <div class="form-group">
      <label for="field-name" class="form-label">Nom *</label>
      <input type="text" id="field-name" class="form-input" value="${escapeAttr(salesPoint?.name || '')}" required>
    </div>
    <div class="form-group">
      <label for="field-address" class="form-label">Adresse</label>
      <input type="text" id="field-address" class="form-input" value="${escapeAttr(salesPoint?.address || '')}" placeholder="123 rue Example, 75001 Paris">
    </div>
    <div class="form-group">
      <label for="field-latitude" class="form-label">Latitude *</label>
      <input type="number" id="field-latitude" class="form-input" value="${salesPoint?.latitude ?? ''}" step="any" min="-90" max="90" required placeholder="48.8566">
    </div>
    <div class="form-group">
      <label for="field-longitude" class="form-label">Longitude *</label>
      <input type="number" id="field-longitude" class="form-input" value="${salesPoint?.longitude ?? ''}" step="any" min="-180" max="180" required placeholder="2.3522">
    </div>
  `;

  openModal(title, html, async () => {
    const name = document.getElementById('field-name').value.trim();
    const address = document.getElementById('field-address').value.trim();
    const latitude = parseFloat(document.getElementById('field-latitude').value);
    const longitude = parseFloat(document.getElementById('field-longitude').value);

    if (!name) throw new Error('Le nom est requis');
    if (isNaN(latitude) || latitude < -90 || latitude > 90) throw new Error('Latitude invalide (-90 à 90)');
    if (isNaN(longitude) || longitude < -180 || longitude > 180) throw new Error('Longitude invalide (-180 à 180)');

    const data = {
      name,
      address: address || null,
      latitude,
      longitude,
    };

    if (isEdit) {
      await apiUpdate('sales_points', salesPoint.id, data);
      showToast('Point de vente modifié');
    } else {
      await apiInsert('sales_points', data);
      showToast('Point de vente ajouté');
    }

    await loadSalesPoints();
  });
}

async function deleteSalesPoint(id) {
  const item = salesPointsCache.find(sp => sp.id === id);
  openConfirmDelete(`Supprimer le point de vente « ${item?.name || ''} » ?`, async () => {
    try {
      await apiDelete('sales_points', id);
      showToast('Point de vente supprimé');
      await loadSalesPoints();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ============================================================================
// BLOG POSTS - CRUD UI
// ============================================================================

async function loadBlogPosts() {
  const container = document.getElementById('blog-posts-list');
  container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p class="loading-text">Chargement...</p></div>';

  try {
    blogPostsCache = await apiList('blog_posts');
    renderBlogPosts();
  } catch (err) {
    container.innerHTML = `<div class="admin-empty-state"><p>Erreur de chargement</p><span>${err.message}</span></div>`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderBlogPosts() {
  const container = document.getElementById('blog-posts-list');

  if (blogPostsCache.length === 0) {
    container.innerHTML = '<div class="admin-empty-state"><p>Aucun article</p><span>Ajoutez votre premier article</span></div>';
    return;
  }

  container.innerHTML = blogPostsCache.map(p => `
    <div class="entity-card" data-id="${p.id}">
      ${p.image_url ? `<img class="entity-card-image" src="${escapeAttr(p.image_url)}" alt="${escapeAttr(p.image_alt || p.title)}">` : ''}
      <div class="entity-card-body">
        <p class="entity-card-name">${escapeHtml(p.title)}${p.is_featured ? ' <span class="entity-card-badge">Mis en avant</span>' : ''}</p>
        <p class="entity-card-detail">${escapeHtml(p.excerpt || 'Aucun extrait')}</p>
        <span class="entity-card-badge">${escapeHtml(p.category || '—')}</span>
        <span class="entity-card-meta">${formatDate(p.published_at)}</span>
      </div>
      <div class="entity-card-actions">
        <button class="btn-icon" data-action="edit" data-entity="blog_post" data-id="${p.id}" aria-label="Modifier ${escapeHtml(p.title)}">${ICON_EDIT}</button>
        <button class="btn-icon btn-icon--danger" data-action="delete" data-entity="blog_post" data-id="${p.id}" aria-label="Supprimer ${escapeHtml(p.title)}">${ICON_DELETE}</button>
      </div>
    </div>
  `).join('');
}

function openBlogPostForm(post = null) {
  const isEdit = !!post;
  const title = isEdit ? 'Modifier l\'article' : 'Nouvel article';

  const publishedValue = post?.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '';

  const html = `
    <div class="form-group">
      <label for="field-title" class="form-label">Titre *</label>
      <input type="text" id="field-title" class="form-input" value="${escapeAttr(post?.title || '')}" required>
    </div>
    <div class="form-group">
      <label for="field-category" class="form-label">Catégorie</label>
      <input type="text" id="field-category" class="form-input" value="${escapeAttr(post?.category || '')}" placeholder="Savoir-faire, Matériaux, Coulisses, Inspiration, Conseils">
    </div>
    <div class="form-group">
      <label for="field-excerpt" class="form-label">Extrait</label>
      <textarea id="field-excerpt" class="form-textarea" rows="3">${escapeHtml(post?.excerpt || '')}</textarea>
    </div>
    <div class="form-group">
      <label for="field-content" class="form-label">Contenu</label>
      <textarea id="field-content" class="form-textarea" rows="8">${escapeHtml(post?.content || '')}</textarea>
    </div>
    <div class="form-group">
      <label for="field-image" class="form-label">Image de couverture</label>
      <input type="file" id="field-image" class="form-file-input" accept="image/jpeg,image/png,image/webp">
      <p class="form-hint">JPG, PNG ou WebP (max 5 Mo)</p>
      ${post?.image_url ? `<img class="image-preview" src="${escapeAttr(post.image_url)}" alt="Aperçu">` : ''}
    </div>
    <div class="form-group">
      <label for="field-image-url" class="form-label">ou URL de l'image</label>
      <input type="url" id="field-image-url" class="form-input" value="${escapeAttr(post?.image_url || '')}" placeholder="https://...">
    </div>
    <div class="form-group">
      <label for="field-image-alt" class="form-label">Texte alternatif de l'image</label>
      <input type="text" id="field-image-alt" class="form-input" value="${escapeAttr(post?.image_alt || '')}" placeholder="Description de l'image">
    </div>
    <div class="form-group">
      <label for="field-published-at" class="form-label">Date de publication</label>
      <input type="datetime-local" id="field-published-at" class="form-input" value="${publishedValue}">
    </div>
    <div class="form-group form-group--checkbox">
      <label class="form-label">
        <input type="checkbox" id="field-featured" ${post?.is_featured ? 'checked' : ''}>
        Mettre en avant
      </label>
    </div>
  `;

  openModal(title, html, async () => {
    const postTitle = document.getElementById('field-title').value.trim();
    const category = document.getElementById('field-category').value.trim();
    const excerpt = document.getElementById('field-excerpt').value.trim();
    const content = document.getElementById('field-content').value.trim();
    const imageAlt = document.getElementById('field-image-alt').value.trim();
    const publishedAt = document.getElementById('field-published-at').value || null;
    const isFeatured = document.getElementById('field-featured').checked;
    const fileInput = document.getElementById('field-image');
    let imageUrl = document.getElementById('field-image-url').value.trim();

    if (!postTitle) throw new Error('Le titre est requis');

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.size > 5 * 1024 * 1024) throw new Error('L\'image ne doit pas dépasser 5 Mo');
      imageUrl = await uploadImage(file);
    }

    const data = {
      title: postTitle,
      category: category || null,
      excerpt: excerpt || null,
      content: content || null,
      image_alt: imageAlt || null,
      is_featured: isFeatured,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    };
    if (imageUrl) data.image_url = imageUrl;

    if (isEdit) {
      await apiUpdate('blog_posts', post.id, data);
      showToast('Article modifié');
    } else {
      await apiInsert('blog_posts', data);
      showToast('Article ajouté');
    }

    await loadBlogPosts();
  });
}

async function deleteBlogPost(id) {
  const item = blogPostsCache.find(p => p.id === id);
  openConfirmDelete(`Supprimer l'article « ${item?.title || ''} » ?`, async () => {
    try {
      await apiDelete('blog_posts', id);
      showToast('Article supprimé');
      await loadBlogPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ============================================================================
// CONTENT EDITOR (site_content)
// ============================================================================

async function loadContent(page) {
  currentContentPage = page;
  const container = document.getElementById('content-editor');
  container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p class="loading-text">Chargement...</p></div>';

  // Update page selector buttons
  document.querySelectorAll('.content-page-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.contentPage === page);
  });

  try {
    const rows = await apiFetch(`/site_content?page=eq.${page}&select=*&order=sort_order`);
    renderContentEditor(rows);
  } catch (err) {
    container.innerHTML = `<div class="admin-empty-state"><p>Erreur de chargement</p><span>${err.message}</span></div>`;
  }
}

function renderContentEditor(rows) {
  const container = document.getElementById('content-editor');
  if (!rows.length) {
    container.innerHTML = '<div class="admin-empty-state"><p>Aucun contenu éditable</p><span>Exécutez la migration 11_create_cms_tables.sql</span></div>';
    return;
  }

  // Group by section
  const sections = new Map();
  for (const row of rows) {
    if (!sections.has(row.section)) sections.set(row.section, []);
    sections.get(row.section).push(row);
  }

  let html = '<form id="content-form" class="content-form">';
  for (const [section, fields] of sections) {
    const sectionLabel = SECTION_LABELS[section] || section;
    html += `<fieldset class="content-section"><legend class="content-section-title">${escapeHtml(sectionLabel)}</legend>`;
    for (const field of fields) {
      const inputId = `content-${field.id}`;
      html += `<div class="form-group">`;
      html += `<label for="${inputId}" class="form-label">${escapeHtml(field.label)}</label>`;
      if (field.content_type === 'textarea') {
        html += `<textarea id="${inputId}" class="form-textarea" rows="4" data-content-id="${field.id}">${escapeHtml(field.value || '')}</textarea>`;
      } else if (field.content_type === 'list') {
        html += `<textarea id="${inputId}" class="form-textarea" rows="4" data-content-id="${field.id}" data-content-type="list">${escapeHtml(formatListForEdit(field.value))}</textarea>`;
        html += `<p class="form-hint">Un élément par ligne</p>`;
      } else if (field.content_type === 'image') {
        html += `<input type="text" id="${inputId}" class="form-input" data-content-id="${field.id}" value="${escapeAttr(field.value || '')}" placeholder="https://...">`;
      } else {
        html += `<input type="text" id="${inputId}" class="form-input" data-content-id="${field.id}" value="${escapeAttr(field.value || '')}">`;
      }
      html += `</div>`;
    }
    html += `</fieldset>`;
  }
  html += `<div class="content-form-actions"><button type="submit" class="btn btn-primary">Sauvegarder les modifications</button></div>`;
  html += '</form>';
  container.innerHTML = html;

  document.getElementById('content-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveContent();
  });
}

function formatListForEdit(jsonStr) {
  try {
    const items = JSON.parse(jsonStr);
    return Array.isArray(items) ? items.join('\n') : jsonStr;
  } catch { return jsonStr || ''; }
}

function formatListForSave(text) {
  const items = text.split('\n').map(l => l.trim()).filter(Boolean);
  return JSON.stringify(items);
}

async function saveContent() {
  const fields = document.querySelectorAll('[data-content-id]');
  const btn = document.querySelector('.content-form-actions .btn');
  btn.disabled = true;
  btn.textContent = 'Enregistrement...';

  try {
    for (const field of fields) {
      const id = field.dataset.contentId;
      let value = field.value;
      if (field.dataset.contentType === 'list') {
        value = formatListForSave(value);
      }
      await apiFetch(`/site_content?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ value, updated_at: new Date().toISOString() }),
      });
    }
    showToast('Contenu sauvegardé');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sauvegarder les modifications';
  }
}

// ============================================================================
// PAGES - CRUD UI
// ============================================================================

async function loadPages() {
  const container = document.getElementById('pages-list');
  container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p class="loading-text">Chargement...</p></div>';

  try {
    pagesCache = await apiFetch('/pages?select=*&order=created_at.desc');
    renderPages();
  } catch (err) {
    container.innerHTML = `<div class="admin-empty-state"><p>Erreur de chargement</p><span>${err.message}</span></div>`;
  }
}

function renderPages() {
  const container = document.getElementById('pages-list');

  if (pagesCache.length === 0) {
    container.innerHTML = '<div class="admin-empty-state"><p>Aucune page</p><span>Créez votre première page dynamique</span></div>';
    return;
  }

  container.innerHTML = pagesCache.map(p => `
    <div class="entity-card" data-id="${p.id}">
      <div class="entity-card-body">
        <p class="entity-card-name">${escapeHtml(p.title)} <span class="entity-card-badge">${p.is_published ? 'Publié' : 'Brouillon'}</span></p>
        <p class="entity-card-detail">/${escapeHtml(p.slug)}</p>
      </div>
      <div class="entity-card-actions">
        <button class="btn btn-secondary btn-sm" data-action="edit-blocks" data-entity="page" data-id="${p.id}">Blocs</button>
        <button class="btn-icon" data-action="edit" data-entity="page" data-id="${p.id}" aria-label="Modifier">${ICON_EDIT}</button>
        <button class="btn-icon btn-icon--danger" data-action="delete" data-entity="page" data-id="${p.id}" aria-label="Supprimer">${ICON_DELETE}</button>
      </div>
    </div>
  `).join('');
}

function openPageForm(page = null) {
  const isEdit = !!page;
  const title = isEdit ? 'Modifier la page' : 'Nouvelle page';

  const html = `
    <div class="form-group">
      <label for="field-title" class="form-label">Titre *</label>
      <input type="text" id="field-title" class="form-input" value="${escapeAttr(page?.title || '')}" required>
    </div>
    <div class="form-group">
      <label for="field-slug" class="form-label">Slug (URL) *</label>
      <input type="text" id="field-slug" class="form-input" value="${escapeAttr(page?.slug || '')}" required placeholder="ma-page">
      <p class="form-hint">Accessible via /page.html?slug=ma-page</p>
    </div>
    <div class="form-group">
      <label for="field-meta" class="form-label">Meta description</label>
      <textarea id="field-meta" class="form-textarea" rows="2">${escapeHtml(page?.meta_description || '')}</textarea>
    </div>
    <div class="form-group form-group--checkbox">
      <label class="form-label">
        <input type="checkbox" id="field-published" ${page?.is_published ? 'checked' : ''}>
        Publier
      </label>
    </div>
  `;

  openModal(title, html, async () => {
    const pageTitle = document.getElementById('field-title').value.trim();
    const slug = document.getElementById('field-slug').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const metaDescription = document.getElementById('field-meta').value.trim();
    const isPublished = document.getElementById('field-published').checked;

    if (!pageTitle) throw new Error('Le titre est requis');
    if (!slug) throw new Error('Le slug est requis');

    const data = {
      title: pageTitle,
      slug,
      meta_description: metaDescription || null,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    };

    if (isEdit) {
      await apiUpdate('pages', page.id, data);
      showToast('Page modifiée');
    } else {
      await apiInsert('pages', data);
      showToast('Page créée');
    }

    await loadPages();
  });
}

async function deletePage(id) {
  const item = pagesCache.find(p => p.id === id);
  openConfirmDelete(`Supprimer la page « ${item?.title || ''} » et tous ses blocs ?`, async () => {
    try {
      await apiDelete('pages', id);
      showToast('Page supprimée');
      await loadPages();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ============================================================================
// BLOCK EDITOR
// ============================================================================

async function openBlockEditor(pageId) {
  const page = pagesCache.find(p => p.id === pageId);
  if (!page) return;

  try {
    const blocks = await apiFetch(`/page_blocks?page_id=eq.${pageId}&select=*&order=sort_order`);
    renderBlockEditorModal(page, blocks);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderBlockEditorModal(page, blocks) {
  let blocksHtml = blocks.map((b, i) => {
    const typeLabel = BLOCK_TYPES[b.block_type] || b.block_type;
    const blockTitle = b.data?.title || b.data?.text?.substring(0, 40) || '(sans titre)';
    return `
      <div class="block-item" data-block-id="${b.id}">
        <span class="block-item-type">${escapeHtml(typeLabel)}</span>
        <span class="block-item-title">${escapeHtml(blockTitle)}</span>
        <div class="block-item-actions">
          ${i > 0 ? `<button type="button" class="btn-icon btn-icon--sm" data-block-action="up" data-block-id="${b.id}">&#9650;</button>` : ''}
          ${i < blocks.length - 1 ? `<button type="button" class="btn-icon btn-icon--sm" data-block-action="down" data-block-id="${b.id}">&#9660;</button>` : ''}
          <button type="button" class="btn-icon btn-icon--sm" data-block-action="edit" data-block-id="${b.id}">${ICON_EDIT}</button>
          <button type="button" class="btn-icon btn-icon--sm btn-icon--danger" data-block-action="delete" data-block-id="${b.id}">${ICON_DELETE}</button>
        </div>
      </div>`;
  }).join('');

  if (!blocks.length) {
    blocksHtml = '<p class="form-hint" style="text-align:center;padding:1rem;">Aucun bloc. Ajoutez-en un ci-dessous.</p>';
  }

  const blockTypeOptions = Object.entries(BLOCK_TYPES).map(
    ([val, label]) => `<option value="${val}">${label}</option>`
  ).join('');

  const html = `
    <p class="form-hint">Page : <strong>${escapeHtml(page.title)}</strong> (/${escapeHtml(page.slug)})</p>
    <div class="blocks-list">${blocksHtml}</div>
    <div class="block-add-row">
      <select id="new-block-type" class="form-select">${blockTypeOptions}</select>
      <button type="button" id="add-block-btn" class="btn btn-secondary btn-sm">Ajouter un bloc</button>
    </div>
  `;

  openModal(`Blocs — ${page.title}`, html, async () => { closeModal(); });

  // Hide submit button, use custom interactions
  document.getElementById('modal-submit').style.display = 'none';
  document.getElementById('modal-cancel').textContent = 'Fermer';

  // Block actions
  const modalBody = document.getElementById('modal-body');
  modalBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-block-action]');
    if (!btn) return;
    const action = btn.dataset.blockAction;
    const blockId = btn.dataset.blockId;

    if (action === 'delete') {
      await apiFetch(`/page_blocks?id=eq.${blockId}`, { method: 'DELETE' });
      showToast('Bloc supprimé');
      closeModal();
      openBlockEditor(page.id);
    } else if (action === 'up' || action === 'down') {
      await moveBlock(page.id, blocks, blockId, action === 'up' ? -1 : 1);
      closeModal();
      openBlockEditor(page.id);
    } else if (action === 'edit') {
      closeModal();
      const block = blocks.find(b => b.id === blockId);
      if (block) openBlockForm(page.id, block);
    }
  });

  // Add block
  document.getElementById('add-block-btn').addEventListener('click', () => {
    const type = document.getElementById('new-block-type').value;
    closeModal();
    openBlockForm(page.id, { block_type: type, data: {}, sort_order: blocks.length });
  });
}

async function moveBlock(pageId, blocks, blockId, direction) {
  const idx = blocks.findIndex(b => b.id === blockId);
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= blocks.length) return;

  await apiFetch(`/page_blocks?id=eq.${blocks[idx].id}`, {
    method: 'PATCH',
    body: JSON.stringify({ sort_order: blocks[swapIdx].sort_order }),
  });
  await apiFetch(`/page_blocks?id=eq.${blocks[swapIdx].id}`, {
    method: 'PATCH',
    body: JSON.stringify({ sort_order: blocks[idx].sort_order }),
  });
}

function openBlockForm(pageId, block) {
  const isEdit = !!block.id;
  const title = isEdit ? 'Modifier le bloc' : 'Nouveau bloc';
  const d = block.data || {};

  let fieldsHtml = '';
  switch (block.block_type) {
    case 'hero':
      fieldsHtml = `
        ${fieldInput('Titre', 'block-title', d.title)}
        ${fieldInput('Sous-titre', 'block-subtitle', d.subtitle)}
        ${fieldInput('Image URL', 'block-image', d.image_url)}
        ${fieldInput('Alt image', 'block-image-alt', d.image_alt)}
        ${fieldInput('Texte du bouton', 'block-cta-text', d.cta_text)}
        ${fieldInput('Lien du bouton', 'block-cta-url', d.cta_url)}`;
      break;
    case 'text':
      fieldsHtml = `
        ${fieldInput('Titre', 'block-title', d.title)}
        ${fieldTextarea('Contenu', 'block-content', d.content)}`;
      break;
    case 'image_text':
      fieldsHtml = `
        ${fieldInput('Titre', 'block-title', d.title)}
        ${fieldTextarea('Contenu', 'block-content', d.content)}
        ${fieldInput('Image URL', 'block-image', d.image_url)}
        ${fieldInput('Alt image', 'block-image-alt', d.image_alt)}
        <div class="form-group">
          <label class="form-label">Position de l'image</label>
          <select id="block-image-pos" class="form-select">
            <option value="left" ${d.image_position !== 'right' ? 'selected' : ''}>Gauche</option>
            <option value="right" ${d.image_position === 'right' ? 'selected' : ''}>Droite</option>
          </select>
        </div>`;
      break;
    case 'gallery':
      fieldsHtml = `
        ${fieldInput('Titre', 'block-title', d.title)}
        ${fieldTextarea('Images (une URL par ligne)', 'block-images', (d.images || []).map(i => i.url || i).join('\n'))}`;
      break;
    case 'cta':
      fieldsHtml = `
        ${fieldInput('Titre', 'block-title', d.title)}
        ${fieldTextarea('Texte', 'block-content', d.text)}
        ${fieldInput('Texte du bouton', 'block-cta-text', d.button_text)}
        ${fieldInput('Lien du bouton', 'block-cta-url', d.button_url)}`;
      break;
  }

  const html = `<p class="form-hint">Type : <strong>${BLOCK_TYPES[block.block_type]}</strong></p>${fieldsHtml}`;

  openModal(title, html, async () => {
    const data = buildBlockData(block.block_type);

    if (isEdit) {
      await apiFetch(`/page_blocks?id=eq.${block.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ data }),
      });
      showToast('Bloc modifié');
    } else {
      await apiFetch('/page_blocks', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({ page_id: pageId, block_type: block.block_type, data, sort_order: block.sort_order }),
      });
      showToast('Bloc ajouté');
    }

    closeModal();
    openBlockEditor(pageId);
  });
}

function fieldInput(label, id, value) {
  return `<div class="form-group"><label for="${id}" class="form-label">${label}</label><input type="text" id="${id}" class="form-input" value="${escapeAttr(value || '')}"></div>`;
}

function fieldTextarea(label, id, value) {
  return `<div class="form-group"><label for="${id}" class="form-label">${label}</label><textarea id="${id}" class="form-textarea" rows="4">${escapeHtml(value || '')}</textarea></div>`;
}

function buildBlockData(type) {
  const val = (id) => document.getElementById(id)?.value?.trim() || '';
  switch (type) {
    case 'hero':
      return { title: val('block-title'), subtitle: val('block-subtitle'), image_url: val('block-image'), image_alt: val('block-image-alt'), cta_text: val('block-cta-text'), cta_url: val('block-cta-url') };
    case 'text':
      return { title: val('block-title'), content: val('block-content') };
    case 'image_text':
      return { title: val('block-title'), content: val('block-content'), image_url: val('block-image'), image_alt: val('block-image-alt'), image_position: val('block-image-pos') || 'left' };
    case 'gallery':
      return { title: val('block-title'), images: val('block-images').split('\n').filter(Boolean).map(url => ({ url: url.trim(), alt: '' })) };
    case 'cta':
      return { title: val('block-title'), text: val('block-content'), button_text: val('block-cta-text'), button_url: val('block-cta-url') };
    default:
      return {};
  }
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadAllData() {
  await loadCollections();
  await loadJewelry();
  await loadSalesPoints();
  await loadBlogPosts();
  loadContent('home');
  loadPages();
}

// ============================================================================
// UTILITIES
// ============================================================================

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================================
// EVENT DELEGATION
// ============================================================================

function initEventListeners() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    errorEl.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'Connexion...';

    try {
      await signIn(email, password);
      showDashboard();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Se connecter';
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', signOut);

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Confirm close
  document.getElementById('confirm-close').addEventListener('click', closeConfirm);
  document.getElementById('confirm-cancel').addEventListener('click', closeConfirm);
  document.getElementById('confirm-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeConfirm();
  });
  document.getElementById('confirm-delete').addEventListener('click', async () => {
    const btn = document.getElementById('confirm-delete');
    btn.disabled = true;
    btn.textContent = 'Suppression...';
    try {
      if (pendingDeleteAction) await pendingDeleteAction();
    } finally {
      btn.disabled = false;
      btn.textContent = 'Supprimer';
      closeConfirm();
    }
  });

  // Keyboard: Escape to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!document.getElementById('confirm-overlay').classList.contains('hidden')) {
        closeConfirm();
      } else if (!document.getElementById('modal-overlay').classList.contains('hidden')) {
        closeModal();
      }
    }
  });

  // Add buttons (tab headers)
  document.querySelectorAll('[data-action="add"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const entity = btn.dataset.entity;
      if (entity === 'collection') openCollectionForm();
      else if (entity === 'jewelry') openJewelryForm();
      else if (entity === 'sales_point') openSalesPointForm();
      else if (entity === 'blog_post') openBlogPostForm();
      else if (entity === 'page') openPageForm();
    });
  });

  // Content page selector
  document.querySelectorAll('.content-page-btn').forEach(btn => {
    btn.addEventListener('click', () => loadContent(btn.dataset.contentPage));
  });

  // Event delegation for edit/delete buttons in entity lists
  document.querySelector('.admin-main').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const { action, entity, id } = btn.dataset;

    if (action === 'edit') {
      if (entity === 'collection') {
        const item = collectionsCache.find(c => c.id === id);
        if (item) openCollectionForm(item);
      } else if (entity === 'jewelry') {
        const item = jewelryCache.find(j => j.id === id);
        if (item) openJewelryForm(item);
      } else if (entity === 'sales_point') {
        const item = salesPointsCache.find(sp => sp.id === id);
        if (item) openSalesPointForm(item);
      } else if (entity === 'blog_post') {
        const item = blogPostsCache.find(p => p.id === id);
        if (item) openBlogPostForm(item);
      } else if (entity === 'page') {
        const item = pagesCache.find(p => p.id === id);
        if (item) openPageForm(item);
      }
    } else if (action === 'edit-blocks') {
      if (entity === 'page') openBlockEditor(id);
    } else if (action === 'delete') {
      if (entity === 'collection') deleteCollection(id);
      else if (entity === 'jewelry') deleteJewelry(id);
      else if (entity === 'sales_point') deleteSalesPoint(id);
      else if (entity === 'blog_post') deleteBlogPost(id);
      else if (entity === 'page') deletePage(id);
    }
  });
}

// ============================================================================
// INIT
// ============================================================================

function init() {
  initTabs();
  initEventListeners();

  // Check for existing session
  const session = getSession();
  if (session?.access_token) {
    showDashboard();
  } else {
    showLogin();
  }
}

document.addEventListener('DOMContentLoaded', init);
