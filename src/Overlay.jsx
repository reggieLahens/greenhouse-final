import React from 'react'

export const Overlay = ({ ready, clicked, setClicked }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: clicked ? 'none' : 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#0a0a0a',
      color: 'white',
      zIndex: 1000,
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ marginBottom: 20, fontSize: '3rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Greenhouse Activation</h1>
      <button 
        disabled={!ready}
        onClick={() => setClicked(true)}
        style={{
          padding: '15px 40px',
          fontSize: '1.2rem',
          background: ready ? '#2B4032' : '#333',
          color: ready ? 'white' : '#888',
          border: 'none',
          cursor: ready ? 'pointer' : 'not-allowed',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderRadius: 4,
          transition: 'all 0.3s ease'
        }}
      >
        {ready ? 'Enter Activation' : 'Loading Assets...'}
      </button>
    </div>
  )
}
