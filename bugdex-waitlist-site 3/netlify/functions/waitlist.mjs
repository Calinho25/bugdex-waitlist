const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}

export default async (request) => {
  if (request.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' }, { Allow: 'POST' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'invalid_request' });
  }

  const { email = '', website = '', source = 'landing-page' } = body || {};

  // Honeypot: return a harmless success response to bots without storing anything.
  if (typeof website === 'string' && website.trim().length > 0) {
    return json(200, { status: 'joined' });
  }

  const normalisedEmail = String(email).trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalisedEmail) || normalisedEmail.length > 254) {
    return json(400, { error: 'invalid_email' });
  }

  const supabaseUrl = Netlify.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return json(500, { error: 'server_not_configured' });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/waitlist_signups`, {
      method: 'POST',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        email: normalisedEmail,
        source: typeof source === 'string' && source.trim()
          ? source.trim().slice(0, 80)
          : 'landing-page',
        status: 'waiting'
      })
    });

    if (response.ok) {
      return json(201, { status: 'joined' });
    }

    const errorPayload = await response.json().catch(() => ({}));

    // PostgreSQL unique violation: the email is already present.
    if (response.status === 409 || errorPayload.code === '23505') {
      return json(200, { status: 'already_joined' });
    }

    console.error('Supabase waitlist insert failed', errorPayload);
    return json(500, { error: 'database_error' });
  } catch (error) {
    console.error('Waitlist endpoint failed', error);
    return json(500, { error: 'server_error' });
  }
};
