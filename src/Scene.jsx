import React, { useMemo, useState, useEffect, useRef, Suspense } from "react"
import { useTexture, PositionalAudio, MeshReflectorMaterial, Text, Environment, Html, useGLTF } from "@react-three/drei"
import { useFrame, useThree } from '@react-three/fiber'
import { useBox, usePlane } from "@react-three/cannon"
import * as THREE from 'three'

// --- ENVIRONMENT GEOMETRY ---

const Wall = ({ position, rotation, size = [20, 10, 1] }) => {
  const [ref] = useBox(() => ({ type: "Static", position, rotation, args: size }))
  const greenTex = useTexture("/forest_green.png")
  greenTex.wrapS = greenTex.wrapT = THREE.RepeatWrapping
  greenTex.repeat.set(size[0]/10, size[1]/10)
  
  return (
    <group ref={ref}>
      {/* Main Solid Wall */}
      <mesh receiveShadow castShadow position={[0, -size[1]*0.2, 0]}>
        <boxGeometry args={[size[0], size[1]*0.8, size[2]]} />
        <meshStandardMaterial map={greenTex} roughness={0.9} />
      </mesh>
      {/* Top Glass Grid Shell */}
      <mesh position={[0, size[1]*0.3, 0]} receiveShadow castShadow>
         <boxGeometry args={[size[0], size[1]*0.2, size[2]]} />
         <meshPhysicalMaterial color="#88aaff" transparent opacity={0.3} transmission={0.9} roughness={0.1} />
      </mesh>
      {/* Grid Mullions for top */}
      <mesh position={[0, size[1]*0.3, size[2]/2 + 0.05]}>
         <boxGeometry args={[size[0], 0.1, 0.1]} />
         <meshStandardMaterial color="#111" metalness={0.8} />
      </mesh>
      <mesh position={[0, size[1]*0.4, size[2]/2 + 0.05]}>
         <boxGeometry args={[size[0], 0.1, 0.1]} />
         <meshStandardMaterial color="#111" metalness={0.8} />
      </mesh>
    </group>
  )
}

const SlattedWall = ({ position, rotation, size = [20, 10, 1] }) => {
  const [ref] = useBox(() => ({ type: "Static", position, rotation, args: size }))
  const slats = useMemo(() => {
    const arr = []
    const count = Math.floor(size[1] * 2) // 2 slats per unit height
    for(let i=0; i<count; i++) {
        arr.push((i - count/2) * 0.5)
    }
    return arr
  }, [size])

  return (
    <group ref={ref}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#1E4522" roughness={0.9} />
      </mesh>
      {/* Horizontal Wood Slatting */}
      {slats.map((y, i) => (
         <mesh key={i} position={[0, y, size[2]/2 + 0.05]} castShadow>
            <boxGeometry args={[size[0] - 0.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#2B1A10" roughness={0.7} />
         </mesh>
      ))}
      {/* Vertical LED Strips */}
      <mesh position={[-size[0]/4, 0, size[2]/2 + 0.1]}>
        <boxGeometry args={[0.05, size[1] - 1, 0.05]} />
        <meshStandardMaterial color="#aaffaa" emissive="#aaffaa" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[-size[0]/4, 0, size[2]/2 + 0.2]} intensity={0.5} distance={10} color="#aaffaa" />
      <mesh position={[size[0]/4, 0, size[2]/2 + 0.1]}>
        <boxGeometry args={[0.05, size[1] - 1, 0.05]} />
        <meshStandardMaterial color="#aaffaa" emissive="#aaffaa" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[size[0]/4, 0, size[2]/2 + 0.2]} intensity={0.5} distance={10} color="#aaffaa" />
    </group>
  )
}

const GlassWall = ({ position, rotation, size = [20, 10, 1] }) => {
  const [ref] = useBox(() => ({ type: "Static", position, rotation, args: size }))
  return (
    <group ref={ref}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[size[0], size[1], 0.2]} />
        <meshPhysicalMaterial color="#88aaff" transparent opacity={0.3} transmission={0.9} roughness={0.1} />
      </mesh>
      
      {/* Vertical Mullions */}
      {[...Array(9)].map((_, i) => (
         <mesh key={`v-${i}`} position={[(i - 4) * (size[0]/8), 0, 0]} castShadow>
            <boxGeometry args={[0.2, size[1], 0.3]} />
            <meshStandardMaterial color="#111" metalness={0.8} />
         </mesh>
      ))}

      {/* Horizontal Purlins */}
      {[...Array(4)].map((_, i) => (
         <mesh key={`h-${i}`} position={[0, (i - 1.5) * (size[1]/3), 0]} castShadow>
            <boxGeometry args={[size[0], 0.2, 0.3]} />
            <meshStandardMaterial color="#111" metalness={0.8} />
         </mesh>
      ))}
    </group>
  )
}

