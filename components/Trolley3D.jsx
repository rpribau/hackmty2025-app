// components/Trolley3D.jsx (Re-añadir Polyfill y verificar ruta GLB)
import 'base-64'; // <-- AÑADIR DE NUEVO AL PRINCIPIO
import React, { useRef } from 'react';
import { useGLTF, OrbitControls /*, Environment */ } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import Drawer from './Drawer';

const drawerPositions = [
  [0, 0.7, 0.2], [0, 0.6, 0.2], [0, 0.5, 0.2], [0, 0.4, 0.2],
  [0, 0.3, 0.2], [0, 0.2, 0.2], [0, 0.1, 0.2], [0, 0.0, 0.2],
];

function Model() {
  // --- VERIFICA ESTA RUTA ---
  const { scene } = useGLTF(require('../assets/models/trolley.glb')); 
  return <primitive object={scene} />;
}

export default function Trolley3D({ drawerStates, isFullscreen = false }) {
  // ... (resto del componente Trolley3D sin cambios) ...
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current && !isFullscreen) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      
      {/* <Environment preset="city" /> Sigue comentado */}

      {isFullscreen && <OrbitControls enablePan={true} enableZoom={true} />}
      
      <group ref={groupRef} dispose={null} scale={1.2}> 
        <Model /> 
        {Object.keys(drawerStates).map((drawerId, index) => {
          if (index < drawerPositions.length) {
            return (
              <Drawer
                key={drawerId}
                status={drawerStates[drawerId]}
                position={drawerPositions[index]}
              />
            );
          }
          return null;
        })}
      </group>
    </>
  );
}

// Pre-carga el modelo GLB
// --- VERIFICA ESTA RUTA ---
useGLTF.preload(require('../assets/models/trolley.glb'));