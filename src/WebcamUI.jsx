import React, { useEffect, useRef, useState } from 'react';

export const WebcamUI = ({ setCapturedPhoto, closeWebcam }) => {
  const videoRef = useRef(null);
  const [countdown, setCountdown] = useState(3);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let activeStream = null;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((mediaStream) => {
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error("Webcam access denied", err);
        closeWebcam();
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [closeWebcam]);

  useEffect(() => {
    if (!stream) return; 

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(dataUrl);
      }
      
      closeWebcam();
    }
  }, [countdown, stream, setCapturedPhoto, closeWebcam]);

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.9)', padding: '20px', borderRadius: '12px', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <h2 style={{ color: 'white', margin: '0 0 10px 0', fontFamily: 'sans-serif' }}>Get Ready... {countdown}</h2>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ width: '400px', borderRadius: '8px', transform: 'scaleX(-1)' }} 
      />
    </div>
  );
};
