/**
 * Yarn It! admin — local demo OR live Supabase (one admin user only).
 * Live mode (supabase.env.js): Supabase Auth email + password for the shop admin.
 * No customer accounts. Do not add customer login.
 */
const DEFAULT_CREDS = { user: 'admin', pass: 'yarnit2024' };

let editingId = null;
let imgDataURL = null;

function isLiveAdminMode() {
  return typeof window.yarnitSupabase !== 'undefined' && window.yarnitSupabase.isConfigured();
}

function schemaSetupUserMessage() {
  return window.yarnitSupabaseData && window.yarnitSupabaseData.SCHEMA_SETUP_MESSAGE
    ? window.yarnitSupabaseData.SCHEMA_SETUP_MESSAGE
    : 'Database tables are missing. Run the migration SQL in the Supabase SQL Editor.';
}

function setLiveAdminBanner() {
  const banner = document.getElementById('demoBanner');
  if (!banner) return;
  banner.textContent =
    'Live mode: signed in as admin. Product changes sync to Supabase. Customers do not need accounts.';
  banner.classList.add('supabase-on');
}

function getCreds() {
  return {
    user: storageGet(YI_KEYS.user) || DEFAULT_CREDS.user,
    pass: storageGet(YI_KEYS.pass) || DEFAULT_CREDS.pass,
  };
}

function clearFieldErrors() {
  ['errName', 'errPrice', 'errCat', 'errWa'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.classList.remove('show');
    }
  });
  ['pName', 'pPrice', 'pCat', 'waNumber'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('invalid');
  });
}

function showFieldError(fieldId, errId, message) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (field) field.classList.add('invalid');
  if (err) {
    err.textContent = message;
    err.classList.add('show');
  }
}

function showAdminScreen() {
  document.getElementById('loginErr').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminScreen').style.display = 'block';
  renderAll();
}

async function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginErr');

  if (isLiveAdminMode()) {
    if (!u || !p) {
      errEl.textContent = 'Enter the admin email and password from Supabase Authentication.';
      errEl.style.display = 'block';
      return;
    }
    try {
      await window.yarnitSupabase.signIn(u, p);
      const ok = await hydrateAdminFromSupabase();
      if (!ok) {
        await window.yarnitSupabase.signOut();
        throw new Error(schemaSetupUserMessage());
      }
      showAdminScreen();
      setLiveAdminBanner();
    } catch (e) {
      const msg = e && e.message ? e.message : 'Sign-in failed.';
      errEl.textContent = msg.includes('SQL Editor')
        ? msg
        : 'Sign-in failed: ' +
          msg +
          ' Create the one admin user in Supabase → Authentication → Users (disable public sign-ups).';
      errEl.style.display = 'block';
    }
    return;
  }

  const creds = getCreds();
  if (u === creds.user && p === creds.pass) {
    ensureProductsSeed();
    showAdminScreen();
  } else {
    errEl.textContent = 'Incorrect username or password (local demo only).';
    errEl.style.display = 'block';
  }
}

async function logout() {
  if (isSupabaseMode() && window.yarnitSupabase) {
    await window.yarnitSupabase.signOut();
    _useSupabase = false;
    _productsCache = null;
  }
  document.getElementById('adminScreen').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function showTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'photos') renderPhotos();
  if (name === 'settings') document.getElementById('waNumber').value = getWA();
}

function renderAll() {
  renderStats();
  renderProducts();
}

