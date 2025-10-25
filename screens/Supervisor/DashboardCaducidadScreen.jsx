import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getDashboardData } from '../../api/mockapi';
import { AlertTriangle, Archive, Trash } from 'lucide-react-native';

/**
 * Dashboard de Caducidad (Módulo FEFO)
 */
export default function DashboardCaducidadScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const dashboardData = await getDashboardData();
      setData(dashboardData.caducidad);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!data) {
    return <Text style={styles.errorText}>No se pudieron cargar los datos.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Gestión de Inventario (FEFO)</Text>

      {/* Alerta Crítica */}
      <View style={[styles.kpiCard, styles.alertCard]}>
        <AlertTriangle color="#ffffff" size={28} />
        <View style={styles.kpiTextContainer}>
          <Text style={[styles.kpiValue, styles.alertText]}>{data.alertaCritica}</Text>
        </View>
      </View>

      <View style={styles.kpiCard}>
        <Trash color="#b91c1c" size={28} />
        <View style={styles.kpiTextContainer}>
          <Text style={styles.kpiValue}>{data.desechadosHoy} Artículos</Text>
          <Text style={styles.kpiLabel}>Desechados por Caducidad (Hoy)</Text>
        </View>
      </View>
      
      <Text style={styles.chartTitle}>Inventario por Estado de Vida</Text>
      <View style={styles.inventoryContainer}>
        {data.inventario.map((item) => (
          <View key={item.estado} style={styles.invCard}>
            <Text style={[styles.invLabel, item.estado === 'S_CRÍTICO' && styles.invLabelCritical]}>
              {item.estado}
            </Text>
            <Text style={styles.invValue}>{item.qty.toLocaleString('es-MX')}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 15,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  kpiCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  alertCard: {
    backgroundColor: '#dc2626', // Rojo
  },
  alertText: {
    color: '#ffffff',
  },
  kpiTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  kpiLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
  },
  inventoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  invLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a', // Verde
  },
  invLabelCritical: {
    color: '#f59e0b', // Amarillo
  },
  invValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 5,
  },
});
