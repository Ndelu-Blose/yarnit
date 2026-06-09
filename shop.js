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

/** Canonical hero feature — lowercase name match (sync with store.js / SQL seed). */
const HERO_PRODUCT_KEY = 'chunky mini crochet bag';

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
let carouselAutoTimer = null;
let carouselAutoResumeTimer = null;
const CAROUSEL_AUTO_MS = 5000;
const CAROUSEL_AUTO_RESUME_MS = 8000;
let activeModalProduct = null;
let lightboxSrc = '';
let lightboxAlt = '';

const FILTER_LABELS = {
  all: 'the collection',
  bags: 'Bags',
  tops: 'Tops',
  hats: 'Hats',
  winter: 'Winter Wear',
};

function getProductById(id) {
  return getProducts().find((p) => String(p.id) === String(id));
}

function productWaMessage(p, prefix) {
  const lead = prefix || "Hi Yarn It! I'm interested in the";
  return lead + ' ' + p.name + ' for R' + p.price + '. Is it available?';
}

function productDescription(p) {
  const colours = colourLabel(p.colours);
  let text = 'Handmade to order in our Durban studio.';
  if (colours) text += ' Available in ' + colours + '.';
  else text += ' Custom colours available on request.';
  return text;
}

function availabilityLabel() {
  return 'Made to order · Handmade in Durban';
}

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
  const chunky = list.find((p) => (p.name || '').toLowerCase() === HERO_PRODUCT_KEY);
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

