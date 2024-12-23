//src/services/BroadcastService.ts

import { NativeEventEmitter, NativeModules, DeviceEventEmitter, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import NotificationService from './NotificationService';

export const DOCUMENT_SCAN_STATUS = 'DOCUMENT_SCAN_STATUS';
export const DOCUMENT_SHARE_STATUS = 'DOCUMENT_SHARE_STATUS';
export const CONNECTIVITY_CHANGE = 'CONNECTIVITY_CHANGE';

class BroadcastService {
  private eventEmitter: NativeEventEmitter;

  constructor() {
    this.eventEmitter = Platform.OS === 'ios' 
      ? new NativeEventEmitter(NativeModules.RNEventEmitter)
      : DeviceEventEmitter;
    
    this.setupConnectivityListener();
  }

  // Bağlantı durumu değişikliklerini dinle
  private setupConnectivityListener() {
    NetInfo.addEventListener(state => {
      this.sendBroadcast(CONNECTIVITY_CHANGE, {
        isConnected: state.isConnected,
        type: state.type
      });
    });
  }

  // Broadcast gönder
  public sendBroadcast(action: string, data: any) {
    this.eventEmitter.emit(action, data);
    
    // Önemli durumlar için bildirim gönder
    switch(action) {
      case DOCUMENT_SCAN_STATUS:
        if (data.status === 'completed') {
          NotificationService.createLocalNotification(
            'Tarama Tamamlandı',
            `${data.documentName || 'Belge'} başarıyla tarandı`
          );
        }
        break;
      
      case DOCUMENT_SHARE_STATUS:
        NotificationService.createLocalNotification(
          'Belge Paylaşıldı',
          `${data.documentName || 'Belge'} ${data.sharedWith} ile paylaşıldı`
        );
        break;
        
      case CONNECTIVITY_CHANGE:
        if (!data.isConnected) {
          NotificationService.createLocalNotification(
            'Bağlantı Durumu',
            'İnternet bağlantısı kesildi. Çevrimdışı modda çalışıyorsunuz.'
          );
        }
        break;
    }
  }

  // Broadcast dinleyicisi ekle
  public addListener(action: string, callback: (data: any) => void) {
    return this.eventEmitter.addListener(action, callback);
  }

  // Broadcast dinleyicisini kaldır
  public removeListener(subscription: any) {
    if (subscription) {
      subscription.remove();
    }
  }
}

export default new BroadcastService();