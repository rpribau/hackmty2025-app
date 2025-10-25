import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Clock } from 'lucide-react-native';

/**
 * Representación 2D del carrito cuando 3D no está disponible
 * Muestra los 8 cajones en una vista de lista visual
 */
export default function Trolley2D({ drawerStates }) {
  const drawerIds = Object.keys(drawerStates || {}).sort();
  
  const drawerNames = [
    'Cajón 1: Snacks (ECON)',
    'Cajón 2: Snacks (ECON)',
    'Cajón 3: Bebidas (PREM)',
    'Cajón 4: Bebidas (PREM)',
    'Cajón 5: Amenidades',
    'Cajón 6: Comida Fría',
    'Cajón 7: Vacío',
    'Cajón 8: Vacío',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.trolleyBody}>
        <Text style={styles.title}>Vista del Carrito</Text>
        
        {drawerIds.map((drawerId, index) => {
          const status = drawerStates[drawerId] || 'pending';
          const isCompleted = status === 'completed';
          
          return (
            <View 
              key={drawerId} 
              style={[
                styles.drawer,
                isCompleted && styles.drawerCompleted
              ]}
            >
              <View style={styles.drawerLeft}>
                <Text style={styles.drawerNumber}>{index + 1}</Text>
              </View>
              
              <View style={styles.drawerContent}>
                <Text style={[
                  styles.drawerName,
                  isCompleted && styles.drawerNameCompleted
                ]}>
                  {drawerNames[index]}
                </Text>
              </View>
              
              <View style={styles.drawerRight}>
                {isCompleted ? (
                  <Check color="#16a34a" size={24} />
                ) : (
                  <Clock color="#6b7280" size={24} />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    padding: 20,
  },
  trolleyBody: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 15,
  },
  drawer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9ca3af',
  },
  drawerCompleted: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#16a34a',
  },
  drawerLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  drawerContent: {
    flex: 1,
  },
  drawerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  drawerNameCompleted: {
    color: '#16a34a',
  },
  drawerRight: {
    marginLeft: 8,
  },
});
