import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getDashboardData } from '../../api/mockapi';
import { Trash2, Brain, Map } from 'lucide-react-native';
/**
 * Dashboard de Consumo (Módulo Markoviano)
 */
export default function DashboardConsumoScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const dashboardData = await getDashboardData();
      setData(dashboardData.consumo);
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
      <Text style={styles.header}>Estado del Modelo de Consumo</Text>

      <View style={styles.kpiCard}>
        <Trash2 color="#dc2626" size={28} />
        <View style={styles.kpiTextContainer}>
          <Text style={styles.kpiValue}>{data.tasaDesperdicio}%</Text>
          <Text style={styles.kpiLabel}>Tasa de Desperdicio (Por Consumo)</Text>
        </View>
      </View>
      
      <View style={styles.kpiCard}>
        <Brain color="#3b82f6" size={28} />
        <View style={styles.kpiTextContainer}>
          <Text style={styles.kpiValue}>{data.estadoModelo}</Text>
          <Text style={styles.kpiLabel}>Últ. Actualización: {data.ultimaActualizacion}</Text>
        </View>
      </View>
      
      <Text style={styles.chartTitle}>Políticas de Inventario (Ejemplos)</Text>
      <View style={styles.policyCard}>
        <Map color="#1e3a8a" size={20} />
        <Text style={styles.policyText}>{data.politicaEjemplo}</Text>
      </View>
      {/* Aquí irían filtros para ver políticas por ruta */}
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
  kpiTextContainer: {
    marginLeft: 15,
    flex: 1, // Para que el texto se ajuste
  },
  kpiValue: {
    fontSize: 24, // Un poco más pequeño para texto largo
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
  policyCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  policyText: {
    fontSize: 16,
    color: '#1e3a8a',
    marginLeft: 10,
    flex: 1,
  },
});
