// Vercel serverless function. Secrets belong in Vercel Environment Variables.
const ALLOWED_ORIGINS = new Set([
  'https://www.gallatindemo.com', 'https://gallatindemo.com',
  'https://gallatin-demo-v6.vercel.app'
]);
const str = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ error: 'Origin not allowed' });
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error: 'CRM not configured' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  if (str(b.company_website, 500)) return res.status(200).json({ ok: true }); // honeypot
  const name = str(b.name, 200), email = str(b.email, 254), phone = str(b.phone, 50);
  if (!name || !email || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Valid name, email and phone are required' });
  const services = Array.isArray(b.services) ? b.services.filter(x => typeof x === 'string').slice(0, 20).map(x => str(x, 80)) : [];
  const description = [
    str(b.project_type, 100) && 'Project type: ' + str(b.project_type, 100),
    services.length && 'Services: ' + services.join(', '),
    str(b.contact_method, 50) && 'Preferred contact: ' + str(b.contact_method, 50),
    str(b.message, 5000)
  ].filter(Boolean).join('\n');
  const record = { name, email, phone, address: str(b.address, 500), description, source: 'Website', status: 'New' };
  if (typeof b.submission_id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.submission_id)) record.submission_id = b.submission_id;
  try {
    const response = await fetch(SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/leads', {
      method: 'POST',
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(record), signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 409 && record.submission_id && detail.includes('leads_submission_id_key')) return res.status(200).json({ ok: true, duplicate: true });
      console.error('CRM lead insert failed:', response.status, detail.slice(0, 600));
      return res.status(502).json({ error: 'CRM delivery failed' });
    }
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('CRM network error:', err.message);
    return res.status(502).json({ error: 'CRM unavailable' });
  }
};
