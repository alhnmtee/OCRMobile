// src/services/StorageService.ts

import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface DocumentMetadata {
  id: string;
  name: string;
  path: string;
  createdAt: number;
  size: number;
  mimeType: string;
  ocrCompleted?: boolean;
  ocrText?: string;
}

class StorageService {
  private readonly BASE_PATH: string;
  private readonly DOCUMENTS_PATH: string;
  private readonly TEMP_PATH: string;
  
  constructor() {
    // Ana depolama yolu platform'a göre belirlenir
    this.BASE_PATH = Platform.select({
      ios: `${RNFS.DocumentDirectoryPath}/OCRMobile`,
      android: `${RNFS.ExternalDirectoryPath}/OCRMobile`,
    })!;
    
    this.DOCUMENTS_PATH = `${this.BASE_PATH}/documents`;
    this.TEMP_PATH = `${this.BASE_PATH}/temp`;
    
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      // Ana dizinleri oluştur
      await RNFS.mkdir(this.BASE_PATH);
      await RNFS.mkdir(this.DOCUMENTS_PATH);
      await RNFS.mkdir(this.TEMP_PATH);
    } catch (error) {
      console.error('Storage initialization error:', error);
    }
  }

  // Dosya kaydetme
  public async saveDocument(
    sourceUri: string, 
    fileName: string,
    mimeType: string
  ): Promise<DocumentMetadata> {
    try {
      const timestamp = Date.now();
      const id = `doc_${timestamp}`;
      const extension = this.getFileExtension(fileName);
      const destinationPath = `${this.DOCUMENTS_PATH}/${id}${extension}`;

      // Dosyayı kopyala
      await RNFS.copyFile(sourceUri, destinationPath);
      
      // Dosya bilgilerini al
      const fileStats = await RNFS.stat(destinationPath);
      
      const metadata: DocumentMetadata = {
        id,
        name: fileName,
        path: destinationPath,
        createdAt: timestamp,
        size: fileStats.size,
        mimeType,
        ocrCompleted: false
      };

      // Metadata'yı kaydet
      await this.saveDocumentMetadata(id, metadata);
      
      return metadata;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  // Dosya okuma
  public async readDocument(id: string): Promise<string> {
    try {
      const metadata = await this.getDocumentMetadata(id);
      if (!metadata) {
        throw new Error('Document not found');
      }
      
      const content = await RNFS.readFile(metadata.path, 'base64');
      return content;
    } catch (error) {
      console.error('Error reading document:', error);
      throw error;
    }
  }

  // Dosya silme
  public async deleteDocument(id: string): Promise<void> {
    try {
      const metadata = await this.getDocumentMetadata(id);
      if (!metadata) {
        throw new Error('Document not found');
      }

      // Dosyayı sil
      await RNFS.unlink(metadata.path);
      
      // Metadata'yı sil
      await AsyncStorage.removeItem(`@document_${id}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Tüm dokümanları listele
  public async listDocuments(): Promise<DocumentMetadata[]> {
    try {
      const files = await RNFS.readDir(this.DOCUMENTS_PATH);
      const documents: DocumentMetadata[] = [];

      for (const file of files) {
        const id = file.name.split('.')[0];
        const metadata = await this.getDocumentMetadata(id);
        if (metadata) {
          documents.push(metadata);
        }
      }

      return documents.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error listing documents:', error);
      throw error;
    }
  }

  // Metadata kaydetme
  private async saveDocumentMetadata(
    id: string,
    metadata: DocumentMetadata
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `@document_${id}`,
        JSON.stringify(metadata)
      );
    } catch (error) {
      console.error('Error saving document metadata:', error);
      throw error;
    }
  }

  // Metadata okuma
  private async getDocumentMetadata(id: string): Promise<DocumentMetadata | null> {
    try {
      const data = await AsyncStorage.getItem(`@document_${id}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting document metadata:', error);
      throw error;
    }
  }

  // OCR sonuçlarını kaydetme
  public async saveOCRResult(id: string, ocrText: string): Promise<void> {
    try {
      const metadata = await this.getDocumentMetadata(id);
      if (!metadata) {
        throw new Error('Document not found');
      }

      const updatedMetadata: DocumentMetadata = {
        ...metadata,
        ocrCompleted: true,
        ocrText
      };

      await this.saveDocumentMetadata(id, updatedMetadata);
    } catch (error) {
      console.error('Error saving OCR result:', error);
      throw error;
    }
  }

  // Kullanıcı tercihleri için metodlar
  public async savePreference(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`@pref_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving preference:', error);
      throw error;
    }
  }

  public async getPreference<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(`@pref_${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting preference:', error);
      throw error;
    }
  }

  // Yardımcı metodlar
  private getFileExtension(fileName: string): string {
    const match = fileName.match(/\.[0-9a-z]+$/i);
    return match ? match[0] : '';
  }

  // Depolama alanı temizleme
  public async clearStorage(): Promise<void> {
    try {
      await RNFS.unlink(this.BASE_PATH);
      await this.initializeStorage();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export default new StorageService();