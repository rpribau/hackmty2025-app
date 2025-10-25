import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { ScanLine } from 'lucide-react-native';
import { validateReturnLote } from '../../api/mockapi';

/**
 * Pantalla para el Paso 3.2: Retorno Asistido (Manual).
 * Escanea y clasifica lotes devueltos.
 */
export default function RetornoAsistidoScreen({ navigation, route }) {
  const [log, setLog] = useState([]);

  // 1. Recibir y validar el QR escaneado
  useEffect(() => {
    if (route.params?.scannedData) {
      const loteQR = route.params.scannedData;
      handleValidation(loteQR);
      navigation.setParams({ scannedData: null }); // Limpiar para el próximo escaneo
    }
  }, [route.params?.scannedData]);

  // 2. Llamar a la API simulada de retorno
  const handleValidation = async (loteQR) => {
    const result = await validateReturnLote(loteQR);
    
    // Añadir al log de la pantalla
    const newLogEntry = {
      lote: loteQR,
      message: result.message,
      type: result.status, // 'success' o 'error'
    };
    
    // Añadir al inicio del array
    setLog(prevLog => [newLogEntry, ...prevLog]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.scanContainer}>
        <Button 
          title="Escanear Próximo Artículo" 
          onPress={() => navigation.navigate('Scanner')}
        />
      </View>
      
      {/* Log de Artículos Escaneados */}
      <Text style={styles.logTitle}>Artículos Procesados (Retorno)</Text>
      <ScrollView style={styles.logContainer}>
        {log.length === 0 ? (
          <Text style={styles.logEmpty}>Escanee un artículo para empezar...</Text>
        ) : (
          log.map((entry, index) => (
            <View 
              key={index} 
              style={[
                styles.logEntry, 
                entry.type === 'success' ? styles.logSuccess : styles.logError
              ]}
            >
              <Text style={styles.logLote}>Lote: {entry.lote}</Text>
              <Text style={styles.logMessage}>{entry.message}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  scanContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 15,
    backgroundColor: '#e5e7eb',
    color: '#111827',
  },
  logContainer: {
    flex: 1,
  },
  logEmpty: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#6b7280',
  },
  logEntry: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logSuccess: {
    backgroundColor: '#f0fdf4',
  },
  logError: {
    backgroundColor: '#fef2f2',
  },
  logLote: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  logMessage: {
    fontSize: 16,
    marginTop: 4,
    color: '#374151',
  },
});
