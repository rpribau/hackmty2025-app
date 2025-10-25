import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart, Users, AlertTriangle } from 'lucide-react-native';

/**
 * Dashboard de Productividad (REDISEÑADO)
 * * Principios de UI/UX aplicados:
 * 1. "At-a-glance": KPIs grandes y claros en la parte superior.
 * 2. Priorizar lo Accionable: Destacar las áreas problemáticas
 * (ej. "Eficiencia más baja").
 * 3. Minimalismo: Tarjetas limpias, íconos y mucho espacio en blanco.
 */
export default function DashboardProductividadScreen() {
  // Datos simulados de nuestros modelos de Colas (μ)
  const kpiData = {
    eficienciaPromedio: 92.5, // (Tiempo Estándar / Tiempo Real)
    tasaCumplimiento: 98.2, // % de carritos a tiempo
  };

  const chartData = {
    eficienciaPorEquipo: [
      { label: 'Turno A', value: 95 },
      { label: 'Turno B', value: 88 },
      { label: 'Turno C', value: 93 },
    ],
    masLentos: [
      { nombre: 'Carrito Vinos (Premium)', diff: '+1:30' },
      { nombre: 'Cajón Snacks (ECON)', diff: '+0:45' },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard: Productividad</Text>
      
      {/* 1. Tarjetas de KPIs Principales */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <BarChart color="#3b82f6" size={30} />
          <Text style={styles.kpiValue}>{kpiData.eficienciaPromedio}%</Text>
          <Text style={styles.kpiLabel}>Eficiencia Promedio (μ)</Text>
        </View>
        <View style={styles.kpiCard}>
          <Users color="#16a34a" size={30} />
          <Text style={styles.kpiValue}>{kpiData.tasaCumplimiento}%</Text>
          <Text style={styles.kpiLabel}>Cumplimiento a Tiempo</Text>
        </View>
      </View>

      {/* 2. Gráfico (Simulado) */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Eficiencia por Turno</Text>
        {/* Aquí iría un componente de gráfico (ej. react-native-svg-charts) */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>(Gráfico de barras: 95%, 88%, 93%)</Text>
        </View>
      </View>

      {/* 3. Tarjeta de Puntos Problemáticos (Accionable) */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeaderAlert}>
          <AlertTriangle color="#f97316" size={20} />
          <Text style={styles.cardTitleAlert}>Carritos más Lentos (vs. μ)</Text>
        </View>
        {chartData.masLentos.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{item.nombre}</Text>
            <Text style={styles.listItemValue}>{item.diff}</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  cardHeaderAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleAlert: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f97316', // Naranja
    marginLeft: 8,
  },
  chartPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  chartText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemText: {
    fontSize: 16,
    color: '#374151',
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626', // Rojo
  },
});