function renderStats() {
  const ps = getProducts();
  const cats = [...new Set(ps.map((p) => p.cat))].length;
  const withImgs = ps.filter((p) => p.img).length;
  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card"><div class="stat-num">${ps.length}</div><div class="stat-label">Products</div></div>
    <div class="stat-card"><div class="stat-num">${cats}</div><div class="stat-label">Categories</div></div>
    <div class="stat-card"><div class="stat-num">${withImgs}</div><div class="stat-label">With Photos</div></div>
    <div class="stat-card"><div class="stat-num">${getPhotos().length}</div><div class="stat-label">Library Photos</div></div>
  `;
}

function renderProducts() {
  const ps = getProducts();
  let html = '';

  if (!ps.length) {
    html = `<div class="empty-state">
      <div class="empty-icon">🛍️</div>
      <h4>No products yet</h4>
      <p>Add your first crochet piece below. After you save, open <strong>index.html</strong> and refresh to preview the shop.</p>
    </div>`;
  } else {
    html = ps
      .map((p) => {
        const imgSrc = resolveImageSrc(p.img) || '';
      const imgBlock = imgSrc
        ? `<img src="${imgSrc}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none';this.nextElementSibling.hidden=false">` +
          imagePlaceholderHTML(p.name, true)
        : imagePlaceholderHTML(p.name);
        const badge = p.badge
          ? `<div style="display:inline-block;background:var(--blush);color:var(--deep-pink);border-radius:50px;padding:2px 10px;font-size:0.75rem;font-weight:800;margin-bottom:6px">${escapeHtml(p.badge)}</div>`
          : '';
        return `<div class="admin-product-card" data-id="${p.id}">
      <div class="apc-img" onclick="openEditImgOnly(${p.id})">
        ${imgBlock}
        <div class="apc-img-overlay">
          <svg width="28" height="28" viewBox="0 0 24 24"><path d="M12 15.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm7-11H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM9 3h6l1 2H8z"/></svg>
          <span>Change Photo</span>
        </div>
      </div>
      <div class="apc-body">
        ${badge}
        <div class="apc-name">${escapeHtml(p.name)}</div>
        <div class="apc-price">R${p.price} · ${catLabel(p.cat)}</div>
        <div class="apc-actions">
          <button class="edit-btn" onclick="openEdit(${p.id})">✏️ Edit</button>
          <button class="del-btn" onclick="deleteProduct(${p.id})">🗑️</button>
        </div>
      </div>
    </div>`;
      })
      .join('');
  }

  html += `<div class="add-product-card" onclick="openAdd()"><div class="plus">+</div><span>Add New Product</span></div>`;
  document.getElementById('productsGrid').innerHTML = html;
}

function openAdd() {
  editingId = null;
  imgDataURL = null;
  clearFieldErrors();
  document.getElementById('modalTitle').textContent = 'Add Product';
  document.getElementById('pName').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pCat').value = 'bags';
  document.getElementById('pColours').value = '';
  document.getElementById('pBadge').value = '';
  document.getElementById('modalImgPreview').style.display = 'none';
  document.getElementById('modalImgPreview').src = '';
  document.getElementById('modalImgFile').value = '';
  document.getElementById('productModal').classList.add('open');
}

function openEdit(id) {
  const p = getProducts().find((x) => x.id == id);
  if (!p) return;
  editingId = id;
  imgDataURL = p.img || null;
  clearFieldErrors();
  document.getElementById('modalTitle').textContent = 'Edit Product ✏️';
  document.getElementById('pName').value = p.name;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pCat').value = p.cat;
  document.getElementById('pColours').value = p.colours || '';
  document.getElementById('pBadge').value = p.badge || '';
  const prev = document.getElementById('modalImgPreview');
  if (p.img) {
    prev.src = p.img;
    prev.style.display = 'block';
  } else {
    prev.style.display = 'none';
    prev.src = '';
  }
  document.getElementById('productModal').classList.add('open');
}

function openEditImgOnly(id) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/png,image/webp,image/gif';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readImageFile(
      file,
      async (dataUrl) => {
        const ps = getProducts();
        const idx = ps.findIndex((x) => x.id == id);
        if (idx < 0) return;
        ps[idx].img = dataUrl;
        try {
          if (isSupabaseMode()) {
            await persistProductToSupabase(ps[idx]);
          } else if (!saveProducts(ps)) {
            toast('Could not save — browser storage may be full.');
            return;
          } else {
            saveProducts(ps);
          }
          renderAll();
          toast('Photo updated!');
        } catch (err) {
          toast(err.message || 'Could not save photo.');
        }
      },
      (msg) => toast(msg)
    );
  };
  input.click();
}

function closeModal() {
  document.getElementById('productModal').classList.remove('open');
}

function previewImg(e, previewId) {
  const file = e.target.files[0];
  if (!file) return;
  readImageFile(
    file,
    (dataUrl) => {
      imgDataURL = dataUrl;
      const el = document.getElementById(previewId);
      el.src = imgDataURL;
      el.style.display = 'block';
    },
    (msg) => toast(msg)
  );
}

async function saveProduct() {
  clearFieldErrors();
  const name = document.getElementById('pName').value.trim();
  const price = parseInt(document.getElementById('pPrice').value, 10);
  const cat = document.getElementById('pCat').value;
  const validation = validateProduct({ name, price, cat });

  if (!validation.ok) {
    if (validation.errors.name) showFieldError('pName', 'errName', validation.errors.name);
    if (validation.errors.price) showFieldError('pPrice', 'errPrice', validation.errors.price);
    if (validation.errors.cat) showFieldError('pCat', 'errCat', validation.errors.cat);
    return;
  }

  const ps = getProducts();
  const payload = {
    name,
    price,
    cat,
    colours: document.getElementById('pColours').value.trim(),
    badge: document.getElementById('pBadge').value.trim(),
  };

  let product;
  if (editingId) {
    const idx = ps.findIndex((x) => x.id == editingId);
    if (idx > -1) {
      product = { ...ps[idx], ...payload };
      if (imgDataURL) product.img = imgDataURL;
    }
  } else {
    product = {
      id: Date.now(),
      ...payload,
      img: imgDataURL || '',
    };
  }

  if (!product) return;

  try {
    if (isSupabaseMode()) {
      await persistProductToSupabase(product);
    } else {
      if (editingId) {
        const idx = ps.findIndex((x) => x.id == editingId);
        if (idx > -1) {
          Object.assign(ps[idx], payload);
          if (imgDataURL) ps[idx].img = imgDataURL;
        }
      } else {
        ps.push(product);
      }
      if (!saveProducts(ps)) {
        toast('Could not save — browser storage may be full.');
        return;
      }
    }
    closeModal();
    renderAll();
    toast('Product saved!');
  } catch (err) {
    toast(err.message || 'Could not save product.');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    if (isSupabaseMode()) {
      await removeProductFromSupabase(id);
    } else {
      saveProducts(getProducts().filter((x) => x.id != id));
    }
    renderAll();
    toast('Product deleted');
  } catch (err) {
    toast(err.message || 'Could not delete product.');
  }
}

function uploadPhotos(e) {
  const files = [...e.target.files];
  if (!files.length) return;
  const photos = getPhotos();
  let done = 0;
  let failed = 0;

  files.forEach((file) => {
    readImageFile(
      file,
      (dataUrl) => {
        photos.push({
          id: Date.now() + Math.random(),
          name: file.name,
          src: dataUrl,
          date: new Date().toLocaleDateString(),
        });
        done++;
        finishUpload();
      },
      () => {
        failed++;
        done++;
        finishUpload();
      }
    );
  });

  function finishUpload() {
    if (done !== files.length) return;
    if (!savePhotos(photos)) {
      toast('Could not save photos — browser storage may be full.');
      return;
    }
    renderPhotos();
    renderStats();
    const saved = files.length - failed;
    if (saved) toast(saved + ' photo(s) uploaded! 📸');
    if (failed) toast(failed + ' file(s) skipped (invalid type or too large).');
  }

  e.target.value = '';
}

function renderPhotos() {
  const photos = getPhotos();
  document.getElementById('photoCount').textContent = photos.length;
  const grid = document.getElementById('photoGrid');

  if (!photos.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">📸</div>
      <h4>No photos uploaded yet</h4>
      <p>Upload product photos here for your library. You can also attach images directly when adding a product.</p>
    </div>`;
    return;
  }

  grid.innerHTML = photos
    .map(
      (ph) => `<div class="photo-item">
      <img src="${ph.src}" alt="${escapeHtml(ph.name)}">
      <button class="photo-del" type="button" data-photo-id="${ph.id}" title="Delete">✕</button>
      <div class="photo-item-label">
        <p>${escapeHtml(ph.name.substring(0, 22))}</p>
        <span>${escapeHtml(ph.date)}</span>
      </div>
    </div>`
    )
    .join('');

  grid.querySelectorAll('[data-photo-id]').forEach((btn) => {
    btn.addEventListener('click', () => deletePhoto(btn.getAttribute('data-photo-id')));
  });
}

