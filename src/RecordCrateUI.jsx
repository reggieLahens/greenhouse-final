import React, { useEffect, useState } from 'react'
import { useStore } from './Store'

export const RecordCrateUI = () => {
  const spotifyToken = useStore(state => state.spotifyToken)
  const isRecordCrateOpen = useStore(state => state.isRecordCrateOpen)
  const setRecordCrateOpen = useStore(state => state.setRecordCrateOpen)
  const [tracks, setTracks] = useState([])
  const setCurrentTrack = useStore(state => state.setCurrentTrack)
  const setIsPlaying = useStore(state => state.setIsPlaying)
  const setGlobalDeviceId = useStore(state => state.setDeviceId)
  
  useEffect(() => {
    if (!spotifyToken) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Greenhouse DJ Booth',
        getOAuthToken: cb => { cb(spotifyToken); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('[Spotify SDK] Ready with Device ID', device_id);
        setGlobalDeviceId(device_id);

        // Force browser playback and seamlessly hijack user's active device natively
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${spotifyToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_ids: [device_id], play: false }) // Wait for manual start
        }).catch(err => console.error("Playback Transfer Failed:", err));
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('[Spotify SDK] Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', state => {
        if (!state) return;
        setIsPlaying(!state.paused);
        setCurrentTrack(state.track_window.current_track);
      });

      player.connect();
    };

    // Dynamically inject the script ONLY after the hook is mapped to the window
    if (!document.getElementById('spotify-sdk')) {
      const script = document.createElement('script');
      script.id = 'spotify-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.Spotify) {
      // If it already loaded from a previous mount, force init
      window.onSpotifyWebPlaybackSDKReady();
    }
  }, [spotifyToken, setCurrentTrack, setIsPlaying])

  useEffect(() => {
    if (spotifyToken) {
      fetch('https://api.spotify.com/v1/playlists/6OIJBWbvgbXcF45q0DwEvD/tracks', {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      })
      .then(res => res.json())
      .then(data => {
         if(data.items) setTracks(data.items.map(item => item.track));
      })
      .catch(err => console.error(err));
    }
  }, [spotifyToken])

  const globalDeviceId = useStore(state => state.deviceId)

  const playSong = (uri) => {
    if (!globalDeviceId || !spotifyToken) return;
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${globalDeviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [uri] }),
    });
  };

  if (!isRecordCrateOpen) return null;

  return (
    <div style={{
      position: 'absolute', top: '10%', right: '5%', width: '30%', height: '80%',
      backgroundColor: 'rgba(10,10,10,0.95)', border: '1px solid #333',
      borderRadius: '10px', color: 'white', overflowY: 'auto', zIndex: 1000,
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, fontWeight: 'normal', letterSpacing: '2px' }}>RECORD CRATE</h2>
        <button onClick={() => setRecordCrateOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer' }}>X</button>
      </div>

      {!spotifyToken ? (
        <a href="/api/auth/login" style={{ padding: '15px', background: '#1DB954', color: 'white', textAlign: 'center', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', marginTop: '20px' }}>
          CONNECT SPOTIFY
        </a>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'scroll' }}>
          {tracks.map(track => (
             <div key={track.id} onClick={() => playSong(track.uri)} style={{ display: 'flex', gap: '15px', cursor: 'pointer', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', alignItems: 'center' }}>
               <img src={track.album.images[0]?.url} alt={track.album.name} style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
               <div>
                 <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>{track.name}</p>
                 <p style={{ margin: 0, color: '#aaa', fontSize: '11px' }}>{track.artists.map(a => a.name).join(', ')}</p>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  )
}
