import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Platform, 
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { QrCode, Calendar, Package, CheckCircle, X, Save, Hash } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { itemsService, restockHistoryService } from '../../api';

/**
 * Pantalla para el Paso 1: Registrar Lote (REDISEÑADA)
 * * Principios de UI/UX aplicados:
 * 1. Flujo Guiado (Wizard): La pantalla cambia de estado. No es un formulario, 
 * es un proceso de 2 pasos.
 * 2. Carga Cognitiva Mínima: Solo se pide una acción a la vez.
 * 3. Componentes Nativos: Usa un selector de fecha nativo en lugar de texto.
 * 4. Jerarquía Visual: Botones de acción grandes y claros.
 */
export default function RegistroDeLoteScreen({ navigation, route }) {
  // Estado para controlar el flujo
  const [step, setStep] = useState(1); // 1: Escanear QR, 2: Llenar Datos

  // Datos del formulario (inicialmente vacíos)
  const [qrCode, setQrCode] = useState('');
  const [objectName, setObjectName] = useState('');
  const [loteID, setLoteID] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState(new Date());
  const [cantidad, setCantidad] = useState('');
  
  // Controles de UI
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  // Get employee ID from route params
  const employeeId = route.params?.employeeId;

  // 1. Hook para recibir el QR code escaneado
  useEffect(() => {
    if (route.params?.scannedData) {
      const scannedQR = route.params.scannedData;
      handleQRScanned(scannedQR);
    }
  }, [route.params?.scannedData]);

  // 2. Lógica al escanear el QR
  const handleQRScanned = (scannedQR) => {
    setQrCode(scannedQR);
    setStep(2); // Avanzar al formulario
    navigation.setParams({ scannedData: null }); // Limpiar params
  };

  // 3. Lógica para el selector de fecha
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaCaducidad;
    setShowDatePicker(Platform.OS === 'ios');
    setFechaCaducidad(currentDate);
  };

  // 4. Validar y guardar en la base de datos
  const handleSaveLote = async () => {
    // Validación
    if (!objectName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del producto');
      return;
    }
    if (!loteID.trim()) {
      Alert.alert('Error', 'Por favor ingresa el ID del lote');
      return;
    }
    if (!cantidad.trim() || isNaN(cantidad)) {
      Alert.alert('Error', 'Por favor ingresa una cantidad válida');
      return;
    }

    setSaving(true);
    
    try {
      // Create item in database
      const itemData = {
        item_type: objectName.trim(),
        batch_number: loteID.trim(),
        quantity: parseInt(cantidad),
        expiry_date: fechaCaducidad.toISOString(),
        qr_code: qrCode,
        status: 'available',
      };

      const createdItem = await itemsService.createItem(itemData);
      
      // Log registration activity
      if (employeeId) {
        await restockHistoryService.logBatchRegistration(
          employeeId,
          createdItem.id,
          parseInt(cantidad)
        );
      }
      
      setSaving(false);
      setSuccessModal(true);
      
      // Auto-cerrar después de 2 segundos
      setTimeout(() => {
        resetFlow();
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      setSaving(false);
      console.error('Error saving item:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo guardar el lote. Verifica la conexión con el servidor.'
      );
    }
  };

  // 5. Resetear la pantalla al estado inicial
  const resetFlow = () => {
    setStep(1);
    setQrCode('');
    setObjectName('');
    setLoteID('');
    setCantidad('');
    setFechaCaducidad(new Date());
    setSuccessModal(false);
  };

  return (
    <View style={styles.container}>
      
      {/* --- MODAL DE ÉXITO --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={successModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <CheckCircle size={64} color="#16a34a" />
            <Text style={styles.successModalTitle}>¡Lote guardado!</Text>
            <Text style={styles.successModalText}>
              Los datos se han actualizado correctamente en la base de datos
            </Text>
          </View>
        </View>
      </Modal>

      {/* --- STEP 1: ESCANEAR QR --- */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <View style={styles.iconCircle}>
            <QrCode size={48} color="#3b82f6" />
          </View>
          
          <Text style={styles.title}>Escanear Código QR</Text>
          <Text style={styles.subtitle}>
            Escanea el código QR del registro para comenzar
          </Text>

          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => navigation.navigate('Scanner')}
          >
            <QrCode size={24} color="white" />
            <Text style={styles.scanButtonText}>Escanear QR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- STEP 2: LLENAR FORMULARIO --- */}
      {step === 2 && (
        <ScrollView style={styles.formScrollView}>
          <View style={styles.formContainer}>
            
            {/* Título */}
            <View style={styles.formHeader}>
              <Package size={32} color="#3b82f6" />
              <Text style={styles.formTitle}>Registrar Información del Lote</Text>
              <Text style={styles.formSubtitle}>
                Completa todos los campos para actualizar la base de datos
              </Text>
            </View>

            {/* Campo: QR Code (solo lectura) */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Código QR</Text>
              <View style={styles.readOnlyField}>
                <QrCode size={20} color="#64748b" />
                <Text style={styles.readOnlyText}>{qrCode}</Text>
              </View>
            </View>

            {/* Campo: Nombre del Producto */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Nombre del Producto *</Text>
              <View style={styles.inputWrapper}>
                <Package size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Manzanas Gala"
                  value={objectName}
                  onChangeText={setObjectName}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Campo: ID del Lote */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>ID del Lote *</Text>
              <View style={styles.inputWrapper}>
                <Hash size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: LOTE-2025-001"
                  value={loteID}
                  onChangeText={setLoteID}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Campo: Cantidad */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Cantidad *</Text>
              <View style={styles.inputWrapper}>
                <Package size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 50"
                  keyboardType="numeric"
                  value={cantidad}
                  onChangeText={setCantidad}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Campo: Fecha de Caducidad */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Fecha de Caducidad *</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color="#64748b" />
                <Text style={styles.dateText}>
                  {fechaCaducidad.toLocaleDateString('es-MX', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={fechaCaducidad}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={resetFlow}
              >
                <X size={20} color="#64748b" />
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSaveLote}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Save size={20} color="white" />
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // --- STEP 1: ESCANEAR ---
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  // --- STEP 2: FORMULARIO ---
  formScrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 24,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },

  // --- CAMPOS ---
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
  },

  // --- BOTONES ---
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  cancelButton: {
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
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // --- MODAL DE ÉXITO ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 16,
    marginBottom: 8,
  },
  successModalText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

