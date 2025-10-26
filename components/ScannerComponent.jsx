import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

/**
 * Componente reutilizable para escanear códigos QR y de barras.
 * Pide permiso para la cámara y devuelve el dato escaneado
 * a la pantalla anterior.
 */
export default function ScannerComponent() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  // 1. Pedir permiso para la cámara al cargar
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  // 2. Manejador del escaneo
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    // Use setParams on the previous screen to update its params
    // Then go back to preserve all existing params
    const state = navigation.getState();
    const previousRoute = state.routes[state.index - 1];
    
    console.log('📸 QR Scanned:', data);
    console.log('🔙 Previous route:', previousRoute.name);
    console.log('📦 Previous params:', previousRoute.params);
    
    // Navigate back to previous screen with updated params
    navigation.navigate(previousRoute.name, {
      ...previousRoute.params,
      scannedData: data
    });
  };

  // 3. Renderizar vistas condicionales
  if (!permission) {
    return <Text style={styles.text}>Solicitando permiso de cámara...</Text>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Sin acceso a la cámara. Por favor, active el permiso en la configuración.</Text>
        <Button title="Solicitar permiso" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Apunte al código QR del Lote</Text>
        <View style={styles.scanBox} />
      </View>
      {scanned && <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: 'white',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 20,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    marginTop: 20,
  },
});
