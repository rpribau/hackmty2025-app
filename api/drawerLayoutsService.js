import baseService from './baseService';
import { ENDPOINTS } from './config';

/**
 * Drawer Layouts API Service
 * Manages drawer layout configurations
 */
class DrawerLayoutsService {
  /**
   * Get all drawer layouts with pagination
   * @param {number} skip - Number of layouts to skip
   * @param {number} limit - Maximum number of layouts to return
   * @returns {Promise<Array>} List of drawer layouts
   */
  async getLayouts(skip = 0, limit = 100) {
    return baseService.get(ENDPOINTS.drawerLayouts, { skip, limit });
  }

  /**
   * Get layout by ID
   * @param {number} id - Layout ID
   * @returns {Promise<object>} Layout details
   */
  async getLayoutById(id) {
    return baseService.get(ENDPOINTS.drawerLayoutById(id));
  }

  /**
   * Get layout by drawer ID
   * @param {number} drawerId - Drawer ID
   * @returns {Promise<object>} Layout configuration for drawer
   */
  async getLayoutByDrawer(drawerId) {
    return baseService.get(ENDPOINTS.drawerLayoutByDrawer(drawerId));
  }

  /**
   * Create new drawer layout
   * @param {object} layoutData - Layout data
   * @param {number} layoutData.drawer_id - Drawer ID
   * @param {string} layoutData.layout_config - Layout configuration (JSON string)
   * @returns {Promise<object>} Created layout
   */
  async createLayout(layoutData) {
    return baseService.post(ENDPOINTS.drawerLayouts, layoutData);
  }

  /**
   * Update drawer layout
   * @param {number} id - Layout ID
   * @param {object} layoutData - Updated layout data
   * @returns {Promise<object>} Updated layout
   */
  async updateLayout(id, layoutData) {
    return baseService.put(ENDPOINTS.drawerLayoutById(id), layoutData);
  }

  /**
   * Delete drawer layout
   * @param {number} id - Layout ID
   * @returns {Promise<object>} Deletion confirmation
   */
  async deleteLayout(id) {
    return baseService.delete(ENDPOINTS.drawerLayoutById(id));
  }

  /**
   * Parse layout configuration
   * @param {object} layout - Layout object with layout_config field
   * @returns {object} Parsed configuration
   */
  parseLayoutConfig(layout) {
    try {
      if (typeof layout.layout_config === 'string') {
        return JSON.parse(layout.layout_config);
      }
      return layout.layout_config;
    } catch (error) {
      console.error('Error parsing layout config:', error);
      return {};
    }
  }
}

export default new DrawerLayoutsService();
