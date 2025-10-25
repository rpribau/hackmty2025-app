import React, { useState, useEffect, Suspense } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Modal,
  SafeAreaView // <-- Importar SafeAreaView
} from 'react-native';
// Temporarily use 2D fallback
import Trolley2D from '../../components/Trolley2D';
// import { Canvas } from '@react-three/fiber/native';
// import Trolley3D from '../../components/Trolley3D';
import { getPackingJob } from '../../api/mockapi';
import { Package, Clock, ScanLine, Check, Maximize2, X } from 'lucide-react-native';
import FeedbackModal from '../../components/FeedbackModal';

export default function EstacionDeEmpaqueScreen({ navigation }) {
  const [job, setJob] = useState(null);
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [drawerStates, setDrawerStates] = useState({});
  const [timer, setTimer] = useState(0);
  const [modal, setModal] = useState({ isVisible: false, type: '', message: '' });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ... (useEffects y funciones sin cambios) ...
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

  const handleSelectDrawer = (drawer) => {
    if (drawerStates[drawer.id] === 'pending') {
      setCurrentDrawer(drawer);
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
  };

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
    // Usamos SafeAreaView para evitar que se encime con la barra de estado/notch
    <SafeAreaView style={styles.container}>
      <FeedbackModal 
        isVisible={modal.isVisible}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ isVisible: false, type: '', message: '' })}
      />

      {/* Modal de pantalla completa (2D fallback) */}
      <Modal
        visible={isFullscreen}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          <Trolley2D drawerStates={drawerStates} />
          {/* Botón para cerrar la pantalla completa */}
          <TouchableOpacity 
            style={styles.closeFullscreenButton} 
            onPress={() => setIsFullscreen(false)}
          >
            <X color="#111827" size={30} />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* 1. Encabezado */}
      <View style={styles.header}>
        <Package color="#111827" size={30} />
        <View>
          <Text style={styles.headerTitle}>Vuelo: {job.vuelo}</Text>
          <Text style={styles.headerSubtitle}>Destino: {job.destino}</Text>
        </View>
      </View>

      {/* 2. Tarjeta de Tiempos */}
      <View style={styles.timerCard}>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Tiempo Estándar (μ)</Text>
          <Text style={styles.timerText}>{formatTime(job.tiempoEstandar)}</Text>
        </View>
        <View style={[styles.timerBox, styles.timerBoxHighlight]}>
          <Text style={styles.timerLabel}>Tu Tiempo</Text>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      </View>

      {/* 3. Visualizador del Carrito (¡AHORA FLEXIBLE!) */}
      <View style={styles.canvasContainer}>
        <Trolley2D drawerStates={drawerStates} />
        {/* Botón de Fullscreen */}
        <TouchableOpacity 
          style={styles.fullscreenButton} 
          onPress={() => setIsFullscreen(true)}
        >
          <Maximize2 color="#111827" size={20} />
        </TouchableOpacity>
      </View>

      {/* 4. Lista de Tareas / Acción (¡AHORA FLEXIBLE!) */}
      <View style={styles.taskContainer}>
        {!currentDrawer ? (
          // --- Vista de Lista de Cajones ---
          <>
            <Text style={styles.taskTitle}>Cajones Pendientes</Text>
            <ScrollView>
              {job.cajones.map((drawer) => (
                <TouchableOpacity 
                  key={drawer.id} 
                  style={[
                    styles.drawerItem, 
                    drawerStates[drawer.id] === 'completed' && styles.drawerItemCompleted
                  ]}
                  onPress={() => handleSelectDrawer(drawer)}
                >
                  <View style={[
                    styles.drawerIcon,
                    drawerStates[drawer.id] === 'completed' && styles.drawerIconCompleted
                  ]}>
                    {drawerStates[drawer.id] === 'completed' ? 
                      <Check color="#16a34a" size={24} /> :
                      <Clock color="#6b7280" size={24} />
                    }
                  </View>
                  <View>
                    <Text style={styles.drawerName}>{drawer.nombre}</Text>
                    <Text style={styles.drawerContent}>{drawer.contenido}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : (
          // --- Vista de Acción de Escaneo ---
          <View style={styles.scanActionContainer}>
            <Text style={styles.scanTitle}>Acción Requerida</Text>
            <Text style={styles.scanSubtitle}>
              Escanear Lote (FEFO) para: <Text style={{fontWeight: 'bold'}}>{currentDrawer.nombre}</Text>
            </Text>
            <TouchableOpacity style={styles.scanButton} onPress={handleScanLote}>
              <ScanLine color="#ffffff" size={30} />
              <Text style={styles.scanButtonText}>Escanear Lote</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentDrawer(null)}>
              <Text style={styles.cancelText}>Volver a la lista</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- ¡ESTILOS CORREGIDOS! ---
  container: {
    flex: 1, // <--- CLAVE: Ocupar toda la pantalla
    backgroundColor: '#f8fafc',
  },
  canvasContainer: {
    flex: 0.4, // <--- CLAVE: 40% de la pantalla para el modelo
    backgroundColor: '#e0e7ff',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  taskContainer: {
    flex: 0.6, // <--- CLAVE: 60% de la pantalla para las tareas
    backgroundColor: '#ffffff',
    padding: 20,
    // Se quitó el marginTop: -20 para un layout limpio
  },
  // --- FIN DE ESTILOS CORREGIDOS ---

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12, // Menos padding vertical
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 22, // Ligeramente más pequeño
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 16,
  },
  timerCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12, // Menos padding
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timerBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  timerBoxHighlight: {
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  timerLabel: {
    fontSize: 14, // Ligeramente más pequeño
    color: '#6b7280',
    marginBottom: 4,
  },
  timerText: {
    fontSize: 26, // Ligeramente más pequeño
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
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
    top: 50, // Asume SafeAreaView
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 24,
    elevation: 4,
  },
  taskTitle: {
    fontSize: 20, // Ligeramente más pequeño
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12, // Menos padding
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80, // Altura mínima para que no se compacte
  },
  drawerItemCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  drawerIcon: {
    width: 44, // Ligeramente más pequeño
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  drawerIconCompleted: {
    backgroundColor: '#dcfce7',
  },
  drawerName: {
    fontSize: 16, // Ligeramente más pequeño
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
    paddingHorizontal: 24,
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
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 18, // Ligeramente más pequeño
    paddingHorizontal: 32,
    borderRadius: 12, // Ligeramente más pequeño
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 220, // Ligeramente más pequeño
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  cancelText: {
    marginTop: 24,
    color: '#6b7280',
    fontSize: 16,
  },
});

