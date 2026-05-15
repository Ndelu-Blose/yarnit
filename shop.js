/* Storefront — Yarn It! boutique catalogue
   Floating card products: edit FLOATING_PRODUCT_KEYS below.
   Social links: config.js */

const WA_SVG =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

const CATEGORIES = [
  { id: 'bags', title: 'Crochet Bags', desc: 'Chunky minis, rose handbags, and chain-strap styles' },
  { id: 'tops', title: 'Crochet Tops', desc: 'Bikini tops, florals, shells, and beaded details' },
  { id: 'hats', title: 'Bucket Hats', desc: 'Open-weave buckets in six seasonal colours' },
  { id: 'winter', title: 'Winter Wear', desc: 'Pearl-pin beanies in four classic shades' },
  { id: 'custom', title: 'Custom Orders', desc: 'Your colour, your design, made for you' },
];

/** Reserved for future cut-out product PNGs (single item on transparent background). */
const FLOATING_PRODUCT_KEYS = [];

const CAT_LINE_ICONS = {
  bags:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8V6a4 4 0 018 0v2"/><path d="M4 8h16l-1.2 12H5.2L4 8z"/></svg>',
  tops:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4l-2 6h12l-2-6"/><path d="M6 10v10h12V10"/></svg>',
  hats:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14c0-4 3.6-7 8-7s8 3 8 7"/><path d="M3 14h18v2H3z"/></svg>',
  winter:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4"/></svg>',
  custom:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"/><path d="M5 19h14"/></svg>',
};

let currentFilter = 'all';

