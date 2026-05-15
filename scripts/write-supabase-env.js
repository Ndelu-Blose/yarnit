/**
 * Reads .env.local and writes supabase.env.js for static HTML (no bundler).
 * Run: npm run supabase:env
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env.local');
const outPath = path.join(root, 'supabase.env.js');

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

if (!fs.existsSync(envPath)) {
  console.warn('No .env.local found — skip supabase.env.js (localStorage demo mode).');
  process.exit(0);
}

const env = parseEnv(fs.readFileSync(envPath, 'utf8'));
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const key =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or publishable/anon key in .env.local');
  process.exit(1);
}

const body =
  '// Auto-generated from .env.local — do not commit (gitignored)\n' +
  'window.YARNIT_SUPABASE = ' +
  JSON.stringify({ url, key }, null, 2) +
  ';\n';

fs.writeFileSync(outPath, body, 'utf8');
console.log('Wrote supabase.env.js');
