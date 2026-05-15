/**
 * Site configuration — UPDATE social links and image paths here.
 * Product photos: admin upload, or place files in assets/images/
 * Floating shop cards: edit FLOATING_PRODUCT_KEYS in shop.js
 */
const SITE_CONFIG = {
  /* UPDATE: Social profile URLs */
  social: {
    instagram: '#',
    tiktok: '#',
    facebook: '#',
  },

  /* UPDATE: Folder for static product photos (filename only in product data) */
  assets: {
    imageBase: 'assets/images/',
  },

  /* Default filenames per category (optional fallbacks when no admin upload) */
  categoryImages: {
    bags: 'category-bags.jpg',
    tops: 'category-tops.jpg',
    hats: 'category-hats.jpg',
    winter: 'category-winter.jpg',
    custom: '',
  },

  /* Square logo PNG is for stickers/print/social — site uses integrated text wordmark */
  logo: 'logo.png',
};
