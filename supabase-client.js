/**
 * Yarn It! — Supabase browser client (static HTML/JS, not Next.js).
 *
 * AUTH MODEL (read before changing):
 * - The shop (index.html) is public: visitors browse products without logging in.
 * - Exactly ONE Supabase Auth user is required: the shop admin (email + password).
 * - admin.html uses signInWithPassword for that admin only.
 * - Do NOT add customer sign-up, customer login, or customer accounts.
 * - Create the admin in Supabase Dashboard → Authentication → Users (disable public sign-ups).
 *
 * Requires: supabase.env.js (from .env.local) + CDN @supabase/supabase-js
 */
(function () {
  function isConfigured() {
    return Boolean(
      window.YARNIT_SUPABASE &&
        window.YARNIT_SUPABASE.url &&
        window.YARNIT_SUPABASE.key &&
        typeof window.supabase !== 'undefined' &&
        window.supabase.createClient
    );
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!window.__yarnitSupabaseClient) {
      window.__yarnitSupabaseClient = window.supabase.createClient(
        window.YARNIT_SUPABASE.url,
        window.YARNIT_SUPABASE.key
      );
    }
    return window.__yarnitSupabaseClient;
  }

  window.yarnitSupabase = {
    isConfigured,
    getClient,

    /** True when supabase.env.js is present (live database mode). */
    isLiveMode() {
      return isConfigured();
    },

    async getSession() {
      const sb = getClient();
      if (!sb) return null;
      const { data } = await sb.auth.getSession();
      return data.session;
    },

    /** Admin dashboard only — not for customers. */
    async signIn(email, password) {
      const sb = getClient();
      if (!sb) throw new Error('Supabase is not configured');
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.session;
    },

    async signOut() {
      const sb = getClient();
      if (!sb) return;
      await sb.auth.signOut();
    },
  };
})();
