// src/services/ApiService.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API henüz hazır olmadığı için işlemleri simüle edelim
const MOCK_MODE = true;
const BASE_URL = MOCK_MODE ? '' : 'https://api.example.com'; 

class ApiService {
  private static instance: ApiService;
  private api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private constructor() {
    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        if (MOCK_MODE) {
          throw new Error('API in mock mode');
        }
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Mock responses for offline development
  private mockResponse<T>(data: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), 500);
    });
  }

  // User endpoints
  public async loginUser(email: string, password: string) {
    if (MOCK_MODE) {
      return this.mockResponse({ success: true });
    }
    
    try {
      const response = await this.api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async registerUser(email: string, password: string) {
    if (MOCK_MODE) {
      return this.mockResponse({ success: true });
    }

    try {
      const response = await this.api.post('/auth/register', { email, password });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  public async getDocuments() {
    if (MOCK_MODE) {
      return this.mockResponse([]);
    }

    try {
      const response = await this.api.get('/documents');
      return response.data;
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  }

  public async uploadDocument(formData: FormData) {
    if (MOCK_MODE) {
      return this.mockResponse({ success: true });
    }

    try {
      const response = await this.api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  }

  public async updateDocument(documentId: string, data: any) {
    if (MOCK_MODE) {
      return this.mockResponse({ success: true });
    }

    try {
      const response = await this.api.put(`/documents/${documentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Update document error:', error);
      throw error;
    }
  }

  public async deleteDocument(documentId: string) {
    if (MOCK_MODE) {
      return this.mockResponse({ success: true });
    }

    try {
      const response = await this.api.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  public async shareDocument(documentId: string, userId: string) {
    if (MOCK_MODE) {
      return this.mockResponse({ success: true });
    }

    try {
      const response = await this.api.post(`/documents/${documentId}/share`, {
        userId,
      });
      return response.data;
    } catch (error) {
      console.error('Share document error:', error);
      throw error;
    }
  }
}

export default ApiService.getInstance();