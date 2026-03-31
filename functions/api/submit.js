const EMAIL_WORKER = "https://titrin-email.j1115cruz.workers.dev";
const AUTH_KEY = "b19ae04663c2772fec8c9e690c8a04a0";

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    // Honeypot
    if (formData.get('website')) {
      return Response.redirect(new URL('/thank-you', context.request.url).toString(), 302);
    }

    // Timing
    const ts = parseInt(formData.get('_ts') || '0');
    if (ts && (Date.now() - ts) < 3000) {
      return Response.redirect(new URL('/thank-you', context.request.url).toString(), 302);
    }

    // Sanitize
    function clean(str, max = 500) {
      return String(str || '').replace(/<[^>]*>/g, '').trim().substring(0, max);
    }

    const name = clean(formData.get('name'), 100);
    const email = clean(formData.get('email'), 100);
    const address = clean(formData.get('address'), 200);
    const alr = clean(formData.get('alr'), 20);
    const project = clean(formData.get('project'), 300);
    const timeline = clean(formData.get('timeline'), 100);
    const message = clean(formData.get('message'), 2000);

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.redirect(new URL('/contact?error=1', context.request.url).toString(), 302);
    }

    // Send via email Worker
    try {
      const res = await fetch(EMAIL_WORKER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Key': AUTH_KEY,
        },
        body: JSON.stringify({ name, email, address, alr, project, timeline, message }),
      });
      const result = await res.json();
      console.log('Email worker response:', JSON.stringify(result));
    } catch (e) {
      console.error('Email worker error:', e.message);
    }

    return Response.redirect(new URL('/thank-you', context.request.url).toString(), 302);
  } catch (err) {
    console.error('Form error:', err);
    return Response.redirect(new URL('/thank-you', context.request.url).toString(), 302);
  }
}
