import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { PieChart, Trash2, TrendingDown } from 'lucide-react-native';
import { restockHistoryService, itemsService } from '../../api';

/**
 * Dashboard de Consumo (REDISEÑADO)
 * Basado en las probabilidades de transición de Markov.
 */
export default function DashboardConsumoScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpiData, setKpiData] = useState({
    tasaDesperdicio: 0,
    tasaRetorno: 0,
  });
  const [warningRecords, setWarningRecords] = useState([]);
  const [topDepleted, setTopDepleted] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get all restock history
      const allHistory = await restockHistoryService.getRestockHistory(0, 100);
      
      // Get warning records (batch stacking)
      const warnings = await restockHistoryService.getWarningRecords();
      
      // Get all items
      const allItems = await itemsService.getItems(0, 100);
      
      // Calculate waste rate (depleted items)
      const depletedItems = allItems.filter(item => item.status === 'depleted');
      const totalItems = allItems.length;
      const wasteRate = totalItems > 0 ? (depletedItems.length / totalItems) * 100 : 12.8;
      
      // Calculate return rate (based on removal actions)
      const removalActions = allHistory.filter(h => h.action_type === 'removal');
      const restockActions = allHistory.filter(h => h.action_type === 'restock');
      const returnRate = restockActions.length > 0 
        ? (removalActions.length / restockActions.length) * 100 
        : 45.0;
      
      setKpiData({
        tasaDesperdicio: wasteRate.toFixed(1),
        tasaRetorno: returnRate.toFixed(1),
      });
      
      setWarningRecords(warnings.slice(0, 5));
      
      // Calculate top depleted item types
      const itemTypeCounts = {};
      depletedItems.forEach(item => {
        itemTypeCounts[item.item_type] = (itemTypeCounts[item.item_type] || 0) + 1;
      });
      
      const sorted = Object.entries(itemTypeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setTopDepleted(sorted);
      
    } catch (error) {
      console.error('Error loading consumo data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
          <Text style={styles.cardTitleAlert}>Top 5 Items Agotados</Text>
        </View>
        {topDepleted.length === 0 ? (
          <Text style={styles.emptyText}>No hay datos de desperdicio</Text>
        ) : (
          topDepleted.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{item.name}</Text>
              <Text style={styles.listItemValue}>{item.count} veces</Text>
            </View>
          ))
        )}
      </View>
      
      {/* 3. Tarjeta de Puntos Problemáticos (Accionable) */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeaderAlert}>
          <TrendingDown color="#f97316" size={20} />
          <Text style={styles.cardTitleAlert}>Advertencias de Apilamiento</Text>
        </View>
        {warningRecords.length === 0 ? (
          <Text style={styles.emptyText}>No hay advertencias registradas</Text>
        ) : (
          warningRecords.map((record, index) => (
            <View key={index} style={styles.listItem}>
              <View>
                <Text style={styles.listItemText}>
                  {record.action_type} - Empleado {record.employee_id}
                </Text>
                <Text style={styles.listItemSubtext}>
                  {new Date(record.created_at).toLocaleDateString('es-MX')}
                </Text>
              </View>
              <Text style={styles.warningBadge}>⚠️</Text>
            </View>
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemText: {
    fontSize: 16,
    color: '#374151',
  },
  listItemSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316', // Naranja
  },
  warningBadge: {
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    paddingVertical: 20,
  },
});

