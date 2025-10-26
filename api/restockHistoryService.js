import baseService from './baseService';
import { ENDPOINTS } from './config';

/**
 * Restock History API Service
 * Manages activity logging and performance tracking
 */
class RestockHistoryService {
  /**
   * Get restock history with pagination
   * @param {number} skip - Number of records to skip
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} List of restock history records
   */
  async getRestockHistory(skip = 0, limit = 100) {
    return baseService.get(ENDPOINTS.restockHistory, { skip, limit });
  }

  /**
   * Get restock history by employee
   * @param {number} employeeId - Employee ID
   * @param {number} skip - Number of records to skip
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} List of employee's restock history
   */
  async getHistoryByEmployee(employeeId, skip = 0, limit = 100) {
    return baseService.get(ENDPOINTS.restockHistoryByEmployee(employeeId), { skip, limit });
  }

  /**
   * Get employee performance metrics
   * @param {number} employeeId - Employee ID
   * @returns {Promise<object>} Performance metrics
   */
  async getEmployeePerformance(employeeId) {
    return baseService.get(ENDPOINTS.restockHistoryPerformance(employeeId));
  }

  /**
   * Get leaderboard
   * @param {number} limit - Maximum number of employees in leaderboard
   * @returns {Promise<Array>} Leaderboard rankings
   */
  async getLeaderboard(limit = 10) {
    return baseService.get(ENDPOINTS.restockHistoryLeaderboard, { limit });
  }

  /**
   * Get warning records (HTTP 207 batch stacking incidents)
   * @param {number} skip - Number of records to skip
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} List of warning records
   */
  async getWarningRecords(skip = 0, limit = 100) {
    return baseService.get(ENDPOINTS.restockHistoryWarnings, { skip, limit });
  }

  /**
   * Log a restock action
   * @param {object} actionData - Action data
   * @param {number} actionData.employee_id - Employee ID
   * @param {string} actionData.action_type - Action type (e.g., 'packing', 'return', 'registration')
   * @param {number} actionData.drawer_id - Drawer ID (optional)
   * @param {number} actionData.item_id - Item/batch ID (optional)
   * @param {number} actionData.quantity - Quantity involved (optional)
   * @param {number} actionData.accuracy_score - Accuracy score 0-100 (optional)
   * @param {number} actionData.efficiency_score - Efficiency score 0-100 (optional)
   * @param {string} actionData.notes - Additional notes (optional)
   * @returns {Promise<object>} Created history record
   */
  async logRestockAction(actionData) {
    return baseService.post(ENDPOINTS.restockHistory, {
      ...actionData,
      completion_time: new Date().toISOString(),
    });
  }

  /**
   * Log packing completion
   * @param {number} employeeId - Employee ID
   * @param {number} drawerId - Drawer ID
   * @param {number} itemId - Item/batch ID
   * @param {number} quantity - Quantity packed
   * @param {number} accuracyScore - Accuracy score 0-100
   * @param {number} efficiencyScore - Efficiency score 0-100
   * @returns {Promise<object>} Created history record
   */
  async logPackingCompletion(employeeId, drawerId, itemId, quantity, accuracyScore = 100, efficiencyScore = 100) {
    return this.logRestockAction({
      employee_id: employeeId,
      action_type: 'packing',
      drawer_id: drawerId,
      item_id: itemId,
      quantity,
      accuracy_score: accuracyScore,
      efficiency_score: efficiencyScore,
    });
  }

  /**
   * Log batch registration
   * @param {number} employeeId - Employee ID
   * @param {number} itemId - Item/batch ID
   * @param {number} quantity - Quantity registered
   * @returns {Promise<object>} Created history record
   */
  async logBatchRegistration(employeeId, itemId, quantity) {
    return this.logRestockAction({
      employee_id: employeeId,
      action_type: 'registration',
      item_id: itemId,
      quantity,
      accuracy_score: 100,
      efficiency_score: 100,
    });
  }

  /**
   * Log return processing activity
   * @param {number} employeeId - Employee ID
   * @param {number} itemId - Item/batch ID (batch_id)
   * @param {number} quantity - Quantity returned
   * @param {number} drawerId - Optional drawer ID
   * @returns {Promise<object>} Created history record
   */
  async logReturnProcessing(employeeId, itemId, quantity, drawerId = null) {
    const data = {
      employee_id: employeeId,
      action_type: 'removal',
      batch_id: itemId,
      quantity_changed: quantity,
      accuracy_score: 100,
      efficiency_score: 100,
      notes: 'Return processing'
    };

    if (drawerId) {
      data.drawer_id = drawerId;
    }

    return this.logRestockAction(data);
  }
}

export default new RestockHistoryService();