function deletePhoto(id) {
  if (!confirm('Remove this photo?')) return;
  const photos = getPhotos().filter((p) => p.id != id);
  savePhotos(photos);
  renderPhotos();
  renderStats();
  toast('Photo removed');
}

function changePassword() {
  if (isLiveAdminMode()) {
    alert(
      'Live mode uses Supabase Auth for the one admin account.\n\n' +
        'Change the password in Supabase Dashboard → Authentication → Users.\n\n' +
        'Customers do not have accounts on this site.'
    );
    return;
  }
  const cur = document.getElementById('curPass').value;
  const nw = document.getElementById('newPass').value;
  const cf = document.getElementById('confPass').value;
  const creds = getCreds();
  if (cur !== creds.pass) {
    alert('Current password is incorrect');
    return;
  }
  if (!nw) {
    alert('New password cannot be empty');
    return;
  }
  if (nw !== cf) {
    alert('New passwords do not match');
    return;
  }
  storageSet(YI_KEYS.pass, nw);
  document.getElementById('curPass').value = '';
  document.getElementById('newPass').value = '';
  document.getElementById('confPass').value = '';
  toast('Password updated! 🔑');
}

async function saveWA() {
  clearFieldErrors();
  const n = document.getElementById('waNumber').value.trim();
  const validation = validateWhatsApp(n);
  if (!validation.ok) {
    showFieldError('waNumber', 'errWa', validation.message);
    return;
  }
  setWA(validation.digits);
  document.getElementById('waNumber').value = validation.digits;
  try {
    if (isSupabaseMode()) {
      await persistSettingsToSupabase({ whatsapp_number: validation.digits });
    }
    toast('WhatsApp number saved!');
  } catch (err) {
    toast(err.message || 'Could not save to Supabase.');
  }
}

