/**
 * Assemble a static public/ folder for Vercel (index.html lives at repo root, not in dist/).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'public');

const ROOT_FILES = [
  'index.html',
  'admin.html',
  'styles.css',
  'config.js',
  'store.js',
  'shop.js',
  'admin.js',
  'supabase-client.js',
  'supabase-data.js',
];

function copyRootFiles() {
  for (const file of ROOT_FILES) {
    const src = path.join(root, file);
    if (!fs.existsSync(src)) {
      console.warn('[vercel] skip missing file:', file);
      continue;
    }
    fs.copyFileSync(src, path.join(out, file));
  }
}

function copyDist() {
  const distSrc = path.join(root, 'dist');
  const distOut = path.join(out, 'dist');
  if (!fs.existsSync(distSrc)) {
    throw new Error('dist/ not found — run npm run build first');
  }
  fs.mkdirSync(distOut, { recursive: true });
  for (const file of fs.readdirSync(distSrc)) {
    fs.copyFileSync(path.join(distSrc, file), path.join(distOut, file));
  }
}

function copyAssets() {
  const assetsSrc = path.join(root, 'assets');
  if (!fs.existsSync(assetsSrc)) return;
  fs.cpSync(assetsSrc, path.join(out, 'assets'), { recursive: true });
}

function writeSupabaseEnvStub() {
  const envSrc = path.join(root, 'supabase.env.js');
  const envOut = path.join(out, 'supabase.env.js');
  if (fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, envOut);
    return;
  }
  const example = path.join(root, 'supabase.env.example.js');
  if (fs.existsSync(example)) {
    fs.copyFileSync(example, envOut);
    return;
  }
  fs.writeFileSync(
    envOut,
    'window.__YARNIT_SUPABASE__ = { url: "", anonKey: "" };\n',
    'utf8'
  );
}

if (fs.existsSync(out)) {
  fs.rmSync(out, { recursive: true, force: true });
}
fs.mkdirSync(out, { recursive: true });

copyRootFiles();
copyDist();
copyAssets();
writeSupabaseEnvStub();

console.log('[vercel] public/ ready at', out);
