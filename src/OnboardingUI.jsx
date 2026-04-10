import React from 'react'
import { createPortal } from 'react-dom'
import { useStore } from './Store'

export const OnboardingUI = () => {
  const setOnboardingComplete = useStore(state => state.setOnboardingComplete)

  const KeyUI = ({ label }) => (
    <div style={{
      width: '40px', height: '40px', background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontSize: '20px', fontWeight: 'bold', color: 'white'
    }}>{label}</div>
  )

  const MouseGraphic = () => (
    <div style={{
      width: '30px', height: '46px', border: '2px solid white', borderRadius: '15px',
      position: 'relative', display: 'flex', justifyContent: 'center', marginTop: '10px'
    }}>
      <div style={{ width: '4px', height: '10px', background: 'white', borderRadius: '2px', marginTop: '6px' }} />
    </div>
  )

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 2147483647, display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: 'rgba(0,0,0,0.4)', pointerEvents: 'auto',
      color: 'white', fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', padding: '50px',
        maxWidth: '600px', width: '90%', textAlign: 'center', boxShadow: '0 16px 64px 0 rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '40px', letterSpacing: '1px', textTransform: 'uppercase' }}>Welcome to the Space</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '40px', padding: '0 20px' }}>
          {/* Controls: Walk */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ color: '#aaa', fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>Walk Around</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <KeyUI label="↑" />
              <div style={{ display: 'flex', gap: '6px' }}>
                <KeyUI label="←" />
                <KeyUI label="↓" />
                <KeyUI label="→" />
              </div>
            </div>
          </div>
          
          {/* Controls: Look */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingTop: '0px' }}>
            <div style={{ color: '#aaa', fontSize: '14px', textTransform: 'uppercase', marginBottom: '7px', fontWeight: 'bold', letterSpacing: '1px' }}>Look Around</div>
            <MouseGraphic />
          </div>
        </div>

        {/* Missions */}
        <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '16px', marginBottom: '30px' }}>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>Explore the Activations</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '18px' }}><span style={{ fontSize: '24px' }}>🎧</span> <span><strong>DJ Booth:</strong> Change tracks (Spotify login required).</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '18px' }}><span style={{ fontSize: '24px' }}>👕</span> <span><strong>Customization:</strong> Get a new shirt.</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '18px' }}><span style={{ fontSize: '24px' }}>📸</span> <span><strong>Photo Booth:</strong> Head to the photo booth for a photo.</span></li>
          </ul>
        </div>

        <div style={{ color: '#1DB954', fontSize: '16px', fontWeight: 'bold', marginBottom: '35px', padding: '15px', border: '1px dashed #1DB954', borderRadius: '8px', background: 'rgba(29, 185, 84, 0.1)' }}>
          TIP: Connect Spotify at the top for the full experience.
        </div>

        <button 
          onClick={() => setOnboardingComplete(true)}
          style={{
            background: 'white', color: 'black', fontWeight: 'bold', fontSize: '22px', 
            padding: '16px 48px', border: 'none', borderRadius: '30px', cursor: 'pointer',
            transition: 'transform 0.2s', textTransform: 'uppercase', letterSpacing: '2px'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          START
        </button>
      </div>
    </div>,
    document.body
  )
}
