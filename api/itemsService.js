import baseService from './baseService';
import { ENDPOINTS } from './config';

/**
 * Items API Service
 * Manages item batches with CRUD operations
 */
class ItemsService {
  /**
   * Get all items with pagination
   * @param {number} skip - Number of items to skip
   * @param {number} limit - Maximum number of items to return
   * @returns {Promise<Array>} List of items
   */
  async getItems(skip = 0, limit = 100) {
    return baseService.get(ENDPOINTS.items, { skip, limit });
  }

  /**
   * Get items by status
   * @param {string} status - Item status (available, depleted, etc.)
   * @returns {Promise<Array>} List of items with specified status
   */
  async getItemsByStatus(status) {
    return baseService.get(ENDPOINTS.itemsByStatus(status));
  }

  /**
   * Get item by ID
   * @param {number} id - Item ID
   * @returns {Promise<object>} Item details
   */
  async getItemById(id) {
    return baseService.get(ENDPOINTS.itemById(id));
  }

  /**
   * Create new item/batch
   * @param {object} itemData - Item data
   * @param {string} itemData.item_type - Type of item
   * @param {string} itemData.batch_number - Batch/lot number
   * @param {number} itemData.quantity - Quantity
   * @param {string} itemData.expiry_date - Expiry date (ISO format)
   * @param {string} itemData.qr_code - QR code
   * @param {string} itemData.status - Status (default: available)
   * @returns {Promise<object>} Created item
   */
  async createItem(itemData) {
    return baseService.post(ENDPOINTS.items, itemData);
  }

  /**
   * Update item
   * @param {number} id - Item ID
   * @param {object} itemData - Updated item data
   * @returns {Promise<object>} Updated item
   */
  async updateItem(id, itemData) {
    return baseService.put(ENDPOINTS.itemById(id), itemData);
  }

  /**
   * Delete item
   * @param {number} id - Item ID
   * @returns {Promise<object>} Deletion confirmation
   */
  async deleteItem(id) {
    return baseService.delete(ENDPOINTS.itemById(id));
  }

  /**
   * Get available batches sorted by FEFO (First-Expired-First-Out)
   * @returns {Promise<Array>} List of available batches sorted by expiry date
   */
  async getAvailableBatches() {
    const items = await this.getItemsByStatus('available');
    
    // Sort by expiry date (oldest first) for FEFO logic
    return items.sort((a, b) => {
      const dateA = new Date(a.expiry_date);
      const dateB = new Date(b.expiry_date);
      return dateA - dateB;
    });
  }

  /**
   * Get batches expiring soon (within specified days)
   * @param {number} daysThreshold - Number of days threshold
   * @returns {Promise<Array>} List of items expiring soon
   */
  async getExpiringSoon(daysThreshold = 30) {
    const items = await this.getItemsByStatus('available');
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));
    
    return items.filter(item => {
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= thresholdDate && expiryDate > now;
    }).sort((a, b) => {
      const dateA = new Date(a.expiry_date);
      const dateB = new Date(b.expiry_date);
      return dateA - dateB;
    });
  }
}

export default new ItemsService();
