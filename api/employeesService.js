import baseService from './baseService';
import { ENDPOINTS } from './config';

/**
 * Employees API Service
 * Manages employee records
 */
class EmployeesService {
  /**
   * Get all employees with optional status filter and pagination
   * @param {string} status - Employee status filter (optional)
   * @param {number} skip - Number of employees to skip
   * @param {number} limit - Maximum number of employees to return
   * @returns {Promise<Array>} List of employees
   */
  async getEmployees(status = null, skip = 0, limit = 100) {
    const params = { skip, limit };
    if (status) {
      params.status = status;
    }
    return baseService.get(ENDPOINTS.employees, params);
  }

  /**
   * Get employee by ID
   * @param {number} id - Employee ID
   * @returns {Promise<object>} Employee details
   */
  async getEmployeeById(id) {
    return baseService.get(ENDPOINTS.employeeById(id));
  }

  /**
   * Get employee by name (search)
   * @param {string} name - Employee name to search (can be employee_id, first_name, or full name)
   * @returns {Promise<object|null>} Employee if found, null otherwise
   */
  async getEmployeeByName(name) {
    try {
      const employees = await this.getEmployees(null, 0, 1000);
      
      // Try to match by employee_id first, then by first_name, then by full name
      return employees.find(emp => 
        emp.employee_id === name ||
        emp.first_name === name ||
        `${emp.first_name} ${emp.last_name}` === name ||
        emp.employee_id.toLowerCase() === name.toLowerCase() ||
        emp.first_name.toLowerCase() === name.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error finding employee by name:', error);
      return null;
    }
  }

  /**
   * Create new employee
   * @param {object} employeeData - Employee data
   * @param {string} employeeData.employee_id - Employee ID
   * @param {string} employeeData.first_name - First name
   * @param {string} employeeData.last_name - Last name (optional)
   * @param {string} employeeData.role - Employee role
   * @param {string} employeeData.status - Employee status (default: active)
   * @returns {Promise<object>} Created employee
   */
  async createEmployee(employeeData) {
    return baseService.post(ENDPOINTS.employees, employeeData);
  }

  /**
   * Update employee
   * @param {number} id - Employee ID
   * @param {object} employeeData - Updated employee data
   * @returns {Promise<object>} Updated employee
   */
  async updateEmployee(id, employeeData) {
    return baseService.put(ENDPOINTS.employeeById(id), employeeData);
  }

  /**
   * Delete employee
   * @param {number} id - Employee ID
   * @returns {Promise<object>} Deletion confirmation
   */
  async deleteEmployee(id) {
    return baseService.delete(ENDPOINTS.employeeById(id));
  }

  /**
   * Get active employees
   * @returns {Promise<Array>} List of active employees
   */
  async getActiveEmployees() {
    return this.getEmployees('active');
  }

  /**
   * Find or create employee by name
   * @param {string} name - Employee name or ID
   * @param {string} role - Employee role (default: Cabin Crew)
   * @returns {Promise<object>} Employee (existing or newly created)
   */
  async findOrCreateEmployee(name, role = 'Cabin Crew') {
    try {
      // Try to find existing employee
      let employee = await this.getEmployeeByName(name);
      
      // If not found, create new employee
      if (!employee) {
        console.log(`Creating new employee: ${name}`);
        employee = await this.createEmployee({
          employee_id: name,
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          role,
          status: 'active',
        });
      }
      
      return employee;
    } catch (error) {
      console.error('Error in findOrCreateEmployee:', error);
      throw error;
    }
  }
}

export default new EmployeesService();