function productImageBasename(p) {
  const img = p && p.img ? String(p.img).trim() : '';
  if (!img) return '';
  return img.replace(/^.*\//, '');
}

/** Flat-lay / shared category photos — catalogue frame, not 3D float */
function usesCataloguePhoto(p) {
  const base = productImageBasename(p);
  if (!base) return true;
  if (base.indexOf('category-') === 0) return true;
  const products = getProducts();
  return products.filter((x) => productImageBasename(x) === base).length > 1;
}

function isFloatingProduct(p) {
  if (usesCataloguePhoto(p)) return false;
  const n = (p.name || '').toLowerCase();
  return FLOATING_PRODUCT_KEYS.indexOf(n) !== -1;
}

function pickHeroProduct(list) {
  const chunky = list.find((p) => (p.name || '').toLowerCase() === 'chunky mini crochet bag');
  if (chunky) return chunky;
  const bag = list.find((p) => p.cat === 'bags' && hasValidImage(p.img));
  return bag || list[0];
}

/** Hero card copy — flat-lay photos show a range, not one SKU */
function heroPieceCopy(featured) {
  const catalogue = usesCataloguePhoto(featured);
  if (!catalogue) {
    return {
      tag: 'Featured piece',
      title: featured.name,
      priceHtml: 'R' + featured.price + ' <span>ZAR</span>',
      meta: colourLabel(featured.colours),
      waMsg:
        "Hi Yarn It! I'm interested in the " + featured.name + ' for R' + featured.price + '. Is it available?',
    };
  }
  const collectionTitles = {
    bags: 'Chunky crochet bags',
    tops: 'Crochet tops',
    hats: 'Bucket hats',
    winter: 'Winter beanies',
    custom: 'Custom crochet',
  };
  const fromPrices = { bags: 220, tops: 180, hats: 160, winter: 140, custom: 0 };
  const title = collectionTitles[featured.cat] || featured.name;
  const fromPrice = fromPrices[featured.cat] || featured.price;
  const waPieces = {
    bags: 'crochet bags',
    tops: 'crochet tops',
    hats: 'bucket hats',
    winter: 'beanies',
    custom: 'a custom piece',
  };
  return {
    tag: 'The collection',
    title: title,
    priceHtml: 'From R' + fromPrice + ' <span>ZAR</span>',
    meta: colourLabel(featured.colours) || 'Made to order · Custom colours',
    waMsg: "Hi Yarn It! I'd love to browse your " + (waPieces[featured.cat] || 'collection') + '.',
  };
}

function firstProductImageForCategory(cat) {
  const p = getProducts().find((x) => x.cat === cat && hasValidImage(x.img));
  if (p) return p.img;
  const fallback = SITE_CONFIG.categoryImages[cat];
  return hasValidImage(fallback) ? fallback : null;
}

function renderHeroShowcase() {
  const el = document.getElementById('heroShowcase');
  if (!el) return;

  const list = getProducts();
  const featured = pickHeroProduct(list);
  if (!featured) {
    el.innerHTML = renderFloatingVisual(null, 'Featured piece', 'hero-float-visual');
    return;
  }

  const copy = heroPieceCopy(featured);
  const catalogue = usesCataloguePhoto(featured);
  const visual = catalogue
    ? '<div class="hero-catalogue-img">' + renderMediaFrame(featured.img, featured.name) + '</div>'
    : renderFloatingVisual(featured.img, featured.name, 'hero-float-visual');
  const cardClass = catalogue
    ? 'boutique-card hero-catalogue-card'
    : 'floating-product-card boutique-card hero-floating-card';

  el.innerHTML =
    '<div class="hero-stage">' +
    '<div class="hero-glow" aria-hidden="true"></div>' +
    '<article class="' +
    cardClass +
    '">' +
    visual +
    '<div class="hero-piece-body">' +
    '<p class="hero-piece-tag">' +
    escapeHtml(copy.tag) +
    '</p>' +
    '<h3 class="hero-piece-title">' +
    escapeHtml(copy.title) +
    '</h3>' +
    '<p class="hero-piece-price">' +
    copy.priceHtml +
    '</p>' +
    (copy.meta ? '<p class="hero-piece-meta">' + escapeHtml(copy.meta) + '</p>' : '') +
    '<a class="btn-primary btn-elegant hero-piece-cta wa-link" data-wa-msg="' +
    escapeHtml(copy.waMsg) +
    '" href="' +
    waUrl(msg) +
    '">Enquire on WhatsApp</a>' +
    '</div></article></div>';
  if (!catalogue) {
    const card = el.querySelector('.hero-floating-card');
    if (card) card.classList.add('hero-piece-idle');
  }
}

function renderCategoryVisual(catId, title) {
  const src = firstProductImageForCategory(catId);
  if (hasValidImage(src)) {
    return '<div class="collection-catalogue-img">' + renderMediaFrame(src, title) + '</div>';
  }
  return '<div class="collection-preview-stitch stitch-pattern" aria-hidden="true"></div>';
}

function renderAboutGallery() {
  const el = document.getElementById('aboutGallery');
  if (!el) return;
  const imgs = getProducts()
    .map((p) => p.img)
    .filter((src) => hasValidImage(src))
    .slice(0, 4);
  const slots = imgs.length ? imgs : [null, null, null, null];
  el.innerHTML = slots
    .map((src, i) => {
      if (!hasValidImage(src)) {
        return '<div class="boutique-card about-tile">' + renderMediaFrame(null, 'Gallery ' + (i + 1)) + '</div>';
      }
      return (
        '<div class="boutique-card about-tile about-tile--catalogue">' + renderMediaFrame(src, 'Gallery ' + (i + 1)) + '</div>'
      );
    })
    .join('');
}

function renderCategoryCards() {
  const grid = document.getElementById('catGrid');
  if (!grid) return;

  grid.innerHTML = CATEGORIES.map((c, i) => {
    return (
      '<article class="boutique-card collection-tile cat-card reveal-item" data-cat="' +
      c.id +
      '" role="button" tabindex="0" style="--i:' +
      i +
      '">' +
      '<div class="collection-preview">' +
      renderCategoryVisual(c.id, c.title) +
      '</div>' +
      '<div class="collection-body"><h3>' +
      escapeHtml(c.title) +
      '</h3><p>' +
      escapeHtml(c.desc) +
      '</p><span class="tile-explore">Explore</span></div></article>'
    );
  }).join('');

  grid.querySelectorAll('.cat-card').forEach((card) => {
    const cat = card.dataset.cat;
    const go = () => filterProducts(cat, null);
    card.addEventListener('click', go);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });
}

function renderStandardProductCard(p) {
  const badge = p.badge ? '<span class="product-badge">' + escapeHtml(p.badge) + '</span>' : '';
  const msg = "Hi Yarn It! I'm interested in the " + p.name + ' for R' + p.price + '. Is it available?';
  const colours = colourLabel(p.colours);
  const catalogue = usesCataloguePhoto(p);
  const frame = renderMediaFrame(p.img, p.name);
  return (
    '<article class="product-card boutique-card reveal-item" data-cat="' +
    escapeHtml(p.cat) +
    '">' +
    '<div class="product-img-wrap standard-img-wrap' +
    (catalogue ? ' is-catalogue' : '') +
    '">' +
    badge +
    frame +
    '</div>' +
    '<div class="product-info">' +
    '<h3>' +
    escapeHtml(p.name) +
    '</h3>' +
    '<p class="product-price">R' +
    p.price +
    '<span> ZAR</span></p>' +
    (colours
      ? '<div class="product-colours"><span class="colour-label">' + escapeHtml(colours) + '</span></div>'
      : '') +
    '<a class="wa-btn wa-btn--slim" href="' +
    waUrl(msg) +
    '" target="_blank" rel="noopener">' +
    WA_SVG +
    ' Order on WhatsApp</a>' +
    '</div></article>'
  );
}

function renderFloatingProductCard(p) {
  const badge = p.badge ? '<span class="product-badge">' + escapeHtml(p.badge) + '</span>' : '';
  const msg = "Hi Yarn It! I'm interested in the " + p.name + ' for R' + p.price + '. Is it available?';
  const colours = colourLabel(p.colours);
  return (
    '<article class="product-card boutique-card is-floating reveal-item" data-cat="' +
    escapeHtml(p.cat) +
    '">' +
    '<div class="floating-product-card product-float-shell">' +
    badge +
    renderFloatingVisual(p.img, p.name, 'grid-float-visual') +
    '<div class="product-info">' +
    '<h3>' +
    escapeHtml(p.name) +
    '</h3>' +
    '<p class="product-price">R' +
    p.price +
    '<span> ZAR</span></p>' +
    (colours
      ? '<div class="product-colours"><span class="colour-label">' + escapeHtml(colours) + '</span></div>'
      : '') +
    '<a class="wa-btn wa-btn--slim" href="' +
    waUrl(msg) +
    '" target="_blank" rel="noopener">' +
    WA_SVG +
    ' Order on WhatsApp</a>' +
    '</div></div></article>'
  );
}

function renderProductCard(p) {
  return isFloatingProduct(p) ? renderFloatingProductCard(p) : renderStandardProductCard(p);
}

function renderProducts() {
  const ps = getProducts();
  const grid = document.getElementById('productsGrid');
  if (!ps.length) {
    grid.innerHTML =
      '<p class="empty-shop">No pieces in the collection yet. Open <a href="admin.html">admin</a> to add products, then refresh.</p>';
    return;
  }
  grid.innerHTML = ps
    .map((p, i) => {
      const html = renderProductCard(p);
      return html.replace('reveal-item"', 'reveal-item" style="--i:' + i + '"');
    })
    .join('');
  filterProducts(currentFilter, null);
}

function applySocialLinks() {
  const map = {
    ig: SITE_CONFIG.social.instagram,
    tt: SITE_CONFIG.social.tiktok,
    fb: SITE_CONFIG.social.facebook,
  };
  Object.keys(map).forEach((key) => {
    document.querySelectorAll('.social-card.' + key + ', .social-footer-' + key).forEach((a) => {
      if (map[key]) a.href = map[key];
    });
  });
}

function applyWaLinks() {
  document.querySelectorAll('.wa-link').forEach((a) => {
    const msg = a.getAttribute('data-wa-msg');
    if (msg) a.href = waUrl(msg);
  });
  const waText = document.getElementById('waDisplay');
  if (waText) waText.textContent = 'WhatsApp: ' + formatWaDisplay(getWA());
}

async function initStore() {
  const synced = await hydrateFromSupabase();
  if (!synced) ensureProductsSeed();
  renderHeroShowcase();
  renderCategoryCards();
  renderProducts();
  renderAboutGallery();
  applyWaLinks();
  applySocialLinks();
  initBoutiqueMotion();
}

function filterProducts(cat, btn) {
  currentFilter = cat;
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const grid = document.getElementById('productsGrid');
  const applyFilter = () => {
    document.querySelectorAll('.product-card').forEach((card) => {
      card.style.display = cat === 'all' || card.dataset.cat === cat ? '' : 'none';
    });
  };
  if (grid) {
    grid.classList.add('is-filtering');
    requestAnimationFrame(() => {
      applyFilter();
      window.setTimeout(() => grid.classList.remove('is-filtering'), 340);
    });
  } else {
    applyFilter();
  }
  if (cat !== 'all' && cat !== 'custom') {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  } else if (cat === 'custom') {
    document.getElementById('custom').scrollIntoView({ behavior: 'smooth' });
  }
}

function showFormError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
}

