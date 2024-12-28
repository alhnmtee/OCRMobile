// src/database/initDatabase.ts
import DatabaseService from './DatabaseService';
import { useEffect } from 'react';

export const useInitDatabase = () => {
  useEffect(() => {
    const init = async () => {
      try {
        await DatabaseService.initDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };

    init();
  }, []);
};