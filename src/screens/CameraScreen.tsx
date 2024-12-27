import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useDocuments } from '../contexts/DocumentContext';

type CameraScreenProps = {
  navigation: any;
};

const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraReady, setCameraReady] = useState(false);
  const devices = useCameraDevices();
  const device = devices.filter(device => device.position === 'back')[0];
  const camera = useRef<Camera>(null);
  const { saveDocument } = useDocuments();

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      if (cameraPermission !== 'denied') {
        setHasPermission(true);
      } else {
        Alert.alert(
          'İzin Reddedildi',
          'Kamera iznine ihtiyacımız var.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      }
    };
    requestPermissions();
  }, [navigation]);

  const takePicture = async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({
          flash: 'auto'
        });

        const fileName = `scan_${Date.now()}.jpg`;
        await saveDocument(
          `file://${photo.path}`,
          fileName,
          'image/jpeg'
        );

        Alert.alert(
          'Başarılı',
          'Belge kaydedildi',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu');
    }
  };

  if (!device || !hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Kamera yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setCameraReady(true)}
      />
      
      {isCameraReady && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
  },
});

export default CameraScreen;