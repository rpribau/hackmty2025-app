import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { 
  Package, 
  QrCode, 
  CheckCircle, 
  AlertTriangle,
  Save,
  ChevronRight,
  Lock
} from 'lucide-react-native';
import { Canvas } from '@react-three/fiber/native';
import { drawersService, drawerStatusService, itemsService, restockHistoryService } from '../../api';
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
  // Initialize ref from route params (survives remount!)
  const selectedDrawerIdRef = useRef(route.params?.pendingDrawerId || null);
  const [drawerDetails, setDrawerDetails] = useState(null);
  const [itemsChecked, setItemsChecked] = useState({});
  
  // Estados de UI
  const [showScanner, setShowScanner] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completingJob, setCompletingJob] = useState(false);

  // Get employee ID from route params
  const employeeId = route.params?.employeeId;

  // 1. Cargar el trabajo al montar el componente
  useEffect(() => {
    loadJob();
  }, []);

  // 1.5. Bloquear navegación hacia atrás cuando hay un cajón en proceso
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Si no hay cajón en proceso, permitir navegación normal
      if (!drawerDetails) {
        return;
      }

      // Prevenir la navegación por defecto
      e.preventDefault();

      // Mostrar alerta de confirmación
      Alert.alert(
        'Proceso en curso',
        'Debes completar o guardar el cajón actual antes de salir.',
        [
          { text: 'Entendido', style: 'cancel' }
        ]
      );
    });

    return unsubscribe;
  }, [navigation, drawerDetails]);

  // 2. Listener para QR escaneado
  useEffect(() => {
    console.log('📱 QR Scan Effect triggered:', {
      scannedData: route.params?.scannedData,
      selectedDrawerIdRef: selectedDrawerIdRef.current,
      currentSelectedDrawer: selectedDrawer?.id
    });
    
    if (route.params?.scannedData && selectedDrawerIdRef.current) {
      // Find the drawer from ref
      const targetDrawer = drawers.find(d => d.id === selectedDrawerIdRef.current);
      
      if (targetDrawer) {
        console.log('✅ Processing QR scan for drawer from ref:', targetDrawer.drawer_code || targetDrawer.id);
        handleDrawerQRScanned(route.params.scannedData, targetDrawer);
      } else {
        console.log('⚠️ Drawer not found in drawers array:', selectedDrawerIdRef.current);
      }
    } else if (route.params?.scannedData && !selectedDrawerIdRef.current) {
      console.log('⚠️ QR scanned but no drawer selected in ref!');
    }
  }, [route.params?.scannedData, drawers]);

  const loadJob = async () => {
    setLoading(true);
    try {
      // Get all drawers from API
      const allDrawers = await drawersService.getDrawers(0, 100);
      
      // For now, simulate a job with first 16 drawers
      // In production, you would have a jobs API to get assigned jobs
      const jobDrawers = allDrawers.slice(0, 16);
      
      // Create job data structure
      const job = {
        jobId: 'JOB-' + Date.now(),
        flight: 'AA1234',
        route: 'MEX → NYC',
        status: false,
        locked: false,
        drawers: jobDrawers
      };
      
      setJobData(job);
      
      // 🆕 Fetch drawer_status records to check completion state
      console.log('🔍 Checking drawer completion status from database...');
      const drawerStatusMap = {};
      
      for (const drawer of jobDrawers) {
        try {
          const response = await drawerStatusService.getStatusByDrawer(drawer.id);
          // baseService.js already unwraps the response, so 'response' IS the data object
          // If we get here without error, drawer has status = completed
          if (response && response.id) {
            drawerStatusMap[drawer.id] = 'completed';
            console.log(`✅ Drawer ${drawer.drawer_code} is completed (DB status: ${response.status})`);
          } else {
            drawerStatusMap[drawer.id] = 'pending';
          }
        } catch (error) {
          // If 404 or error, drawer has no status = pending
          drawerStatusMap[drawer.id] = 'pending';
          console.log(`📝 Drawer ${drawer.drawer_code} is pending (no status records)`);
        }
      }
      
      // Inicializar estado de cajones con status real de la BD
      const initialDrawers = jobDrawers.map(drawer => ({
        ...drawer,
        id: drawer.id || drawer.drawer_id,
        name: `Cajón ${drawer.drawer_code || drawer.id}`,
        description: drawer.location || 'Sin ubicación',
        status: drawerStatusMap[drawer.id] || 'pending', // 🆕 Use DB status instead of hardcoded 'pending'
        scanned: drawerStatusMap[drawer.id] === 'completed'
      }));
      
      console.log('🎨 Final drawer states:', 
        Object.fromEntries(initialDrawers.map(d => [d.id, d.status]))
      );
      
      setDrawers(initialDrawers);
    } catch (error) {
      console.error('Error loading job:', error);
      Alert.alert(
        'Error',
        'No se pudo cargar el trabajo. Verifica la conexión con el servidor.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Usuario selecciona un cajón
  const handleSelectDrawer = (drawer) => {
    console.log('🎯 Drawer selected:', {
      id: drawer.id,
      drawer_code: drawer.drawer_code,
      status: drawer.status
    });
    
    if (drawer.status === 'completed') {
      Alert.alert('Cajón completado', 'Este cajón ya está completado');
      return;
    }
    
    setSelectedDrawer(drawer);
    selectedDrawerIdRef.current = drawer.id; // Store in ref!
    setShowScanner(true);
    console.log('🚀 Navigating to Scanner for drawer:', drawer.drawer_code || drawer.id);
    console.log('💾 Stored in ref:', selectedDrawerIdRef.current);
    // Store in navigation params so it survives component unmount!
    navigation.setParams({ pendingDrawerId: drawer.id });
    navigation.navigate('Scanner');
  };

  // 4. QR del cajón escaneado
  const handleDrawerQRScanned = async (qrCode, targetDrawer) => {
    console.log('🔍 Processing QR Code:', qrCode);
    console.log('🔍 Target drawer:', targetDrawer?.drawer_code || targetDrawer?.id);
    
    navigation.setParams({ scannedData: null, pendingDrawerId: null }); // Clear both params!
    setShowScanner(false);
    selectedDrawerIdRef.current = null; // Clear ref after use
    
    try {
      // Find drawer by QR code
      console.log('🌐 Finding drawer by QR code...');
      const drawer = await drawersService.findDrawerByQRCode(qrCode);
      console.log('📦 Found drawer:', drawer);
      
      if (!drawer || drawer.id !== targetDrawer.id) {
        console.log('❌ QR mismatch:', {
          foundDrawerId: drawer?.id,
          targetDrawerId: targetDrawer?.id,
          match: drawer?.id === targetDrawer?.id
        });
        Alert.alert('QR Inválido', 'El QR escaneado no corresponde al cajón seleccionado');
        setSelectedDrawer(null);
        return;
      }
      
      console.log('✅ QR matches selected drawer!');
      
      // Keep selectedDrawer updated with the validated drawer data
      setSelectedDrawer(drawer);
      
      // Get available items (FEFO sorted)
      const availableItems = await itemsService.getAvailableBatches();
      
      // Take first 3-5 items for this drawer (in production, this would be based on flight requirements)
      const drawerItems = availableItems.slice(0, Math.floor(Math.random() * 3) + 3);
      
      // Actualizar estado del cajón a "in-progress"
      setDrawers(prev => prev.map(d => 
        d.id === targetDrawer.id 
          ? { ...d, status: 'in-progress', scanned: true, qrCode: qrCode }
          : d
      ));
      
      // Mostrar detalles del cajón
      setDrawerDetails({
        name: drawer.drawer_code,
        type: 'Standard',
        class: 'Economy',
        items: drawerItems.map(item => ({
          id: item.id,
          name: item.item_type,
          quantity: item.quantity,
          batch_number: item.batch_number,
          expiry_date: item.expiry_date
        }))
      });
      
      // Inicializar checklist
      const initialChecked = {};
      drawerItems.forEach(item => {
        initialChecked[item.id] = false;
      });
      setItemsChecked(initialChecked);
      
    } catch (error) {
      console.error('Error validating drawer QR:', error);
      Alert.alert('Error', 'No se pudo validar el QR del cajón');
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
      Alert.alert('Items incompletos', 'Por favor marca todos los items como completados');
      return;
    }
    
    setShowConfirmModal(true);
  };

  // 7. Guardar datos del cajón
  const handleSaveDrawer = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    
    try {
      // Create drawer status for each item (batch)
      // According to apispec: POST /api/drawer-status requires drawer_id, batch_id, quantity, status
      const statusPromises = drawerDetails.items.map(async (item) => {
        const statusData = {
          drawer_id: selectedDrawer.id,
          batch_id: item.id, // FIXED: Changed from item_id to batch_id per apispec
          quantity: item.quantity,
          status: 'full', // FIXED: Changed from 'active' to valid status per apispec: empty, partial, full, needs_restock
          employee_id: employeeId // Optional: Track who loaded the drawer
        };
        
        console.log('📤 Creating drawer status:', statusData);
        const result = await drawerStatusService.createStatus(statusData);
        
        // Check for batch stacking warning (HTTP 207)
        if (result.hasWarning) {
          Alert.alert(
            '⚠️ Advertencia de Apilamiento',
            `Se detectó apilamiento de lotes en el cajón ${selectedDrawer.name}:\n\n${result.warning?.message || 'Múltiples lotes detectados'}`,
            [{ text: 'OK' }]
          );
        }
        
        return result;
      });
      
      await Promise.all(statusPromises);
      
      // Log restock action to history
      if (employeeId) {
        try {
          await restockHistoryService.logRestockAction({
            employee_id: employeeId,
            drawer_id: selectedDrawer.id,
            action_type: 'restock',
            quantity_changed: drawerDetails.items.reduce((sum, item) => sum + item.quantity, 0),
            accuracy_score: 100,
            efficiency_score: 95,
            notes: `Empaque Guiado - Cajón ${selectedDrawer.drawer_code || selectedDrawer.name}`
          });
        } catch (error) {
          console.error('Error logging history:', error);
        }
      }
      
      // Actualizar estado del cajón a "completed"
      setDrawers(prev => prev.map(d => 
        d.id === selectedDrawer.id 
          ? { ...d, status: 'completed' }
          : d
      ));
      
      // Limpiar estado y navegación
      navigation.setParams({ scannedData: null, pendingDrawerId: null });
      selectedDrawerIdRef.current = null;
      setSelectedDrawer(null);
      setDrawerDetails(null);
      setItemsChecked({});
      
      Alert.alert('Éxito', `✅ Cajón guardado correctamente\n\nCajón: ${selectedDrawer.drawer_code || selectedDrawer.name}\nItems cargados: ${drawerDetails.items.length}`);
    } catch (error) {
      console.error('Error saving drawer:', error);
      Alert.alert('Error', `No se pudo guardar el cajón:\n\n${error.message || 'Error desconocido'}`);
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
      Alert.alert('Trabajo incompleto', 'Debes completar todos los cajones antes de finalizar');
      return;
    }
    
    setShowFinalConfirmModal(true);
  };

  // 10. Confirmar finalización del trabajo
  const handleFinalConfirm = async () => {
    setShowFinalConfirmModal(false);
    setCompletingJob(true);
    
    try {
      // Log packing completion for each drawer
      if (employeeId) {
        const logPromises = drawers.map(async (drawer) => {
          return restockHistoryService.logPackingCompletion(
            employeeId,
            drawer.id,
            0, // item_id not available here
            0, // quantity not available here
            100, // accuracy score
            100  // efficiency score
          );
        });
        
        await Promise.all(logPromises);
      }
      
      // Actualizar el estado del trabajo
      setJobData(prev => ({
        ...prev,
        status: true, // FALSE → TRUE
        locked: true
      }));
      
      Alert.alert(
        '🎉 Trabajo Completado',
        '¡Felicidades! Has completado exitosamente el empaque del vuelo.\n\n' +
        '📊 Estado del trabajo: FALSE → TRUE\n' +
        '🔒 Trabajo bloqueado - No se pueden editar cajones',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('OperadorHome', {
                jobCompleted: true,
                hasNewJobs: false,
                jobStatus: true
              });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error completing job:', error);
      Alert.alert('Error', 'No se pudo completar el trabajo');
    } finally {
      setCompletingJob(false);
    }
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

          {/* Botón de acción - Solo Guardar */}
          <View style={styles.drawerDetailActions}>
            <TouchableOpacity 
              style={[
                styles.saveDrawerButton,
                styles.saveDrawerButtonFullWidth,
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
  saveDrawerButtonFullWidth: {
    flex: 1,
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