function heroEditorialImageHtml(src, alt) {
  const resolved = resolveImageSrc(src);
  const safeAlt = escapeHtml(alt || 'Yarn It handmade crochet');
  if (!resolved) {
    return '<div class="hero-image-frame">' + imagePlaceholderHTML(alt) + '</div>';
  }
  const safeSrc = resolved.replace(/"/g, '&quot;');
  return (
    '<div class="hero-image-frame">' +
    '<img src="' +
    safeSrc +
    '" alt="' +
    safeAlt +
    '" loading="eager" decoding="async">' +
    '</div>'
  );
}

function renderHeroEditorial() {
  const art = document.getElementById('heroArt');
  if (!art) return;

  const featured = pickHeroProduct(getProducts());
  if (!featured) {
    art.innerHTML = heroEditorialImageHtml(null, 'Yarn It crochet pieces');
    return;
  }

  const copy = heroPieceCopy(featured);
  const priceText = copy.priceHtml.replace(/<[^>]+>/g, '').trim();
  art.innerHTML =
    heroEditorialImageHtml(featured.img, featured.name) +
    '<div class="hero-mini-card">' +
    '<span class="hero-mini-eyebrow">' +
    escapeHtml(copy.tag) +
    '</span>' +
    '<h3>' +
    escapeHtml(copy.title) +
    '</h3>' +
    '<p class="hero-mini-price">' +
    escapeHtml(priceText) +
    '</p>' +
    '</div>';
}

function categoryCardImageSrc(catId) {
  const src = firstProductImageForCategory(catId);
  return hasValidImage(src) ? resolveImageSrc(src) : null;
}

function renderAboutGallery() {
  const el = document.getElementById('aboutGallery');
  if (!el) return;
  const seen = new Set();
  const imgs = [];
  getProducts().forEach((p) => {
    if (!hasValidImage(p.img)) return;
    const key = productImageBasename(p) || String(p.img);
    if (seen.has(key)) return;
    seen.add(key);
    imgs.push(p.img);
  });
  const slots = imgs.length ? imgs.slice(0, 4) : [null, null, null, null];
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
    const num = String(i + 1).padStart(2, '0');
    const sizeClass = c.id === 'bags' ? ' category-large' : c.id === 'custom' ? ' category-wide' : '';
    const src = categoryCardImageSrc(c.id);
    const imgTag = src
      ? '<img src="' + src.replace(/"/g, '&quot;') + '" alt="' + escapeHtml(c.title) + '" loading="lazy" decoding="async">'
      : '';
    return (
      '<article class="category-card' +
      sizeClass +
      ' reveal-item" data-cat="' +
      c.id +
      '" role="button" tabindex="0" style="--i:' +
      i +
      '">' +
      imgTag +
      '<div class="category-card-body"><span class="category-num">' +
      num +
      '</span><h3>' +
      escapeHtml(c.title) +
      '</h3><p>' +
      escapeHtml(c.desc) +
      '</p></div></article>'
    );
  }).join('');

  grid.querySelectorAll('.category-card').forEach((card) => {
    const cat = card.dataset.cat;
    const go = () => {
      if (cat === 'custom') {
        document.getElementById('custom').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      filterProducts(cat);
    };
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
  const colours = colourLabel(p.colours);
  const catalogue = usesCataloguePhoto(p);
  const frame = renderMediaFrame(p.img, p.name);
  return (
    '<article class="product-card boutique-card reveal-item" data-cat="' +
    escapeHtml(p.cat) +
    '" data-product-id="' +
    p.id +
    '">' +
    '<button type="button" class="product-open" data-product-id="' +
    p.id +
    '" aria-label="View ' +
    escapeHtml(p.name) +
    '">' +
    '<div class="product-img-wrap standard-img-wrap' +
    (catalogue ? ' is-catalogue' : '') +
    '">' +
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
    '<span class="view-piece-label">View Piece</span>' +
    '</div></button></article>'
  );
}

function renderFloatingProductCard(p) {
  const colours = colourLabel(p.colours);
  return (
    '<article class="product-card boutique-card is-floating reveal-item" data-cat="' +
    escapeHtml(p.cat) +
    '" data-product-id="' +
    p.id +
    '">' +
    '<button type="button" class="product-open" data-product-id="' +
    p.id +
    '" aria-label="View ' +
    escapeHtml(p.name) +
    '">' +
    '<div class="floating-product-card product-float-shell">' +
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
    '<span class="view-piece-label">View Piece</span>' +
    '</div></div></button></article>'
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
  filterProducts(currentFilter);
}

function setActiveFilterButton(cat) {
  document.querySelectorAll('.filter-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-cat') === cat);
  });
}

function updateFilterMeta(cat) {
  const resultEl = document.getElementById('filterResult');
  const emptyEl = document.getElementById('shopEmpty');
  const grid = document.getElementById('productsGrid');
  if (!resultEl) return;

  const cards = [...document.querySelectorAll('#productsGrid .product-card')];
  const visible = cards.filter((c) => getComputedStyle(c).display !== 'none');
  const count = visible.length;

  if (cat === 'all') {
    resultEl.textContent = count === 1 ? 'Showing 1 piece' : 'Showing ' + count + ' pieces';
  } else {
    const label = FILTER_LABELS[cat] || catLabel(cat);
    resultEl.textContent =
      count === 1 ? 'Showing 1 piece in ' + label : 'Showing ' + count + ' pieces in ' + label;
  }

  if (emptyEl) {
    emptyEl.hidden = count > 0;
  }
  if (grid) {
    grid.classList.toggle('is-empty', count === 0);
  }
  const carousel = document.getElementById('productsCarousel');
  if (carousel) {
    carousel.classList.toggle('is-empty', count === 0);
    carousel.hidden = count === 0;
  }
  syncCarouselDots();
  updateCarouselControls();
}

function getVisibleCarouselCards() {
  const track = document.getElementById('productsGrid');
  if (!track) return [];
  return [...track.querySelectorAll('.product-card')].filter((c) => getComputedStyle(c).display !== 'none');
}

function getCarouselStep() {
  const cards = getVisibleCarouselCards();
  const card = cards[0];
  const track = document.getElementById('productsGrid');
  if (!card || !track) return 296;
  const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
  return card.offsetWidth + gap;
}

function getActiveCarouselIndex() {
  const viewport = document.getElementById('productsCarouselViewport');
  const cards = getVisibleCarouselCards();
  if (!viewport || !cards.length) return 0;

  const anchor = viewport.scrollLeft + viewport.clientWidth * 0.35;
  let best = 0;
  let bestDist = Infinity;
  cards.forEach((card, i) => {
    const dist = Math.abs(card.offsetLeft - anchor);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

function scrollCarouselToIndex(index) {
  const viewport = document.getElementById('productsCarouselViewport');
  const cards = getVisibleCarouselCards();
  const card = cards[index];
  if (!viewport || !card) return;
  viewport.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
}

function scrollCarousel(direction) {
  const cards = getVisibleCarouselCards();
  if (!cards.length) return;
  const current = getActiveCarouselIndex();
  const next = current + direction;
  if (next < 0) scrollCarouselToIndex(cards.length - 1);
  else if (next >= cards.length) scrollCarouselToIndex(0);
  else scrollCarouselToIndex(next);
  scheduleCarouselAutoResume();
}

function resetCarouselScroll() {
  const viewport = document.getElementById('productsCarouselViewport');
  if (viewport) viewport.scrollLeft = 0;
}

function pauseCarouselAuto() {
  if (carouselAutoTimer) {
    clearInterval(carouselAutoTimer);
    carouselAutoTimer = null;
  }
  if (carouselAutoResumeTimer) {
    clearTimeout(carouselAutoResumeTimer);
    carouselAutoResumeTimer = null;
  }
}

function carouselAutoAllowed() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (document.body.classList.contains('modal-open') || document.body.classList.contains('lightbox-open')) {
    return false;
  }
  const carousel = document.getElementById('productsCarousel');
  if (!carousel || carousel.hidden) return false;
  return getVisibleCarouselCards().length > 1;
}

function startCarouselAuto() {
  pauseCarouselAuto();
  if (!carouselAutoAllowed()) return;

  carouselAutoTimer = setInterval(function () {
    if (!carouselAutoAllowed()) {
      pauseCarouselAuto();
      return;
    }
    const viewport = document.getElementById('productsCarouselViewport');
    const cards = getVisibleCarouselCards();
    if (!viewport || cards.length < 2) return;

    const current = getActiveCarouselIndex();
    const next = current + 1 >= cards.length ? 0 : current + 1;
    scrollCarouselToIndex(next);
  }, CAROUSEL_AUTO_MS);
}

function scheduleCarouselAutoResume() {
  pauseCarouselAuto();
  if (!carouselAutoAllowed()) return;
  carouselAutoResumeTimer = window.setTimeout(startCarouselAuto, CAROUSEL_AUTO_RESUME_MS);
}

function syncCarouselDots() {
  const dotsEl = document.getElementById('productsCarouselDots');
  const carousel = document.getElementById('productsCarousel');
  if (!dotsEl || !carousel || carousel.hidden) return;

  const cards = getVisibleCarouselCards();
  if (cards.length < 2) {
    dotsEl.innerHTML = '';
    dotsEl.hidden = true;
    return;
  }

  dotsEl.hidden = false;
  if (dotsEl.querySelectorAll('.carousel-dot').length !== cards.length) {
    dotsEl.innerHTML = cards
      .map(function (card, i) {
        const name = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Piece ' + (i + 1);
        return (
          '<button type="button" class="carousel-dot" role="tab" aria-label="Go to ' +
          escapeHtml(name) +
          '" data-index="' +
          i +
          '"></button>'
        );
      })
      .join('');
  }
  updateActiveCarouselDot();
}

function updateActiveCarouselDot() {
  const dotsEl = document.getElementById('productsCarouselDots');
  if (!dotsEl || dotsEl.hidden) return;
  const active = getActiveCarouselIndex();
  dotsEl.querySelectorAll('.carousel-dot').forEach(function (dot, i) {
    const isActive = i === active;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

function updateCarouselControls() {
  const carousel = document.getElementById('productsCarousel');
  const viewport = document.getElementById('productsCarouselViewport');
  const prev = document.getElementById('productsCarouselPrev');
  const next = document.getElementById('productsCarouselNext');
  if (!carousel || !viewport || carousel.hidden) return;

  const hasOverflow = viewport.scrollWidth > viewport.clientWidth + 8;
  if (prev) {
    prev.hidden = !hasOverflow;
    prev.disabled = viewport.scrollLeft <= 8;
  }
  if (next) {
    next.hidden = !hasOverflow;
    next.disabled = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 8;
  }
  updateActiveCarouselDot();
}

function initProductsCarousel() {
  const carousel = document.getElementById('productsCarousel');
  const viewport = document.getElementById('productsCarouselViewport');
  const prev = document.getElementById('productsCarouselPrev');
  const next = document.getElementById('productsCarouselNext');
  const dotsEl = document.getElementById('productsCarouselDots');
  if (!carousel || carousel.dataset.bound) return;
  carousel.dataset.bound = '1';

  if (prev) {
    prev.addEventListener('click', function () {
      pauseCarouselAuto();
      scrollCarousel(-1);
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      pauseCarouselAuto();
      scrollCarousel(1);
    });
  }
  if (dotsEl) {
    dotsEl.addEventListener('click', function (e) {
      const dot = e.target.closest('.carousel-dot');
      if (!dot) return;
      pauseCarouselAuto();
      scrollCarouselToIndex(parseInt(dot.getAttribute('data-index'), 10));
      scheduleCarouselAutoResume();
    });
  }
  if (viewport) {
    viewport.addEventListener('scroll', function () {
      updateCarouselControls();
    }, { passive: true });
    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pauseCarouselAuto();
        scrollCarousel(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        pauseCarouselAuto();
        scrollCarousel(1);
      }
    });
    viewport.addEventListener('touchstart', pauseCarouselAuto, { passive: true });
    viewport.addEventListener('touchend', scheduleCarouselAutoResume, { passive: true });
    viewport.addEventListener('wheel', pauseCarouselAuto, { passive: true });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseCarouselAuto();
    else startCarouselAuto();
  });

  carousel.addEventListener('mouseenter', pauseCarouselAuto);
  carousel.addEventListener('mouseleave', scheduleCarouselAutoResume);
  carousel.addEventListener('focusin', pauseCarouselAuto);
  carousel.addEventListener('focusout', function (e) {
    if (!carousel.contains(e.relatedTarget)) scheduleCarouselAutoResume();
  });

  window.addEventListener('resize', function () {
    syncCarouselDots();
    updateCarouselControls();
  }, { passive: true });

  startCarouselAuto();
}

function openProductModal(id) {
  const p = getProductById(id);
  const modal = document.getElementById('productModal');
  if (!p || !modal) return;

  activeModalProduct = p;
  const resolved = resolveImageSrc(p.img);
  const img = document.getElementById('productModalImage');
  const colours = colourLabel(p.colours);
  const checkMsg = productWaMessage(p, "Hi Yarn It! I'd like to check availability for the");
  const enquireMsg = productWaMessage(p);

  document.getElementById('productModalCategory').textContent = catLabel(p.cat);
  document.getElementById('productModalTitle').textContent = p.name;
  document.getElementById('productModalPrice').textContent = 'R' + p.price + ' ZAR';
  document.getElementById('productModalStatus').textContent = availabilityLabel();
  document.getElementById('productModalColours').textContent = colours ? 'Colours: ' + colours : '';
  document.getElementById('productModalDesc').textContent = productDescription(p);

  if (img) {
    if (resolved) {
      img.src = resolved;
      img.alt = p.name;
      img.hidden = false;
    } else {
      img.removeAttribute('src');
      img.alt = p.name;
      img.hidden = true;
    }
  }

  const waBtn = document.getElementById('productModalWaBtn');
  waBtn.setAttribute('data-wa-msg', enquireMsg);
  waBtn.href = waUrl(enquireMsg);

  const checkBtn = document.getElementById('productModalCheckBtn');
  checkBtn.onclick = function () {
    window.open(waUrl(checkMsg), '_blank', 'noopener');
  };

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  pauseCarouselAuto();
  document.getElementById('productModalClose').focus();
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  activeModalProduct = null;
  scheduleCarouselAutoResume();
}

function openLightbox(src, alt) {
  const box = document.getElementById('imageLightbox');
  const img = document.getElementById('imageLightboxImg');
  if (!box || !img || !src) return;
  lightboxSrc = src;
  lightboxAlt = alt || '';
  img.src = src;
  img.alt = lightboxAlt;
  box.hidden = false;
  box.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  pauseCarouselAuto();
  document.getElementById('imageLightboxClose').focus();
}

function closeLightbox() {
  const box = document.getElementById('imageLightbox');
  const img = document.getElementById('imageLightboxImg');
  if (!box) return;
  box.hidden = true;
  box.setAttribute('aria-hidden', 'true');
  if (img) {
    img.removeAttribute('src');
    img.alt = '';
  }
  document.body.classList.remove('lightbox-open');
  scheduleCarouselAutoResume();
  lightboxSrc = '';
  lightboxAlt = '';
}

function initProductInteractions() {
  const modal = document.getElementById('productModal');
  const lightbox = document.getElementById('imageLightbox');
  const shop = document.getElementById('products');
  if (!modal) return;

  if (shop && !shop.dataset.shopBound) {
    shop.dataset.shopBound = '1';
    shop.addEventListener('click', function (e) {
      const btn = e.target.closest('.product-open');
      if (!btn) return;
      const id = btn.getAttribute('data-product-id');
      if (id) openProductModal(id);
    });
  }

  document.getElementById('productModalClose').addEventListener('click', closeProductModal);
  modal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeProductModal);
  });

  const imageBtn = document.getElementById('productModalImageBtn');
  if (imageBtn) {
    imageBtn.addEventListener('click', function () {
      const src = resolveImageSrc(activeModalProduct && activeModalProduct.img);
      if (src) openLightbox(src, activeModalProduct.name);
    });
  }

  if (lightbox) {
    document.getElementById('imageLightboxClose').addEventListener('click', closeLightbox);
    lightbox.querySelectorAll('[data-close-lightbox]').forEach((el) => {
      el.addEventListener('click', closeLightbox);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!document.getElementById('imageLightbox').hidden) {
      closeLightbox();
      return;
    }
    if (!document.getElementById('productModal').hidden) {
      closeProductModal();
    }
  });
}

