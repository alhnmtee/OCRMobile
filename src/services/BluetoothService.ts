// src/services/BluetoothService.ts

import { PermissionsAndroid, Platform, NativeEventEmitter, NativeModules } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { Document } from '../database/models/Document';
import StorageService from './StorageService';
import BroadcastService from './BroadcastService';

class BluetoothService {
  private isInitialized: boolean = false;
  private bluetoothModule: typeof RNBluetoothClassic | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Platform kontrolü
      if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
        throw new Error('Bluetooth is only supported on Android and iOS');
      }

      // Android için izinleri kontrol et
      if (Platform.OS === 'android') {
        const granted = await this.requestBluetoothPermissions();
        if (!granted) {
          throw new Error('Bluetooth permissions not granted');
        }
      }

      // Bluetooth modülünü başlat
      this.bluetoothModule = RNBluetoothClassic;
      
      if (!this.bluetoothModule) {
        throw new Error('Bluetooth module initialization failed');
      }

      // Bluetooth'un açık olup olmadığını kontrol et
      const enabled = await this.bluetoothModule.isBluetoothEnabled();
      
      if (!enabled) {
        await this.bluetoothModule.requestBluetoothEnabled();
      }

      this.isInitialized = true;
      console.log('Bluetooth service initialized successfully');
    } catch (error) {
      console.error('Bluetooth initialization error:', error);
      this.isInitialized = false;
      this.bluetoothModule = null;
      throw error;
    }
  }

  private async requestBluetoothPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const apiLevel = parseInt(Platform.Version.toString(), 10);
        
        let permissions = [];
        if (apiLevel >= 31) { // Android 12 ve üstü
          permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          ];
        } else { // Android 11 ve altı
          permissions = [
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ];
        }

        const results = await PermissionsAndroid.requestMultiple(permissions);
        return Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );
      }
      return true;
    } catch (error) {
      console.error('Error requesting Bluetooth permissions:', error);
      return false;
    }
  }

  async startDiscovery(): Promise<any[]> {
    try {
      await this.initialize();
      
      if (!this.bluetoothModule) {
        throw new Error('Bluetooth module not initialized');
      }

      console.log('Starting discovery...');
      
      // Önce eşleşmiş cihazları al
      const paired = await this.bluetoothModule.getBondedDevices();
      console.log('Paired devices:', paired);

      // Yeni cihazları keşfet
      return new Promise((resolve) => {
        const eventEmitter = new NativeEventEmitter(NativeModules.RNBluetoothClassic);
        const devices = [...paired];

        const discoveryTimeout = setTimeout(() => {
          this.bluetoothModule?.cancelDiscovery();
          resolve(devices);
        }, 12000);

        const discoverySubscription = eventEmitter.addListener(
          'bluetoothDiscovered',
          (device) => {
            if (!devices.find(d => d.address === device.address)) {
              devices.push(device);
            }
          }
        );

        const discoveryFinishedSubscription = eventEmitter.addListener(
          'bluetoothDiscoveryFinished',
          () => {
            clearTimeout(discoveryTimeout);
            discoverySubscription.remove();
            discoveryFinishedSubscription.remove();
            resolve(devices);
          }
        );

        this.bluetoothModule?.startDiscovery().catch(error => {
          console.error('Error starting discovery:', error);
          clearTimeout(discoveryTimeout);
          discoverySubscription.remove();
          discoveryFinishedSubscription.remove();
          resolve(devices);
        });
      });
    } catch (error) {
      console.error('Error in startDiscovery:', error);
      return [];
    }
  }

  async stopDiscovery(): Promise<void> {
    try {
      if (this.bluetoothModule) {
        await this.bluetoothModule.cancelDiscovery();
      }
    } catch (error) {
      console.error('Error stopping discovery:', error);
    }
  }

  async shareDocument(deviceAddress: string, document: Document): Promise<void> {
    try {
      await this.initialize();

      if (!this.bluetoothModule) {
        throw new Error('Bluetooth module not initialized');
      }

      // Bağlantı kur
      const device = await this.bluetoothModule.connectToDevice(deviceAddress, {
        delimiter: '\n',
        charset: 'utf-8'
      });
      
      // Dosyayı oku
      const fileContent = await StorageService.readDocument(document.id);
      
      // Metadata ve içeriği birleştir
      const data = JSON.stringify({
        metadata: {
          name: document.name,
          size: document.size,
          mimeType: document.mimeType,
          createdAt: document.createdAt
        },
        content: fileContent
      });

      // Veriyi gönder
      await device.write(data);
      
      // Broadcast gönder
      BroadcastService.sendBroadcast('DOCUMENT_SHARE_STATUS', {
        documentName: document.name,
        sharedWith: device.name || 'Unknown Device'
      });

      // Bağlantıyı kapat
      await device.disconnect();
    } catch (error) {
      console.error('Error sharing document via Bluetooth:', error);
      throw error;
    }
  }

  async acceptIncomingConnection(delimiter: string = '\n'): Promise<void> {
    try {
      await this.initialize();

      if (!this.bluetoothModule) {
        throw new Error('Bluetooth module not initialized');
      }

      await this.bluetoothModule.accept({
        delimiter: delimiter,
        charset: 'utf-8'
      });
    } catch (error) {
      console.error('Error accepting Bluetooth connection:', error);
      throw error;
    }
  }
}

export default new BluetoothService();