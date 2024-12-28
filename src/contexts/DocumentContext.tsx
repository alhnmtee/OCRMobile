// src/contexts/DocumentContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import StorageService, { DocumentMetadata } from '../services/StorageService';
import DatabaseService from '../database/DatabaseService';
import { Document } from '../models/Document';

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
      const docs = await DatabaseService.getDocuments(user.uid);
      setDocuments(docs);
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

    await DatabaseService.insertDocument(document);
    setDocuments(prev => [document, ...prev]);
    
    return document;
  };

  const deleteDocument = async (id: string): Promise<void> => {
    await StorageService.deleteDocument(id);
    await DatabaseService.deleteDocument(id);
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getDocument = async (id: string): Promise<string> => {
    return await StorageService.readDocument(id);
  };

  const saveOCRResult = async (id: string, ocrText: string): Promise<void> => {
    await DatabaseService.updateDocumentOCR(id, ocrText);
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, ocrCompleted: true, ocrText } : doc
      )
    );
  };

  const addTag = async (documentId: string, tagName: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const tag = {
      id: `tag_${Date.now()}`,
      name: tagName,
      createdAt: Date.now(),
      userId: user.uid
    };

    await DatabaseService.createTag(tag);
    await DatabaseService.addTagToDocument(documentId, tag.id);
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

    await DatabaseService.shareDocument(share);
    await loadDocuments(); // Paylaşım sayısı güncellendiği için yeniden yükle
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