function applySocialLinks() {
  const map = {
    ig: SITE_CONFIG.social.instagram,
    tt: SITE_CONFIG.social.tiktok,
    fb: SITE_CONFIG.social.facebook,
  };
  Object.keys(map).forEach((key) => {
    document.querySelectorAll('.social-card.' + key + ', .social-link.' + key + ', .social-footer-' + key).forEach((a) => {
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

function renderShopContent() {
  renderHeroEditorial();
  renderCategoryCards();
  renderProducts();
  renderAboutGallery();
  applyWaLinks();
  applySocialLinks();
  updateFilterMeta(currentFilter);
  requestAnimationFrame(function () {
    syncCarouselDots();
    updateCarouselControls();
    startCarouselAuto();
  });
}

async function initStore() {
  ensureProductsSeed();
  renderShopContent();
  initBoutiqueMotion();
  refreshScrollReveal();

  try {
    const synced = await hydrateFromSupabase();
    if (synced) {
      renderShopContent();
      refreshScrollReveal();
    }
  } catch (e) {
    console.warn('[Yarn It!] Supabase sync skipped:', e);
  }
}

function filterProducts(cat, btn) {
  currentFilter = cat;
  setActiveFilterButton(cat);

  const grid = document.getElementById('productsGrid');
  const applyFilter = () => {
    document.querySelectorAll('#productsGrid .product-card').forEach((card) => {
      card.style.display = cat === 'all' || card.dataset.cat === cat ? '' : 'none';
    });
    updateFilterMeta(cat);
    resetCarouselScroll();
    syncCarouselDots();
    updateCarouselControls();
    scheduleCarouselAutoResume();
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
  const size = form.querySelector('#customSize').value;
  const notes = form.querySelector('#customNotes').value.trim();

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

  let msg =
    "Hi Yarn It! I'd like to place a custom order.\nName: " +
    name +
    '\nPhone: ' +
    phone +
    '\nProduct: ' +
    product +
    '\nColour: ' +
    colour +
    '\nSize: ' +
    size;
  if (notes) msg += '\nNotes: ' + notes;
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

function revealInView(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
    el.classList.add('visible');
    if (el.classList.contains('reveal-stagger')) el.classList.add('is-visible');
  }
}

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
    { threshold: 0.06, rootMargin: '0px' }
  );
  document.querySelectorAll('.fade-in, .reveal-stagger').forEach((el) => {
    revealInView(el);
    scrollRevealObserver.observe(el);
  });
}

function refreshScrollReveal() {
  document.querySelectorAll('.fade-in, .reveal-stagger').forEach((el) => {
    revealInView(el);
    if (scrollRevealObserver) scrollRevealObserver.observe(el);
  });
}

function initHeroMotion() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.classList.contains('is-ready')) return;
  requestAnimationFrame(() => hero.classList.add('is-ready'));
}

let navScrollHandler = null;
let navScrollBound = false;

function initNavScroll() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  if (!navScrollHandler) {
    navScrollHandler = () => nav.classList.toggle('is-scrolled', window.scrollY > 16);
  }
  navScrollHandler();
  if (!navScrollBound) {
    window.addEventListener('scroll', navScrollHandler, { passive: true });
    navScrollBound = true;
  }
}

function initBoutiqueMotion() {
  document.documentElement.classList.add('motion-on');
  initScrollReveal();
  initHeroMotion();
  initNavScroll();
  requestAnimationFrame(refreshScrollReveal);
}

initNav();
initProductInteractions();
initProductsCarousel();
initStore().catch(function (e) {
  console.error('Shop init failed:', e);
  ensureProductsSeed();
  renderShopContent();
  initBoutiqueMotion();
  refreshScrollReveal();
});
window.addEventListener('storage', function () {
  if (!isSupabaseMode()) initStore();
});
