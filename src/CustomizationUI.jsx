import React from 'react';

export const CustomizationUI = ({ shirtColor, setShirtColor }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '20px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'sans-serif',
      zIndex: 100,
      border: '1px solid #333'
    }}>
      <h3 style={{ margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1rem' }}>
        Custom Lab
      </h3>
      <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#ccc' }}>Select T-Shirt Color:</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        {['white', 'black', '#800000'].map((colorStr) => (
          <button
            key={colorStr}
            onClick={() => setShirtColor(colorStr)}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: colorStr,
              border: shirtColor === colorStr ? '2px solid #fff' : '2px solid transparent',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
              transition: 'border 0.2s'
            }}
            title={colorStr}
          />
        ))}
      </div>
    </div>
  );
};
