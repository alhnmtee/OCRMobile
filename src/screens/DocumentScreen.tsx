import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDocuments } from '../contexts/DocumentContext';
import { formatBytes, formatDate } from '../utils/formatters';
import { DocumentMetadata } from '../services/StorageService';

const DocumentsScreen = () => {
  const {
    documents,
    loading,
    deleteDocument,
    refreshDocuments,
  } = useDocuments();

  const renderDocument = ({ item }: { item: DocumentMetadata }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        <Text style={styles.documentName}>{item.name}</Text>
        <Text style={styles.documentMeta}>
          {formatBytes(item.size)} • {formatDate(item.createdAt)}
        </Text>
        {item.ocrCompleted && (
          <Text style={styles.ocrStatus}>OCR Tamamlandı</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteDocument(item.id)}>
        <Text style={styles.deleteButtonText}>Sil</Text>
      </TouchableOpacity>
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
      <FlatList<DocumentMetadata>
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
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
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
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
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