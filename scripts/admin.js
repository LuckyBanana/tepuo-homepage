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
let pendingDeleteAction = null;

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
// DATA LOADING
// ============================================================================

async function loadAllData() {
  await loadCollections();
  // Load jewelry after collections so we can show collection names
  await loadJewelry();
  await loadSalesPoints();
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
    });
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
      }
    } else if (action === 'delete') {
      if (entity === 'collection') deleteCollection(id);
      else if (entity === 'jewelry') deleteJewelry(id);
      else if (entity === 'sales_point') deleteSalesPoint(id);
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
