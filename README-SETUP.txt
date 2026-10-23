GALLATIN DEMO WEBSITE -> CRM INTEGRATION

1. In the existing GitHub repo GallatinDemo/gallatin-demo-v6, replace root index.html with this index.html.
2. Create folder api in repo root, then add api/quote.js.
3. In Vercel project gallatin-demo-v6, Production environment variables must contain:
   SUPABASE_URL = your Supabase project URL
   SUPABASE_SERVICE_ROLE_KEY = your Supabase service_role secret (never put this in GitHub or HTML).
4. Commit changes. Vercel will deploy from main. Redeploy if environment variables were added after the last deployment.
5. Submit a TEST quote from www.gallatindemo.com. Check both email and Supabase leads (source Website).
6. If either fails, check Vercel project Logs for /api/quote, and Formspree dashboard for email delivery.

IMPORTANT: This is a starter integration, not a hardened public form service. Add server-side rate limiting and bot protection (e.g. Turnstile) before relying on it at scale. The origin header check and honeypot are not sufficient anti-abuse protection.

The form's original Formspree action is unchanged. A failed CRM request will not suppress Formspree email delivery. A failed Formspree request will not suppress the CRM insert. The page reports partial delivery honestly.

Only index.html and api/quote.js are included. Keep your existing CSS, nav.js, images, and project pages unchanged.
