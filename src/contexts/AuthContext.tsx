import React, { createContext, useState, useContext, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { getToken } from '../api/auth';
import NotificationService from '../services/NotificationService';

interface AuthContextData {
  user: any;
  loading: boolean;
  signedIn: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeNotifications = async () => {
      await NotificationService.requestUserPermission();
      await NotificationService.setupForegroundHandler();
      await NotificationService.setupBackgroundHandler();
    };

    initializeNotifications();

    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        const token = await getToken();
        if (token) {
          setUser(user);
          // Kullanıcı giriş yaptığında notification topic'lerine abone ol
          await NotificationService.listenToTopics();
          // FCM token'ı al ve gerekirse backend'e kaydet
          const fcmToken = await NotificationService.getFCMToken();
          if (fcmToken) {
            // TODO: FCM token'ı backend'e kaydet
            console.log('FCM Token:', fcmToken);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signedIn: !!user,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};