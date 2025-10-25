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
 * (Operador) Obtiene un trabajo de empaque completo con múltiples cajones.
 * Versión extendida para la pantalla rediseñada.
 * Ahora devuelve 8 cajones para coincidir con los rieles del modelo 3D.
 */
export const getPackingJob = async () => {
  // Simulación de una llamada de red
  await delay(500);
  
  // Datos simulados
  return {
    vuelo: 'LX721',
    destino: 'ZRH-JFK',
    tiempoEstandar: 480, // 8 minutos (μ de nuestro modelo)
    cajones: [
      { id: 'drawer-1', nombre: 'Cajón 1: Snacks (ECON)', contenido: '32 Snacks, 15 Jugos' },
      { id: 'drawer-2', nombre: 'Cajón 2: Snacks (ECON)', contenido: '32 Snacks, 15 Jugos' },
      { id: 'drawer-3', nombre: 'Cajón 3: Bebidas (PREM)', contenido: '8 Vinos, 10 Cervezas' },
      { id: 'drawer-4', nombre: 'Cajón 4: Bebidas (PREM)', contenido: '8 Vinos, 10 Cervezas' },
      { id: 'drawer-5', nombre: 'Cajón 5: Amenidades', contenido: '20 Kits Dentales, 15 Antifaces' },
      { id: 'drawer-6', nombre: 'Cajón 6: Comida Fría', contenido: '12 Ensaladas, 12 Postres' },
      { id: 'drawer-7', nombre: 'Cajón 7: Vacío', contenido: 'N/A' },
      { id: 'drawer-8', nombre: 'Cajón 8: Vacío', contenido: 'N/A' },
    ],
  };
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
 * (Operador) Obtiene los detalles de un producto por su EAN/código de barras.
 */
export const getProductDetails = async (ean) => {
  await delay(300);
  
  // Simulación de base de datos de productos
  const productos = {
    '7501234567890': { ean: '7501234567890', nombre: 'Snack Box Economy' },
    '7501234567891': { ean: '7501234567891', nombre: 'Jugo de Naranja' },
    '7501234567892': { ean: '7501234567892', nombre: 'Sándwich de Jamón' },
    '7501234567893': { ean: '7501234567893', nombre: 'Galletas Chocolate' },
  };
  
  return productos[ean] || null;
};

/**
 * (Operador) Registra un nuevo lote en el sistema.
 */
export const registerNewLote = async (ean, cantidad, fechaCaducidad) => {
  await delay(400);
  
  // Validaciones básicas
  if (!ean || !cantidad || !fechaCaducidad) {
    return {
      status: 'error',
      message: 'Faltan datos obligatorios'
    };
  }
  
  if (cantidad <= 0) {
    return {
      status: 'error',
      message: 'La cantidad debe ser mayor a 0'
    };
  }
  
  // Simular registro exitoso
  const loteId = `LOTE-${Date.now()}`;
  return {
    status: 'success',
    message: 'Lote registrado correctamente',
    loteId: loteId
  };
};


/**
 * (Supervisor) Obtiene todos los datos de los dashboards.
 */
export const getDashboardData = async () => {
  await delay(500);
  return mockData.dashboards;
};
