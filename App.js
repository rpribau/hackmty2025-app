import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar Pantallas
import LoginScreen from './screens/LoginScreen';
import OperadorHomeScreen from './screens/Operador/OperadorHomeScreen';
import RegistroDeLoteScreen from './screens/Operador/RegistroDeLoteScreen';
import EstacionDeEmpaqueScreen from './screens/Operador/EstacionDeEmpaqueScreen';
import RetornoAsistidoScreen from './screens/Operador/RetornoAsistidoScreen';
import SupervisorTabNavigator from './screens/Supervisor/SupervisorTabNavigator';
import ScannerComponent from './components/ScannerComponent'; // Importar el escáner

// Crear el Stack Navigator
const Stack = createNativeStackNavigator();

/**
 * Navegador principal de la aplicación.
 * Maneja la navegación de alto nivel, empezando por el Login
 * y luego bifurcando a los perfiles de Operador o Supervisor.
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Seleccionar Perfil' }}
        />
        
        {/* Flujo del Operador */}
        <Stack.Screen 
          name="OperadorHome" 
          component={OperadorHomeScreen} 
          options={{ title: 'Tareas de Operador' }}
        />
        <Stack.Screen 
          name="RegistroDeLote" 
          component={RegistroDeLoteScreen} 
          options={{ title: 'Paso 1: Registrar Lote' }}
        />
        <Stack.Screen 
          name="EstacionDeEmpaque" 
          component={EstacionDeEmpaqueScreen} 
          options={{ title: 'Paso 2: Empaque Guiado' }}
        />
        <Stack.Screen 
          name="RetornoAsistido" 
          component={RetornoAsistidoScreen} 
          options={{ title: 'Paso 3: Retorno Asistido' }}
        />

        {/* Flujo del Supervisor */}
        <Stack.Screen 
          name="SupervisorHome" 
          component={SupervisorTabNavigator} 
          options={{ headerShown: false }} // El Tab Navigator tiene su propio header
        />

        {/* Componente de Escáner (Modal) */}
        {/* Se presenta como un modal para que pueda ser llamado desde cualquier pantalla */}
        <Stack.Screen 
          name="Scanner" 
          component={ScannerComponent} 
          options={{ presentation: 'modal', title: 'Escanear Código' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
