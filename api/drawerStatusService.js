import baseService from './baseService';
import { ENDPOINTS } from './config';

/**
 * Drawer Status API Service
 * Manages drawer status tracking with batch stacking detection
 */
class DrawerStatusService {
  /**
   * Get all drawer statuses with pagination
   * @param {number} skip - Number of records to skip
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} List of drawer statuses
   */
  async getAllStatuses(skip = 0, limit = 100) {
    return baseService.get(ENDPOINTS.drawerStatus, { skip, limit });
  }

  /**
   * Get status by drawer ID
   * @param {number} drawerId - Drawer ID
   * @returns {Promise<object>} Drawer status with batch tracking
   */
  async getStatusByDrawer(drawerId) {
    return baseService.get(ENDPOINTS.drawerStatusByDrawer(drawerId));
  }

  /**
   * Alias for getStatusByDrawer
   * @param {number} drawerId - Drawer ID
   * @returns {Promise<object>} Drawer status
   */
  async getDrawerStatus(drawerId) {
    return this.getStatusByDrawer(drawerId);
  }

  /**
   * Get all batches in a drawer (via drawer status)
   * @param {number} statusId - Drawer status ID
   * @returns {Promise<Array>} List of batch trackings
   */
  async getBatchesInDrawer(statusId) {
    return baseService.get(ENDPOINTS.drawerStatusBatches(statusId));
  }

  /**
   * Create new drawer status entry
   * NOTE: This may return HTTP 207 if batch stacking is detected
   * @param {object} statusData - Status data
   * @param {number} statusData.drawer_id - Drawer ID
   * @param {number} statusData.item_id - Item/batch ID
   * @param {number} statusData.quantity - Quantity stored
   * @param {string} statusData.status - Status (default: active)
   * @returns {Promise<object>} Created status (may include hasWarning flag)
   */
  async createStatus(statusData) {
    const response = await baseService.post(ENDPOINTS.drawerStatus, statusData);
    
    // Check for batch stacking warning (HTTP 207)
    if (response.hasWarning) {
      console.warn('⚠️ BATCH STACKING DETECTED:', response.warning);
      // Return the response with warning flag so UI can display it
    }
    
    return response;
  }

  /**
   * Update drawer status
   * @param {number} id - Status ID
   * @param {object} statusData - Updated status data
   * @returns {Promise<object>} Updated status
   */
  async updateStatus(id, statusData) {
    return baseService.put(ENDPOINTS.drawerStatusById(id), statusData);
  }

  /**
   * Delete drawer status
   * @param {number} id - Status ID
   * @returns {Promise<object>} Deletion confirmation
   */
  async deleteStatus(id) {
    return baseService.delete(ENDPOINTS.drawerStatusById(id));
  }

  /**
   * Get batches by status
   * @param {number} statusId - Status ID
   * @returns {Promise<Array>} List of batches
   */
  async getBatchesByStatus(statusId) {
    return baseService.get(ENDPOINTS.drawerStatusBatches(statusId));
  }

  /**
   * Get non-depleted batches for a drawer
   * @param {number} drawerId - Drawer ID
   * @returns {Promise<Array>} List of active batches
   */
  async getNonDepletedBatches(drawerId) {
    const status = await this.getStatusByDrawer(drawerId);
    const batches = await this.getBatchesByStatus(status.id);
    return batches.filter(batch => batch.status !== 'depleted');
  }

  /**
   * Mark batch as depleted
   * @param {number} statusId - Status ID
   * @param {number} batchId - Batch ID
   * @returns {Promise<object>} Updated status
   */
  async depleteBatch(statusId, batchId) {
    return this.updateStatus(statusId, {
      status: 'depleted',
      item_id: batchId,
    });
  }

  /**
   * Check if drawer has multiple batches (batch stacking)
   * @param {number} drawerId - Drawer ID
   * @returns {Promise<boolean>} True if multiple batches detected
   */
  async hasBatchStacking(drawerId) {
    try {
      const batches = await this.getNonDepletedBatches(drawerId);
      return batches.length > 1;
    } catch (error) {
      console.error('Error checking batch stacking:', error);
      return false;
    }
  }

  /**
   * Get drawer utilization info
   * @param {number} drawerId - Drawer ID
   * @returns {Promise<object>} Utilization data
   */
  async getDrawerUtilization(drawerId) {
    try {
      const status = await this.getStatusByDrawer(drawerId);
      const batches = await this.getBatchesByStatus(status.id);
      
      const totalQuantity = batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
      const activeBatches = batches.filter(b => b.status !== 'depleted').length;
      
      return {
        drawer_id: drawerId,
        total_quantity: totalQuantity,
        active_batches: activeBatches,
        has_stacking: activeBatches > 1,
      };
    } catch (error) {
      console.error('Error getting drawer utilization:', error);
      return {
        drawer_id: drawerId,
        total_quantity: 0,
        active_batches: 0,
        has_stacking: false,
      };
    }
  }
}

export default new DrawerStatusService();
