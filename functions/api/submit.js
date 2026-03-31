export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    // Honeypot check
    if (formData.get('website')) {
      return Response.redirect(new URL('/thank-you', context.request.url).toString(), 302);
    }

    // Timing check
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

    const body = [
      'New Contact Form Submission',
      '===========================',
      '',
      'Name: ' + name,
      'Email: ' + email,
      'Property Address/PID: ' + address,
      'ALR: ' + alr,
      'Project Type: ' + project,
      'Timeline: ' + timeline,
      '',
      'Message:',
      message,
    ].join('\n');

    // Try Cloudflare Email Worker binding
    if (context.env && context.env.EMAIL) {
      try {
        const mime = [
          'From: "Titrin Website" <noreply@titrin.ca>',
          'To: contact@titrin.ca',
          'Reply-To: ' + name + ' <' + email + '>',
          'Subject: New enquiry from ' + name,
          'Content-Type: text/plain; charset=utf-8',
          'MIME-Version: 1.0',
          '',
          body,
        ].join('\r\n');

        const msg = new EmailMessage('noreply@titrin.ca', 'contact@titrin.ca', new Response(mime).body);
        await context.env.EMAIL.send(msg);
        console.log('Email sent via binding');
      } catch (e) {
        console.error('Email binding error:', e.message);
      }
    }

    // Always log submission to Workers logs (visible in Cloudflare dashboard)
    console.log('SUBMISSION:', JSON.stringify({
      name, email, address, alr, project, timeline, message,
      time: new Date().toISOString()
    }));

    return Response.redirect(new URL('/thank-you', context.request.url).toString(), 302);
  } catch (err) {
    console.error('Form error:', err);
    return Response.redirect(new URL('/thank-you', context.request.url).toString(), 302);
  }
}
