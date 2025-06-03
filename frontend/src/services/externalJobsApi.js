import axios from 'axios';

// External Jobs API Service for integrating with third-party job APIs
class ExternalJobsAPI {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout for external API calls
    });

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Search external jobs using our backend proxy
  async searchExternalJobs(params = {}) {
    try {
      const response = await this.apiClient.get('/external-jobs/search', {
        params: {
          query: params.query || '',
          location: params.location || '',
          employment_types: params.employment_types || 'FULLTIME',
          job_requirements: params.job_requirements || '',
          page: params.page || 1,
          num_pages: params.num_pages || 1,
          date_posted: params.date_posted || 'all',
          remote_jobs_only: params.remote_jobs_only || false,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching external jobs:', error);
      throw error;
    }
  }

  // Get job details from external API
  async getExternalJobDetails(jobId, provider = 'jsearch') {
    try {
      const response = await this.apiClient.get(`/external-jobs/${provider}/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching external job details:', error);
      throw error;
    }
  }

  // Get trending jobs from external APIs
  async getTrendingJobs(params = {}) {
    try {
      const response = await this.apiClient.get('/external-jobs/trending', {
        params: {
          location: params.location || '',
          category: params.category || '',
          limit: params.limit || 10,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending jobs:', error);
      throw error;
    }
  }

  // Sync external jobs to local database (admin function)
  async syncExternalJobs(params = {}) {
    try {
      const response = await this.apiClient.post('/external-jobs/sync', {
        query: params.query || 'software developer',
        location: params.location || '',
        max_jobs: params.max_jobs || 50,
        categories: params.categories || ['technology', 'engineering'],
        ...params
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing external jobs:', error);
      throw error;
    }
  }

  // Get external job providers status
  async getProvidersStatus() {
    try {
      const response = await this.apiClient.get('/external-jobs/providers/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching providers status:', error);
      throw error;
    }
  }

  // Get cached external jobs (faster response)
  async getCachedExternalJobs(params = {}) {
    try {
      const response = await this.apiClient.get('/external-jobs/cached', {
        params: {
          category: params.category || '',
          location: params.location || '',
          page: params.page || 1,
          limit: params.limit || 20,
          sort: params.sort || 'date_posted',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cached external jobs:', error);
      throw error;
    }
  }

  // Search jobs across multiple providers
  async searchMultiProvider(params = {}) {
    try {
      const response = await this.apiClient.get('/external-jobs/multi-search', {
        params: {
          query: params.query || '',
          location: params.location || '',
          providers: params.providers || ['jsearch', 'adzuna'], // Default providers
          merge_results: params.merge_results !== false, // Default to true
          limit_per_provider: params.limit_per_provider || 10,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in multi-provider search:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const externalJobsAPI = new ExternalJobsAPI();

// Export individual methods for easier importing
export const externalJobsService = {
  searchJobs: (params) => externalJobsAPI.searchExternalJobs(params),
  getJobDetails: (jobId, provider) => externalJobsAPI.getExternalJobDetails(jobId, provider),
  getTrending: (params) => externalJobsAPI.getTrendingJobs(params),
  syncJobs: (params) => externalJobsAPI.syncExternalJobs(params),
  getProvidersStatus: () => externalJobsAPI.getProvidersStatus(),
  getCached: (params) => externalJobsAPI.getCachedExternalJobs(params),
  multiSearch: (params) => externalJobsAPI.searchMultiProvider(params),
};

export default externalJobsAPI;
