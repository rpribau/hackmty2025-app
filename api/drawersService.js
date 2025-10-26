import baseService from './baseService';
import { ENDPOINTS, API_BASE_URL } from './config';

/**
 * Drawers API Service
 * Manages drawer CRUD operations and QR code generation
 */
class DrawersService {
  /**
   * Get all drawers with pagination
   * @param {number} skip - Number of drawers to skip
   * @param {number} limit - Maximum number of drawers to return
   * @returns {Promise<Array>} List of drawers
   */
  async getDrawers(skip = 0, limit = 100) {
    return baseService.get(ENDPOINTS.drawers, { skip, limit });
  }

  /**
   * Get drawer by ID
   * @param {number} id - Drawer ID
   * @returns {Promise<object>} Drawer details
   */
  async getDrawerById(id) {
    return baseService.get(ENDPOINTS.drawerById(id));
  }

  /**
   * Create new drawer
   * @param {object} drawerData - Drawer data
   * @param {string} drawerData.drawer_code - Unique drawer code
   * @param {string} drawerData.location - Drawer location
   * @param {number} drawerData.capacity - Drawer capacity
   * @param {string} drawerData.status - Drawer status (default: active)
   * @returns {Promise<object>} Created drawer
   */
  async createDrawer(drawerData) {
    return baseService.post(ENDPOINTS.drawers, drawerData);
  }

  /**
   * Update drawer
   * @param {number} id - Drawer ID
   * @param {object} drawerData - Updated drawer data
   * @returns {Promise<object>} Updated drawer
   */
  async updateDrawer(id, drawerData) {
    return baseService.put(ENDPOINTS.drawerById(id), drawerData);
  }

  /**
   * Delete drawer
   * @param {number} id - Drawer ID
   * @returns {Promise<object>} Deletion confirmation
   */
  async deleteDrawer(id) {
    return baseService.delete(ENDPOINTS.drawerById(id));
  }

  /**
   * Generate QR code for drawer
   * @param {number} drawerId - Drawer ID
   * @returns {Promise<object>} QR code data
   */
  async generateQRCode(drawerId) {
    return baseService.post(ENDPOINTS.drawerQRCode(drawerId));
  }

  /**
   * Get QR code data for drawer
   * @param {number} drawerId - Drawer ID
   * @returns {Promise<object>} QR code data
   */
  async getQRCode(drawerId) {
    return baseService.get(ENDPOINTS.drawerQRCode(drawerId));
  }

  /**
   * Get QR code image URL
   * @param {number} drawerId - Drawer ID
   * @returns {string} Full URL to QR code image
   */
  getQRCodeImageURL(drawerId) {
    return `${API_BASE_URL}${ENDPOINTS.drawerQRCodeImage(drawerId)}`;
  }

  /**
   * Find drawer by QR code
   * @param {string} qrCode - QR code string (UUID)
   * @returns {Promise<object|null>} Drawer if found, null otherwise
   */
  async findDrawerByQRCode(qrCode) {
    try {
      const drawers = await this.getDrawers(0, 1000);
      // Compare against qr_code field (UUID), not drawer_code (DR-A1)
      return drawers.find(drawer => drawer.qr_code === qrCode || drawer.id === qrCode) || null;
    } catch (error) {
      console.error('Error finding drawer by QR code:', error);
      return null;
    }
  }
}

export default new DrawersService();
