import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, AlertTriangle, ShieldCheck } from 'lucide-react-native';

/**
 * Dashboard de Caducidad (REDISEÑADO)
 * Basado en el estado del inventario digital (FEFO).
 */
export default function DashboardCaducidadScreen() {
  // Datos simulados
  const kpiData = {
    proximos7dias: 1250, // Items que vencen en 7 días
    desperdicioEvitado: 97.8, // % de items (S_Critico) consumidos
  };

  const chartData = {
    alertasRojas: [
      { nombre: 'Leche en Polvo', lote: 'LOTE-MLK-20251026' },
      { nombre: 'Jugo de Naranja', lote: 'LOTE-JGO-20251027' },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard: Caducidad</Text>

      {/* 1. Tarjetas de KPIs Principales */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Calendar color="#f97316" size={30} />
          <Text style={styles.kpiValue}>{kpiData.proximos7dias}</Text>
          <Text style={styles.kpiLabel}>Items (Próx. 7 Días)</Text>
        </View>
        <View style={styles.kpiCard}>
          <ShieldCheck color="#16a34a" size={30} />
          <Text style={styles.kpiValue}>{kpiData.desperdicioEvitado}%</Text>
          <Text style={styles.kpiLabel}>% Desperdicio Evitado (FEFO)</Text>
        </View>
      </View>

      {/* 2. Tarjeta de Alertas (Accionable) */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeaderAlert}>
          <AlertTriangle color="#dc2626" size={20} />
          <Text style={styles.cardTitleAlert}>¡Alertas! Lotes Críticos (Próx. 48h)</Text>
        </View>
        {chartData.alertasRojas.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{item.nombre}</Text>
            <Text style={styles.listItemValue}>{item.lote}</Text>
          </View>
        ))}
      </View>
      
      {/* 3. Gráfico (Simulado) */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Inventario por Caducidad</Text>
        {/* Aquí iría un gráfico de Pie o Barras */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>(Gráfico: 90% OK, 8% Crítico, 2% Vencido)</Text>
        </View>
      </View>

    </ScrollView>
  );
}

// Se usan los mismos 'styles' que DashboardProductividadScreen
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
    color: '#dc2626', // Rojo
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

