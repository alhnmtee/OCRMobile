// src/screens/DocumentTagsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDocuments } from '../contexts/DocumentContext';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentTags'>;

const DocumentTagsScreen = ({ route, navigation }: Props) => {
  const { documentId, documentName } = route.params;
  const [newTag, setNewTag] = useState('');
  const { addTag } = useDocuments();

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      Alert.alert('Hata', 'Lütfen bir etiket adı girin');
      return;
    }

    try {
      await addTag(documentId, newTag.trim());
      Alert.alert('Başarılı', 'Etiket eklendi');
      setNewTag('');
    } catch (error) {
      Alert.alert('Hata', 'Etiket eklenirken bir hata oluştu');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{documentName}</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTag}
          onChangeText={setNewTag}
          placeholder="Yeni etiket ekle"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTag}
        >
          <Text style={styles.buttonText}>Ekle</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DocumentTagsScreen;