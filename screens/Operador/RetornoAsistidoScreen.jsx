import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ScanLine, Check, X, History, Package, AlertTriangle } from 'lucide-react-native';
import FeedbackModal from '../../components/FeedbackModal';
import { itemsService, restockHistoryService, drawersService, drawerStatusService } from '../../api';

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
  const [loading, setLoading] = useState(false);
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [drawerItems, setDrawerItems] = useState([]);

  // Get employee ID from route params
  const employeeId = route.params?.employeeId;

  // Handle QR scan from Scanner component
  useEffect(() => {
    if (route.params?.scannedData) {
      handleScanResult(route.params.scannedData);
      navigation.setParams({ scannedData: null });
    }
  }, [route.params?.scannedData]);

  // Process scanned drawer QR code
  const handleScanResult = async (qrCode) => {
    setLoading(true);
    try {
      console.log('🔍 Scanned QR Code:', qrCode);
      
      // Find drawer by QR code
      const allDrawers = await drawersService.getDrawers();
      console.log('📦 Total drawers in database:', allDrawers.length);
      
      // The QR code might contain either the drawer_code or the drawer UUID
      let drawer = null;
      
      // Try to match by drawer_code first (exact match)
      drawer = allDrawers.find(d => d.drawer_code === qrCode);
      
      // If not found, try by UUID (id field)
      if (!drawer) {
        drawer = allDrawers.find(d => d.id === qrCode);
        console.log('🔍 Trying UUID match...');
      }
      
      // If not found, try case-insensitive drawer_code match
      if (!drawer) {
        drawer = allDrawers.find(d => d.drawer_code?.toLowerCase() === qrCode?.toLowerCase());
        console.log('🔍 Trying case-insensitive match...');
      }
      
      // If still not found, try trimming whitespace
      if (!drawer) {
        drawer = allDrawers.find(d => 
          d.drawer_code?.trim() === qrCode?.trim() || 
          d.id?.trim() === qrCode?.trim()
        );
        console.log('🔍 Trying trimmed match...');
      }
      
      if (!drawer) {
        console.error('❌ Drawer not found. Scanned:', qrCode);
        console.error('Available drawer codes:', 
          allDrawers.slice(0, 5).map(d => `${d.drawer_code} (ID: ${d.id})`));
        Alert.alert(
          'Error', 
          `No se encontró el cajón con el QR escaneado.\n\nQR: "${qrCode}"\n\nVerifica que el cajón existe en la base de datos.`
        );
        setLoading(false);
        return;
      }
      
      console.log('✅ Found drawer:', drawer.drawer_code, 'ID:', drawer.id);

      console.log('✅ Found drawer:', drawer.drawer_code, 'ID:', drawer.id);

      setCurrentDrawer(drawer);

      // Get drawer status to find items in this drawer
      console.log('🔍 Looking for drawer status...');
      const drawerStatus = await drawerStatusService.getDrawerStatus(drawer.id);
      
      if (!drawerStatus) {
        console.warn('⚠️ No drawer status found - drawer not loaded yet');
        Alert.alert(
          '⚠️ Paso 2 Requerido', 
          `Este cajón aún no ha sido cargado.\n\nCajón: ${drawer.drawer_code}\n\n❌ Debes completar Paso 2 (Empaque Guiado) primero para cargar items en este cajón antes de poder procesarlo en Retorno Asistido.\n\n📋 Flujo correcto:\n1. Paso 1: Registro de Lote\n2. Paso 2: Empaque Guiado ← REQUERIDO\n3. Paso 3: Retorno Asistido`,
          [{ text: 'Entendido', style: 'default' }]
        );
        setLoading(false);
        return;
      }
      
      console.log('✅ Found drawer status:', drawerStatus.id);

      // Get all batches in this drawer
      console.log('🔍 Getting batches in drawer...');
      const batches = await drawerStatusService.getBatchesInDrawer(drawerStatus.id);
      console.log('📦 Found batches:', batches?.length || 0);
      
      if (!batches || batches.length === 0) {
        Alert.alert(
          '⚠️ Cajón Vacío', 
          `No hay artículos en este cajón.\n\nCajón: ${drawer.drawer_code}\n\n❌ Debes cargar items en Paso 2 (Empaque Guiado) antes de usar Retorno Asistido.\n\n📋 Flujo correcto:\n1. Paso 1: Registro de Lote\n2. Paso 2: Empaque Guiado ← Carga items aquí\n3. Paso 3: Retorno Asistido`,
          [{ text: 'Entendido', style: 'default' }]
        );
        setLoading(false);
        return;
      }

      // Get full item details for each batch
      const itemsWithDetails = await Promise.all(
        batches.map(async (batch) => {
          const item = await itemsService.getItemById(batch.batch_id);
          return {
            ...item,
            quantityInDrawer: batch.quantity_loaded, // ✅ Fixed: Use quantity_loaded from batch tracking
            batchTrackingId: batch.id,
            isDepleted: batch.is_depleted
          };
        })
      );

      setDrawerItems(itemsWithDetails);

      // Process all items and check expiry dates
      await processDrawerItems(drawer, itemsWithDetails, drawerStatus.id);

    } catch (error) {
      console.error('Error processing drawer scan:', error);
      Alert.alert('Error', 'No se pudo procesar el cajón escaneado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Process all items in the drawer
  const processDrawerItems = async (drawer, items, drawerStatusId) => {
    const now = new Date();
    let hasExpiredItems = false;
    let hasWarningItems = false;
    const itemResults = [];

    for (const item of items) {
      if (item.isDepleted) continue; // Skip already depleted items

      const expiryDate = new Date(item.expiry_date);
      const isExpired = expiryDate <= now;
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      let action = 'OK';
      let status = 'success';
      
      if (isExpired) {
        action = 'DESECHAR';
        status = 'error';
        hasExpiredItems = true;
      } else if (daysUntilExpiry <= 2) {
        action = 'CRÍTICO';
        status = 'warning';
        hasWarningItems = true;
      }

      const result = {
        nombre: item.item_type,
        loteId: item.batch_number,
        quantity: item.quantityInDrawer,
        action: action,
        status: status,
        expiryDate: expiryDate.toLocaleDateString('es-MX'),
        daysUntilExpiry: daysUntilExpiry,
        drawerCode: drawer.drawer_code
      };

      itemResults.push(result);

      // Log return processing activity
      if (employeeId) {
        try {
          await restockHistoryService.logReturnProcessing(
            employeeId,
            item.id,
            item.quantityInDrawer,
            drawer.id
          );
        } catch (error) {
          console.error('Error logging return:', error);
        }
      }
    }

    // Update history
    setScannedHistory(prev => [...itemResults, ...prev]);

    // Show comprehensive feedback modal
    if (hasExpiredItems) {
      const expiredCount = itemResults.filter(r => r.action === 'DESECHAR').length;
      setModal({
        isVisible: true,
        type: 'error',
        message: `⚠️ CAJÓN CON LOTES CADUCADOS\n\nCajón: ${drawer.drawer_code}\nTotal artículos: ${itemResults.length}\n❌ Caducados: ${expiredCount}\n\nAcción: REVISAR Y DESECHAR los lotes vencidos`,
      });
    } else if (hasWarningItems) {
      const warningCount = itemResults.filter(r => r.action === 'CRÍTICO').length;
      setModal({
        isVisible: true,
        type: 'warning',
        message: `⚠️ CAJÓN CON LOTES CRÍTICOS\n\nCajón: ${drawer.drawer_code}\nTotal artículos: ${itemResults.length}\n🟡 Críticos (≤2 días): ${warningCount}\n\nAcción: USAR PRONTO`,
      });
    } else {
      setModal({
        isVisible: true,
        type: 'success',
        message: `✅ CAJÓN OK\n\nCajón: ${drawer.drawer_code}\nTotal artículos: ${itemResults.length}\n\nTodos los lotes están en buen estado.\nAcción: Devolver a Almacén`,
      });
    }
  };

  const handleScanPress = () => {
    navigation.navigate('Scanner');
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
        <Text style={styles.title}>Retorno Asistido</Text>
        <Text style={styles.subtitle}>Escanea el QR del cajón para verificar artículos devueltos.</Text>
      </View>

      {/* 2. Botón de Acción Principal */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.scanButton, loading && styles.scanButtonDisabled]} 
          onPress={handleScanPress}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#ffffff" size="large" />
              <Text style={styles.scanButtonText}>Procesando...</Text>
            </>
          ) : (
            <>
              <ScanLine color="#ffffff" size={40} />
              <Text style={styles.scanButtonText}>Escanear QR del Cajón</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Current Drawer Info */}
      {currentDrawer && (
        <View style={styles.currentDrawerContainer}>
          <Package color="#3b82f6" size={24} />
          <View style={styles.currentDrawerText}>
            <Text style={styles.currentDrawerLabel}>Último cajón escaneado:</Text>
            <Text style={styles.currentDrawerCode}>{currentDrawer.drawer_code}</Text>
            <Text style={styles.currentDrawerItems}>{drawerItems.length} artículo(s) procesado(s)</Text>
          </View>
        </View>
      )}

      {/* 3. Historial de Sesión */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <History color="#4b5563" size={20} />
          <Text style={styles.historyTitle}>Historial de esta Sesión</Text>
        </View>
        <ScrollView>
          {scannedHistory.length === 0 ? (
            <Text style={styles.emptyText}>Aún no hay cajones escaneados.</Text>
          ) : (
            scannedHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={[
                  styles.historyIcon, 
                  item.status === 'error' ? styles.historyIconError : 
                  item.status === 'warning' ? styles.historyIconWarning :
                  styles.historyIconSuccess
                ]}>
                  {item.status === 'error' ? 
                    <X color="#dc2626" size={20} /> :
                    item.status === 'warning' ?
                    <AlertTriangle color="#f59e0b" size={20} /> :
                    <Check color="#16a34a" size={20} />
                  }
                </View>
                <View style={styles.historyText}>
                  <Text style={styles.historyItemName}>{item.nombre}</Text>
                  <Text style={styles.historyItemLote}>Lote: {item.loteId} • Cajón: {item.drawerCode}</Text>
                  <Text style={styles.historyItemExpiry}>
                    Vence: {item.expiryDate} ({item.daysUntilExpiry > 0 ? `${item.daysUntilExpiry} días` : 'VENCIDO'})
                  </Text>
                </View>
                <View style={styles.historyActionContainer}>
                  <Text style={[
                    styles.historyAction,
                    item.status === 'error' ? styles.historyActionError : 
                    item.status === 'warning' ? styles.historyActionWarning :
                    styles.historyActionSuccess
                  ]}>
                    {item.action}
                  </Text>
                  <Text style={styles.historyQuantity}>Qty: {item.quantity}</Text>
                </View>
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
  scanButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  currentDrawerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  currentDrawerText: {
    marginLeft: 12,
    flex: 1,
  },
  currentDrawerLabel: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  currentDrawerCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 2,
  },
  currentDrawerItems: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 2,
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
  historyIconWarning: {
    backgroundColor: '#fef3c7',
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
    marginTop: 2,
  },
  historyItemExpiry: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  historyActionContainer: {
    alignItems: 'flex-end',
  },
  historyAction: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyActionSuccess: {
    color: '#16a34a',
  },
  historyActionWarning: {
    color: '#f59e0b',
  },
  historyActionError: {
    color: '#dc2626',
  },
  historyQuantity: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
});

