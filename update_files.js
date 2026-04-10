const fs = require('fs');

// Patch Store.js
const storeContent = `import { create } from 'zustand'

export const useStore = create((set) => ({
  tshirtColor: '#ffffff',
  playerPosition: [0, 0, 0],
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  cycleColor: () => set((state) => {
    const colors = ['#ffffff', '#00FFCC', '#FF00FF', '#0000FF'];
    const currentIndex = colors.indexOf(state.tshirtColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    return { tshirtColor: colors[nextIndex] };
  }),
}))
`;
fs.writeFileSync('src/Store.js', storeContent);

// Patch Player.jsx
const playerContent = `import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import * as THREE from 'three'
import { useStore } from './Store'

const usePlayerControls = () => {
  const keys = useRef({ forward: false, backward: false, left: false, right: false })
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = true
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.backward = true
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = true
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = true
    }
    const handleKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = false
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.backward = false
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = false
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  return keys
}

export const Player = () => {
  const { camera } = useThree()
  // Angular factor [0,0,0] locks rotation so the proxy block avatar doesn't 'flop' around.
  const [ref, api] = useSphere(() => ({ 
      mass: 1, 
      type: 'Dynamic', 
      position: [0, 5, 8], 
      args: [0.3], 
      angularFactor: [0, 0, 0] 
  }), useRef())
  
  const keys = usePlayerControls()
  const setPlayerPosition = useStore(state => state.setPlayerPosition)
  
  const velocity = useRef([0, 0, 0])
  const position = useRef([0, 0, 0])
  
  useEffect(() => {
    const unsubV = api.velocity.subscribe((v) => (velocity.current = v))
    const unsubP = api.position.subscribe((p) => {
        position.current = p
        setPlayerPosition(p)
    })
    return () => { unsubV(); unsubP(); }
  }, [api.velocity, api.position, setPlayerPosition])

  useFrame(() => {
    const defaultSpeed = 5
    const { forward, backward, left, right } = keys.current

    let zDirection = 0
    let xDirection = 0

    if (forward) zDirection -= 1
    if (backward) zDirection += 1
    if (left) xDirection -= 1
    if (right) xDirection += 1

    const direction = new THREE.Vector3(xDirection, 0, zDirection).normalize().multiplyScalar(defaultSpeed)

    api.velocity.set(direction.x, velocity.current[1], direction.z)

    const targetCamPos = new THREE.Vector3(
      position.current[0] + 1.5, 
      position.current[1] + 2.5, 
      position.current[2] + 4
    )
    camera.position.lerp(targetCamPos, 0.1)
    
    const lookAtPos = new THREE.Vector3(
      position.current[0], 
      position.current[1] + 1, 
      position.current[2] - 1
    )
    camera.lookAt(lookAtPos)
  })

  // Stylized Humanoid Form (Young Black Male)
  return (
    <group ref={ref}>
      <group position={[0, -0.6, 0]}> 
         {/* Head */}
         <mesh position={[0, 1.2, 0]} castShadow>
           <boxGeometry args={[0.2, 0.25, 0.2]} />
           <meshStandardMaterial color="#5C3A21" />
         </mesh>
         {/* Torso (Jacket) */}
         <mesh position={[0, 0.75, 0]} castShadow>
           <boxGeometry args={[0.45, 0.6, 0.3]} />
           <meshStandardMaterial color="#111" roughness={0.6} />
         </mesh>
         {/* Arms (Jacket) */}
         <mesh position={[-0.3, 0.75, 0]} castShadow>
           <boxGeometry args={[0.15, 0.5, 0.15]} />
           <meshStandardMaterial color="#111" roughness={0.6} />
         </mesh>
         <mesh position={[0.3, 0.75, 0]} castShadow>
           <boxGeometry args={[0.15, 0.5, 0.15]} />
           <meshStandardMaterial color="#111" roughness={0.6} />
         </mesh>
         {/* Legs (Denim) */}
         <mesh position={[-0.12, 0.25, 0]} castShadow>
           <boxGeometry args={[0.15, 0.45, 0.15]} />
           <meshStandardMaterial color="#1a1c29" />
         </mesh>
         <mesh position={[0.12, 0.25, 0]} castShadow>
           <boxGeometry args={[0.15, 0.45, 0.15]} />
           <meshStandardMaterial color="#1a1c29" />
         </mesh>
         {/* Sneakers */}
         <mesh position={[-0.12, 0.0, 0.05]} castShadow>
           <boxGeometry args={[0.15, 0.15, 0.2]} />
           <meshStandardMaterial color="#fff" />
         </mesh>
         <mesh position={[0.12, 0.0, 0.05]} castShadow>
           <boxGeometry args={[0.15, 0.15, 0.2]} />
           <meshStandardMaterial color="#fff" />
         </mesh>
      </group>
    </group>
  )
}
`;
fs.writeFileSync('src/Player.jsx', playerContent);


