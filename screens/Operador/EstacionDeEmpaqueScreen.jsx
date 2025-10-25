import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { Package, Clock, ScanLine, AlertTriangle, CheckCircle } from 'lucide-react-native';
// Local mock implementations to avoid dependency resolution errors.
// These mimic the small API used by this screen and can be replaced
// with the real api/mockApi module when available.
const getPackingTask = async () => {
  // simulate network delay
  await new Promise((res) => setTimeout(res, 300));
  return {
    vuelo: 'H123',
    tiempoEstandar: 45,
    // Provide a couple of items so the screen logic works
    items: [
      { nombre: 'Producto A', qtyRequerida: 2 },
      { nombre: 'Producto B', qtyRequerida: 3 },
    ],
  };
};

const validateLoteFEFO = async (loteQR) => {
  // simulate validation delay
  await new Promise((res) => setTimeout(res, 200));
  if (!loteQR) {
    return { status: 'error', message: 'Lote vacío' };
  }
  // Simple heuristic: if the scanned data includes 'OK' treat as valid
  if (String(loteQR).toUpperCase().includes('OK')) {
    return { status: 'success' };
  }
  return { status: 'error', message: 'Lote no válido FEFO' };
};
import Trolley3D from '../../components/Trolley3D'; // <-- ¡IMPORTAR EL COMPONENTE 3D!

/**
 * Pantalla para el Paso 2: Empaque Guiado (MODIFICADA CON 3D)
 * Muestra el modelo 3D del carrito y la tarea actual.
 */