function clearFormErrors(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.classList.remove('show');
    }
  });
  document.querySelectorAll('.custom-form input.invalid').forEach((i) => i.classList.remove('invalid'));
}

function submitCustomOrder() {
  const form = document.querySelector('.custom-form');
  const name = form.querySelector('#customName').value.trim();
  const phone = form.querySelector('#customPhone').value.trim();
  const product = form.querySelector('#customProduct').value;
  const colour = form.querySelector('#customColour').value.trim();

  clearFormErrors(['errCustomName', 'errCustomPhone', 'errCustomProduct']);

  let valid = true;
  if (name.length < 2) {
    showFormError('errCustomName', 'Please enter your name.');
    form.querySelector('#customName').classList.add('invalid');
    valid = false;
  }
  if (phone.length < 8) {
    showFormError('errCustomPhone', 'Please enter a valid phone number.');
    form.querySelector('#customPhone').classList.add('invalid');
    valid = false;
  }
  if (!product || product === 'Choose a product...') {
    showFormError('errCustomProduct', 'Please choose a product type.');
    valid = false;
  }
  if (!valid) return;

  const msg =
    "Hi Yarn It! I'd like to place a custom order.\nName: " +
    name +
    '\nPhone: ' +
    phone +
    '\nProduct: ' +
    product +
    '\nColour: ' +
    colour;
  window.open(waUrl(msg), '_blank', 'noopener');
}

