import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { View, StyleSheet } from 'react-native';
import * as THREE from 'three';

/**
 * Componente 3D que renderiza un cajón ("drawer") individual.
 * Acepta su estado (pendiente, completado) para cambiar su color
 * y su posición (animación de deslizarse).
 */
function Drawer({ position, status, delay }) {
  const meshRef = useRef();
  
  // Estado base
  const color = status === 'completado' ? '#16a34a' : '#a1a1aa'; // Verde si está completo, gris si no
  const targetX = status === 'completado' ? position[0] - 0.5 : position[0]; // Se desliza -0.5 en X si está completo

  // Animación suave (lerp)
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Animar la posición X (deslizamiento)
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        targetX,
        delta * 2 // Velocidad de la animación
      );
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.4, 0.1, 0.8]} /> 
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/**
 * Componente principal 3D: El Carrito (Trolley)
 * Recibe el estado de todos sus cajones como prop.
 */
export default function Trolley3D({ drawerStatuses }) {
  // drawerStatuses es un array de objetos, ej: [{ id: 0, status: 'completado' }, { id: 1, status: 'pendiente' }, ...]
  
  // Posiciones de los cajones en el modelo 3D
  const drawerPositions = [
    [0, 0.5, 0], [0, 0.35, 0], [0, 0.2, 0], [0, 0.05, 0],
    [0, -0.1, 0], [0, -0.25, 0], [0, -0.4, 0], [0, -0.55, 0]
  ];

  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [2, 1, 2], fov: 50 }}>
        {/* Luces para que se vea bien */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* El cuerpo principal del carrito (un simple cubo) */}
        <mesh position={[-0.25, 0, 0]}>
          <boxGeometry args={[0.05, 1.2, 0.9]} />
          <meshStandardMaterial color="#d4d4d8" />
        </mesh>

        {/* Renderizar los 8 cajones */}
        {drawerPositions.map((pos, index) => (
          <Drawer 
            key={index} 
            position={pos} 
            status={drawerStatuses[index]?.status || 'pendiente'} 
          />
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300, // Altura fija para el canvas 3D
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 15,
  },
});
