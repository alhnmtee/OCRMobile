import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  ActionSheetIOS,
  Platform,
  Linking,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

const DocumentViewerScreen = ({ route }: any) => {
  const { document } = route.params;
  const [selectedText, setSelectedText] = useState<string>('');

  const handleTextLongPress = (text: string) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Copy', 'Search on Web'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCopyText(text);
          } else if (buttonIndex === 2) {
            handleSearchOnWeb(text);
          }
        }
      );
    } else {
      Alert.alert('Action', 'Choose an action', [
        {
          text: 'Copy',
          onPress: () => handleCopyText(text),
        },
        {
          text: 'Search on Web',
          onPress: () => handleSearchOnWeb(text),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
    }
  };

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'The text has been copied to your clipboard.');
  };

  const handleSearchOnWeb = (text: string) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    Linking.openURL(searchUrl);
  };

  if (!document) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Belge yüklenemedi.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{document.name}</Text>
      <Image source={{ uri: `file://${document.path}` }} style={styles.image} resizeMode="contain" />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {document.ocrText ? (
          <Pressable
            onLongPress={() => handleTextLongPress(document.ocrText)}
            style={styles.textContainer}>
            <Text style={styles.ocrText}>{document.ocrText}</Text>
          </Pressable>
        ) : (
          <ActivityIndicator size="large" color="#000" />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 16,
  },
  contentContainer: {
    flexGrow: 1,
  },
  textContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  ocrText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
  },
});

export default DocumentViewerScreen;