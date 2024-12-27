import React, { useEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {logout} from '../api/auth';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import NotificationService from '../services/NotificationService';
import BroadcastService, { 
  DOCUMENT_SCAN_STATUS,
  DOCUMENT_SHARE_STATUS,
  CONNECTIVITY_CHANGE
} from '../services/BroadcastService';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  useEffect(() => {
    // Broadcast listeners
    const scanListener = BroadcastService.addListener(
      DOCUMENT_SCAN_STATUS,
      (data) => {
        console.log('Scan status changed:', data);
      }
    );

    const shareListener = BroadcastService.addListener(
      DOCUMENT_SHARE_STATUS,
      (data) => {
        console.log('Share status changed:', data);
      }
    );

    const connectivityListener = BroadcastService.addListener(
      CONNECTIVITY_CHANGE,
      (data) => {
        console.log('Connectivity changed:', data);
      }
    );

    // Cleanup
    return () => {
      BroadcastService.removeListener(scanListener);
      BroadcastService.removeListener(shareListener);
      BroadcastService.removeListener(connectivityListener);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  // OCR işlemi simülasyonu
  const simulateOCRProcess = async () => {
    // Tarama başladı broadcast'i
    BroadcastService.sendBroadcast(DOCUMENT_SCAN_STATUS, {
      status: 'started',
      documentName: 'test_doc.pdf'
    });

    // 2 saniye sonra tamamlandı broadcast'i
    setTimeout(() => {
      BroadcastService.sendBroadcast(DOCUMENT_SCAN_STATUS, {
        status: 'completed',
        documentName: 'test_doc.pdf'
      });
    }, 2000);
  };

  // Belge paylaşım simülasyonu
  const simulateDocumentShare = () => {
    BroadcastService.sendBroadcast(DOCUMENT_SHARE_STATUS, {
      documentName: 'test_doc.pdf',
      sharedWith: 'test@example.com'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ana Sayfa</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Camera')}>
        <Text style={styles.buttonText}>OCR İşlemi Başlat</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={simulateDocumentShare}>
        <Text style={styles.buttonText}>Belge Paylaş</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}>
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;