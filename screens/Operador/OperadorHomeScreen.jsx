import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlusCircle, Package, ArrowLeftRight } from 'lucide-react-native';

/**
 * Pantalla principal del Operador con sus 3 tareas clave.
 */
export default function OperadorHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Tareas</Text>
      
      {/* Botón para Paso 1 */}
      <TouchableOpacity 
        style={styles.taskButton} 
        onPress={() => navigation.navigate('RegistroDeLote')}
      >
        <PlusCircle color="#1e3a8a" size={40} />
        <View style={styles.taskTextContainer}>
          <Text style={styles.taskTitle}>Paso 1: Registrar Lote</Text>
          <Text style={styles.taskSubtitle}>Digitalizar nuevos productos del proveedor.</Text>
        </View>
      </TouchableOpacity>

      {/* Botón para Paso 2 */}
      <TouchableOpacity 
        style={styles.taskButton} 
        onPress={() => navigation.navigate('EstacionDeEmpaque')}
      >
        <Package color="#1e3a8a" size={40} />
        <View style={styles.taskTextContainer}>
          <Text style={styles.taskTitle}>Paso 2: Empaque Guiado</Text>
          <Text style={styles.taskSubtitle}>Ensamblar carritos para vuelos.</Text>
        </View>
      </TouchableOpacity>

      {/* Botón para Paso 3 */}
      <TouchableOpacity 
        style={styles.taskButton} 
        onPress={() => navigation.navigate('RetornoAsistido')}
      >
        <ArrowLeftRight color="#1e3a8a" size={40} />
        <View style={styles.taskTextContainer}>
          <Text style={styles.taskTitle}>Paso 3: Retorno Asistido</Text>
          <Text style={styles.taskSubtitle}>Procesar cajones devueltos (manual).</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 30,
  },
  taskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  taskSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});
