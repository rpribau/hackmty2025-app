/**
 * API SIMULADA (Mock API)
 * * Este archivo simula las respuestas de sus modelos de Markov y Teoría de Colas.
 * Nos permite construir la UI sin depender de que los modelos estén listos.
 * Devuelve datos hardcodeados con un pequeño retraso para simular una llamada de red.
 */

const mockData = {
  task: {
    vuelo: 'LX721',
    carrito: 'C-05',
    cajon: 3,
    tiempoEstandar: 55, // μ (micro) - Salida del Modelo de Colas
    items: [
      { id: 'SNK-001', nombre: 'Snack Box Economy', qtyRequerida: 32 },
      { id: 'JUC-003', nombre: 'Jugo de Naranja', qtyRequerida: 15 },
    ]
  },
  dashboards: {
    productividad: {
      eficienciaGeneral: 92,
      estadoCola: 'SALUDABLE',
      esperaPromedio: 0.8, // en minutos
      empleadosRecomendados: 5, // s (salida del modelo)
      empleadosActuales: 5,
    },
    consumo: {
      tasaDesperdicio: 15,
      estadoModelo: 'ESTABLE (15,000 iteraciones)',
      ultimaActualizacion: 'Hoy 06:00 AM',
      politicaEjemplo: 'Ruta ZRH-JFK (Vino): Cargar 2 [S1]',
    },
    caducidad: {
      alertaCritica: '¡ALERTA! 3 Lotes [S_CRÍTICO] vencen en 48h.',
      desechadosHoy: 120,
      inventario: [
        { estado: 'S_VÁLIDO', qty: 15000 },
        { estado: 'S_CRÍTICO', qty: 350 },
        { estado: 'S_VENCIDO', qty: 80 },
      ]
    }
  }
};

// Lógica de simulación FEFO
const lotesCriticos = ['LOTE-CRITICO-123'];
const lotesValidos = ['LOTE-VALIDO-456'];
const lotesVencidos = ['LOTE-VENCIDO-789'];

// Simula una llamada de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * (Operador) Obtiene la siguiente tarea de empaque.
 * Simula la salida de los modelos de Consumo y Productividad.
 */
export const getPackingTask = async () => {
  await delay(400);
  return mockData.task;
};

/**
 * (Operador) Simula la validación de un lote escaneado.
 * Esta es la lógica FEFO que bloquea al usuario.
 */
export const validateLoteFEFO = async (loteQR) => {
  await delay(200);
  
  // Simulación de Límite (Regla FEFO)
  if (lotesValidos.includes(loteQR)) {
    // El usuario escaneó un lote válido, PERO debemos checar si existe uno crítico.
    // En esta simulación, asumimos que SÍ existe uno crítico.
    return {
      status: 'error',
      code: 'FEFO_VIOLATION',
      message: '¡ERROR! Use primero el lote [LOTE-CRITICO-123] que vence pronto.',
      loteCorrecto: 'LOTE-CRITICO-123'
    };
  }

  if (lotesCriticos.includes(loteQR)) {
    return {
      status: 'success',
      code: 'FEFO_OK',
      message: 'Lote Crítico OK'
    };
  }
  
  if (lotesVencidos.includes(loteQR)) {
     return {
      status: 'error',
      code: 'VENCIDO',
      message: '¡LOTE VENCIDO! No se puede cargar.'
    };
  }

  return { status: 'error', code: 'NOT_FOUND', message: 'Lote no encontrado' };
};

/**
 * (Operador) Simula la validación de un lote en Retorno Asistido.
 */
export const validateReturnLote = async (loteQR) => {
  await delay(200);

  if (lotesValidos.includes(loteQR) || lotesCriticos.includes(loteQR)) {
    return {
      status: 'success',
      code: 'RETURN_OK',
      message: 'LOTE OK. Devolver a Almacén.'
    };
  }

  if (lotesVencidos.includes(loteQR)) {
    return {
      status: 'error',
      code: 'VENCIDO',
      message: '¡ALERTA CADUCIDAD! Lote vencido. Desechar.'
    };
  }
  
  return { status: 'error', code: 'NOT_FOUND', message: 'Lote no encontrado' };
};


/**
 * (Supervisor) Obtiene todos los datos de los dashboards.
 */
export const getDashboardData = async () => {
  await delay(500);
  return mockData.dashboards;
};