const AFrameRoof = () => {
  const thickness = 0.2
  const length = 40
  const height = 15
  const width = 30
  const halfWidth = width / 2
  const angle = Math.atan2(height, halfWidth)
  const hypotenuse = Math.sqrt(height*height + halfWidth*halfWidth)

  return (
    <group position={[0, 10, 0]}>
      {/* Left Glass */}
      <mesh position={[-halfWidth/2, height/2, 0]} rotation={[0, 0, angle]}>
        <planeGeometry args={[hypotenuse, length]} />
        <meshPhysicalMaterial color="#88aaff" transparent opacity={0.3} transmission={0.9} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Right Glass */}
      <mesh position={[halfWidth/2, height/2, 0]} rotation={[0, 0, -angle]}>
        <planeGeometry args={[hypotenuse, length]} />
        <meshPhysicalMaterial color="#88aaff" transparent opacity={0.3} transmission={0.9} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Vertical Steel Beams */}
      {[...Array(11)].map((_, i) => (
        <group key={i} position={[0, 0, (i - 5) * 4]}>
          <mesh position={[-halfWidth/2, height/2, 0]} rotation={[0, 0, angle]}>
             <cylinderGeometry args={[0.1, 0.1, hypotenuse]} />
             <meshStandardMaterial color="#111" metalness={0.8} />
          </mesh>
          <mesh position={[halfWidth/2, height/2, 0]} rotation={[0, 0, -angle]}>
             <cylinderGeometry args={[0.1, 0.1, hypotenuse]} />
             <meshStandardMaterial color="#111" metalness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Horizontal Purlins (Grid Lines) */}
      {[...Array(5)].map((_, i) => (
         <group key={`purlin-${i}`}>
            <mesh position={[-halfWidth + (i+1)*(halfWidth/6), (i+1)*(height/6), 0]} rotation={[Math.PI/2, 0, 0]}>
               <cylinderGeometry args={[0.05, 0.05, length]} />
               <meshStandardMaterial color="#111" metalness={0.8} />
            </mesh>
            <mesh position={[halfWidth - (i+1)*(halfWidth/6), (i+1)*(height/6), 0]} rotation={[Math.PI/2, 0, 0]}>
               <cylinderGeometry args={[0.05, 0.05, length]} />
               <meshStandardMaterial color="#111" metalness={0.8} />
            </mesh>
         </group>
      ))}
      {/* Ridge beam */}
      <mesh position={[0, height, 0]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, length]} />
        <meshStandardMaterial color="#111" metalness={0.8} />
      </mesh>
    </group>
  )
}

const Floor = ({ position, rotation }) => {
  const [ref] = usePlane(() => ({ type: "Static", position, rotation }))
  const woodTex = useTexture("/wood_floor.png")
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping
  woodTex.repeat.set(12, 12)

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial map={woodTex} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

// --- ZONES ---

const GalleryFrame = ({ position, rotation, url }) => {
  const texture = useTexture(url)
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.4, 0.1]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[4, 2.25]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  )
}

