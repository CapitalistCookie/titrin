export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    // Honeypot check - if this hidden field has a value, it's a bot
    const honeypot = formData.get('website') || '';
    if (honeypot) {
      // Bot detected - silently redirect without sending email
      return Response.redirect(new URL('/thank-you.html', context.request.url).toString(), 302);
    }

    // Rate limiting via simple timestamp check
    const submitted = formData.get('_ts') || '';
    const now = Date.now();
    if (submitted && (now - parseInt(submitted)) < 3000) {
      // Form submitted in under 3 seconds - likely a bot
      return Response.redirect(new URL('/thank-you.html', context.request.url).toString(), 302);
    }

    // Sanitize inputs - strip HTML tags and limit length
    function sanitize(str, maxLen = 500) {
      return String(str || '').replace(/<[^>]*>/g, '').trim().substring(0, maxLen);
    }

    const name = sanitize(formData.get('name'), 100);
    const email = sanitize(formData.get('email'), 100);
    const address = sanitize(formData.get('address'), 200);
    const alr = sanitize(formData.get('alr'), 20);
    const project = sanitize(formData.get('project'), 300);
    const timeline = sanitize(formData.get('timeline'), 100);
    const message = sanitize(formData.get('message'), 2000);

    // Validate required fields
    if (!name || !email) {
      return Response.redirect(new URL('/contact.html?error=required', context.request.url).toString(), 302);
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.redirect(new URL('/contact.html?error=email', context.request.url).toString(), 302);
    }

    const emailBody = `
New Contact Form Submission
===========================

Name: ${name}
Email: ${email}
Property Address/PID: ${address}
ALR: ${alr}
Project Type: ${project}
Timeline: ${timeline}

Message:
${message}
    `.trim();

    const sendRequest = new Request('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'titrinsolutions@gmail.com', name: 'Titrin Solutions' }],
          },
        ],
        from: {
          email: 'noreply@titrin.ca',
          name: 'Titrin Website',
        },
        reply_to: {
          email: email,
          name: name,
        },
        subject: `New enquiry from ${name}`,
        content: [
          {
            type: 'text/plain',
            value: emailBody,
          },
        ],
      }),
    });

    const response = await fetch(sendRequest);

    if (response.ok || response.status === 202) {
      return Response.redirect(new URL('/thank-you.html', context.request.url).toString(), 302);
    } else {
      console.error('Mailchannels error:', response.status, await response.text());
      return Response.redirect(new URL('/thank-you.html', context.request.url).toString(), 302);
    }
  } catch (err) {
    console.error('Form submission error:', err);
    return Response.redirect(new URL('/thank-you.html', context.request.url).toString(), 302);
  }
}
