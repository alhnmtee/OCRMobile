//src/services/NotificationService.ts

import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import PushNotification from 'react-native-push-notification';

class NotificationService {
  constructor() {
    this.configurePushNotification();
  }

  private configurePushNotification() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Android için kanal oluştur
    PushNotification.createChannel(
      {
        channelId: 'default',
        channelName: 'Default Channel',
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  public async requestUserPermission() {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return permission === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  public async getFCMToken() {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('Your Firebase Token is:', fcmToken);
        return fcmToken;
      }
    } catch (error) {
      console.error('Failed to get FCM token:', error);
    }
    return null;
  }

  public createLocalNotification(title: string, message: string) {
    PushNotification.localNotification({
      channelId: 'default',
      title: title,
      message: message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
    });
  }

  public async listenToTopics() {
    try {
      await messaging().subscribeToTopic('ocr_notifications');
      await messaging().subscribeToTopic('document_shares');
      console.log('Subscribed to topics successfully');
    } catch (error) {
      console.error('Failed to subscribe to topics:', error);
    }
  }

  public setupForegroundHandler() {
    return messaging().onMessage(async remoteMessage => {
      console.log('Received foreground message:', remoteMessage);
      this.createLocalNotification(
        remoteMessage.notification?.title || 'Yeni Bildirim',
        remoteMessage.notification?.body || ''
      );
    });
  }

  public setupBackgroundHandler() {
    return messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
      this.createLocalNotification(
        remoteMessage.notification?.title || 'Yeni Bildirim',
        remoteMessage.notification?.body || ''
      );
      return Promise.resolve();
    });
  }
}

export default new NotificationService();