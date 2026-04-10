export default async function handler(req, res) {
  const code = req.query.code || null;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  const host = req.headers.host || '127.0.0.1:3000';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

  // Hard enforce 127.0.0.1 callback bridge for local testing, fallback to env
  const redirect_uri = isLocal 
    ? `http://127.0.0.1:3000/api/auth/callback`
    : process.env.SPOTIFY_REDIRECT_URI;

  if (!code) {
    return res.redirect('/?error=no_code_provided');
  }

  const authOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    body: new URLSearchParams({
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    }).toString()
  };

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    const data = await response.json();

    if (data.access_token) {
      // Redirect back to the frontend with the token embedded
      res.redirect(`/?spotify_token=${data.access_token}`);
    } else {
      res.redirect(`/?error=invalid_token`);
    }
  } catch (error) {
    res.redirect(`/?error=fetch_failed`);
  }
}
