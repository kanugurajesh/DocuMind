import axios from 'axios';
import { showToast } from './toast';

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    showToast.error('Request failed to send');
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          errorMessage = data.error || 'Invalid request';
          break;
        case 401:
          errorMessage = 'Authentication required';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = data.error || `Error ${status}`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection';
    } else {
      // Other error
      errorMessage = error.message || 'Request failed';
    }

    // Only show toast for non-custom error handling
    // If the calling code handles errors specifically, they should catch this
    if (!error.config?.skipGlobalErrorToast) {
      showToast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
