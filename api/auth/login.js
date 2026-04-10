export default function handler(req, res) {
  const scope = "streaming user-read-email user-read-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state";
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  
  // Force the Spotify handshake to strictly route through the whitelisted 127.0.0.1 mapping
  const host = req.headers.host || '127.0.0.1:3000';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const protocol = isLocal ? 'http' : 'https';
  
  // If local, force 127.0.0.1 to avoid Spotify dashboard restrictions. Otherwise use Prod ENV.
  const redirect_uri = isLocal 
    ? `http://127.0.0.1:3000/api/auth/callback`
    : process.env.SPOTIFY_REDIRECT_URI;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
