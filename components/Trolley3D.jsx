import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei/native';
import Drawer from './Drawer';

/**
 * Componente del modelo GLTF del carrito
 */
function TrolleyModel() {
  // For React Native, we need to use require with the full path
  const gltf = useGLTF(require('../assets/models/trolley.gltf'));
  
  return (
    <group scale={1.5} position={[0, -1, 0]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

/**
 * Componente principal 3D: El Carrito (Trolley)
 * Recibe el estado de todos sus cajones como prop (objeto con IDs como keys).
 */
export default function Trolley3D({ drawerStates }) {
  // drawerStates es un objeto, ej: {'drawer-1': 'pending', 'drawer-2': 'completed', ...}
  
  // Posiciones de los cajones en el modelo 3D (ajustar según tu modelo GLTF)
  const drawerPositions = [
    [0, 1.3, -0.45],   // Cajón 1 (Superior)
    [0, 1.05, -0.45],  // Cajón 2
    [0, 0.8, -0.45],   // Cajón 3
    [0, 0.55, -0.45],  // Cajón 4
    [0, 0.3, -0.45],   // Cajón 5
    [0, 0.05, -0.45],  // Cajón 6
    [0, -0.2, -0.45],  // Cajón 7
    [0, -0.45, -0.45], // Cajón 8 (Inferior)
  ];

  // Convertir el objeto a un array ordenado por ID
  const drawerIds = Object.keys(drawerStates || {}).sort();

  return (
    <>
      {/* Luces para que se vea bien */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Cargar el modelo GLTF con Suspense */}
      <Suspense fallback={null}>
        <TrolleyModel />
      </Suspense>

      {/* Renderizar los 8 cajones animados */}
      {drawerPositions.map((pos, index) => {
        const drawerId = drawerIds[index];
        const status = drawerId ? drawerStates[drawerId] : 'pending';
        return (
          <Drawer 
            key={index} 
            position={pos} 
            status={status} 
          />
        );
      })}
    </>
  );
}

// Preload the model
useGLTF.preload(require('../assets/models/trolley.gltf'));

