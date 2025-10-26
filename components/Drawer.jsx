import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

/**
 * Componente 3D para un solo Cajón
 * Este cajón reacciona a los cambios de 'status' animando su color y posición.
 * - 'pending': Gris, se desliza hacia afuera
 * - 'completed': Verde, se contrae de vuelta
 */
export default function Drawer({ status, position }) {
  const meshRef = useRef();
  
  // Dimensiones to match TrolleyModel
  const trolleyWidth = 0.7;
  const trolleyHeight = 1.6;
  const numDrawers = 8;
  const drawerHeight = (trolleyHeight * 0.85) / numDrawers;
  const drawerWidth = trolleyWidth * 0.92;
  const drawerDepth = 0.35;
  
  // Colores según el estado
  const targetColor = status === 'completed' ? '#16a34a' : '#94a3b8'; // Verde si completado, gris si pendiente
  const targetOpacity = status === 'completed' ? 0.9 : 0.7;
  
  // Determine which side based on Z position
  const isFrontSide = position[2] > 0;
  const slideDirection = isFrontSide ? 1 : -1;
  
  // Si está PENDIENTE, se desliza hacia afuera; si está COMPLETADO, vuelve a su posición
  const targetZ = status === 'pending' ? position[2] + (0.3 * slideDirection) : position[2];

  // Efecto para logging (opcional, para debugging)
  useEffect(() => {
    console.log(`Drawer at position [${position}] changed status to: ${status}`);
  }, [status, position]);

  // Animación suave (lerp) en cada frame
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Animar la posición Z (deslizamiento)
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        targetZ,
        delta * 3 // Velocidad de animación más rápida
      );
      
      // Animar el color
      const currentColor = meshRef.current.material.color;
      const target = new THREE.Color(targetColor);
      currentColor.lerp(target, delta * 3); // Transición rápida de color
      
      // Animar la opacidad
      meshRef.current.material.opacity = THREE.MathUtils.lerp(
        meshRef.current.material.opacity,
        targetOpacity,
        delta * 3
      );
    }
  });

  return (
    <mesh ref={meshRef} position={[...position]} castShadow receiveShadow>
      <boxGeometry args={[drawerWidth, drawerHeight * 0.85, drawerDepth]} />
      <meshStandardMaterial 
        color={targetColor} 
        metalness={0.4} 
        roughness={0.5}
        transparent={true}
        opacity={targetOpacity}
        emissive={status === 'completed' ? '#0d7a2e' : '#000000'} // Brillo verde cuando completado
        emissiveIntensity={status === 'completed' ? 0.3 : 0}
      />
    </mesh>
  );
}