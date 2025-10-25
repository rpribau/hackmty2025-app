import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HardHat, User } from 'lucide-react-native'; // Iconos

/**
 * Pantalla de selección de perfil (Login).
 * Elige entre Operador y Supervisor.
 */
export default function LoginScreen({ navigation }) {
  
  const goToOperador = () => {
    navigation.replace('OperadorHome');
  };

  const goToSupervisor = () => {
    navigation.replace('SupervisorHome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sistema de Flujo Inteligente</Text>
      <Text style={styles.subtitle}>Seleccione su perfil:</Text>

      <TouchableOpacity style={styles.button} onPress={goToOperador}>
        <HardHat color="#ffffff" size={32} />
        <Text style={styles.buttonText}>Soy Operador</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={goToSupervisor}>
        <User color="#ffffff" size={32} />
        <Text style={styles.buttonText}>Soy Supervisor</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#111827',
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%',
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
  },
});
