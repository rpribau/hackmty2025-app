/**
 * API Configuration
 * Base URL for the backend API
 * 
 * IMPORTANT: React Native can't use 'localhost' when running on a device/emulator.
 * Use your computer's IP address instead.
 * 
 * To find your IP:
 * - Windows: ipconfig (look for IPv4 Address)
 * - Mac/Linux: ifconfig (look for inet)
 * - Or use: 10.0.2.2 for Android emulator, localhost for iOS simulator
 */

// Use your computer's IP address for React Native
const USE_LOCALHOST = false; // Set to true only if testing on iOS simulator
const COMPUTER_IP = '10.22.133.111'; // Your computer's IPv4 address
const PORT = '5001';

export const API_BASE_URL = USE_LOCALHOST 
  ? `http://localhost:${PORT}`
  : `http://${COMPUTER_IP}:${PORT}`;

/**
 * API Endpoints
 */
export const ENDPOINTS = {
  // Health
  health: '/health',
  
  // Items (Batches)
  items: '/api/items',
  itemById: (id) => `/api/items/${id}`,
  itemsByStatus: (status) => `/api/items/status/${status}`,
  
  // Drawers
  drawers: '/api/drawers',
  drawerById: (id) => `/api/drawers/${id}`,
  drawerQRCode: (id) => `/api/drawers/${id}/qr-code`,
  drawerQRCodeImage: (id) => `/api/drawers/${id}/qr-code/image`,
  
  // Drawer Layouts
  drawerLayouts: '/api/drawer-layouts',
  drawerLayoutById: (id) => `/api/drawer-layouts/${id}`,
  drawerLayoutByDrawer: (drawerId) => `/api/drawer-layouts/by-drawer/${drawerId}`,
  
  // Drawer Status
  drawerStatus: '/api/drawer-status',
  drawerStatusById: (id) => `/api/drawer-status/${id}`,
  drawerStatusByDrawer: (drawerId) => `/api/drawer-status/drawer/${drawerId}`,
  drawerStatusBatches: (statusId) => `/api/drawer-status/${statusId}/batches`,
  drawerStatusNonDepletedBatches: (statusId) => `/api/drawer-status/${statusId}/non-depleted-batches`,
  drawerStatusDepleteBatch: (statusId) => `/api/drawer-status/${statusId}/deplete-batch`,
  
  // Employees
  employees: '/api/employees',
  employeeById: (id) => `/api/employees/${id}`,
  
  // Restock History
  restockHistory: '/api/restock-history',
  restockHistoryById: (id) => `/api/restock-history/${id}`,
  restockHistoryByEmployee: (employeeId) => `/api/restock-history/employee/${employeeId}`,
  restockHistoryPerformance: (employeeId) => `/api/restock-history/performance/${employeeId}`,
  restockHistoryLeaderboard: '/api/restock-history/leaderboard',
  restockHistoryWarnings: '/api/restock-history/warnings',
};

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};