const Lounge = ({ position }) => {
  const gltf = useGLTF('/scene.glb')
  const couch1 = useMemo(() => gltf.scene.clone(), [gltf.scene])
  const couch2 = useMemo(() => gltf.scene.clone(), [gltf.scene])

  // Invisible physics colliders bound to world space utilizing dynamic Lounge offset
  // Set Y-bounds exactly at 0.8 height to support standing natively on the visual cushions
  useBox(() => ({ type: "Static", position: [position[0], 0.4, position[2] - 2.6], args: [2.55, 0.8, 1.25] }))
  useBox(() => ({ type: "Static", position: [position[0] - 4.2, 0.4, position[2]], rotation: [0, Math.PI/2, 0], args: [2.55, 0.8, 1.25] }))

  useMemo(() => {
    const applyMatteNavy = (n) => { 
      if (n.isMesh) { 
        n.castShadow = true; 
        n.receiveShadow = true; 
        n.material = new THREE.MeshStandardMaterial({
          color: '#1A2B4C',
          roughness: 1.0,
          metalness: 0.0
        })
      } 
    }
    couch1.traverse(applyMatteNavy)
    couch2.traverse(applyMatteNavy)
  }, [couch1, couch2])

  return (
    <group position={position}>
      {/* Rug */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10.4, 7.8]} />
        <meshStandardMaterial color="#554433" roughness={1} />
      </mesh>
      
      {/* Sofas offset drastically locally to force a >1FT central walking channel */}
      <primitive object={couch1} position={[0.5, 0, -2.6]} scale={[2.55, 2.55, 2.55]} />
      <primitive object={couch2} position={[-4.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={[2.55, 2.55, 2.55]} />

      {/* Side Table */}
      <mesh position={[2, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 1]} />
        <meshStandardMaterial color="#111" metalness={0.6} />
      </mesh>
      <pointLight position={[0, 3, 0]} intensity={1.5} distance={12} color="#ffddaa" castShadow />
    </group>
  )
}
useGLTF.preload('/scene.glb')
useGLTF.preload('/2cdj.glb')
useGLTF.preload('/houseplant.glb')

const Houseplant = ({ position }) => {
  const gltf = useGLTF('/houseplant.glb')
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene])

  useMemo(() => {
    scene.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true
        n.receiveShadow = true
        // Overwriting completely to sever any glitchy .map properties loaded from the raw file
        n.material = new THREE.MeshStandardMaterial({
          color: '#1B4D3E',
          roughness: 0.9,
          metalness: 0.1
        })
      }
    })
  }, [scene])

  return <primitive object={scene} position={position} scale={[0.08, 0.08, 0.08]} />
}

