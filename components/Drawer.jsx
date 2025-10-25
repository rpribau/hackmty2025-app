import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

/**
 * Componente 3D para un solo Cajón
 * Este es el cajón "procedural" que diseñamos en código.
 * Acepta un 'status' (pending, completed) y una 'position'.
 * Reacciona a los cambios de 'status' animando su color y posición.
 */
export default function Drawer({ status, position }) {
  const meshRef = useRef();
  
  // Estado base - acepta 'pending' o 'completed'
  const targetColor = status === 'completed' ? '#16a34a' : '#a1a1aa'; // Verde si está completo, gris si no
  const targetZ = status === 'completed' ? position[2] : position[2] + 0.3; // Se desliza hacia afuera si está pendiente

  // Animación suave (lerp)
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Animar la posición Z (deslizamiento)
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        targetZ,
        delta * 2 // Velocidad de la animación
      );
      
      // Animar el color
      const currentColor = meshRef.current.material.color;
      const target = new THREE.Color(targetColor);
      currentColor.lerp(target, delta * 2);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      {/* Dimensiones del cajón (ancho, alto, profundidad) */}
      <boxGeometry args={[0.7, 0.2, 0.9]} />
      <meshStandardMaterial color={targetColor} />
    </mesh>
  );
}
