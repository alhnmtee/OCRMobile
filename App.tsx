// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/navigation/types';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';
import DocumentTagsScreen from './src/screens/DocumentTagsScreen';
import BluetoothShareScreen from './src/screens/BluetoothShareScreen';
import { AuthProvider } from './src/contexts/AuthContext';
import { DocumentProvider } from './src/contexts/DocumentContext';
import DocumentViewerScreen from './src/screens/DocumentViewerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <DocumentProvider>
          <Stack.Navigator 
            initialRouteName="Login"
            screenOptions={{
              headerShown: true,
            }}>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Ana Sayfa' }} 
            />
            <Stack.Screen 
              name="Camera" 
              component={CameraScreen}
              options={{ title: 'Belge Tara' }} 
            />
            <Stack.Screen 
              name="Documents" 
              component={DocumentsScreen}
              options={{ title: 'Belgelerim' }} 
            />
            <Stack.Screen 
              name="DocumentTags" 
              component={DocumentTagsScreen}
              options={{ title: 'Etiketler' }} 
            />
            <Stack.Screen 
              name="BluetoothShare" 
              component={BluetoothShareScreen}
              options={{ title: 'Bluetooth ile Paylaş' }} 
            />
            <Stack.Screen
              name="DocumentViewer"
              component={DocumentViewerScreen}
              options={{ title: 'Belge Görüntüleyici' }}
            />
            
          </Stack.Navigator>
        </DocumentProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;