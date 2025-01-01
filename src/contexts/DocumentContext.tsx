// src/contexts/DocumentContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import StorageService, { DocumentMetadata } from '../services/StorageService';
import DatabaseService from '../database/DatabaseService';
import ApiService from '../services/ApiService';
import { Document, Tag } from '../database/models/Document';

interface DocumentContextData {
  documents: Document[];
  loading: boolean;
  saveDocument: (uri: string, fileName: string, mimeType: string) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  getDocument: (id: string) => Promise<string>;
  saveOCRResult: (id: string, ocrText: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  addTag: (documentId: string, tagName: string) => Promise<void>;
  shareDocument: (documentId: string, sharedWithUserId: string) => Promise<void>;
}

const DocumentContext = createContext<DocumentContextData>({} as DocumentContextData);

export const DocumentProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await DatabaseService.initDatabase();
        if (user) {
          await loadDocuments();
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      // Yerel veritabanından belgeleri yükle
      const localDocs = await DatabaseService.getDocuments(user.uid);
      
      // API'den belgeleri al
      try {
        const apiDocs = await ApiService.getDocuments();
        // Her iki kaynaktan gelen belgeleri birleştir
        const mergedDocs = [...localDocs];
        apiDocs.forEach((apiDoc: Document) => {
          const existingDoc = mergedDocs.find(doc => doc.id === apiDoc.id);
          if (!existingDoc) {
            mergedDocs.push(apiDoc);
          } else if (apiDoc.lastModified > existingDoc.lastModified) {
            // API'deki belge daha yeni ise güncelle
            Object.assign(existingDoc, apiDoc);
          }
        });
        setDocuments(mergedDocs);
      } catch (apiError) {
        console.error('API error, using local documents:', apiError);
        setDocuments(localDocs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async (
    uri: string,
    fileName: string,
    mimeType: string
  ): Promise<Document> => {
    if (!user) throw new Error('User not authenticated');

    // Dosyayı yerel depolamaya kaydet
    const savedFileMetadata = await StorageService.saveDocument(uri, fileName, mimeType);
    
    const document: Document = {
      id: savedFileMetadata.id,
      name: savedFileMetadata.name,
      path: savedFileMetadata.path,
      createdAt: savedFileMetadata.createdAt,
      size: savedFileMetadata.size,
      mimeType: savedFileMetadata.mimeType,
      ocrCompleted: false,
      userId: user.uid,
      shareCount: 0,
      lastModified: Date.now()
    };

    // Yerel veritabanına kaydet
    await DatabaseService.insertDocument(document);

    // API'ye yükle
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: fileName,
      });
      await ApiService.uploadDocument(formData);
    } catch (apiError) {
      console.error('Failed to upload to API:', apiError);
      // API hatası durumunda yerel kayıt devam eder
    }
    
    setDocuments(prev => [document, ...prev]);
    return document;
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      // Yerel depolamadan sil
      await StorageService.deleteDocument(id);
      // Yerel veritabanından sil
      await DatabaseService.deleteDocument(id);
      
      // API'den silmeyi dene
      try {
        await ApiService.deleteDocument(id);
      } catch (apiError) {
        console.error('Failed to delete from API:', apiError);
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  const getDocument = async (id: string): Promise<string> => {
    return await StorageService.readDocument(id);
  };

  const saveOCRResult = async (id: string, ocrText: string): Promise<void> => {
    try {
      // Yerel veritabanını güncelle
      await DatabaseService.updateDocumentOCR(id, ocrText);
      
      // API'yi güncelle
      try {
        await ApiService.updateDocument(id, { ocrText, ocrCompleted: true });
      } catch (apiError) {
        console.error('Failed to update OCR result in API:', apiError);
      }

      setDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { ...doc, ocrCompleted: true, ocrText } : doc
        )
      );
    } catch (error) {
      console.error('Error saving OCR result:', error);
      throw error;
    }
  };
  const addTag = async (documentId: string, tagName: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const tag: Tag = {
      id: `tag_${Date.now()}`,
      name: tagName,
      createdAt: Date.now(),
      userId: user.uid
    };

    try {
      // Yerel veritabanına kaydet
      await DatabaseService.createTag(tag);
      await DatabaseService.addTagToDocument(documentId, tag.id);
 
      const document = documents.find(d => d.id === documentId);
      const updatedTags = [...(document?.tags || []), tag];
   
      try {
        await ApiService.updateDocument(documentId, { tags: updatedTags });
      } catch (apiError) {
        console.error('Failed to update tags in API:', apiError);
      }

      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, tags: updatedTags }
          : doc
      ));
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  };
  const shareDocument = async (documentId: string, sharedWithUserId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const share = {
      id: `share_${Date.now()}`,
      documentId,
      sharedByUserId: user.uid,
      sharedWithUserId,
      sharedAt: Date.now(),
      accessType: 'read' as const,
      status: 'pending' as const
    };

    try {
      // Yerel veritabanına kaydet
      await DatabaseService.shareDocument(share);
      
      // API'ye gönder
      try {
        await ApiService.shareDocument(documentId, sharedWithUserId);
      } catch (apiError) {
        console.error('Failed to share document via API:', apiError);
      }
      
      await loadDocuments();
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  };

  const refreshDocuments = async (): Promise<void> => {
    setLoading(true);
    await loadDocuments();
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        loading,
        saveDocument,
        deleteDocument,
        getDocument,
        saveOCRResult,
        refreshDocuments,
        addTag,
        shareDocument
      }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};