function resetAll() {
  if (isLiveAdminMode()) {
    toast('Reset is not available in live mode. Delete products individually or use the Supabase dashboard.');
    return;
  }
  if (!confirm('This will delete ALL products and photos. Are you sure?')) return;
  if (!confirm('This cannot be undone. Confirm reset?')) return;
  localStorage.removeItem(YI_KEYS.products);
  localStorage.removeItem(YI_KEYS.photos);
  ensureProductsSeed();
  renderAll();
  renderPhotos();
  toast('Data reset complete');
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

document.getElementById('productModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

function updateLoginHint() {
  const hint = document.getElementById('loginHint');
  const pwdCard = document.getElementById('localPasswordCard');
  const resetCard = document.getElementById('localResetCard');
  const user = document.getElementById('loginUser');

  const settingsSub = document.getElementById('settingsSub');
  if (isLiveAdminMode()) {
    if (hint) {
      hint.innerHTML =
        '<strong>Live mode.</strong> Sign in with the <strong>one admin</strong> email and password from ' +
        'Supabase → Authentication → Users. Disable public sign-ups. Customers never log in.';
    }
    if (settingsSub) {
      settingsSub.textContent =
        'Update WhatsApp and shop details. Admin password: Supabase Dashboard → Authentication → Users.';
    }
    if (user) {
      user.type = 'email';
      user.placeholder = 'Admin email';
      user.autocomplete = 'email';
    }
    if (pwdCard) pwdCard.style.display = 'none';
    if (resetCard) resetCard.style.display = 'none';
    return;
  }

  if (hint) {
    hint.innerHTML = 'Local demo: <strong>admin</strong> / <strong>yarnit2024</strong> (browser only, no Supabase).';
  }
  if (settingsSub) {
    settingsSub.textContent = 'Update your shop info and login password (local demo only).';
  }
  if (user) {
    user.type = 'text';
    user.placeholder = 'Username';
    user.autocomplete = 'username';
  }
  if (pwdCard) pwdCard.style.display = 'block';
  if (resetCard) resetCard.style.display = 'block';
}

(async function initAdmin() {
  updateLoginHint();
  if (isLiveAdminMode()) {
    const session = await window.yarnitSupabase.getSession();
    if (session) {
      const ok = await hydrateAdminFromSupabase();
      if (ok) {
        showAdminScreen();
        setLiveAdminBanner();
        return;
      }
      await window.yarnitSupabase.signOut();
    }
    return;
  }
  ensureProductsSeed();
})();
