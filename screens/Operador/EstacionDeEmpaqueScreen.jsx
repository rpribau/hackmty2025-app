import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal as RNModal,
  SafeAreaView
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

// --- ¡IMPORTS 3D! ---
import { Canvas } from '@react-three/fiber/native';
import Trolley3D from '../../components/Trolley3D'; // ¡El componente 3D real!

// --- Tus Imports ---
import { getPackingJob } from '../../api/mockapi';
import { Package, Clock, ScanLine, Check, Maximize2, X, ChevronUp, ChevronDown } from 'lucide-react-native';
import FeedbackModal from '../../components/FeedbackModal';

export default function EstacionDeEmpaqueScreen({ navigation }) {
  // ... (Todos tus 'useState' y 'useRef' de BottomSheet están perfectos) ...
  const [job, setJob] = useState(null);
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [drawerStates, setDrawerStates] = useState({});
  const [timer, setTimer] = useState(0);
  const [modal, setModal] = useState({ isVisible: false, type: '', message: '' });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '90%'], []);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  // ... (Tus 'useEffect' y funciones 'formatTime' están perfectos) ...
  useEffect(() => {
    getPackingJob().then(data => {
      setJob(data);
      const initialStates = data.cajones.reduce((acc, drawer) => {
        acc[drawer.id] = 'pending';
        return acc;
      }, {});
      setDrawerStates(initialStates);
    });
  }, []);

  useEffect(() => {
    if (job) {
      const interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [job]);

  const formatTime = (s) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // ... (Tus 'handleSelectDrawer' y 'handleScanLote' están perfectos) ...
  const handleSelectDrawer = (drawer) => {
    if (drawerStates[drawer.id] === 'pending') {
      setCurrentDrawer(drawer);
      bottomSheetRef.current?.snapToIndex(1);
    }
  };

  const handleScanLote = () => {
    setModal({
      isVisible: true,
      type: 'success',
      message: `Lote OK para ${currentDrawer.nombre}`
    });
    setDrawerStates(prev => ({ ...prev, [currentDrawer.id]: 'completed' }));
    setCurrentDrawer(null);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSheetChanges = useCallback((index) => {
    setIsSheetExpanded(index === 1);
  }, []);

  if (!job) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando tarea de empaque...</Text>
      </View>
    );
  }

  // --- UI Principal ---
  return (
    <SafeAreaView style={styles.container}>
      <FeedbackModal
        isVisible={modal.isVisible}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ isVisible: false, type: '', message: '' })}
      />

      {/* Modal de pantalla completa (¡AHORA MUESTRA EL 3D!) */}
      <RNModal
        visible={isFullscreen}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          {/* Canvas 3D en Pantalla Completa */}
          <Suspense fallback={<ActivityIndicator size="large" color="#3b82f6" />}>
            <Canvas>
              <Trolley3D drawerStates={drawerStates} isFullscreen={true} />
            </Canvas>
          </Suspense>

          <TouchableOpacity
            style={styles.closeFullscreenButton}
            onPress={() => setIsFullscreen(false)}
          >
            <X color="#111827" size={30} />
          </TouchableOpacity>
        </SafeAreaView>
      </RNModal>

      {/* 1. Encabezado (Superpuesto) */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Vuelo: {job.vuelo}</Text>
          <Text style={styles.headerSubtitle}>Destino: {job.destino}</Text>
        </View>
        <TouchableOpacity
          style={styles.fullscreenButton}
          onPress={() => setIsFullscreen(true)}
        >
          <Maximize2 color="#111827" size={20} />
        </TouchableOpacity>
      </View>

      {/* 2. Visualizador del Carrito (¡AHORA ES 3D!) */}
      <View style={styles.canvasContainer}>
        {/* ¡AQUÍ ESTÁ EL CAMBIO! Se fue el Trolley2D y entró el Canvas 3D */}
        <Suspense fallback={
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Cargando modelo 3D...</Text>
          </View>
        }>
          <Canvas>
            <Trolley3D drawerStates={drawerStates} isFullscreen={false} />
          </Canvas>
        </Suspense>
        
        {/* Tarjeta de Tiempos (Superpuesta) */}
        <View style={styles.timerCard}>
          <View style={styles.timerBox}>
            <Text style={styles.timerLabel}>Std (μ)</Text>
            <Text style={styles.timerText}>{formatTime(job.tiempoEstandar)}</Text>
          </View>
          <View style={[styles.timerBox, styles.timerBoxHighlight]}>
            <Text style={styles.timerLabel}>Tu Tiempo</Text>
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
        </View>
      </View>

      {/* 3. Panel Deslizable (Bottom Sheet) - Esto ya funciona */}
      {/* Esta es AHORA la ÚNICA lista de cajones */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0} // Empieza minimizado
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <View style={styles.bottomSheetContentContainer}>
          <View style={styles.handleChevronContainer}>
            {isSheetExpanded ? <ChevronDown color="#9ca3af" size={24} /> : <ChevronUp color="#9ca3af" size={24} />}
          </View>

          {!currentDrawer ? (
            // --- Vista de Lista de Cajones ---
            <>
              <Text style={styles.taskTitle}>Cajones Pendientes</Text>
              <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
                {job.cajones.map((drawer) => (
                  <TouchableOpacity
                    key={drawer.id}
                    style={[
                      styles.drawerItem,
                      drawerStates[drawer.id] === 'completed' && styles.drawerItemCompleted
                    ]}
                    onPress={() => handleSelectDrawer(drawer)}
                    disabled={drawerStates[drawer.id] === 'completed'}
                  >
                    <View style={[
                      styles.drawerIcon,
                      drawerStates[drawer.id] === 'completed' && styles.drawerIconCompleted
                    ]}>
                      {drawerStates[drawer.id] === 'completed' ?
                        <Check color="#16a34a" size={20} /> :
                        <Clock color="#6b7280" size={20} />
                      }
                    </View>
                    <View style={styles.drawerTextContainer}>
                      <Text style={styles.drawerName}>{drawer.nombre}</Text>
                      <Text style={styles.drawerContent}>{drawer.contenido}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </BottomSheetScrollView>
            </>
          ) : (
            // --- Vista de Acción de Escaneo ---
            <View style={styles.scanActionContainer}>
              <Text style={styles.scanTitle}>Acción Requerida</Text>
              <Text style={styles.scanSubtitle}>
                Escanear Lote (FEFO) para: <Text style={{ fontWeight: 'bold' }}>{currentDrawer.nombre}</Text>
              </Text>
              <TouchableOpacity style={styles.scanButton} onPress={handleScanLote}>
                <ScanLine color="#ffffff" size={24} />
                <Text style={styles.scanButtonText}>Escanear Lote</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentDrawer(null)}>
                <Text style={styles.cancelText}>Volver a la lista</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
// (Los estilos son los mismos de la versión "Bottom Sheet"
// que ya te había pasado, ya que están diseñados para este layout)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e7ff', // Fondo del canvas ahora es el fondo principal
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.7)',
    position: 'absolute',
    top: 40, // Asume SafeAreaView
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  canvasContainer: {
    flex: 1, // Ocupa todo el espacio disponible
    position: 'relative',
    marginTop: 100, // Espacio para el header
    marginBottom: 50, // Espacio para el timer
  },
  timerCard: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  timerBox: {
    flex: 1,
    alignItems: 'center',
  },
  timerBoxHighlight: {
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  timerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  timerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  fullscreenButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#e0e7ff',
  },
  closeFullscreenButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 24,
    elevation: 4,
    zIndex: 10,
  },
  // --- Estilos del Bottom Sheet ---
  bottomSheetBackground: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: '#d1d5db',
    width: 40,
  },
  bottomSheetContentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  handleChevronContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  drawerItemCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
    opacity: 0.7,
  },
  drawerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerIconCompleted: {
    backgroundColor: '#dcfce7',
  },
  drawerTextContainer: {
    flex: 1,
  },
  drawerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  drawerContent: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  scanActionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  scanSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 3,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  cancelText: {
    marginTop: 20,
    color: '#6b7280',
    fontSize: 16,
  },
});