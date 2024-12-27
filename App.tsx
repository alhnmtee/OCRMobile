// App.tsx

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import {DocumentProvider} from './src/contexts/DocumentContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import DocumentsScreen from './src/screens/DocumentScreen';

import {ActivityIndicator, View} from 'react-native';

const Stack = createNativeStackNavigator();

function Navigation() {
  const {signedIn, loading} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!signedIn ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{headerShown: true}}
          />
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              headerShown: true,
              title: 'Belge Tara',
            }}
          />
          <Stack.Screen
            name="Documents"
            component={DocumentsScreen}
            options={{
              headerShown: true,
              title: 'Belgelerim',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <DocumentProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </DocumentProvider>
    </AuthProvider>
  );
}

export default App;