const HERO_PRODUCT_KEY = 'chunky mini crochet bag';

const FILTER_LABELS = {
  all: 'the collection',
  bags: 'Bags',
  tops: 'Tops',
  hats: 'Hats',
  winter: 'Winter Wear',
};

export function getProducts() {
  if (typeof window.getProducts === 'function') return window.getProducts();
  return [];
}

export function getProductById(id) {
  return getProducts().find((p) => String(p.id) === String(id));
}

export function resolveImageSrc(img) {
  if (typeof window.resolveImageSrc === 'function') return window.resolveImageSrc(img);
  return img || null;
}

export function colourLabel(colours) {
  if (typeof window.colourLabel === 'function') return window.colourLabel(colours);
  if (!colours) return '';
  return String(colours)
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .join(' · ');
}

export function catLabel(cat) {
  if (typeof window.catLabel === 'function') return window.catLabel(cat);
  return FILTER_LABELS[cat] || cat;
}

export function productImageBasename(p) {
  const img = p && p.img ? String(p.img).trim() : '';
  if (!img) return '';
  return img.replace(/^.*\//, '');
}

export function usesCataloguePhoto(p) {
  const base = productImageBasename(p);
  if (!base) return true;
  if (base.indexOf('category-') === 0) return true;
  return getProducts().filter((x) => productImageBasename(x) === base).length > 1;
}

export function productDescription(p) {
  if (p.blurb) return p.blurb;
  const colours = colourLabel(p.colours);
  let text = 'Handmade to order in our Durban studio.';
  if (colours) text += ' Available in ' + colours + '.';
  else text += ' Custom colours available on request.';
  return text;
}

export function cataloguePhotoNote(p) {
  if (!usesCataloguePhoto(p)) return '';
  return 'Studio photo shows colour options for this style. Your piece is made to order.';
}

export function productWaMessage(p, prefix) {
  const lead = prefix || "Hi Yarn It! I'm interested in the";
  return lead + ' ' + p.name + ' for R' + p.price + '. Is it available?';
}

export function customColourMessage(p) {
  return (
    "Hi Yarn It! I'd like to ask about a custom colour for the " +
    p.name +
    '. What options do you have?'
  );
}

export function waUrl(msg) {
  if (typeof window.waUrl === 'function') return window.waUrl(msg);
  return '#';
}

export function filterLabel(cat) {
  return FILTER_LABELS[cat] || catLabel(cat);
}

export function pickHeroProduct(list) {
  const chunky = list.find((p) => (p.name || '').toLowerCase() === HERO_PRODUCT_KEY);
  if (chunky) return chunky;
  const bag = list.find((p) => p.cat === 'bags' && p.img);
  return bag || list[0];
}

export function heroPieceCopy(featured) {
  const catalogue = usesCataloguePhoto(featured);
  if (!catalogue) {
    return {
      tag: 'Featured piece',
      title: featured.name,
      priceText: 'R' + featured.price + ' ZAR',
    };
  }
  const collectionTitles = {
    bags: 'Chunky crochet bags',
    tops: 'Crochet tops',
    hats: 'Bucket hats',
    winter: 'Winter beanies',
  };
  const fromPrices = { bags: 220, tops: 180, hats: 160, winter: 140 };
  return {
    tag: 'The collection',
    title: collectionTitles[featured.cat] || featured.name,
    priceText: 'From R' + (fromPrices[featured.cat] || featured.price) + ' ZAR',
  };
}

export function logoSrc() {
  const cfg = typeof window.SITE_CONFIG !== 'undefined' ? window.SITE_CONFIG : null;
  const base = cfg && cfg.assets ? cfg.assets.imageBase : 'assets/images/';
  return base + (cfg && cfg.logo ? cfg.logo : 'logo.png');
}

export const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'bags', label: 'Bags' },
  { id: 'tops', label: 'Tops' },
  { id: 'hats', label: 'Hats' },
  { id: 'winter', label: 'Winter Wear' },
];

export function openProductModal(id) {
  window.dispatchEvent(new CustomEvent('yarnit:open-product', { detail: { id: String(id) } }));
}
