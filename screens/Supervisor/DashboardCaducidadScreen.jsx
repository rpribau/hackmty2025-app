import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { Calendar, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { itemsService } from '../../api';

/**
 * Dashboard de Caducidad (REDISEÑADO)
 * Basado en el estado del inventario digital (FEFO).
 */
export default function DashboardCaducidadScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpiData, setKpiData] = useState({
    proximos7dias: 0,
    desperdicioEvitado: 0,
  });
  const [alertasRojas, setAlertasRojas] = useState([]);
  const [chartData, setChartData] = useState({
    pieData: [],
    barData: { labels: [], datasets: [{ data: [] }] },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get all available items
      const availableItems = await itemsService.getAvailableBatches();
      
      // Calculate items expiring in next 7 days
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const expiringSoon = availableItems.filter(item => {
        const expiryDate = new Date(item.expiry_date);
        return expiryDate <= sevenDaysFromNow && expiryDate > now;
      });
      
      // Calculate items expiring in next 48 hours (critical alerts)
      const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
      const criticalItems = availableItems.filter(item => {
        const expiryDate = new Date(item.expiry_date);
        return expiryDate <= twoDaysFromNow && expiryDate > now;
      });
      
      // Categorize items by expiry time ranges
      const expired = availableItems.filter(item => new Date(item.expiry_date) <= now);
      const critical = criticalItems; // 0-2 days
      const warning = expiringSoon.filter(item => {
        const expiryDate = new Date(item.expiry_date);
        return expiryDate > twoDaysFromNow && expiryDate <= sevenDaysFromNow;
      }); // 2-7 days
      const safe = availableItems.filter(item => {
        const expiryDate = new Date(item.expiry_date);
        return expiryDate > sevenDaysFromNow;
      }); // 7+ days
      
      // Calculate waste prevention (items consumed before expiry)
      const totalAvailable = availableItems.length;
      const expiredCount = expired.length;
      const wastePreventionRate = totalAvailable > 0 
        ? ((totalAvailable - expiredCount) / totalAvailable) * 100 
        : 97.8;
      
      setKpiData({
        proximos7dias: expiringSoon.reduce((sum, item) => sum + item.quantity, 0),
        desperdicioEvitado: wastePreventionRate.toFixed(1),
      });
      
      setAlertasRojas(criticalItems.slice(0, 10).map(item => ({
        nombre: item.item_type,
        lote: item.batch_number,
        expiry: new Date(item.expiry_date).toLocaleDateString('es-MX'),
      })));
      
      // Prepare Pie Chart data (distribution by status)
      const totalItems = availableItems.length;
      const pieChartData = [
        {
          name: 'Seguros (7+ días)',
          population: safe.length,
          color: '#16a34a',
          legendFontColor: '#374151',
          legendFontSize: 12,
        },
        {
          name: 'Alerta (2-7 días)',
          population: warning.length,
          color: '#f59e0b',
          legendFontColor: '#374151',
          legendFontSize: 12,
        },
        {
          name: 'Crítico (0-2 días)',
          population: critical.length,
          color: '#ef4444',
          legendFontColor: '#374151',
          legendFontSize: 12,
        },
        {
          name: 'Vencidos',
          population: expired.length,
          color: '#991b1b',
          legendFontColor: '#374151',
          legendFontSize: 12,
        },
      ].filter(item => item.population > 0); // Only show categories with items
      
      // Prepare Bar Chart data (quantity by category)
      const barChartData = {
        labels: ['Seguros', 'Alerta', 'Crítico', 'Vencidos'],
        datasets: [{
          data: [
            safe.reduce((sum, item) => sum + item.quantity, 0),
            warning.reduce((sum, item) => sum + item.quantity, 0),
            critical.reduce((sum, item) => sum + item.quantity, 0),
            expired.reduce((sum, item) => sum + item.quantity, 0),
          ]
        }]
      };
      
      setChartData({
        pieData: pieChartData,
        barData: barChartData,
      });
      
    } catch (error) {
      console.error('Error loading caducidad data:', error);
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
          <Text style={styles.cardTitleAlert}>
            ¡Alertas! Lotes Críticos (Próx. 48h) - {alertasRojas.length}
          </Text>
        </View>
        {alertasRojas.length === 0 ? (
          <Text style={styles.emptyText}>No hay lotes críticos</Text>
        ) : (
          alertasRojas.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View>
                <Text style={styles.listItemText}>{item.nombre}</Text>
                <Text style={styles.listItemSubtext}>Vence: {item.expiry}</Text>
              </View>
              <Text style={styles.listItemValue}>{item.lote}</Text>
            </View>
          ))
        )}
      </View>
      
      {/* 3. Gráfico de Distribución de Inventario */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Distribución de Inventario por Caducidad</Text>
        {chartData.pieData.length > 0 ? (
          <PieChart
            data={chartData.pieData}
            width={Dimensions.get('window').width - 80}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>No hay datos disponibles</Text>
          </View>
        )}
      </View>

      {/* 4. Gráfico de Cantidades por Categoría */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Cantidades por Categoría de Caducidad</Text>
        {chartData.barData.datasets[0].data.some(val => val > 0) ? (
          <BarChart
            data={chartData.barData}
            width={Dimensions.get('window').width - 80}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 12,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            showValuesOnTopOfBars
            fromZero
          />
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>No hay datos disponibles</Text>
          </View>
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  listItemSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626', // Rojo
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    paddingVertical: 20,
  },
});

