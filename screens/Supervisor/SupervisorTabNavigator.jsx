import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Activity, PieChart, Archive } from 'lucide-react-native';

// Importar las pantallas del dashboard
import DashboardProductividadScreen from './DashboardProductividadScreen';
import DashboardConsumoScreen from './DashboardConsumoScreen';
import DashboardCaducidadScreen from './DashboardCaducidadScreen';

const Tab = createBottomTabNavigator();

/**
 * Navegador de Pestañas (Tabs) para el perfil de Supervisor.
 * Muestra los 3 dashboards principales.
 */
export default function SupervisorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Productividad') {
            return <Activity color={color} size={size} />;
          } else if (route.name === 'Consumo') {
            return <PieChart color={color} size={size} />;
          } else if (route.name === 'Caducidad') {
            return <Archive color={color} size={size} />;
          }
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Productividad" 
        component={DashboardProductividadScreen} 
        options={{ title: 'Dashboard: Productividad' }}
      />
      <Tab.Screen 
        name="Consumo" 
        component={DashboardConsumoScreen} 
        options={{ title: 'Dashboard: Consumo' }}
      />
      <Tab.Screen 
        name="Caducidad" 
        component={DashboardCaducidadScreen} 
        options={{ title: 'Dashboard: Caducidad' }}
      />
    </Tab.Navigator>
  );
}
