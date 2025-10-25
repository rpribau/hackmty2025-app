import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PieChart, Trash2, TrendingDown } from 'lucide-react-native';

/**
 * Dashboard de Consumo (REDISEÑADO)
 * Basado en las probabilidades de transición de Markov.
 */
export default function DashboardConsumoScreen() {
  // Datos simulados de nuestros modelos de Markov
  const kpiData = {
    tasaDesperdicio: 12.8, // % de items (S_Vencido) desechados
    tasaRetorno: 45.0,   // % de items que regresan sin consumirse
  };

  const chartData = {
    topDesperdicio: [
      { nombre: 'Jugo de Naranja 200ml', pct: 35 },
      { nombre: 'Snack Box (ECON)', pct: 28 },
    ],
    topNoConsumido: [
      { nombre: 'Vino Blanco (PREM)', pct: 60 },
      { nombre: 'Agua Mineral 500ml', pct: 55 },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard: Consumo</Text>

      {/* 1. Tarjetas de KPIs Principales */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Trash2 color="#dc2626" size={30} />
          <Text style={styles.kpiValue}>{kpiData.tasaDesperdicio}%</Text>
          <Text style={styles.kpiLabel}>Tasa de Desperdicio</Text>
        </View>
        <View style={styles.kpiCard}>
          <TrendingDown color="#f97316" size={30} />
          <Text style={styles.kpiValue}>{kpiData.tasaRetorno}%</Text>
          <Text style={styles.kpiLabel}>Tasa de Retorno (No Cons.)</Text>
        </View>
      </View>

      {/* 2. Gráfico (Simulado) */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeaderAlert}>
          <Trash2 color="#dc2626" size={20} />
          <Text style={styles.cardTitleAlert}>Top 5 Desperdicio (Markov P(S_Desecho))</Text>
        </View>
        {/* Aquí iría un gráfico de Pie o Barras */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>(Gráfico de barras: Jugo 35%, Snack 28%, ...)</Text>
        </View>
      </View>
      
      {/* 3. Tarjeta de Puntos Problemáticos (Accionable) */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeaderAlert}>
          <TrendingDown color="#f97316" size={20} />
          <Text style={styles.cardTitleAlert}>Top 5 Retorno (Markov P(S_Retorno))</Text>
        </View>
        {chartData.topNoConsumido.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{item.nombre}</Text>
            <Text style={styles.listItemValue}>{item.pct}%</Text>
          </View>
        ))}
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
    color: '#111827',
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
    color: '#f97316', // Naranja
  },
});

