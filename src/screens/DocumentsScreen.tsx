// src/screens/DocumentsScreen.tsx

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDocuments } from '../contexts/DocumentContext';
import { formatBytes, formatDate } from '../utils/formatters';
import { Document } from '../models/Document';

const DocumentsScreen = ({ navigation }: any) => {
  const {
    documents,
    loading,
    deleteDocument,
    refreshDocuments,
    shareDocument,
  } = useDocuments();

  const handleShare = async (document: Document) => {
    Alert.alert(
      'Paylaş',
      'Paylaşım yöntemini seçin',
      [
        {
          text: 'Bluetooth ile Paylaş',
          onPress: () => navigation.navigate('BluetoothShare', { document })
        },
        {
          text: 'Kullanıcı ile Paylaş',
          onPress: async () => {
            try {
              // Normalde buraya bir kullanıcı seçme ekranı eklenebilir
              const targetUserId = 'example_user_id';
              await shareDocument(document.id, targetUserId);
              Alert.alert('Başarılı', 'Belge paylaşıldı');
            } catch (error) {
              Alert.alert('Hata', 'Belge paylaşılırken bir hata oluştu');
            }
          }
        },
        {
          text: 'İptal',
          style: 'cancel'
        }
      ]
    );
  };

  const handleAddTags = (document: Document) => {
    navigation.navigate('DocumentTags', {
      documentId: document.id,
      documentName: document.name,
    });
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        <Text style={styles.documentName}>{item.name}</Text>
        <Text style={styles.documentMeta}>
          {formatBytes(item.size)} • {formatDate(item.createdAt)}
        </Text>
        {item.ocrCompleted && (
          <Text style={styles.ocrStatus}>OCR Tamamlandı</Text>
        )}
        {item.shareCount > 0 && (
          <Text style={styles.shareCount}>{item.shareCount} kez paylaşıldı</Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.tagButton]}
          onPress={() => navigation.navigate('DocumentViewer', { document: item })}>
          <Text style={styles.buttonText}>Görüntüle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.tagButton]}
          onPress={() => handleAddTags(item)}>
          <Text style={styles.buttonText}>Etiketler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => handleShare(item)}>
          <Text style={styles.buttonText}>Paylaş</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteDocument(item.id)}>
          <Text style={styles.buttonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList<Document>
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={refreshDocuments}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz belge bulunmuyor</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  documentInfo: {
    flex: 1,
    marginBottom: 10,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  documentMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  ocrStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  shareCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DocumentsScreen;