export default function EstacionDeEmpaqueScreen({ navigation, route }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Seguimiento de los cajones y artículos
  const [currentDrawerIndex, setCurrentDrawerIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [itemsScanned, setItemsScanned] = useState(0); // Cuántos items del lote actual se han escaneado

  // Estado para el modelo 3D
  const [drawerStatuses, setDrawerStatuses] = useState([
    { id: 0, status: 'pendiente' }, { id: 1, status: 'pendiente' },
    { id: 2, status: 'pendiente' }, { id: 3, status: 'pendiente' },
    { id: 4, status: 'pendiente' }, { id: 5, status: 'pendiente' },
    { id: 6, status: 'pendiente' }, { id: 7, status: 'pendiente' },
  ]);

  const [scannedLote, setScannedLote] = useState(null);
  const [alert, setAlert] = useState({ visible: false, type: '', message: '' });

  // 1. Cargar la tarea de empaque
  useEffect(() => {
    (async () => {
      setLoading(true);
      const taskData = await getPackingTask();
      setTask(taskData);
      // Simular que la tarea tiene 8 cajones (drawers)
      // En la vida real, 'taskData' traería la info de los 8 cajones
      // Por ahora, solo nos enfocamos en el primer cajón (que tiene 2 items)
      setLoading(false);
    })();
  }, []);

  // 2. Recibir el QR escaneado y validarlo
  useEffect(() => {
    if (route.params?.scannedData) {
      const loteQR = route.params.scannedData;
      setScannedLote(loteQR);
      handleValidation(loteQR);
    }
  }, [route.params?.scannedData]);

  // 3. Lógica de Validación FEFO
  const handleValidation = async (loteQR) => {
    const result = await validateLoteFEFO(loteQR);

    if (result.status === 'success') {
      // ¡ÉXITO!
      setAlert({ visible: true, type: 'success', message: 'LOTE CORRECTO' });
      
      // Simular que el escaneo fue exitoso para el ítem
      // (Aquí iría la lógica de contar: 1, 2, 3... hasta 32)
      setItemsScanned(itemsScanned + 1); 
      
      // Simulación: Si escaneamos el lote correcto, asumimos que terminamos el ítem
      // Y si terminamos el último ítem, completamos el cajón
      
      const currentItem = task.items[currentItemIndex];
      // Si este escaneo completa la cantidad requerida
      // (Simulación simplificada)
      if (itemsScanned + 1 >= currentItem.qtyRequerida) {
        // ¿Hay más items en este cajón?
        if (currentItemIndex + 1 < task.items.length) {
          // Pasar al siguiente ítem
          setCurrentItemIndex(currentItemIndex + 1);
          setItemsScanned(0); // Resetear contador
        } else {
          // ¡CAJÓN COMPLETO!
          completeDrawer();
        }
      }
    } else {
      // ¡ERROR!
      setAlert({ visible: true, type: 'error', message: result.message });
      // El cajón 3D podría parpadear en rojo aquí
    }
  };

  // 4. Lógica de "Gamificación" 3D
  const completeDrawer = () => {
    // Actualizar el estado del cajón para el modelo 3D
    const newStatuses = [...drawerStatuses];
    newStatuses[currentDrawerIndex].status = 'completado';
    setDrawerStatuses(newStatuses);

    // Avanzar al siguiente cajón (si hay)
    if (currentDrawerIndex + 1 < 8) { // Asumimos 8 cajones
      setCurrentDrawerIndex(currentDrawerIndex + 1);
      setCurrentItemIndex(0); // Resetear al primer ítem del nuevo cajón
      setItemsScanned(0);
      // Cargar la nueva tarea del cajón (no implementado en mockApi)
      setAlert({ visible: true, type: 'info', message: '¡Cajón Completo! Siguiente cajón.' });
    } else {
      // ¡CARRITO COMPLETO!
      setAlert({ visible: true, type: 'info', message: '¡CARRITO COMPLETO! Tarea finalizada.' });
      // Aquí navegaríamos de vuelta o a la siguiente tarea
    }
  };

  const closeAlert = () => {
    setAlert({ visible: false, type: '', message: '' });
    navigation.setParams({ scannedData: null });
    setScannedLote(null);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }
  if (!task) {
    return <Text style={styles.errorText}>No se pudo cargar la tarea.</Text>;
  }

  const currentItem = task.items[currentItemIndex];

  return (
    <View style={styles.container}>
      {/* Modal de Alerta Rojo/Verde */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={alert.visible}
        onRequestClose={closeAlert}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.alertBox, 
            alert.type === 'success' ? styles.alertSuccess : 
            alert.type === 'error' ? styles.alertError : styles.alertInfo
          ]}>
            {alert.type === 'success' && <CheckCircle color="#ffffff" size={60} />}
            {alert.type === 'error' && <AlertTriangle color="#ffffff" size={60} />}
            {alert.type === 'info' && <Package color="#ffffff" size={60} />}
            <Text style={styles.alertText}>{alert.message}</Text>
            <Button title="Cerrar" onPress={closeAlert} color="#ffffff" />
          </View>
        </View>
      </Modal>

      {/* Info de Tarea */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Vuelo: {task.vuelo} (Cajón {currentDrawerIndex + 1}/8)</Text>
        <View style={styles.kpiContainer}>
          <Clock color="#3b82f6" size={20} />
          <Text style={styles.kpiText}>Tiempo Estándar (μ): {task.tiempoEstandar} seg.</Text>
        </View>
      </View>
      
      {/* ¡NUEVO! Canvas 3D */}
      <Trolley3D drawerStatuses={drawerStatuses} />

      {/* Tarea Actual */}
      <View style={styles.taskCard}>
        <Text style={styles.taskLabel}>TAREA (Cajón {currentDrawerIndex + 1}):</Text>
        <Text style={styles.taskItem}>{currentItem.nombre}</Text>
        <Text style={styles.taskQty}>Progreso: {itemsScanned} / {currentItem.qtyRequerida}</Text>
      </View>

      {/* Botón de Escaneo */}
      <TouchableOpacity 
        style={styles.scanButton} 
        onPress={() => navigation.navigate('Scanner')}
      >
        <ScanLine color="#ffffff" size={30} />
        <Text style={styles.scanButtonText}>Escanear Lote ({currentItem.nombre})</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5',
    padding: 15,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  kpiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 5,
  },
  kpiText: {
    fontSize: 16,
    color: '#1e40af',
    marginLeft: 8,
    fontWeight: '500',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  taskLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  taskItem: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginVertical: 5,
    textAlign: 'center',
  },
  taskQty: {
    fontSize: 20,
    fontWeight: '500',
    color: '#3b82f6',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
    marginTop: 'auto', // Pega el botón abajo
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Estilos del Modal de Alerta
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '80%',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  alertSuccess: {
    backgroundColor: '#16a34a', // Verde
  },
  alertError: {
    backgroundColor: '#dc2626', // Rojo
  },
  alertInfo: {
    backgroundColor: '#2563eb', // Azul
  },
  alertText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
});

