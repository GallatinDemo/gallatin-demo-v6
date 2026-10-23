// Vercel serverless function. Secrets are configured in Vercel, NEVER in public HTML.
const MAX_BODY_BYTES = 16000;
const clean = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const length = Number(req.headers['content-length'] || 0);
  if (length > MAX_BODY_BYTES) return res.status(413).json({ error: 'Request too large' });
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('CRM intake environment variables are missing');
    return res.status(503).json({ error: 'Intake temporarily unavailable' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Invalid request' });
    if (clean(body.website)) return res.status(200).json({ ok: true }); // spam honeypot
    const name = clean(body.name, 200);
    const phone = clean(body.phone, 100);
    const email = clean(body.email, 254);
    const address = clean(body.address, 500);
    const message = clean(body.message, 5000);
    const projectType = clean(body.project_type, 100);
    const contactMethod = clean(body.contact_method, 100);
    const services = Array.isArray(body.services) ? body.services.slice(0, 20).map(s => clean(s, 100)).filter(Boolean) : [];
    if (!name || !phone || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Name, phone and valid email are required' });
    }
    const description = [
      projectType && `Project type: ${projectType}`,
      services.length && `Services: ${services.join(', ')}`,
      contactMethod && `Preferred contact: ${contactMethod}`,
      message && `Customer message:\n${message}`
    ].filter(Boolean).join('\n\n').slice(0, 10000);
    const apiResponse = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name, phone, email, address, description, source: 'Website quote form', status: 'New' })
    });
    if (!apiResponse.ok) {
      console.error('Supabase lead insert failed', apiResponse.status, (await apiResponse.text()).slice(0, 500));
      return res.status(502).json({ error: 'Intake temporarily unavailable' });
    }
    // Optional: send the original email notification through Formspree after the CRM insert.
    // Set FORMSPREE_URL in Vercel if you want these email notifications retained.
    const formspreeUrl = process.env.FORMSPREE_URL;
    if (formspreeUrl) {
      try {
        const formData = new URLSearchParams();
        for (const [key, val] of Object.entries({ name, phone, email, address, project_type: projectType, message, contact_method: contactMethod })) formData.append(key, val);
        services.forEach(service => formData.append('services', service));
        const notification = await fetch(formspreeUrl, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData });
        if (!notification.ok) console.error('Formspree notification failed', notification.status);
      } catch (error) { console.error('Formspree notification failed', error.message); }
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Quote endpoint failed', error.message);
    return res.status(500).json({ error: 'Intake temporarily unavailable' });
  }
};
