import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { CheckCircle, AlertTriangle, X } from 'lucide-react-native';

/**
 * Componente de Modal de Feedback (NUEVO)
 * Reutilizable para mostrar éxito o error de forma
 * clara y minimalista.
 */
export default function FeedbackModal({ isVisible, type, message, onClose }) {
  const isSuccess = type === 'success';
  const backgroundColor = isSuccess ? '#16a34a' : '#dc2626'; // Verde o Rojo
  const Icon = isSuccess ? CheckCircle : AlertTriangle;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.6}
    >
      <View style={[styles.modalContent, { backgroundColor }]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X color="#ffffff" size={24} />
        </TouchableOpacity>
        
        <Icon color="#ffffff" size={80} />
        
        <Text style={styles.messageText}>{message}</Text>
        
        <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
          <Text style={styles.confirmButtonText}>Entendido</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  messageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  confirmButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
