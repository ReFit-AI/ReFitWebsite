import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your actual backend URL
// Use 10.0.2.2 for Android emulator, localhost for iOS simulator
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api/mobile/v1'
  : 'https://refit.com/api/mobile/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('sessionToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      await AsyncStorage.removeItem('sessionToken');
      await AsyncStorage.removeItem('walletAddress');
      // TODO: Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async connect(walletAddress: string) {
    const response = await api.post('/auth/connect', { walletAddress });
    const { sessionToken } = response.data;
    
    // Store session info
    await AsyncStorage.setItem('sessionToken', sessionToken);
    await AsyncStorage.setItem('walletAddress', walletAddress);
    
    return response.data;
  },
  
  async disconnect() {
    await AsyncStorage.removeItem('sessionToken');
    await AsyncStorage.removeItem('walletAddress');
  },
  
  async getSession() {
    const token = await AsyncStorage.getItem('sessionToken');
    const walletAddress = await AsyncStorage.getItem('walletAddress');
    return { token, walletAddress };
  }
};

export const phoneService = {
  async getModels() {
    const response = await api.get('/phone/models');
    return response.data;
  },
  
  async getQuote(phoneData: {
    brand: string;
    model: string;
    storage: string;
    carrier: string;
    condition: string;
  }) {
    const response = await api.post('/phone/quote', phoneData);
    return response.data;
  }
};

export default api;