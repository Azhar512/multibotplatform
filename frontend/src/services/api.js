import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  timeoutErrorMessage: 'Request timed out. Please try again.'
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject({
        message: 'Session expired. Please login again.',
        status: 401,
        data: null
      });
    }

    const customError = {
      message: error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || null
    };
    return Promise.reject(customError);
  }
);

// Dashboard API endpoints
export const dashboardAPI = {
  getStats: async () => {
    try {
      const data = await api.get('/dashboard/stats');
      return {
        success: true,
        data: {
          totalSales: parseFloat(data.totalSales || 0),
          salesGrowth: parseFloat(data.salesGrowth || 0),
          totalProfit: parseFloat(data.totalProfit || 0),
          profitGrowth: parseFloat(data.profitGrowth || 0),
          averageSales: parseFloat(data.averageSales || 0),
          averageSalesGrowth: parseFloat(data.averageSalesGrowth || 0),
          marginRate: parseFloat(data.marginRate || 0),
          marginRateGrowth: parseFloat(data.marginRateGrowth || 0)
        }
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getInteractionTrends: async () => {
    try {
      const data = await api.get('/dashboard/interaction-trends');
      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getPersonalityEffectiveness: async () => {
    try {
      const data = await api.get('/dashboard/personality-effectiveness');
      return {
        success: true,
        data: data || {}
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRevenueOverview: async (period = 'monthly') => {
    try {
      const data = await api.get(`/dashboard/revenue-overview?period=${period}`);
      return {
        success: true,
        data: Array.isArray(data) ? data.map(item => ({
          month: item.month,
          sales: parseFloat(item.sales || 0),
          profit: parseFloat(item.profit || 0)
        })) : []
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getQuarterlyPerformance: async (year = new Date().getFullYear()) => {
    try {
      const data = await api.get(`/dashboard/quarterly-performance?year=${year}`);
      return {
        success: true,
        data: Array.isArray(data) ? data.map(item => ({
          quarter: item._id,
          value: parseFloat(item.value || 0)
        })) : []
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getActivityLog: async (limit = 10) => {
    try {
      const data = await api.get(`/dashboard/activity-log?limit=${limit}`);
      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};
// Add this to your api.js file
export const twilioAPI = {
  getToken: async () => {
    try {
      const response = await api.get('/twilio/token');
      
      // Handle different response formats
      if (response.token) {
        // Direct token response
        return {
          success: true,
          data: { token: response.token }
        };
      } else if (response.data && response.data.token) {
        // Nested token response
        return {
          success: true,
          data: { token: response.data.token }
        };
      } else {
        console.error('Invalid token response format:', response);
        throw new Error('Invalid token response format from server');
      }
    } catch (error) {
      console.error('Token fetch error:', error);
      return handleApiError(error);
    }
  },
  
  
  initiateCall: async (phoneNumber, personalitySettings, aiModel, voiceType) => {
    try {
      const response = await api.post('/twilio/initiate-call', {
        phoneNumber,
        personalitySettings,
        aiModel,
        voiceType
      });
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};
// Bot API endpoints
export const botAPI = {
  getBertResponse: async (text, personality, model, config) => {
    try {
      const response = await api.post('/bert/response', {
        message: text,
        personality,
        model,
        config
      });
      
      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDeepseekResponse: async (text, personality, config) => {
    try {
      const response = await api.post('/deepseek/response', {
        message: text,
        personality,
        config
      });
      
      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error);
    }
  },

  speechToText: async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await api.post('/speech-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Model API endpoints
export const modelAPI = {
  getDeepSeekResponse: async (input, config = {}) => {
    try {
      const response = await api.post('/model/deepseek', {
        input,
        model: 'deepseek-r1',
        config: {
          max_new_tokens: config.max_new_tokens || 1024,
          top_p: config.top_p || 0.95,
          do_sample: config.do_sample || true,
          return_full_text: config.return_full_text || false,
          ...config
        }
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getIndustryModelResponse: async (industry, input, context = null) => {
    try {
      const response = await api.post('/model/industry', {
        industry,
        input,
        context,
        config: {
          maxLength: 512,
          temperature: 0.7
        }
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getGeneralResponse: async (question, context) => {
    try {
      const response = await api.post('/model/general', {
        question,
        context,
        model: 'deepset/roberta-base-squad2'
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getFinanceResponse: async (input, context = null) => {
    try {
      const response = await api.post('/model/finance', {
        input,
        context,
        model: 'microsoft/deberta-v3-base'
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getLegalResponse: async (input, context = null) => {
    try {
      const response = await api.post('/model/legal', {
        input,
        context,
        model: 'nlpaueb/legal-bert-base-uncased'
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRealEstateResponse: async (input, context = null) => {
    try {
      const response = await api.post('/model/realestate', {
        input,
        context,
        model: 'bert-base-uncased'
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getInsuranceResponse: async (input, context = null) => {
    try {
      const response = await api.post('/model/insurance', {
        input,
        context,
        model: 'distilbert-base-uncased'
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Helper function for model selection
export const getModelResponse = async (industry, input, context = null) => {
  switch (industry) {
    case 'General':
      return await modelAPI.getGeneralResponse(input, context);
    case 'Finance':
      return await modelAPI.getFinanceResponse(input, context);
    case 'Legal':
      return await modelAPI.getLegalResponse(input, context);
    case 'RealEstate':
      return await modelAPI.getRealEstateResponse(input, context);
    case 'Insurance':
      return await modelAPI.getInsuranceResponse(input, context);
    default:
      throw new Error('Invalid industry selection');
  }
};

// User API endpoints
export const userAPI = {
  getProfile: async () => {
    try {
      const data = await api.get('/user/profile');
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateProfile: async (profileData) => {
    try {
      const data = await api.put('/user/profile', profileData);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSettings: async () => {
    try {
      const data = await api.get('/user/settings');
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateSettings: async (settings) => {
    try {
      const data = await api.put('/user/settings', settings);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Auth API endpoints
export const authAPI = {
  login: async (credentials) => {
    try {
      const data = await api.post('/auth/login', credentials);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  register: async (userData) => {
    try {
      const data = await api.post('/auth/register', userData);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      return {
        success: true,
        data: null
      };
    } catch (error) {
      localStorage.removeItem('token');
      return handleApiError(error);
    }
  },

  refreshToken: async () => {
    try {
      const data = await api.post('/auth/refresh-token');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Health check endpoint
export const healthAPI = {
  checkStatus: async () => {
    try {
      const data = await api.get('/health-check');
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

const handleApiError = (error) => {
  console.error('API Error:', error);
  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
    data: null
  };
};

export default api;