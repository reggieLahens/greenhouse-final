import React, { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Physics } from "@react-three/cannon"
import { useProgress } from "@react-three/drei"
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Player } from "./Player"
import { Scene } from "./Scene"
import { Overlay } from "./Overlay"
import { WebcamUI } from "./WebcamUI"
import * as THREE from 'three'

function App() {
  const [clicked, setClicked] = useState(false)
  const [ready, setReady] = useState(false)
  const [shirtColor, setShirtColor] = useState('white')
  const [webcamActive, setWebcamActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const { progress } = useProgress()

  useEffect(() => {
    if (progress === 100) {
      setReady(true)
    }
  }, [progress])

  return (
    <>
      <Overlay ready={ready} clicked={clicked} setClicked={setClicked} />
      {webcamActive && (
        <WebcamUI setCapturedPhoto={setCapturedPhoto} closeWebcam={() => setWebcamActive(false)} />
      )}
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
    </>
  )
}

export default App
