import { API_BASE_URL, HTTP_METHODS } from './config';

/**
 * Base API Service
 * Handles all HTTP requests with proper error handling
 */
class BaseAPIService {
  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {object} body - Request body (optional)
   * @param {object} queryParams - Query parameters (optional)
   * @returns {Promise<object>} Response data
   */
  async request(endpoint, method = HTTP_METHODS.GET, body = null, queryParams = null) {
    try {
      // Build URL with query parameters
      let url = `${API_BASE_URL}${endpoint}`;
      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        url += `?${params.toString()}`;
      }

      // Build request options
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Add body for POST/PUT requests
      if (body && (method === HTTP_METHODS.POST || method === HTTP_METHODS.PUT)) {
        options.body = JSON.stringify(body);
      }

      console.log(`🌐 API Request: ${method} ${url}`);
      if (body) console.log('📦 Request Body:', body);

      // Make the request
      const response = await fetch(url, options);

      // Parse response
      const responseData = await response.json();

      // Check for errors
      if (!response.ok) {
        // Suppress 404 logs for drawer-status checks (expected for non-worked drawers)
        const isDrawerStatusCheck = endpoint.includes('/drawer-status/drawer/');
        const is404 = response.status === 404;
        
        if (!isDrawerStatusCheck || !is404) {
          console.error(`❌ API Error (${response.status}):`, responseData);
        }
        
        throw new Error(responseData.message || responseData.error || 'API request failed');
      }

      // Check for batch stacking warning (HTTP 207)
      if (response.status === 207) {
        console.warn('⚠️ BATCH STACKING WARNING:', responseData.warning);
        return {
          ...responseData,
          hasWarning: true,
        };
      }

      console.log('✅ API Response:', responseData);
      
      // Unwrap response if it has a "data" wrapper
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data;
      }
      
      return responseData;

    } catch (error) {
      // Suppress error logs for expected 404s on drawer-status checks
      const isDrawerStatusCheck = endpoint.includes('/drawer-status/drawer/');
      if (!isDrawerStatusCheck) {
        console.error('❌ API Request Failed:', error);
      }
      
      // Check if it's a network error
      if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
        throw new Error('No se pudo conectar al servidor. Verifica que el API esté corriendo en http://localhost:5001');
      }
      
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, queryParams = null) {
    return this.request(endpoint, HTTP_METHODS.GET, null, queryParams);
  }

  /**
   * POST request
   */
  async post(endpoint, body) {
    return this.request(endpoint, HTTP_METHODS.POST, body);
  }

  /**
   * PUT request
   */
  async put(endpoint, body) {
    return this.request(endpoint, HTTP_METHODS.PUT, body);
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, HTTP_METHODS.DELETE);
  }
}

export default new BaseAPIService();
