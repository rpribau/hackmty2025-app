// Initialize polyfills before any other imports
import './utils/polyfills';
import setupPolyfills from './utils/polyfills';
setupPolyfills();

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ... (El resto de tus imports de pantallas se mantienen igual)
import LoginScreen from './screens/LoginScreen';
import OperadorHomeScreen from './screens/Operador/OperadorHomeScreen';
import RegistroDeLoteScreen from './screens/Operador/RegistroDeLoteScreen';
import EstacionDeEmpaqueScreen from './screens/Operador/EstacionDeEmpaqueScreen';
import RetornoAsistidoScreen from './screens/Operador/RetornoAsistidoScreen';
import SupervisorTabNavigator from './screens/Supervisor/SupervisorTabNavigator';
import ScannerComponent from './components/ScannerComponent';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {/* ... (El resto de tu Stack Navigator se mantiene igual) ... */}
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Seleccionar Perfil' }}
          />
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
          <Stack.Screen
            name="SupervisorHome"
            component={SupervisorTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Scanner"
            component={ScannerComponent}
            options={{ presentation: 'modal', title: 'Escanear Código' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}