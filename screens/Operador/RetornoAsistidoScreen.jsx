import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ScanLine, Check, X, History, Package } from 'lucide-react-native';
import FeedbackModal from '../../components/FeedbackModal';
import { processReturnedItem } from '../../api/mockapi';

/**
 * Pantalla para el Paso 3: Retorno Asistido (REDISEÑADA)
 * * Principios de UI/UX aplicados:
 * 1. "Scan-First": La UI se centra en una sola acción: escanear.
 * 2. Feedback Masivo: Usa el FeedbackModal para dar una respuesta
 * clara e inequívoca (OK vs. DESECHAR).
 * 3. Contexto Simple: Muestra un historial simple de lo que se ha
 * escaneado en esta sesión.
 */
export default function RetornoAsistidoScreen({ navigation, route }) {
  const [scannedHistory, setScannedHistory] = useState([]);
  const [modal, setModal] = useState({ isVisible: false, type: '', message: '' });

  // Simulación de escaneo (en la vida real, se navegaría al Scanner)
  const handleScanPress = async () => {
    // En un caso real: navigation.navigate('Scanner')
    // Simulación:
    const fakeLoteQR = 'LOTE-SNK01-20251020'; // Simular un lote caducado
    const result = await processReturnedItem(fakeLoteQR);

    // Actualizar historial
    setScannedHistory(prev => [result, ...prev]);

    // Mostrar feedback
    if (result.action === 'DESECHAR') {
      setModal({
        isVisible: true,
        type: 'error',
        message: `¡LOTE CADUCADO! (${result.nombre})\n\nAcción: DESECHAR`,
      });
    } else {
      setModal({
        isVisible: true,
        type: 'success',
        message: `LOTE OK (${result.nombre})\n\nAcción: Devolver a Almacén`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <FeedbackModal 
        isVisible={modal.isVisible}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ isVisible: false, type: '', message: '' })}
      />

      {/* 1. Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Retorno Asistido (Manual)</Text>
        <Text style={styles.subtitle}>Escanea los artículos devueltos de cajones complejos.</Text>
      </View>

      {/* 2. Botón de Acción Principal */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
          <ScanLine color="#ffffff" size={40} />
          <Text style={styles.scanButtonText}>Escanear Artículo Devuelto</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Historial de Sesión */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <History color="#4b5563" size={20} />
          <Text style={styles.historyTitle}>Historial de esta Sesión</Text>
        </View>
        <ScrollView>
          {scannedHistory.length === 0 ? (
            <Text style={styles.emptyText}>Aún no hay artículos escaneados.</Text>
          ) : (
            scannedHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={[
                  styles.historyIcon, 
                  item.action === 'DESECHAR' ? styles.historyIconError : styles.historyIconSuccess
                ]}>
                  {item.action === 'DESECHAR' ? 
                    <X color="#dc2626" size={20} /> :
                    <Check color="#16a34a" size={20} />
                  }
                </View>
                <View style={styles.historyText}>
                  <Text style={styles.historyItemName}>{item.nombre}</Text>
                  <Text style={styles.historyItemLote}>Lote: {item.loteId}</Text>
                </View>
                <Text style={[
                  styles.historyAction,
                  item.action === 'DESECHAR' ? styles.historyActionError : styles.historyActionSuccess
                ]}>
                  {item.action}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  actionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    elevation: 3,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  historyContainer: {
    flex: 1,
    padding: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIconSuccess: {
    backgroundColor: '#dcfce7',
  },
  historyIconError: {
    backgroundColor: '#fee2e2',
  },
  historyText: {
    flex: 1,
  },
  historyItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  historyItemLote: {
    fontSize: 12,
    color: '#6b7280',
  },
  historyAction: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyActionSuccess: {
    color: '#16a34a',
  },
  historyActionError: {
    color: '#dc2626',
  },
});

