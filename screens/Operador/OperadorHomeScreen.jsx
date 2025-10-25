import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Package, PlusCircle, ArrowLeftRight, ChevronRight } from 'lucide-react-native';

/**
 * Pantalla principal del Operador (REDISEÑADA)
 * * Principios de UI/UX aplicados:
 * 1. Jerarquía Clara: La tarea principal (Empaque) es la tarjeta más grande
 * y de color primario (Call to Action principal).
 * 2. Minimalismo: Se usa un layout basado en tarjetas con amplio espacio en blanco.
 * 3. Guía Visual: Los íconos son grandes y las tarjetas secundarias están
 * agrupadas lógicamente como "Otras Tareas".
 * 4. Consistencia: Colores neutros con un solo color de acción (azul).
 */
export default function OperadorHomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      {/* 1. Encabezado de Bienvenida */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Bienvenido, Operador</Text>
        <Text style={styles.headerSubtitle}>¿Qué tarea necesitas realizar?</Text>
      </View>

      {/* 2. Tarjeta de Acción Principal (La tarea más común) */}
      <Text style={styles.sectionTitle}>Tarea Principal</Text>
      <TouchableOpacity 
        style={styles.primaryCard} 
        onPress={() => navigation.navigate('EstacionDeEmpaque')}
      >
        <Package color="#ffffff" size={40} />
        <View style={styles.primaryCardTextContainer}>
          <Text style={styles.primaryCardTitle}>Paso 2: Empaque Guiado</Text>
          <Text style={styles.primaryCardSubtitle}>Ensamblar carritos para vuelos</Text>
        </View>
        <ChevronRight color="#e0e7ff" size={24} />
      </TouchableOpacity>

      {/* 3. Cuadrícula de Acciones Secundarias (Otras tareas) */}
      <Text style={styles.sectionTitle}>Otras Tareas</Text>
      <View style={styles.secondaryGrid}>
        
        {/* Tarjeta de Registro de Lote */}
        <TouchableOpacity 
          style={styles.secondaryCard} 
          onPress={() => navigation.navigate('RegistroDeLote')}
        >
          <View style={[styles.secondaryCardIconContainer, { backgroundColor: '#e0e7ff' }]}>
            <PlusCircle color="#3b82f6" size={28} />
          </View>
          <Text style={styles.secondaryCardTitle}>Paso 1: Registrar Lote</Text>
        </TouchableOpacity>
        
        {/* Tarjeta de Retorno Asistido */}
        <TouchableOpacity 
          style={styles.secondaryCard} 
          onPress={() => navigation.navigate('RetornoAsistido')}
        >
          <View style={[styles.secondaryCardIconContainer, { backgroundColor: '#fee2e2' }]}>
            <ArrowLeftRight color="#dc2626" size={28} />
          </View>
          <Text style={styles.secondaryCardTitle}>Paso 3: Retorno Asistido</Text>
        </TouchableOpacity>

      </View>
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
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  
  // --- Tarjeta Primaria ---
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6', // Azul primario
    padding: 24,
    borderRadius: 16, // Bordes más redondeados
    marginBottom: 24,
    elevation: 5,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryCardTextContainer: {
    flex: 1, // Ocupa el espacio restante
    marginLeft: 16,
  },
  primaryCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  primaryCardSubtitle: {
    fontSize: 14,
    color: '#e0e7ff', // Un azul más claro
    marginTop: 4,
  },

  // --- Cuadrícula Secundaria ---
  secondaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '48%', // Dos columnas con espacio
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  secondaryCardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28, // Círculo perfecto
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a', // Azul oscuro
    textAlign: 'center',
  },
});

