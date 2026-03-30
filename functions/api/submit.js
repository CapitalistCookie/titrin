export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const address = formData.get('address') || '';
    const alr = formData.get('alr') || '';
    const project = formData.get('project') || '';
    const timeline = formData.get('timeline') || '';
    const message = formData.get('message') || '';

    // Send email via Mailchannels (free with Cloudflare Workers)
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
      // Redirect to thank you page
      return Response.redirect(new URL('/thank-you.html', context.request.url).toString(), 302);
    } else {
      const errorText = await response.text();
      console.error('Mailchannels error:', response.status, errorText);
      // Still redirect - don't show error to user
      return Response.redirect(new URL('/thank-you.html', context.request.url).toString(), 302);
    }
  } catch (err) {
    console.error('Form submission error:', err);
    return Response.redirect(new URL('/thank-you.html', context.request.url).toString(), 302);
  }
}