const DJBooth = ({ position, sharedPhotoTexture }) => {
  const cdjGltf = useGLTF('/2cdj.glb')
  const deck1 = useMemo(() => cdjGltf.scene.clone(), [cdjGltf.scene])

  // DJ Booth physical structures
  // 1. Fixed stage platform to stop bleeding (elevated to flawlessly clear boots)
  useBox(() => ({ type: "Static", position: [position[0], 0.3, position[2]], args: [8, 0.4, 4] }))
  
  // 2. High wall for the table to prevent climbing
  useBox(() => ({ type: "Static", position: [position[0], 1.2, position[2] + 0.5], args: [3, 1, 1] }))

  useMemo(() => {
    deck1.traverse((n) => { 
      if (n.isMesh) { 
        n.castShadow = true; 
        n.receiveShadow = true; 
        n.material = new THREE.MeshStandardMaterial({
          color: '#181818',
          metalness: 0.8,
          roughness: 0.2
        })
      } 
    })
  }, [deck1])

  return (
  <group position={position}>
    {/* Stage */}
    <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
      <boxGeometry args={[8, 0.4, 4]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    {/* Table */}
    <mesh position={[0, 1.2, 0.5]} castShadow receiveShadow>
      <boxGeometry args={[3, 1, 1]} />
      <meshStandardMaterial color="#222" metalness={0.5} roughness={0.2} />
    </mesh>
    <mesh position={[0, 1.2, 1.01]}>
      <planeGeometry args={[1, 0.5]} />
      <meshBasicMaterial color="#fff" />
      <Text position={[0, 0, 0.01]} fontSize={0.2} color="black" textAlign="center">adidas</Text>
    </mesh>
    
    {/* Centralized Upscaled CDJ Deck */}
    <primitive object={deck1} position={[0, 1.7, 0.5]} scale={[0.25, 0.25, 0.25]} rotation={[0, 0, 0]} />

    {/* Large Screen */}
    <mesh position={[0, 3, -1.5]} castShadow>
      <boxGeometry args={[6, 3, 0.2]} />
      <meshStandardMaterial color="#000" />
    </mesh>
    <mesh position={[0, 3, -1.39]}>
      <planeGeometry args={[5.8, 2.8]} />
      {sharedPhotoTexture ? (
        <meshStandardMaterial map={sharedPhotoTexture} emissiveMap={sharedPhotoTexture} emissive="white" emissiveIntensity={0.2} transparent={false} side={THREE.DoubleSide} />
      ) : (
        <>
          <meshStandardMaterial color="#ff2255" emissive="#ff2255" emissiveIntensity={2} />
          <Text position={[0, 0, 0.01]} fontSize={0.6} color="white" fontWeight="bold">FESTIVAL GROOVE</Text>
        </>
      )}
    </mesh>
    <pointLight position={[0, 5, 2]} intensity={2} distance={15} color="#ff2255" castShadow />
  </group>
)}

const PhotoBooth = ({ position, setWebcamActive, sharedPhotoTexture }) => {
  const [inRange, setInRange] = useState(false)
  const groupRef = useRef()
  const materialRef = useRef()
  const { camera } = useThree()

  useEffect(() => {
    if (sharedPhotoTexture && materialRef.current) {
      materialRef.current.needsUpdate = true;
    }
  }, [sharedPhotoTexture])

  useFrame(() => {
    if (groupRef.current) {
      const dist = camera.position.distanceTo(groupRef.current.position)
      const isNear = dist < 6
      if (isNear !== inRange) {
        setInRange(isNear)
      }
    }
  })

  return (
    <group position={position} ref={groupRef}>
      {/* Sleek Fridge Base */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[1.5, 4, 1.5]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Strict conditional to avoid rendering null map buffers */}
      {sharedPhotoTexture ? (
        <mesh position={[-0.77, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.6, 0.9]} />
          <meshStandardMaterial ref={materialRef} map={sharedPhotoTexture} emissiveMap={sharedPhotoTexture} emissive="#ffffff" emissiveIntensity={0.5} toneMapped={false} side={THREE.DoubleSide} transparent={false} />
        </mesh>
      ) : (
        <mesh position={[-0.77, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.6, 0.9]} />
          <meshStandardMaterial color="#222" emissive="#222" emissiveIntensity={0.1} side={THREE.DoubleSide} transparent={false} />
        </mesh>
      )}
      
      {/* Glowing ring/lens */}
      <mesh position={[-0.77, 3.5, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.15, 0.02, 16, 16]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
      </mesh>
      
      {/* Eye Level HTML UI */}
      {inRange && (
        <Html position={[-1.2, 1.8, 0]} center zIndexRange={[100, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.8)', padding: '10px 15px', borderRadius: '8px', border: '1px solid #444', textAlign: 'center', pointerEvents: 'auto' }}>
            <p style={{ color: 'white', margin: '0 0 10px 0', fontFamily: 'sans-serif' }}>Take a Photo?</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setWebcamActive(true); }}
              style={{ padding: '8px 20px', background: '#f25', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              YES
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}

const CustomLab = ({ position, rotation, setShirtColor }) => {
  const [inRange, setInRange] = useState(false)
  const groupRef = useRef()
  const { camera } = useThree()

  useFrame(() => {
    if (groupRef.current) {
      const dist = camera.position.distanceTo(groupRef.current.position)
      const isNear = dist < 8
      if (isNear !== inRange) {
        setInRange(isNear)
      }
    }
  })

  return (
  <group position={position} rotation={rotation} ref={groupRef}>
    {/* Minimalist Desk projecting into the room */}
    <mesh position={[-1, 1, 0]} castShadow>
      <boxGeometry args={[4, 0.1, 1.5]} />
      <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[-2.8, 0.5, 0]} castShadow>
      <boxGeometry args={[0.2, 1, 1.5]} />
      <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[0.8, 0.5, 0]} castShadow>
      <boxGeometry args={[0.2, 1, 1.5]} />
      <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
    </mesh>

    {/* White Box */}
    <mesh position={[-2, 1.15, 0]} castShadow onClick={(e) => { e.stopPropagation(); setShirtColor('white') }}>
      <boxGeometry args={[0.4, 0.2, 0.4]} />
      <meshStandardMaterial color="white" roughness={0.5} />
      <Text position={[0, 0.3, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.15} color="white" outlineColor="black" outlineWidth={0.02}>
        WHITE
      </Text>
    </mesh>
    
    {/* Black Box */}
    <mesh position={[-1, 1.15, 0]} castShadow onClick={(e) => { e.stopPropagation(); setShirtColor('#222') }}>
      <boxGeometry args={[0.4, 0.2, 0.4]} />
      <meshStandardMaterial color="#111" roughness={0.5} />
      <Text position={[0, 0.3, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.15} color="white" outlineColor="black" outlineWidth={0.02}>
        BLACK
      </Text>
    </mesh>

    {/* Maroon Box */}
    <mesh position={[0, 1.15, 0]} castShadow onClick={(e) => { e.stopPropagation(); setShirtColor('#500') }}>
      <boxGeometry args={[0.4, 0.2, 0.4]} />
      <meshStandardMaterial color="#500" roughness={0.5} />
      <Text position={[0, 0.3, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.15} color="white" outlineColor="black" outlineWidth={0.02}>
        MAROON
      </Text>
    </mesh>

    <Text position={[0, 3, 1.1]} rotation={[0, Math.PI, 0]} fontSize={0.5} color="#eebb88">CUSTOM LAB</Text>
    <pointLight position={[0, 3, 0.9]} intensity={1.5} distance={10} color="#eebb88" castShadow />
  </group>
)}

// Generate simplified large 'Monstera/Ficus' meshes (low poly representation)
const generateFoliageCluster = (count) => {
  const leaves = []
  for(let i=0; i<count; i++) {
    leaves.push(
      <mesh key={i} position={[(Math.random()-0.5)*1.5, Math.random()*1.5, (Math.random()-0.5)*1.5]} rotation={[Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI]} castShadow receiveShadow>
         <cylinderGeometry args={[0, 0.5, 1, 4]} />
         <meshStandardMaterial color={Math.random() > 0.5 ? "#2A4C25" : "#3D6A37"} roughness={0.8} />
      </mesh>
    )
  }
  return leaves
}

export const Scene = ({ clicked, shirtColor, setShirtColor, setWebcamActive, capturedPhoto }) => {
  const [sharedPhotoTexture, setSharedPhotoTexture] = useState(null);

  useEffect(() => {
    if (capturedPhoto) {
      const tex = new THREE.TextureLoader().load(capturedPhoto, () => {
        tex.needsUpdate = true;
      })
      tex.colorSpace = THREE.SRGBColorSpace;
      setSharedPhotoTexture(tex);

      return () => {
        tex.dispose();
      }
    } else {
      setSharedPhotoTexture(null);
    }
  }, [capturedPhoto])

  return (
    <>
      <Environment preset="warehouse" background={false} />
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[10, 30, 15]} intensity={2} castShadow color="#ffffff" />

      <Floor position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      
      {/* Back wall with DJ Booth */}
      <GlassWall position={[0, 5, -18]} size={[30, 10, 1]} />
      <DJBooth position={[0, 0, -15]} sharedPhotoTexture={sharedPhotoTexture} />

      {/* Front Wall with PhotoBooth */}
      <Wall position={[0, 5, 20]} size={[30, 10, 1]} />
      <PhotoBooth position={[10, 0, 15]} setWebcamActive={setWebcamActive} sharedPhotoTexture={sharedPhotoTexture} />

      {/* Left Wall with Lounge and Gallery */}
      <Wall position={[-15, 5, 1]} rotation={[0, Math.PI / 2, 0]} size={[38, 10, 1]} />
      <Suspense fallback={null}>
        <Lounge position={[-10, 0, -3]} />
      </Suspense>
      <GalleryFrame position={[-14.4, 6, 2]} rotation={[0, Math.PI/2, 0]} url="/event1.jpg" />
      <GalleryFrame position={[-14.4, 6, -3]} rotation={[0, Math.PI/2, 0]} url="/event2.jpg" />
      <GalleryFrame position={[-14.4, 6, -8]} rotation={[0, Math.PI/2, 0]} url="/event3.jpg" />

      {/* Right Wall with Custom Lab */}
      <SlattedWall position={[15, 5, 1]} rotation={[0, -Math.PI / 2, 0]} size={[38, 10, 1]} />
      <CustomLab position={[13.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} setShirtColor={setShirtColor} />

      {/* A-Frame Roof */}
      <AFrameRoof />

      {/* Floor Corner Houseplants */}
      <Houseplant position={[-13, 0, 15]} />
      <Houseplant position={[13, 0, 15]} />
      <Houseplant position={[-13, 0, -13]} />
      <Houseplant position={[13, 0, -13]} />
      
      {/* Hanging Foliage */}
      <group position={[-5, 10, 0]}>{generateFoliageCluster(5)}</group>
      <group position={[5, 10, 5]}>{generateFoliageCluster(5)}</group>
      <group position={[0, 12, -8]}>{generateFoliageCluster(5)}</group>

      {clicked && <PositionalAudio url="/Sway_of_the_Palms.mp3" distance={15} loop autoplay />}
    </>
  )
}
