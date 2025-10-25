import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getDashboardData } from '../../api/mockapi';
import { Zap, Clock, Users } from 'lucide-react-native';

/**
 * Dashboard de Productividad (Módulo de Colas)
 */
export default function DashboardProductividadScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const dashboardData = await getDashboardData();
      setData(dashboardData.productividad);
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
      <Text style={styles.header}>Estado de la Línea (En Vivo)</Text>
      
      {/* Tarjeta de KPI */}
      <View style={styles.kpiCard}>
        <Zap color="#16a34a" size={28} />
        <View style={styles.kpiTextContainer}>
          <Text style={styles.kpiValue}>{data.eficienciaGeneral}%</Text>
          <Text style={styles.kpiLabel}>Eficiencia General (vs. Estándar μ)</Text>
        </View>
      </View>
      
      <View style={styles.kpiCard}>
        <Clock color={data.estadoCola === 'SALUDABLE' ? '#16a34a' : '#dc2626'} size={28} />
        <View style={styles.kpiTextContainer}>
          <Text style={styles.kpiValue}>{data.estadoCola}</Text>
          <Text style={styles.kpiLabel}>Estado de la Cola (Espera: {data.esperaPromedio}m)</Text>
        </View>
      </View>

      <View style={styles.kpiCard}>
        <Users color="#3b82f6" size={28} />
        <View style={styles.kpiTextContainer}>
          <Text style={styles.kpiValue}>
            {data.empleadosActuales} / {data.empleadosRecomendados}
          </Text>
          <Text style={styles.kpiLabel}>Empleados Actuales vs. Recomendados (s)</Text>
        </View>
      </View>
      
      {/* Aquí irían los gráficos de rendimiento por empleado */}
      <Text style={styles.chartTitle}>Gráfico de Productividad (Placeholder)</Text>
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartText}>[Gráfico de barras de eficiencia por hora]</Text>
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
  kpiTextContainer: {
    marginLeft: 15,
  },
  kpiValue: {
    fontSize: 28,
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
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  chartText: {
    color: '#6b7280',
    fontSize: 16,
  },
});
