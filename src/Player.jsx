import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
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

export const Player = ({ shirtColor = 'white' }) => {
  const { camera } = useThree()
  const isOnboardingComplete = useStore(state => state.isOnboardingComplete)
  const visualRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  // position slightly back from center
  const [ref, api] = useSphere(() => ({ 
    mass: 1, 
    type: 'Dynamic', 
    position: [0, 5, 8], 
    args: [1.0],
    angularFactor: [0, 0, 0],
    linearDamping: 0.5
  }), useRef())
  const keys = usePlayerControls()
  
  const velocity = useRef([0, 0, 0])
  const position = useRef([0, 0, 0])
  
  useEffect(() => {
    const unsubV = api.velocity.subscribe((v) => (velocity.current = v))
    const unsubP = api.position.subscribe((p) => (position.current = p))
    return () => { unsubV(); unsubP(); }
  }, [api.velocity, api.position])

  const controlsRef = useRef()

  useFrame((state) => {
    const defaultSpeed = 5
    let { forward, backward, left, right } = keys.current

    // Lock controls during onboarding
    if (!isOnboardingComplete) {
      forward = backward = left = right = false;
    }

    // Calculate camera-relative movement
    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    forwardVector.y = 0
    forwardVector.normalize()

    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    rightVector.y = 0
    rightVector.normalize()

    const moveDir = new THREE.Vector3()
    if (forward) moveDir.add(forwardVector)
    if (backward) moveDir.sub(forwardVector)
    if (left) moveDir.sub(rightVector)
    if (right) moveDir.add(rightVector)

    if (moveDir.lengthSq() > 0) moveDir.normalize()

    api.velocity.set(moveDir.x * defaultSpeed, velocity.current[1], moveDir.z * defaultSpeed)

    // Procedural Walking Animation
    const speed = moveDir.length()
    if (speed > 0) {
      // Scale frequency with speed to avoid visual foot sliding
      const walkCycle = Math.sin(state.clock.elapsedTime * 12) 
      const swing = walkCycle * 0.6 // amplitude
      
      if(leftLegRef.current) leftLegRef.current.rotation.x = swing
      if(rightLegRef.current) rightLegRef.current.rotation.x = -swing
      if(leftArmRef.current) leftArmRef.current.rotation.x = -swing
      if(rightArmRef.current) rightArmRef.current.rotation.x = swing
    } else {
      // Return to Idle Stance smoothly
      if(leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1)
      if(rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1)
      if(leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1)
      if(rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1)
    }

    // Smooth Character Dynamic Rotation
    if (moveDir.lengthSq() > 0.1 && visualRef.current) {
      const targetAngle = Math.atan2(moveDir.x, moveDir.z)
      let diff = targetAngle - visualRef.current.rotation.y
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      visualRef.current.rotation.y += diff * 0.15
    }

    // Sync Follow Camera target gracefully
    if (controlsRef.current) {
      const t = new THREE.Vector3(position.current[0], position.current[1] + 1, position.current[2])
      controlsRef.current.target.lerp(t, 0.2)
    }
  })

  return (
    <>
      <OrbitControls 
        ref={controlsRef} 
        minDistance={4} 
        maxDistance={5} 
        maxPolarAngle={Math.PI / 2 - 0.05} // No going under the floor
        enablePan={false}
        enabled={isOnboardingComplete}
        makeDefault
      />
      <group ref={ref} name="PlayerBody">
        <ContactShadows position={[0, -0.99, 0]} opacity={0.6} scale={2} blur={1.5} far={1} />
        <group ref={visualRef} position={[0, -0.85, 0]}>  
         {/* Head (Black Cap) */}
         <mesh position={[0, 1.45, 0.05]} castShadow rotation={[0.1, 0, 0]}>
           <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} />
           <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
         </mesh>
         <mesh position={[0, 1.45, 0.2]} castShadow rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.2, 0.02, 0.3]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
         </mesh>
         <mesh position={[0, 1.3, 0]} castShadow>
           <sphereGeometry args={[0.2, 16, 16]} />
           <meshStandardMaterial color="#5c3a21" roughness={0.5} /> {/* darker skin tone */}
         </mesh>

         {/* Body - T-Shirt (Customizable) */}
         <mesh position={[0, 0.85, 0]} castShadow>
           <boxGeometry args={[0.48, 0.65, 0.28]} />
           <meshStandardMaterial color={shirtColor} roughness={0.8} />
         </mesh>

         {/* Body - Jacket (Open over shirt) */}
         {/* Left half */}
         <mesh position={[-0.18, 0.85, 0.02]} castShadow>
           <boxGeometry args={[0.18, 0.66, 0.32]} />
           <meshStandardMaterial color="#2d2d33" roughness={0.8} /> {/* dark grey/blue streetwear jacket */}
         </mesh>
         {/* Right half */}
         <mesh position={[0.18, 0.85, 0.02]} castShadow>
           <boxGeometry args={[0.18, 0.66, 0.32]} />
           <meshStandardMaterial color="#2d2d33" roughness={0.8} />
         </mesh>
         {/* Back of jacket */}
         <mesh position={[0, 0.85, -0.1]} castShadow>
           <boxGeometry args={[0.52, 0.66, 0.1]} />
           <meshStandardMaterial color="#2d2d33" roughness={0.8} />
         </mesh>

         {/* Arms (Jacket sleeves) */}
         <group ref={leftArmRef} position={[-0.32, 1.1, 0]} rotation={[0, 0, -0.2]}>
            <mesh position={[0, -0.3, 0]} castShadow>
               <cylinderGeometry args={[0.1, 0.08, 0.6]} />
               <meshStandardMaterial color="#2d2d33" roughness={0.8} />
            </mesh>
         </group>
         <group ref={rightArmRef} position={[0.32, 1.1, 0]} rotation={[0, 0, 0.2]}>
            <mesh position={[0, -0.3, 0]} castShadow>
               <cylinderGeometry args={[0.1, 0.08, 0.6]} />
               <meshStandardMaterial color="#2d2d33" roughness={0.8} />
            </mesh>
         </group>

         {/* Legs - pants & shoes */}
         <group ref={leftLegRef} position={[-0.14, 0.5, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <boxGeometry args={[0.22, 0.55, 0.22]} />
              <meshStandardMaterial color="#111" roughness={0.9} /> {/* dark pants */}
            </mesh>
            <mesh position={[0, -0.55, 0.05]} castShadow>
              <boxGeometry args={[0.23, 0.1, 0.3]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
            </mesh>
         </group>
         <group ref={rightLegRef} position={[0.14, 0.5, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <boxGeometry args={[0.22, 0.55, 0.22]} />
              <meshStandardMaterial color="#111" roughness={0.9} /> {/* dark pants */}
            </mesh>
            <mesh position={[0, -0.55, 0.05]} castShadow>
              <boxGeometry args={[0.23, 0.1, 0.3]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
            </mesh>
         </group>

         {/* Backpack (Grey with straps) */}
         <mesh position={[0, 0.9, -0.22]} castShadow>
           <boxGeometry args={[0.42, 0.55, 0.18]} />
           <meshStandardMaterial color="#555" roughness={0.7} /> {/* grey backpack */}
         </mesh>
         <mesh position={[0, 0.9, -0.32]} castShadow> {/* outer pocket */}
           <boxGeometry args={[0.35, 0.3, 0.1]} />
           <meshStandardMaterial color="#444" roughness={0.7} /> 
         </mesh>
      </group>
    </group>
  </>
  )
}
