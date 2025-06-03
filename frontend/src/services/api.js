import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),
};

// Job Service
export const jobService = {
  getJobs: (params) => apiClient.get('/jobs', { params }),
  getJobById: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (jobData) => apiClient.post('/jobs', jobData),
  updateJob: (id, jobData) => apiClient.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
  getEmployerJobs: () => apiClient.get('/jobs/employer'),
  incrementJobView: (id) => apiClient.put(`/jobs/${id}/view`),
};

// Profile Service
export const profileService = {
  getMyProfile: () => apiClient.get('/profiles/me'),
  updateMyProfile: (profileData) => apiClient.put('/profiles/me', profileData),
  getProfileById: (id) => apiClient.get(`/profiles/${id}`),
  searchProfiles: (params) => apiClient.get('/profiles/search', { params }),
};

// Application Service
export const applicationService = {
  applyForJob: (data) => apiClient.post('/applications/apply', data),
  getMyApplications: () => apiClient.get('/applications/my-applications'),
  getJobApplications: (jobId) => apiClient.get(`/applications/job/${jobId}`),
  updateApplicationStatus: (applicationId, status) => apiClient.patch(`/applications/${applicationId}/status`, { status }),
  getApplicationById: (applicationId) => apiClient.get(`/applications/${applicationId}`), // Added method
  // Add other application related calls here
};

// Analytics Service
export const analyticsService = {
  getEmployerAnalytics: () => apiClient.get('/analytics/employer'),
  getGeneralAnalytics: () => apiClient.get('/analytics/general'),
  getJobPostingsAnalytics: () => apiClient.get('/analytics/employer/jobs'),
};

export default apiClient;
