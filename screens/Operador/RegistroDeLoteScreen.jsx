import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Platform, 
  Modal 
} from 'react-native';
import { QrCode, Calendar, Package, AlertTriangle, CheckCircle, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getProductDetails, registerNewLote } from '../../api/mockapi';

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
  // Estado para controlar el flujo del "wizard"
  const [step, setStep] = useState(1); // 1: Escanear, 2: Llenar Datos

  // Datos del formulario
  const [scannedProduct, setScannedProduct] = useState(null); // { ean: '...', nombre: '...' }
  const [cantidad, setCantidad] = useState('');
  const [fecha, setFecha] = useState(new Date());
  
  // Controles de UI
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: '', message: '' });

  // 1. Hook para recibir el EAN escaneado
  useEffect(() => {
    if (route.params?.scannedData) {
      const ean = route.params.scannedData;
      handleProductScanned(ean);
    }
  }, [route.params?.scannedData]);

  // 2. Lógica al escanear
  const handleProductScanned = async (ean) => {
    // Simular búsqueda del producto en la API
    const product = await getProductDetails(ean);
    if (product) {
      setScannedProduct(product);
      setStep(2); // Avanzar al siguiente paso
      navigation.setParams({ scannedData: null }); // Limpiar params
    } else {
      setAlert({ visible: true, type: 'error', message: 'Producto no encontrado' });
    }
  };

  // 3. Lógica para el selector de fecha
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fecha;
    setShowDatePicker(Platform.OS === 'ios'); // En iOS se queda abierto
    setFecha(currentDate);
  };

  // 4. Lógica de registro final
  const handleRegisterLote = async () => {
    if (!cantidad || !fecha || !scannedProduct) {
      setAlert({ visible: true, type: 'error', message: 'Completa todos los campos' });
      return;
    }

    // Simular envío a la API
    const result = await registerNewLote(scannedProduct.ean, cantidad, fecha);
    if (result.status === 'success') {
      setAlert({ visible: true, type: 'success', message: '¡Lote registrado con éxito!' });
      // Resetear el flujo
      resetFlow();
    } else {
      setAlert({ visible: true, type: 'error', message: result.message });
    }
  };

  // 5. Resetear la pantalla al estado inicial
  const resetFlow = () => {
    setStep(1);
    setScannedProduct(null);
    setCantidad('');
    setFecha(new Date());
    setAlert({ visible: false, type: '', message: '' });
  };
  
  const closeAlert = () => {
    setAlert({ visible: false, type: '', message: '' });
  };

  return (
    <View style={styles.container}>
      
      {/* --- MODAL DE ALERTA --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={alert.visible}
        onRequestClose={closeAlert}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.alertBox, 
            alert.type === 'success' ? styles.alertSuccess : styles.alertError
          ]}>
            {alert.type === 'success' && <CheckCircle color="#ffffff" size={60} />}
            {alert.type === 'error' && <AlertTriangle color="#ffffff" size={60} />}
            <Text style={styles.alertText}>{alert.message}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeAlert}>
              <X color="#ffffff" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- SELECTOR DE FECHA (MODAL) --- */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={fecha}
          mode="date"
          display="spinner" // Un spinner es más fácil de usar con guantes
          onChange={onDateChange}
        />
      )}
      
      {/* --- PASO 1: PANTALLA DE ESCANEO --- */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Registrar Nuevo Lote</Text>
          <Text style={styles.subtitle}>Comienza escaneando el código de barras (EAN/UPC) de la caja del producto.</Text>
          
          <View style={styles.iconContainer}>
            <QrCode size={120} color="#3b82f6" />
          </View>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.primaryButtonText}>Escanear Producto</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- PASO 2: PANTALLA DE DATOS --- */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Paso 2: Ingresar Datos</Text>
          <Text style={styles.subtitle}>Ingresa la cantidad y la fecha de caducidad del lote.</Text>

          {/* Tarjeta de Producto Escaneado */}
          <View style={styles.productCard}>
            <Package color="#16a34a" size={30} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{scannedProduct.nombre}</Text>
              <Text style={styles.productEan}>EAN: {scannedProduct.ean}</Text>
            </View>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={styles.label}>Cantidad en el Lote</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 150"
              keyboardType="numeric"
              value={cantidad}
              onChangeText={setCantidad}
            />

            <Text style={styles.label}>Fecha de Caducidad</Text>
            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar color="#3b82f6" size={20} style={{ marginRight: 10 }} />
              <Text style={styles.datePickerText}>
                {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleRegisterLote}
          >
            <Text style={styles.primaryButtonText}>Registrar Lote</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={resetFlow} // Botón para cancelar y escanear otro
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: '90%',
  },
  iconContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 100,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Estilos del Paso 2
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  productEan: {
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    width: '100%',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  datePickerText: {
    fontSize: 16,
    color: '#111827',
  },

  // Estilos del Modal de Alerta
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: '100%',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    position: 'relative',
  },
  alertSuccess: {
    backgroundColor: '#16a34a', // Verde
  },
  alertError: {
    backgroundColor: '#dc2626', // Rojo
  },
  alertText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
});

