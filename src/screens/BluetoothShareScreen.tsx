// src/screens/BluetoothShareScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BluetoothService from '../services/BluetoothService';
import { RootStackParamList } from '../navigation/types';
import { BluetoothDevice } from 'react-native-bluetooth-classic';

type BluetoothShareProps = NativeStackScreenProps<RootStackParamList, 'BluetoothShare'>;

const BluetoothShareScreen: React.FC<BluetoothShareProps> = ({
  route,
  navigation,
}) => {
  const { document } = route.params;
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    startScan();
    return () => {
      BluetoothService.stopDiscovery();
    };
  }, []);

  const startScan = async () => {
    try {
      setScanning(true);
      console.log('Starting Bluetooth scan...');
      const discoveredDevices = await BluetoothService.startDiscovery();
      console.log('Final device list:', discoveredDevices);
      
      if (discoveredDevices.length === 0) {
        Alert.alert(
          'Bilgi', 
          'Hiçbir Bluetooth cihazı bulunamadı. Lütfen:\n\n' +
          '1. Hedef cihazın Bluetooth\'unun açık olduğundan\n' +
          '2. Hedef cihazın keşfedilebilir modda olduğundan\n' +
          '3. Cihazların birbirine yakın olduğundan\n\n' +
          'emin olun ve tekrar deneyin.'
        );
      } else {
        // Cihazları isimlerine göre sırala
        const sortedDevices = [...discoveredDevices].sort((a, b) => {
          const nameA = a.name || 'Unnamed Device';
          const nameB = b.name || 'Unnamed Device';
          return nameA.localeCompare(nameB);
        });
        setDevices(sortedDevices);
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      Alert.alert(
        'Hata',
        'Bluetooth taraması sırasında bir hata oluştu: ' + 
        (error.message || 'Bilinmeyen hata')
      );
    } finally {
      setScanning(false);
    }
  };

  const handleShare = async (deviceAddress: string, deviceName: string) => {
    try {
      setSharing(true);
      await BluetoothService.shareDocument(deviceAddress, document);
      Alert.alert('Başarılı', `Belge ${deviceName} cihazına gönderildi`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Hata', 'Belge paylaşılırken bir hata oluştu');
    } finally {
      setSharing(false);
    }
  };

  const renderDevice = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleShare(item.address, item.name)}
      disabled={sharing}>
      <View>
        <Text style={styles.deviceName}>{item.name || 'İsimsiz Cihaz'}</Text>
        <Text style={styles.deviceAddress}>{item.address}</Text>
      </View>
      {sharing && <ActivityIndicator size="small" color="#007AFF" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth ile Paylaş</Text>
      <Text style={styles.subtitle}>"{document.name}"</Text>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={startScan}
        disabled={scanning}>
        <Text style={styles.scanButtonText}>
          {scanning ? 'Taranıyor...' : 'Cihazları Tara'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.address}
        style={styles.deviceList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {scanning
              ? 'Cihazlar aranıyor...'
              : 'Bluetooth cihazı bulunamadı'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default BluetoothShareScreen;