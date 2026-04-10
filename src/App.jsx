import React, { Suspense, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Canvas } from "@react-three/fiber"
import { Physics } from "@react-three/cannon"
import { useProgress } from "@react-three/drei"
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Player } from "./Player"
import { Scene } from "./Scene"
import { Overlay } from "./Overlay"
import { WebcamUI } from "./WebcamUI"
import { RecordCrateUI } from "./RecordCrateUI"
import { OnboardingUI } from "./OnboardingUI"
import { useStore } from './Store'
import * as THREE from 'three'

function App() {
  const [clicked, setClicked] = useState(false)
  const [ready, setReady] = useState(false)
  const [shirtColor, setShirtColor] = useState('white')
  const [webcamActive, setWebcamActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const { progress } = useProgress()
  const spotifyToken = useStore(state => state.spotifyToken)
  const setSpotifyToken = useStore(state => state.setSpotifyToken)
  const isNearBooth = useStore(state => state.isNearBooth)
  const isRecordCrateOpen = useStore(state => state.isRecordCrateOpen)
  const isOnboardingComplete = useStore(state => state.isOnboardingComplete)

  const deviceId = useStore(state => state.deviceId)
  const isPlaying = useStore(state => state.isPlaying)

  const skipTrack = async (direction) => {
    if (!spotifyToken || !deviceId) return;

    if (direction === 'previous') {
       fetch(`https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`, {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${spotifyToken}` }
       }).catch(err => console.error("Prev Failed", err));
    } else {
       if (isPlaying) {
         fetch(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${spotifyToken}` }
         }).catch(err => console.error("Skip Failed", err));
       } else {
         fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
           method: 'PUT',
           headers: { 'Authorization': `Bearer ${spotifyToken}`, 'Content-Type': 'application/json' },
           body: JSON.stringify({ context_uri: "spotify:playlist:6OIJBWbvgbXcF45q0DwEvD" })
         }).catch(err => console.error("Play Failed", err));
       }
    }
  };

  useEffect(() => {
    if (progress === 100) {
      setReady(true)
    }
  }, [progress])

  useEffect(() => {
    // Parse OAuth return
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('spotify_token');
    if (token) {
      setSpotifyToken(token);
      // Clean up the URL securely
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setSpotifyToken])

  return (
    <>
      <Overlay ready={ready} clicked={clicked} setClicked={setClicked} />
      {clicked && !isOnboardingComplete && <OnboardingUI />}
      {webcamActive && (
        <WebcamUI setCapturedPhoto={setCapturedPhoto} closeWebcam={() => setWebcamActive(false)} />
      )}
      <RecordCrateUI />

      {/* Static Override Debugger */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '60px',
        background: '#121212', borderBottom: '2px solid #1DB954',
        zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px'
      }}>
        {!spotifyToken ? (
          <a href="/api/auth/login" style={{ padding: '10px 20px', background: '#1DB954', color: 'white', textDecoration: 'none', fontWeight: 'bold', borderRadius: '5px' }}>
            LOGIN TO SPOTIFY
          </a>
        ) : (
          <div style={{ color: '#1DB954', fontWeight: 'bold', fontFamily: 'monospace' }}>SPOTIFY CONNECTED</div>
        )}
      </div>



      <Canvas 
        shadows 
        camera={{ fov: 50, position: [0, 5, 10] }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2 
        }}
        style={{ background: '#020202' }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Player shirtColor={shirtColor} />
            <Scene clicked={clicked} shirtColor={shirtColor} setShirtColor={setShirtColor} setWebcamActive={setWebcamActive} capturedPhoto={capturedPhoto} />
          </Physics>
          <EffectComposer>
            <Bloom luminanceThreshold={1.2} mipmapBlur intensity={1.5} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Dynamic 2D Proximity Console (Glassmorphism) - Layered Over Canvas */}
      {clicked && isNearBooth && !isRecordCrateOpen && createPortal(
        <div style={{
          position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          padding: '20px 40px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.25)',
          zIndex: 2147483647, color: 'white', fontFamily: 'sans-serif', textAlign: 'center', pointerEvents: 'auto',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
          <div style={{ fontWeight: 'normal', fontSize: '20px', marginBottom: '15px', letterSpacing: '1px' }}>
            Spin New Record?
          </div>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
             <button onClick={(e) => { e.stopPropagation(); skipTrack('previous') }} style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #1DB954', padding: '10px 20px', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', pointerEvents: 'auto' }}>
               [-] Previous (P)
             </button>
             <button onClick={(e) => { e.stopPropagation(); skipTrack('next') }} style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #1DB954', padding: '10px 20px', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', pointerEvents: 'auto' }}>
               [+] Next (N)
             </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default App
