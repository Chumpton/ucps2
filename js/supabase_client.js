// ============================================================
//  SUPABASE CLIENT — Cosmic Compass
//  Replace SUPABASE_URL and SUPABASE_ANON_KEY with your real
//  project values from the Supabase dashboard.
// ============================================================

const SUPABASE_URL = 'https://frzmofxytxhuuusxbxea.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyem1vZnh5dHhodXV1c3hieGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODQ2ODUsImV4cCI6MjA4ODY2MDY4NX0.VXoZGy3GQ_s7IqLQZCMwNcLrLbo4dkHcNCjPfwatVwI';

// Lightweight fetch wrapper — no SDK required.
async function supabaseInsert(table, payload) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const err = await res.text();
        console.error(`[Supabase] Insert to "${table}" failed:`, err);
        return { ok: false, error: err };
    }
    return { ok: true };
}

// ── PUBLIC API ───────────────────────────────────────────────

/**
 * Save a compass calibration + email to Supabase.
 *
 * Expected Supabase table: `compass_calibrations`
 *   name          text
 *   email         text
 *   birth_date    text  (YYYY-MM-DD)
 *   birth_time    text  (HH:MM AM/PM)
 *   birth_location text
 *   birth_lat      numeric
 *   birth_lng      numeric
 *   subscribe      boolean
 *   sun_sign       text
 *   hd_type        text
 *   hd_profile     text
 *   z_node         text   (soul node coordinate)
 *   serial_number  text   (cosmic serial number)
 *   created_at     timestamptz  (default: now())
 */
async function saveCalibration(data) {
    return supabaseInsert('compass_calibrations', data);
}

/**
 * Save a feedback submission to Supabase.
 *
 * Expected Supabase table: `feedback`
 *   name       text
 *   email      text
 *   message    text
 *   created_at timestamptz  (default: now())
 */
async function saveFeedback(data) {
    return supabaseInsert('feedback', data);
}

/**
 * Subscribe an email to the mailing list only (no calibration).
 *
 * Expected Supabase table: `email_list`
 *   email      text  (unique)
 *   source     text  ('compass' | 'feedback' | 'standalone')
 *   created_at timestamptz  (default: now())
 */
async function subscribeEmail(email, source = 'standalone') {
    return supabaseInsert('email_list', { email, source });
}

window.CosmicDB = { saveCalibration, saveFeedback, subscribeEmail };
