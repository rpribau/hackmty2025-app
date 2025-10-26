import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { UserCircle, LogIn } from 'lucide-react-native';

/**
 * Pantalla de Login para Operador
 * Solo pide el nombre del operador para identificarlo
 */
export default function OperadorLoginScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);
    
    // Simular autenticación
    setTimeout(() => {
      // Guardar el nombre del operador (en producción, usar AsyncStorage)
      global.operadorNombre = nombre.trim();
      console.log('✅ Operador logueado:', nombre);
      
      setLoading(false);
      // Navegar a la pantalla principal del operador
      navigation.replace('OperadorHome', { operadorNombre: nombre.trim() });
    }, 500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo/Icono */}
        <View style={styles.iconContainer}>
          <UserCircle color="#3b82f6" size={100} />
        </View>

        {/* Título */}
        <Text style={styles.title}>Bienvenido, Operador</Text>
        <Text style={styles.subtitle}>Ingresa tu nombre para continuar</Text>

        {/* Input de Nombre */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            editable={!loading}
          />
        </View>

        {/* Botón de Login */}
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <LogIn color="#ffffff" size={24} />
          <Text style={styles.loginButtonText}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Text>
        </TouchableOpacity>

        {/* Botón Volver */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#111827',
    width: '100%',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    elevation: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  backButton: {
    marginTop: 16,
    padding: 12,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