function submitContactForm() {
  const form = document.querySelector('.contact-form');
  const name = form.querySelector('#contactName').value.trim();
  const contact = form.querySelector('#contactDetails').value.trim();
  const message = form.querySelector('#contactMessage').value.trim();

  clearFormErrors(['errContactName', 'errContactDetails']);

  let valid = true;
  if (name.length < 2) {
    showFormError('errContactName', 'Please enter your name.');
    form.querySelector('#contactName').classList.add('invalid');
    valid = false;
  }
  if (contact.length < 5) {
    showFormError('errContactDetails', 'Please enter email or phone.');
    form.querySelector('#contactDetails').classList.add('invalid');
    valid = false;
  }
  if (!valid) return;

  const msg =
    'Hi Yarn It!\nName: ' + name + '\nContact: ' + contact + '\nMessage: ' + message;
  window.open(waUrl(msg), '_blank', 'noopener');
}

function initNav() {
  const btn = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => links.classList.toggle('is-open'));
}

let scrollRevealObserver;

function initScrollReveal() {
  if (scrollRevealObserver) scrollRevealObserver.disconnect();
  scrollRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('visible');
        if (el.classList.contains('reveal-stagger')) el.classList.add('is-visible');
        scrollRevealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
  );
  document.querySelectorAll('.fade-in, .reveal-stagger').forEach((el) => scrollRevealObserver.observe(el));
}

function initHeroMotion() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.classList.contains('is-ready')) return;
  requestAnimationFrame(() => hero.classList.add('is-ready'));
}

function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 16);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initBoutiqueMotion() {
  initScrollReveal();
  initHeroMotion();
  initNavScroll();
}

initNav();
initStore().catch(function (e) {
  console.error('Shop init failed:', e);
  ensureProductsSeed();
  renderHeroShowcase();
  renderCategoryCards();
  renderProducts();
  renderAboutGallery();
  applyWaLinks();
  applySocialLinks();
  initBoutiqueMotion();
});
window.addEventListener('storage', function () {
  if (!isSupabaseMode()) initStore();
});
