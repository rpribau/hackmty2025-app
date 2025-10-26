import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Package, PlusCircle, ArrowLeftRight, ChevronRight, Clock, TrendingUp, TrendingDown } from 'lucide-react-native';
import { getOperadorHistory } from '../../api/mockapi';

/**
 * Pantalla principal del Operador (REDISEÑADA)
 * * Principios de UI/UX aplicados:
 * 1. Jerarquía Clara: La tarea principal (Empaque) es la tarjeta más grande
 * y de color primario (Call to Action principal).
 * 2. Minimalismo: Se usa un layout basado en tarjetas con amplio espacio en blanco.
 * 3. Guía Visual: Los íconos son grandes y las tarjetas secundarias están
 * agrupadas lógicamente como "Otras Tareas".
 * 4. Consistencia: Colores neutros con un solo color de acción (azul).
 * 5. Historial: Muestra las actividades previas con métricas de desempeño.
 */
export default function OperadorHomeScreen({ navigation, route }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const operadorNombre = route.params?.operadorNombre || global.operadorNombre || 'Operador';

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getOperadorHistory(operadorNombre);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace unos minutos';
  };
  return (
    <ScrollView style={styles.container}>
      {/* 1. Encabezado de Bienvenida */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Bienvenido, {operadorNombre}</Text>
        <Text style={styles.headerSubtitle}>¿Qué tarea necesitas realizar?</Text>
      </View>

      {/* 2. Tres Tarjetas de Tareas (Iguales) */}
      <Text style={styles.sectionTitle}>Tareas Disponibles</Text>
      
      {/* Tarjeta 1: Registrar Lote */}
      <TouchableOpacity 
        style={[styles.taskCard, { backgroundColor: '#3b82f6' }]} 
        onPress={() => navigation.navigate('RegistroDeLote')}
      >
        <View style={styles.taskCardIconContainer}>
          <PlusCircle color="#ffffff" size={36} />
        </View>
        <View style={styles.taskCardTextContainer}>
          <Text style={styles.taskCardTitle}>Paso 1: Registrar Lote</Text>
          <Text style={styles.taskCardSubtitle}>Registrar productos en el sistema</Text>
        </View>
        <ChevronRight color="#ffffff" size={24} />
      </TouchableOpacity>

      {/* Tarjeta 2: Empaque Guiado */}
      <TouchableOpacity 
        style={[styles.taskCard, { backgroundColor: '#8b5cf6' }]} 
        onPress={() => navigation.navigate('EmpaqueGuiado')}
      >
        <View style={styles.taskCardIconContainer}>
          <Package color="#ffffff" size={36} />
        </View>
        <View style={styles.taskCardTextContainer}>
          <Text style={styles.taskCardTitle}>Paso 2: Empaque Guiado</Text>
          <Text style={styles.taskCardSubtitle}>Ensamblar carritos para vuelos</Text>
        </View>
        <ChevronRight color="#ffffff" size={24} />
      </TouchableOpacity>

      {/* Tarjeta 3: Retorno Asistido */}
      <TouchableOpacity 
        style={[styles.taskCard, { backgroundColor: '#ec4899' }]} 
        onPress={() => navigation.navigate('RetornoAsistido')}
      >
        <View style={styles.taskCardIconContainer}>
          <ArrowLeftRight color="#ffffff" size={36} />
        </View>
        <View style={styles.taskCardTextContainer}>
          <Text style={styles.taskCardTitle}>Paso 3: Retorno Asistido</Text>
          <Text style={styles.taskCardSubtitle}>Procesar devoluciones de vuelos</Text>
        </View>
        <ChevronRight color="#ffffff" size={24} />
      </TouchableOpacity>

      {/* 4. Historial de Actividades */}
        <Text style={[styles.sectionTitle, { marginTop: 44 }]}>Historial de Actividades</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyHistoryCard}>
            <Clock color="#9ca3af" size={48} />
            <Text style={styles.emptyHistoryText}>No hay actividades registradas</Text>
          </View>
        ) : (
          <View style={styles.historyContainer}>
            {history.map((activity) => (
          <View key={activity.id} style={styles.historyCard}>
            {/* Encabezado de la actividad */}
              <View style={styles.historyHeader}>
                <Text style={styles.historyType}>{activity.tipo}</Text>
                <Text style={styles.historyDate}>{formatDate(activity.fecha)}</Text>
              </View>

              {/* Detalles según el tipo de actividad */}
              {activity.tipo === 'Empaque Guiado' && (
                <>
                  <Text style={styles.historyDetail}>
                    Vuelo: <Text style={styles.historyDetailBold}>{activity.vuelo}</Text> → {activity.destino}
                  </Text>
                  <View style={styles.historyMetrics}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Tiempo Estimado</Text>
                      <Text style={styles.metricValue}>{formatTime(activity.tiempoEstimado)}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Tiempo Real</Text>
                      <Text style={[
                        styles.metricValue,
                        activity.tiempoReal <= activity.tiempoEstimado ? styles.metricGood : styles.metricBad
                      ]}>
                        {formatTime(activity.tiempoReal)}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <View style={styles.efficiencyContainer}>
                        {activity.eficiencia >= 100 ? 
                          <TrendingUp color="#16a34a" size={16} /> :
                          <TrendingDown color="#dc2626" size={16} />
                        }
                        <Text style={[
                          styles.efficiencyText,
                          activity.eficiencia >= 100 ? styles.metricGood : styles.metricBad
                        ]}>
                          {activity.eficiencia.toFixed(1)}%
                        </Text>
                      </View>
                      <Text style={styles.metricLabel}>Eficiencia</Text>
                    </View>
                  </View>
                </>
              )}

              {activity.tipo === 'Registro de Lote' && (
                <>
                  <Text style={styles.historyDetail}>
                    Producto: <Text style={styles.historyDetailBold}>{activity.producto}</Text>
                  </Text>
                  <Text style={styles.historyDetail}>
                    Cantidad: <Text style={styles.historyDetailBold}>{activity.cantidad} unidades</Text>
                  </Text>
                  <Text style={styles.historyDetail}>
                    Tiempo: <Text style={styles.historyDetailBold}>{formatTime(activity.tiempoReal)}</Text>
                  </Text>
                </>
              )}

              {activity.tipo === 'Retorno Asistido' && (
                <>
                  <Text style={styles.historyDetail}>
                    Items procesados: <Text style={styles.historyDetailBold}>{activity.itemsProcesados}</Text>
                  </Text>
                  <Text style={styles.historyDetail}>
                    Tiempo: <Text style={styles.historyDetailBold}>{formatTime(activity.tiempoReal)}</Text>
                  </Text>
                </>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Un gris muy claro, casi blanco
    padding: 20,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827', // Casi negro
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#6b7280', // Gris medio
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 16,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  
  // --- Tarjetas de Tareas (Iguales) ---
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  taskCardIconContainer: {
    marginRight: 16,
  },
  taskCardTextContainer: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  taskCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyHistoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 1,
    marginBottom: 20,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  historyDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  historyDetailBold: {
    fontWeight: '600',
    color: '#111827',
  },
  historyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  metricGood: {
    color: '#16a34a',
  },
  metricBad: {
    color: '#dc2626',
  },
  efficiencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  efficiencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