// Patch Scene.jsx
let scene = fs.readFileSync('src/Scene.jsx', 'utf8');
const searchImports = `import { useTexture, PositionalAudio, MeshReflectorMaterial, Text, Environment } from "@react-three/drei"`;
const replaceImports = `import { useTexture, PositionalAudio, MeshReflectorMaterial, Text, Environment, Html } from "@react-three/drei"\nimport { useFrame } from "@react-three/fiber"\nimport { useStore } from './Store'\nimport { useState, useRef, useEffect } from 'react'`;
scene = scene.replace(searchImports, replaceImports);
scene = scene.replace('url="/event1.jpg"', 'url="/event1.jpeg"');

const searchLab = `const CustomLab = ({ position }) => (
  <group position={position}>
    {/* Racking Pipes */}
    <mesh position={[-2, 1.5, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 3]} />
      <meshStandardMaterial color="#ccc" metalness={0.8} />
    </mesh>
    <mesh position={[2, 1.5, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 3]} />
      <meshStandardMaterial color="#ccc" metalness={0.8} />
    </mesh>
    <mesh position={[0, 2.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 4]} />
      <meshStandardMaterial color="#ccc" metalness={0.8} />
    </mesh>
    <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 4]} />
      <meshStandardMaterial color="#ccc" metalness={0.8} />
    </mesh>
    {/* Gear Boxes */}
    <mesh position={[-1, 1.7, 0]} castShadow>
      <boxGeometry args={[0.8, 0.4, 0.4]} />
      <meshStandardMaterial color="#33cc66" />
    </mesh>
    <mesh position={[1, 1.7, 0]} castShadow>
      <boxGeometry args={[0.8, 0.4, 0.4]} />
      <meshStandardMaterial color="#cc3366" />
    </mesh>
    <mesh position={[0, 1.7, 0]} castShadow>
      <boxGeometry args={[0.8, 0.4, 0.4]} />
      <meshStandardMaterial color="#3366cc" />
    </mesh>
    <Text position={[0, 4, 0]} fontSize={0.4} color="white">CUSTOM LAB</Text>
    <pointLight position={[0, 4, 2]} intensity={1.5} distance={10} color="#eebb88" castShadow />
  </group>
)`;

const replaceLab = `const CustomLab = ({ position }) => {
  const tshirtColor = useStore(state => state.tshirtColor)
  const cycleColor = useStore(state => state.cycleColor)
  const playerPosition = useStore(state => state.playerPosition)
  
  const labRef = useRef()
  const [inRange, setInRange] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'KeyE' || e.key === 'e') && inRange) {
        cycleColor()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inRange, cycleColor])

  useFrame(() => {
    if (labRef.current) {
        const labPos = new THREE.Vector3()
        labRef.current.getWorldPosition(labPos)
        const distance = Math.hypot(playerPosition[0] - labPos.x, playerPosition[2] - labPos.z)
        setInRange(distance < 3.5)
    }
  })

  return (
    <group position={position} ref={labRef}>
      {/* Racking Pipes */}
      <mesh position={[-2, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} />
      </mesh>
      <mesh position={[2, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 4]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 4]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} />
      </mesh>
      
      {/* Central T-shirt Interaction Area */}
      <group position={[0, 1.7, 0]}>
         {/* Torso Box */}
         <mesh castShadow position={[0, 0, 0]}>
           <boxGeometry args={[0.6, 0.7, 0.1]} />
           <meshStandardMaterial color={tshirtColor} />
         </mesh>
         {/* Sleeves */}
         <mesh castShadow position={[-0.45, 0.2, 0]}>
           <boxGeometry args={[0.4, 0.25, 0.1]} />
           <meshStandardMaterial color={tshirtColor} />
         </mesh>
         <mesh castShadow position={[0.45, 0.2, 0]}>
           <boxGeometry args={[0.4, 0.25, 0.1]} />
           <meshStandardMaterial color={tshirtColor} />
         </mesh>
         
         {inRange && (
           <Html position={[0, 1, 0]} center p-0 m-0>
             <div style={{ background: '#111', color: '#fff', padding: '5px 15px', borderRadius: '5px', fontSize: '14px', fontFamily: 'sans-serif', whiteSpace: 'nowrap', border: '1px solid #333', pointerEvents: 'none', userSelect: 'none' }}>
               [E] Customize
             </div>
           </Html>
         )}
      </group>
      
      <Text position={[0, 4, 0]} fontSize={0.4} color="white">CUSTOM LAB</Text>
      <pointLight position={[0, 4, 2]} intensity={1.5} distance={10} color="#eebb88" castShadow />
    </group>
  )
}`;
scene = scene.replace(searchLab, replaceLab);
fs.writeFileSync('src/Scene.jsx', scene);
console.log("Successfully wrote all updates!");
