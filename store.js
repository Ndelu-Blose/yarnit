/** Shared Yarn It! store — localStorage demo or Supabase when configured. */
const YI_KEYS = {
  products: 'yi_products',
  photos: 'yi_photos',
  wa: 'yi_wa',
  user: 'yi_user',
  pass: 'yi_pass',
};

const YI_CATEGORIES = ['bags', 'tops', 'hats', 'winter', 'custom'];

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Pink Crochet Chain Bag', price: 250, cat: 'bags', colours: 'Pink, Green, Yellow, Denim', badge: 'Best Seller', img: 'category-bags.jpg' },
  { id: 2, name: 'Rose Crochet Handbag', price: 350, cat: 'bags', colours: 'Taupe, Cream', badge: 'New In', img: 'product-rose-handbag.jpg' },
  { id: 3, name: 'Chunky Mini Crochet Bag', price: 220, cat: 'bags', colours: 'Forest Green, Butter Yellow, Denim', badge: '', img: 'category-bags.jpg' },
  { id: 4, name: 'Blue Flower Crochet Top', price: 180, cat: 'tops', colours: 'Royal Blue, Magenta, Natural', badge: 'Fan Favourite', img: 'category-tops.jpg' },
  { id: 5, name: 'Cowrie Shell Crochet Top', price: 200, cat: 'tops', colours: 'Natural, Shell accent', badge: '', img: 'category-tops.jpg' },
  { id: 6, name: 'Crochet Bucket Hat', price: 160, cat: 'hats', colours: 'Tan, Black, Lavender, Blue, Pink, Cream', badge: '6 Colours', img: 'category-hats.jpg' },
  { id: 7, name: 'Pearl Pin Beanie', price: 140, cat: 'winter', colours: 'Yellow, Sky Blue, Green, Chocolate', badge: '4 Colours', img: 'category-winter.jpg' },
];

const DEFAULT_IMG_BY_ID = Object.fromEntries(DEFAULT_PRODUCTS.map((p) => [p.id, p.img]));

function applyDefaultProductImages(products) {
  if (!Array.isArray(products)) return products;
  return products.map((p) => {
    if (hasValidImage(p.img)) return p;
    const fallback = DEFAULT_IMG_BY_ID[p.id];
    return fallback ? { ...p, img: fallback } : p;
  });
}

/** Returns true when a product has a usable image source */
function hasValidImage(src) {
  if (src == null) return false;
  const s = String(src).trim();
  return s.length > 0;
}

