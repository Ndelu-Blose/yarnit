/**
 * Yarn It! — Supabase data layer (static site).
 *
 * PUBLIC (no login): fetchProducts, fetchSettings — used by the shop.
 * ADMIN ONLY (authenticated session): saveProduct, deleteProduct, upload images, saveSettings.
 *
 * Only one Supabase Auth user should exist (the shop admin). Customers never authenticate.
 */
(function () {
  const SCHEMA_SETUP_MESSAGE =
    'Run supabase/migrations/001_yarnit_schema.sql in the Supabase SQL Editor by pasting the SQL contents, not the file path.';

  function isMissingSchemaError(err) {
    if (!err) return false;
    const code = String(err.code || '');
    const msg = String(err.message || err).toLowerCase();
    return (
      code === 'PGRST205' ||
      msg.includes('could not find the table') ||
      (msg.includes('relation') && msg.includes('does not exist'))
    );
  }

  function logMissingSchema(context) {
    const prefix = context ? '[Yarn It! ' + context + '] ' : '[Yarn It!] ';
    console.error(prefix + SCHEMA_SETUP_MESSAGE);
  }

  function wrapError(err, context) {
    if (isMissingSchemaError(err)) {
      logMissingSchema(context);
    }
    return err;
  }

  async function requireAdminSession() {
    const session = await window.yarnitSupabase.getSession();
    if (!session) {
      throw new Error(
        'Admin sign-in required. This site has one admin account only — customers do not log in.'
      );
    }
    return session;
  }

  function rowToProduct(row) {
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      cat: row.cat,
      colours: row.colours || '',
      badge: row.badge || '',
      img: row.image_url || '',
    };
  }

  function productToRow(p) {
    return {
      id: typeof p.id === 'number' && p.id < 1e12 ? p.id : undefined,
      name: p.name,
      price: p.price,
      cat: p.cat,
      colours: p.colours || '',
      badge: p.badge || '',
      image_url: p.img || '',
      is_active: true,
    };
  }

  /** Public shop — anon/authenticated read via RLS (active products only). */
  async function fetchProducts() {
    const sb = window.yarnitSupabase.getClient();
    const { data, error } = await sb
      .from('products')
      .select('id,name,price,cat,colours,badge,image_url')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw wrapError(error, 'shop');
    return (data || []).map(rowToProduct);
  }

  /** Admin dashboard — requires signed-in admin (RLS: authenticated). */
  async function fetchAllProductsAdmin() {
    await requireAdminSession();
    const sb = window.yarnitSupabase.getClient();
    const { data, error } = await sb
      .from('products')
      .select('id,name,price,cat,colours,badge,image_url,is_active')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw wrapError(error, 'admin');
    return (data || []).map(rowToProduct);
  }

  /** Public shop — read shop settings without login. */
  async function fetchSettings() {
    const sb = window.yarnitSupabase.getClient();
    const { data, error } = await sb.from('shop_settings').select('*').eq('id', 1).maybeSingle();
    if (error) throw wrapError(error, 'shop');
    return data;
  }

  async function uploadImageIfNeeded(img, productId) {
    await requireAdminSession();
    if (!img || typeof img !== 'string') return '';
    if (!img.startsWith('data:')) return img;

    const sb = window.yarnitSupabase.getClient();
    const res = await fetch(img);
    const blob = await res.blob();
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    const path = productId + '/' + Date.now() + '.' + ext;

    const { error: upErr } = await sb.storage.from('product-images').upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    });
    if (upErr) throw wrapError(upErr, 'admin');

    const { data } = sb.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  }

  async function saveProduct(product) {
    await requireAdminSession();
    const sb = window.yarnitSupabase.getClient();
    let img = product.img || '';
    const tempId = product.id || 'new-' + Date.now();
    if (img.startsWith('data:')) {
      img = await uploadImageIfNeeded(img, tempId);
    }

    const row = productToRow({ ...product, img });
    if (row.id) {
      const { data, error } = await sb.from('products').update(row).eq('id', row.id).select().single();
      if (error) throw wrapError(error, 'admin');
      return rowToProduct(data);
    }

    delete row.id;
    const { data, error } = await sb.from('products').insert(row).select().single();
    if (error) throw wrapError(error, 'admin');
    return rowToProduct(data);
  }

  async function deleteProductById(id) {
    await requireAdminSession();
    const sb = window.yarnitSupabase.getClient();
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) throw wrapError(error, 'admin');
  }

  async function saveSettings(partial) {
    await requireAdminSession();
    const sb = window.yarnitSupabase.getClient();
    const { error } = await sb
      .from('shop_settings')
      .upsert({ id: 1, ...partial, updated_at: new Date().toISOString() });
    if (error) throw wrapError(error, 'admin');
  }

  window.yarnitSupabaseData = {
    SCHEMA_SETUP_MESSAGE,
    isMissingSchemaError,
    logMissingSchema,
    fetchProducts,
    fetchAllProductsAdmin,
    fetchSettings,
    saveProduct,
    deleteProductById,
    saveSettings,
  };
})();
