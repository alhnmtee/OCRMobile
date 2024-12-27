// src/contexts/DocumentContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import StorageService, { DocumentMetadata } from '../services/StorageService';

interface DocumentContextData {
  documents: DocumentMetadata[];
  loading: boolean;
  saveDocument: (uri: string, fileName: string, mimeType: string) => Promise<DocumentMetadata>;
  deleteDocument: (id: string) => Promise<void>;
  getDocument: (id: string) => Promise<string>;
  saveOCRResult: (id: string, ocrText: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextData>({} as DocumentContextData);

export const DocumentProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      const docs = await StorageService.listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const saveDocument = async (
    uri: string,
    fileName: string,
    mimeType: string
  ): Promise<DocumentMetadata> => {
    const savedDoc = await StorageService.saveDocument(uri, fileName, mimeType);
    setDocuments(prev => [savedDoc, ...prev]);
    return savedDoc;
  };

  const deleteDocument = async (id: string): Promise<void> => {
    await StorageService.deleteDocument(id);
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getDocument = async (id: string): Promise<string> => {
    return await StorageService.readDocument(id);
  };

  const saveOCRResult = async (id: string, ocrText: string): Promise<void> => {
    await StorageService.saveOCRResult(id, ocrText);
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, ocrCompleted: true, ocrText } : doc
      )
    );
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