/** Resolve image path: supports data URLs, absolute, or assets/images/ filenames */
function resolveImageSrc(img) {
  if (!hasValidImage(img)) return null;
  const s = String(img).trim();
  if (s.startsWith('data:') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) {
    return s;
  }
  const base = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG.assets.imageBase : 'assets/images/';
  return base + s.replace(/^\.?\//, '');
}

/** Polished placeholder markup (no broken img icon) */
function imagePlaceholderHTML(alt, hidden) {
  const label = escapeHtml(alt || 'Yarn It! piece');
  const hide = hidden ? ' hidden' : '';
  return (
    '<div class="img-placeholder"' +
    hide +
    ' role="img" aria-label="' +
    label +
    '">' +
    '<span class="img-placeholder-stitch" aria-hidden="true"></span>' +
    '<span class="img-placeholder-text">Product image pending</span>' +
    '</div>'
  );
}

/** Image frame: img with CSS placeholder fallback (no broken icon) */
function renderMediaFrame(src, alt, extraClass) {
  const resolved = resolveImageSrc(src);
  const cls = 'media-frame' + (extraClass ? ' ' + extraClass : '');
  if (!resolved) {
    return '<div class="' + cls + '">' + imagePlaceholderHTML(alt) + '</div>';
  }
  const safeAlt = escapeHtml(alt || '');
  const safeSrc = resolved.replace(/"/g, '&quot;');
  return (
    '<div class="' +
    cls +
    '">' +
    '<img src="' +
    safeSrc +
    '" alt="' +
    safeAlt +
    '" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">' +
    imagePlaceholderHTML(alt, true) +
    '</div>'
  );
}

/**
 * Floating product visual — image overlaps card (soft boutique 3D).
 * UPDATE: product images via admin or assets/images/ (see config.js).
 */
function renderFloatingVisual(src, alt, extraClass) {
  const resolved = resolveImageSrc(src);
  const visualCls = 'floating-product-visual' + (extraClass ? ' ' + extraClass : '');
  const safeAlt = escapeHtml(alt || 'Yarn It! piece');

  if (!resolved) {
    return (
      '<div class="' +
      visualCls +
      '"><div class="floating-photo-well">' +
      imagePlaceholderHTML(alt) +
      '</div></div>'
    );
  }

  const safeSrc = resolved.replace(/"/g, '&quot;');
  return (
    '<div class="' +
    visualCls +
    '"><div class="floating-photo-well">' +
    '<img class="floating-product-image" src="' +
    safeSrc +
    '" alt="' +
    safeAlt +
    '" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">' +
    imagePlaceholderHTML(alt, true) +
    '</div></div>'
  );
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

let _productsCache = null;
let _useSupabase = false;

function isSupabaseMode() {
  return _useSupabase && typeof window.yarnitSupabase !== 'undefined' && window.yarnitSupabase.isConfigured();
}

function setProductsCache(products) {
  _productsCache = Array.isArray(products) ? products.map((p) => ({ ...p })) : [];
}

function ensureProductsSeed() {
  if (isSupabaseMode()) return;
  if (storageGet(YI_KEYS.products) == null) {
    storageSet(YI_KEYS.products, JSON.stringify(DEFAULT_PRODUCTS));
  }
}

function getProducts() {
  if (_productsCache) return applyDefaultProductImages(_productsCache.map((p) => ({ ...p })));
  try {
    const raw = storageGet(YI_KEYS.products);
    if (raw == null) return DEFAULT_PRODUCTS.map((p) => ({ ...p }));
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : DEFAULT_PRODUCTS.map((p) => ({ ...p }));
    return applyDefaultProductImages(list);
  } catch (e) {
    return DEFAULT_PRODUCTS.map((p) => ({ ...p }));
  }
}

function saveProducts(products) {
  setProductsCache(products);
  if (isSupabaseMode()) return true;
  return storageSet(YI_KEYS.products, JSON.stringify(products));
}

function isSupabaseConfigured() {
  return typeof window.yarnitSupabase !== 'undefined' && window.yarnitSupabase.isConfigured();
}

async function hydrateFromSupabase() {
  if (!isSupabaseConfigured() || typeof window.yarnitSupabaseData === 'undefined') {
    return false;
  }
  try {
    const products = await window.yarnitSupabaseData.fetchProducts();
    const list = products.length ? products : DEFAULT_PRODUCTS.map((p) => ({ ...p }));
    setProductsCache(applyDefaultProductImages(list));
    const settings = await window.yarnitSupabaseData.fetchSettings();
    if (settings?.whatsapp_number) setWA(settings.whatsapp_number);
    if (settings && typeof SITE_CONFIG !== 'undefined') {
      if (settings.instagram_url) SITE_CONFIG.social.instagram = settings.instagram_url;
      if (settings.tiktok_url) SITE_CONFIG.social.tiktok = settings.tiktok_url;
      if (settings.facebook_url) SITE_CONFIG.social.facebook = settings.facebook_url;
    }
    _useSupabase = true;
    return true;
  } catch (e) {
    if (window.yarnitSupabaseData.isMissingSchemaError(e)) {
      window.yarnitSupabaseData.logMissingSchema('shop');
    } else {
      console.warn('[Yarn It! shop] Supabase load failed, using localStorage demo:', e);
    }
    return false;
  }
}

/** After admin signs in with Supabase Auth (single admin user, not customers). */
async function hydrateAdminFromSupabase() {
  if (!isSupabaseConfigured()) return false;
  const session = await window.yarnitSupabase.getSession();
  if (!session) return false;
  try {
    const products = await window.yarnitSupabaseData.fetchAllProductsAdmin();
    setProductsCache(products);
    const settings = await window.yarnitSupabaseData.fetchSettings();
    if (settings?.whatsapp_number) setWA(settings.whatsapp_number);
    _useSupabase = true;
    return true;
  } catch (e) {
    if (window.yarnitSupabaseData.isMissingSchemaError(e)) {
      window.yarnitSupabaseData.logMissingSchema('admin');
    } else {
      console.warn('[Yarn It! admin] Could not load from Supabase:', e);
    }
    return false;
  }
}

async function persistProductToSupabase(product) {
  if (!isSupabaseMode()) return product;
  const saved = await window.yarnitSupabaseData.saveProduct(product);
  const ps = getProducts();
  const idx = ps.findIndex((x) => x.id == product.id);
  if (idx > -1) ps[idx] = saved;
  else ps.push(saved);
  setProductsCache(ps);
  return saved;
}

async function removeProductFromSupabase(id) {
  if (!isSupabaseMode()) return;
  await window.yarnitSupabaseData.deleteProductById(id);
  setProductsCache(getProducts().filter((x) => x.id != id));
}

async function persistSettingsToSupabase(partial) {
  if (!isSupabaseMode()) return;
  await window.yarnitSupabaseData.saveSettings(partial);
}

function getPhotos() {
  try {
    const raw = storageGet(YI_KEYS.photos);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function savePhotos(photos) {
  return storageSet(YI_KEYS.photos, JSON.stringify(photos));
}

function getWA() {
  const raw = storageGet(YI_KEYS.wa) || '27000000000';
  return String(raw).replace(/\D/g, '') || '27000000000';
}

function setWA(number) {
  const digits = String(number).replace(/\D/g, '');
  return storageSet(YI_KEYS.wa, digits);
}

function waUrl(message) {
  return 'https://wa.me/' + getWA() + '?text=' + encodeURIComponent(message);
}

function formatWaDisplay(num) {
  const d = String(num).replace(/\D/g, '');
  if (d.startsWith('27') && d.length >= 11) {
    return '+27 ' + d.slice(2, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7);
  }
  return '+' + d;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function validateProduct(data) {
  const errors = {};
  const name = (data.name || '').trim();
  if (name.length < 2) errors.name = 'Enter a product name (at least 2 characters).';
  const price = Number(data.price);
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Enter a valid price greater than 0.';
  if (price > 999999) errors.price = 'Price is too large.';
  if (!YI_CATEGORIES.includes(data.cat)) errors.cat = 'Choose a valid category.';
  return { ok: Object.keys(errors).length === 0, errors };
}

function validateWhatsApp(number) {
  const digits = String(number).replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    return { ok: false, message: 'Enter a valid WhatsApp number with country code (10–15 digits, e.g. 27731234567).' };
  }
  return { ok: true, digits };
}

function validateImageFile(file) {
  if (!file) return { ok: false, message: 'No file selected.' };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, message: 'Use a JPG, PNG, WebP, or GIF image.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: 'Image must be 2 MB or smaller.' };
  }
  return { ok: true };
}

function readImageFile(file, onSuccess, onError) {
  const check = validateImageFile(file);
  if (!check.ok) {
    onError(check.message);
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => onSuccess(ev.target.result);
  reader.onerror = () => onError('Could not read that image. Try another file.');
  reader.readAsDataURL(file);
}

function colourLabel(str) {
  return (str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' · ');
}

function catLabel(c) {
  return { bags: 'Bags', tops: 'Tops', hats: 'Hats', winter: 'Winter Wear', custom: 'Custom' }[c] || c;
}
