import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {logout} from '../api/auth';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { useDocuments } from '../contexts/DocumentContext';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const { documents } = useDocuments();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OCR Mobile</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Toplam Belge: {documents.length}
        </Text>
        <Text style={styles.statsText}>
          OCR Tamamlanan: {documents.filter(doc => doc.ocrCompleted).length}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Camera')}>
        <Text style={styles.buttonText}>Yeni Belge Tara</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Documents')}>
        <Text style={styles.buttonText}>Belgelerimi Görüntüle</Text>
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;