import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import Drawer from './Drawer';
import { useEffect } from 'react';



// Calculate drawer positions to match the trolley structure
const trolleyHeight = 1.6;    // Taller trolley
const trolleyDepth = 1.0;     // Double depth for front and back sides
const numDrawers = 8;
const drawerHeight = (trolleyHeight * 0.85) / numDrawers;
const drawerStartY = 0.12;

// FRONT side drawers (8 drawers) - facing forward
const drawerPositionsFront = Array.from({ length: numDrawers }, (_, i) => {
  const y = drawerStartY + i * drawerHeight + drawerHeight / 2;
  return [0, y, 0.38]; // Front side, Z positive - moved further out to be visible
});

// BACK side drawers (8 drawers) - facing backward
const drawerPositionsBack = Array.from({ length: numDrawers }, (_, i) => {
  const y = drawerStartY + i * drawerHeight + drawerHeight / 2;
  return [0, y, -0.38]; // Back side, Z negative - moved further out to be visible
});

// Combine both sides - 16 total drawers
const drawerPositions = [...drawerPositionsFront, ...drawerPositionsBack];

// Procedural Trolley Model Component
function TrolleyModel() {
  // --- Dimensiones for DOUBLE-SIDED trolley (FRONT and BACK) ---
  const trolleyWidth = 0.7;      // m - width (left to right)
  const trolleyHeight = 1.6;     // m - much taller
  const trolleyDepth = 1.0;      // m - DOUBLED depth for front and back sides
  const frameThickness = 0.025;  // m

  // --- Colores ---
  const frameColor = '#c0c0c0';   // Gris claro metálico
  const drawerColor = '#444444';  // Gris oscuro
  const wheelColor = '#222222';   // Negro ruedas
  const axleColor = '#aaaaaa';    // Gris eje

  // --- Cajones apilados ---
  const numDrawers = 8;
  const drawerHeight = (trolleyHeight * 0.85) / numDrawers;
  const drawerWidth = trolleyWidth * 0.92;
  const drawerDepth = trolleyDepth * 0.9;
  const drawerStartY = 0.12;

  // --- Posiciones de ruedas ---
  const wheelOffsetX = trolleyWidth / 2 - 0.10;
  const wheelOffsetZ = trolleyDepth / 2 - 0.10;
  const wheelRadius = 0.05;

  return (
    <group>
      {/* Base inferior */}
      <mesh position={[0, frameThickness / 2, 0]}>
        <boxGeometry args={[trolleyWidth, frameThickness, trolleyDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* LEFT side panel (dark back panel) */}
      <mesh position={[-trolleyWidth / 2 + frameThickness / 2, trolleyHeight / 2, 0]}>
        <boxGeometry args={[frameThickness, trolleyHeight, trolleyDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* RIGHT side panel (dark back panel) */}
      <mesh position={[trolleyWidth / 2 - frameThickness / 2, trolleyHeight / 2, 0]}>
        <boxGeometry args={[frameThickness, trolleyHeight, trolleyDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>



      {/* Tapa superior */}
      <mesh position={[0, trolleyHeight, 0]}>
        <boxGeometry args={[trolleyWidth, frameThickness, trolleyDepth]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Agarradera superior curvada - FRONT side */}
      <mesh position={[0, trolleyHeight + 0.05, trolleyDepth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[trolleyWidth / 2.2, 0.02, 16, 32, Math.PI]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Agarradera superior curvada - BACK side */}
      <mesh position={[0, trolleyHeight + 0.05, -trolleyDepth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[trolleyWidth / 2.2, 0.02, 16, 32, Math.PI]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Soportes verticales de la agarradera - FRONT */}
      <mesh position={[-trolleyWidth / 3, trolleyHeight + 0.02, trolleyDepth / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 16]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[trolleyWidth / 3, trolleyHeight + 0.02, trolleyDepth / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 16]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Soportes verticales de la agarradera - BACK */}
      <mesh position={[-trolleyWidth / 3, trolleyHeight + 0.02, -trolleyDepth / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 16]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[trolleyWidth / 3, trolleyHeight + 0.02, -trolleyDepth / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 16]} />
        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Cajones FRONT side (facing forward) */}
      {Array.from({ length: numDrawers }).map((_, i) => {
        const y = drawerStartY + i * drawerHeight + drawerHeight / 2;
        return (
          <group key={`drawer-front-${i}`}>
            <mesh position={[0, y, trolleyDepth / 2 - 0.02]}>
              <boxGeometry args={[drawerWidth, drawerHeight * 0.9, frameThickness]} />
              <meshStandardMaterial color={drawerColor} metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Manija front */}
            <mesh position={[0, y, trolleyDepth / 2]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.005, 0.005, drawerWidth * 0.6, 16]} />
              <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Cajones BACK side (facing backward) */}
      {Array.from({ length: numDrawers }).map((_, i) => {
        const y = drawerStartY + i * drawerHeight + drawerHeight / 2;
        return (
          <group key={`drawer-back-${i}`}>
            <mesh position={[0, y, -trolleyDepth / 2 + 0.02]}>
              <boxGeometry args={[drawerWidth, drawerHeight * 0.9, frameThickness]} />
              <meshStandardMaterial color={drawerColor} metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Manija back */}
            <mesh position={[0, y, -trolleyDepth / 2]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.005, 0.005, drawerWidth * 0.6, 16]} />
              <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Ruedas */}
      {[
        [-wheelOffsetX, 0, wheelOffsetZ],
        [wheelOffsetX, 0, wheelOffsetZ],
        [-wheelOffsetX, 0, -wheelOffsetZ],
        [wheelOffsetX, 0, -wheelOffsetZ],
      ].map((pos, i) => (
        <group key={`wheel-${i}`} position={pos}>
          {/* Rueda principal */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[wheelRadius, wheelRadius, 0.04, 16]} />
            <meshStandardMaterial color={wheelColor} metalness={0.2} roughness={0.8} />
          </mesh>
          {/* Eje metálico */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.05, 16]} />
            <meshStandardMaterial color={axleColor} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Soporte vertical */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.03, 0.1, 0.03]} />
            <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Trolley3D({ cajones, drawerStates, isFullscreen }) {
  const groupRef = useRef();

  useFrame((_state, delta) => {
    if (groupRef.current && !isFullscreen) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  // Convert cajones array to drawerStates object for compatibility
  const effectiveDrawerStates = cajones 
    ? cajones.reduce((acc, cajon) => {
        acc[cajon.id] = cajon.status;
        return acc;
      }, {})
    : drawerStates || {};

  // Log para debugging - ver los estados
  useEffect(() => {
    console.log('🎨 Drawer states updated:', effectiveDrawerStates);
  }, [cajones, drawerStates]);

  return (
    <>
      {/* Improved lighting for better visibility */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 5, -10]} intensity={0.6} />
      <pointLight position={[0, 5, 0]} intensity={0.8} />
      <hemisphereLight args={['#ffffff', '#8888ff', 0.6]} />
      <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={0.8} castShadow />

      {isFullscreen && <OrbitControls enablePan={true} enableZoom={true} />}
      
      <group ref={groupRef} dispose={null} position={[0, -0.8, 0]}> 
        <TrolleyModel /> 
        {Object.keys(effectiveDrawerStates).map((drawerId, index) => {
          if (index < drawerPositions.length) {
            const drawerStatus = effectiveDrawerStates[drawerId];
            console.log(`Rendering drawer ${drawerId} at index ${index} with status: ${drawerStatus}`);
            return (
              <Drawer
                key={drawerId}
                status={drawerStatus}
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

export default Trolley3D;
