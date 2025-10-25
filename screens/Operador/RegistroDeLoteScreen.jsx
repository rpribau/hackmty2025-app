import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, Platform } from 'react-native';
import { Barcode, Calendar, CheckCircle } from 'lucide-react-native';

/**
 * Pantalla para el Paso 1: Registrar un nuevo lote.
 * Utiliza el ScannerComponent.
 */
export default function RegistroDeLoteScreen({ navigation, route }) {
  const [scannedEAN, setScannedEAN] = useState(null);
  const [fechaCaducidad, setFechaCaducidad] = useState(''); // Simplificado como texto
  const [cantidad, setCantidad] = useState('');

  // 1. Recibir datos del escáner
  useEffect(() => {
    if (route.params?.scannedData) {
      setScannedEAN(route.params.scannedData);
    }
  }, [route.params?.scannedData]);

  // 2. Simular el registro
  const handleRegister = () => {
    if (!scannedEAN || !fechaCaducidad || !cantidad) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }
    
    // Aquí se llamaría a la API real para registrar el lote.
    // Por ahora, solo simulamos éxito.
    console.log('Registrando Lote:', { ean: scannedEAN, fecha: fechaCaducidad, qty: cantidad });
    
    Alert.alert('Éxito', `Lote ${scannedEAN} registrado con ${cantidad} unidades.`);
    
    // Limpiar formulario y volver
    setScannedEAN(null);
    setFechaCaducidad('');
    setCantidad('');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      
      {/* Sección de Escaneo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Barcode color="#3b82f6" size={24} />
          <Text style={styles.cardTitle}>1. Escanear Producto (EAN)</Text>
        </View>
        
        {scannedEAN ? (
          <View style={styles.scanSuccess}>
            <CheckCircle color="#16a34a" size={24} />
            <Text style={styles.scanText}>Código: {scannedEAN}</Text>
          </View>
        ) : (
          <Button 
            title="Abrir Escáner" 
            onPress={() => navigation.navigate('Scanner')} 
          />
        )}
      </View>

      {/* Sección de Datos */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Calendar color="#3b82f6" size={24} />
          <Text style={styles.cardTitle}>2. Ingresar Datos del Lote</Text>
        </View>
        
        <Text style={styles.label}>Fecha de Caducidad (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 2025-11-30"
          value={fechaCaducidad}
          onChangeText={setFechaCaducidad}
        />
        
        <Text style={styles.label}>Cantidad de Unidades</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 150"
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
        />
      </View>
      
      <Button 
        title="Registrar Lote" 
        onPress={handleRegister}
        disabled={!scannedEAN || !fechaCaducidad || !cantidad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5',
    padding: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 10,
  },
  scanSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 5,
  },
  scanText: {
    fontSize: 16,
    color: '#15803d',
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
});
