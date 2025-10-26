import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { 
  Package, 
  QrCode, 
  CheckCircle, 
  AlertTriangle,
  Save,
  X,
  ChevronRight,
  Lock
} from 'lucide-react-native';
import { Canvas } from '@react-three/fiber/native';
import { getDrawerJob, validateDrawerQR, saveDrawerData, completePackingJob, checkJobAvailability } from '../../api/mockapi';
import Trolley3D from '../../components/Trolley3D';

/**
 * Pantalla para Empaque Guiado (Paso 2)
 * Flujo completo:
 * 1. Mostrar lista de cajones del trabajo
 * 2. Usuario selecciona cajón → Escanea QR
 * 3. Se muestra lista de items a llenar
 * 4. Usuario confirma llenado → Guarda cajón
 * 5. Cuando todos los cajones están completos → Guardar trabajo completo
 * 6. Verificar disponibilidad de nuevo trabajo
 */
export default function EmpaqueGuiadoScreen({ navigation, route }) {
  // Estado del trabajo
  const [jobData, setJobData] = useState(null);
  const [drawers, setDrawers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado del cajón activo
  const [selectedDrawer, setSelectedDrawer] = useState(null);
  const [drawerDetails, setDrawerDetails] = useState(null);
  const [itemsChecked, setItemsChecked] = useState({});
  
  // Estados de UI
  const [showScanner, setShowScanner] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completingJob, setCompletingJob] = useState(false);

  // 1. Cargar el trabajo al montar el componente
  useEffect(() => {
    loadJob();
  }, []);

  // 2. Listener para QR escaneado
  useEffect(() => {
    if (route.params?.scannedData && selectedDrawer) {
      handleDrawerQRScanned(route.params.scannedData);
    }
  }, [route.params?.scannedData]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const job = await getDrawerJob();
      setJobData(job);
      
      // Inicializar estado de cajones
      const initialDrawers = job.drawers.map(drawer => ({
        ...drawer,
        status: 'pending', // pending, in-progress, completed
        scanned: false
      }));
      setDrawers(initialDrawers);
    } catch (error) {
      alert('Error al cargar el trabajo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Usuario selecciona un cajón
  const handleSelectDrawer = (drawer) => {
    if (drawer.status === 'completed') {
      alert('Este cajón ya está completado');
      return;
    }
    
    setSelectedDrawer(drawer);
    setShowScanner(true);
    // Navegar a scanner
    navigation.navigate('Scanner');
  };

  // 4. QR del cajón escaneado
  const handleDrawerQRScanned = async (qrCode) => {
    navigation.setParams({ scannedData: null });
    setShowScanner(false);
    
    try {
      // Validar QR y obtener detalles del cajón
      const details = await validateDrawerQR(qrCode, selectedDrawer.id);
      
      if (details.status === 'error') {
        alert(details.message);
        setSelectedDrawer(null);
        return;
      }
      
      // Actualizar estado del cajón a "in-progress"
      setDrawers(prev => prev.map(d => 
        d.id === selectedDrawer.id 
          ? { ...d, status: 'in-progress', scanned: true, qrCode: qrCode }
          : d
      ));
      
      // Mostrar detalles del cajón
      setDrawerDetails(details.data);
      
      // Inicializar checklist
      const initialChecked = {};
      details.data.items.forEach(item => {
        initialChecked[item.id] = false;
      });
      setItemsChecked(initialChecked);
      
    } catch (error) {
      alert('Error al validar el QR del cajón');
      console.error(error);
      setSelectedDrawer(null);
    }
  };

  // 5. Usuario marca/desmarca un item
  const toggleItem = (itemId) => {
    setItemsChecked(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // 6. Usuario confirma que llenó el cajón
  const handleConfirmDrawer = () => {
    // Verificar que todos los items estén marcados
    const allChecked = Object.values(itemsChecked).every(checked => checked);
    
    if (!allChecked) {
      alert('Por favor marca todos los items como completados');
      return;
    }
    
    setShowConfirmModal(true);
  };

  // 7. Guardar datos del cajón
  const handleSaveDrawer = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    
    try {
      const drawerData = {
        drawerId: selectedDrawer.id,
        qrCode: drawers.find(d => d.id === selectedDrawer.id).qrCode,
        items: drawerDetails.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          completed: itemsChecked[item.id]
        })),
        completedAt: new Date().toISOString()
      };
      
      const result = await saveDrawerData(drawerData);
      
      if (result.status === 'success') {
        // Actualizar estado del cajón a "completed"
        setDrawers(prev => prev.map(d => 
          d.id === selectedDrawer.id 
            ? { ...d, status: 'completed' }
            : d
        ));
        
        // Limpiar estado
        setSelectedDrawer(null);
        setDrawerDetails(null);
        setItemsChecked({});
        
        alert('✅ Cajón guardado correctamente');
      } else {
        alert('Error al guardar: ' + result.message);
      }
    } catch (error) {
      alert('Error al guardar el cajón');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // 8. Verificar si todos los cajones están completos
  const allDrawersCompleted = () => {
    return drawers.every(d => d.status === 'completed');
  };

  // 9. Usuario finaliza el trabajo completo
  const handleCompleteJob = () => {
    if (!allDrawersCompleted()) {
      alert('Debes completar todos los cajones antes de finalizar');
      return;
    }
    
    setShowFinalConfirmModal(true);
  };

  // 10. Confirmar finalización del trabajo
  const handleFinalConfirm = async () => {
    setShowFinalConfirmModal(false);
    setCompletingJob(true);
    
    try {
      const result = await completePackingJob(jobData.jobId, drawers);
      
      if (result.status === 'success') {
        // Actualizar el estado del trabajo
        setJobData(prev => ({
          ...prev,
          status: true, // FALSE → TRUE
          locked: true
        }));
        
        // Verificar si hay trabajos disponibles
        const availability = await checkJobAvailability();
        
        alert('🎉 Trabajo completado exitosamente!\n\n' + 
              '📊 Estado del trabajo: FALSE → TRUE\n' +
              '🔒 Trabajo bloqueado - No se pueden editar cajones\n\n' +
              (availability.available 
                ? '✅ Hay nuevos trabajos disponibles' 
                : '⏳ No hay trabajos disponibles por el momento'));
        
        // Regresar al Home
        navigation.navigate('OperadorHome', {
          jobCompleted: true,
          hasNewJobs: availability.available,
          jobStatus: true // Enviamos el nuevo estado
        });
      } else {
        alert('Error al finalizar: ' + result.message);
      }
    } catch (error) {
      alert('Error al completar el trabajo');
      console.error(error);
    } finally {
      setCompletingJob(false);
    }
  };

  // 11. Cancelar llenado de cajón
  const handleCancelDrawer = () => {
    setSelectedDrawer(null);
    setDrawerDetails(null);
    setItemsChecked({});
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando trabajo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* --- MODAL: CONFIRMAR CAJÓN --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showConfirmModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <AlertTriangle size={48} color="#f59e0b" />
            <Text style={styles.confirmTitle}>¿Confirmar cajón?</Text>
            <Text style={styles.confirmText}>
              Estás a punto de guardar este cajón. Los datos no podrán ser editados después.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={handleSaveDrawer}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: CONFIRMAR TRABAJO COMPLETO --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showFinalConfirmModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Lock size={48} color="#ef4444" />
            <Text style={styles.confirmTitle}>¿Finalizar trabajo?</Text>
            <Text style={styles.confirmText}>
              Una vez finalizado, <Text style={{ fontWeight: 'bold' }}>NO podrás editar ningún cajón</Text>. 
              ¿Estás seguro de que todos los cajones están correctamente llenados?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowFinalConfirmModal(false)}
              >
                <Text style={styles.modalCancelText}>Revisar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmButton, { backgroundColor: '#ef4444' }]}
                onPress={handleFinalConfirm}
              >
                <Text style={styles.modalConfirmText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- HEADER DEL TRABAJO --- */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Package size={28} color="#3b82f6" />
            <View style={styles.headerInfo}>
              <Text style={styles.flightNumber}>Vuelo {jobData?.flight}</Text>
              <Text style={styles.route}>{jobData?.route}</Text>
            </View>
          </View>
          
          {/* DONE BUTTON - Top Right */}
          <TouchableOpacity 
            style={[
              styles.doneButton,
              !allDrawersCompleted() && styles.doneButtonDisabled
            ]}
            onPress={handleCompleteJob}
            disabled={!allDrawersCompleted() || completingJob}
          >
            {completingJob ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <CheckCircle size={20} color="white" />
                <Text style={styles.doneButtonText}>Done</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(drawers.filter(d => d.status === 'completed').length / drawers.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {drawers.filter(d => d.status === 'completed').length} / {drawers.length} cajones completados
        </Text>
      </View>

      {/* --- VISTA: LISTA DE CAJONES --- */}
      {!drawerDetails && (
        <ScrollView style={styles.drawerList}>
          
          {/* --- 3D TROLLEY MODEL --- */}
          <View style={styles.trolley3DContainer}>
            <Canvas camera={{ position: [0, 0, 2.5], fov: 60 }}>
              <Trolley3D cajones={drawers} />
            </Canvas>
          </View>

          <Text style={styles.sectionTitle}>Selecciona un cajón para llenar</Text>
          
          {drawers.map((drawer) => (
            <TouchableOpacity
              key={drawer.id}
              style={[
                styles.drawerCard,
                drawer.status === 'completed' && styles.drawerCardCompleted,
                drawer.status === 'in-progress' && styles.drawerCardInProgress
              ]}
              onPress={() => handleSelectDrawer(drawer)}
              disabled={drawer.status === 'completed'}
            >
              <View style={styles.drawerCardLeft}>
                {drawer.status === 'completed' ? (
                  <CheckCircle size={24} color="#16a34a" />
                ) : drawer.status === 'in-progress' ? (
                  <QrCode size={24} color="#f59e0b" />
                ) : (
                  <Package size={24} color="#64748b" />
                )}
                <View style={styles.drawerCardInfo}>
                  <Text style={[
                    styles.drawerCardTitle,
                    drawer.status === 'completed' && styles.drawerCardTitleCompleted
                  ]}>
                    {drawer.name}
                  </Text>
                  <Text style={styles.drawerCardSubtitle}>{drawer.description}</Text>
                </View>
              </View>
              
              {drawer.status === 'completed' ? (
                <Lock size={20} color="#16a34a" />
              ) : (
                <ChevronRight size={20} color="#94a3b8" />
              )}
            </TouchableOpacity>
          ))}

        </ScrollView>
      )}

      {/* --- VISTA: DETALLES DEL CAJÓN Y CHECKLIST --- */}
      {drawerDetails && (
        <View style={styles.drawerDetailContainer}>
          <ScrollView style={styles.drawerDetailScroll}>
            {/* Header del cajón */}
            <View style={styles.drawerDetailHeader}>
              <Text style={styles.drawerDetailTitle}>{drawerDetails.name}</Text>
              <View style={styles.drawerDetailBadges}>
                <View style={[styles.badge, { backgroundColor: '#e0f2fe' }]}>
                  <Text style={[styles.badgeText, { color: '#0369a1' }]}>
                    {drawerDetails.type}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}>
                  <Text style={[styles.badgeText, { color: '#b45309' }]}>
                    {drawerDetails.class}
                  </Text>
                </View>
              </View>
            </View>

            {/* Lista de items */}
            <Text style={styles.itemsTitle}>Items a llenar ({drawerDetails.items.length})</Text>
            
            {drawerDetails.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  itemsChecked[item.id] && styles.itemCardChecked
                ]}
                onPress={() => toggleItem(item.id)}
              >
                <View style={styles.itemCardLeft}>
                  <View style={[
                    styles.checkbox,
                    itemsChecked[item.id] && styles.checkboxChecked
                  ]}>
                    {itemsChecked[item.id] && <CheckCircle size={20} color="white" />}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[
                      styles.itemName,
                      itemsChecked[item.id] && styles.itemNameChecked
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemQuantity}>Cantidad: {item.quantity}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.drawerDetailActions}>
            <TouchableOpacity 
              style={styles.cancelDrawerButton}
              onPress={handleCancelDrawer}
            >
              <X size={20} color="#64748b" />
              <Text style={styles.cancelDrawerText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.saveDrawerButton,
                !Object.values(itemsChecked).every(c => c) && styles.saveDrawerButtonDisabled
              ]}
              onPress={handleConfirmDrawer}
              disabled={!Object.values(itemsChecked).every(c => c)}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Save size={20} color="white" />
                  <Text style={styles.saveDrawerText}>Guardar Cajón</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },

  // --- HEADER ---
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: 12,
  },
  flightNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  route: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16a34a',
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  // --- LISTA DE CAJONES ---
  drawerList: {
    flex: 1,
    padding: 20,
  },
  trolley3DContainer: {
    height: 350,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
  },
  drawerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  drawerCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  drawerCardInProgress: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  drawerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drawerCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  drawerCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  drawerCardTitleCompleted: {
    color: '#16a34a',
  },
  drawerCardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },

  // --- DETALLES DEL CAJÓN ---
  drawerDetailContainer: {
    flex: 1,
  },
  drawerDetailScroll: {
    flex: 1,
    padding: 20,
  },
  drawerDetailHeader: {
    marginBottom: 24,
  },
  drawerDetailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  drawerDetailBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },

  // --- ITEMS CHECKLIST ---
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  itemCardChecked: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  itemCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  itemNameChecked: {
    color: '#16a34a',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },

  // --- ACCIONES DEL CAJÓN ---
  drawerDetailActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelDrawerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelDrawerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveDrawerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveDrawerButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveDrawerText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // --- MODALES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
