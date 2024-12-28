// src/services/DatabaseService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Document } from './models/Document';
import { Share } from './models/share';
import { Tag } from './models/tag';

class DatabaseService {
    private static instance: DatabaseService;
    private readonly DOCUMENTS_KEY = '@documents';
    private readonly SHARES_KEY = '@shares';
    private readonly TAGS_KEY = '@tags';
    private readonly DOC_TAGS_KEY = '@doc_tags';

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async initDatabase(): Promise<void> {
        try {
            // İlk çalıştırmada boş array'leri oluştur
            const docs = await AsyncStorage.getItem(this.DOCUMENTS_KEY);
            if (!docs) await AsyncStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify([]));

            const shares = await AsyncStorage.getItem(this.SHARES_KEY);
            if (!shares) await AsyncStorage.setItem(this.SHARES_KEY, JSON.stringify([]));

            const tags = await AsyncStorage.getItem(this.TAGS_KEY);
            if (!tags) await AsyncStorage.setItem(this.TAGS_KEY, JSON.stringify([]));

            const docTags = await AsyncStorage.getItem(this.DOC_TAGS_KEY);
            if (!docTags) await AsyncStorage.setItem(this.DOC_TAGS_KEY, JSON.stringify([]));
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    public async insertDocument(document: Document): Promise<void> {
        try {
            const docs = await this.getDocuments(document.userId);
            docs.push(document);
            await AsyncStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(docs));
        } catch (error) {
            console.error('Error inserting document:', error);
            throw error;
        }
    }

    public async getDocuments(userId: string): Promise<Document[]> {
        try {
            const docs = await AsyncStorage.getItem(this.DOCUMENTS_KEY);
            const allDocs: Document[] = docs ? JSON.parse(docs) : [];
            return allDocs.filter(doc => doc.userId === userId);
        } catch (error) {
            console.error('Error getting documents:', error);
            throw error;
        }
    }

    public async deleteDocument(id: string): Promise<void> {
        try {
            const docs = await AsyncStorage.getItem(this.DOCUMENTS_KEY);
            const allDocs: Document[] = docs ? JSON.parse(docs) : [];
            const filteredDocs = allDocs.filter(doc => doc.id !== id);
            await AsyncStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(filteredDocs));

            // İlişkili etiketleri de sil
            await this.deleteDocumentTags(id);
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    public async updateDocumentOCR(id: string, ocrText: string): Promise<void> {
        try {
            const docs = await AsyncStorage.getItem(this.DOCUMENTS_KEY);
            const allDocs: Document[] = docs ? JSON.parse(docs) : [];
            const updatedDocs = allDocs.map(doc => 
                doc.id === id ? { ...doc, ocrText, ocrCompleted: true } : doc
            );
            await AsyncStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(updatedDocs));
        } catch (error) {
            console.error('Error updating document OCR:', error);
            throw error;
        }
    }

    public async createTag(tag: Tag): Promise<void> {
        try {
            const tags = await AsyncStorage.getItem(this.TAGS_KEY);
            const allTags: Tag[] = tags ? JSON.parse(tags) : [];
            allTags.push(tag);
            await AsyncStorage.setItem(this.TAGS_KEY, JSON.stringify(allTags));
        } catch (error) {
            console.error('Error creating tag:', error);
            throw error;
        }
    }

    public async addTagToDocument(documentId: string, tagId: string): Promise<void> {
        try {
            const docTags = await AsyncStorage.getItem(this.DOC_TAGS_KEY);
            const allDocTags: {documentId: string, tagId: string}[] = docTags ? JSON.parse(docTags) : [];
            allDocTags.push({ documentId, tagId });
            await AsyncStorage.setItem(this.DOC_TAGS_KEY, JSON.stringify(allDocTags));
        } catch (error) {
            console.error('Error adding tag to document:', error);
            throw error;
        }
    }

    public async shareDocument(share: Share): Promise<void> {
        try {
            const shares = await AsyncStorage.getItem(this.SHARES_KEY);
            const allShares: Share[] = shares ? JSON.parse(shares) : [];
            allShares.push(share);
            await AsyncStorage.setItem(this.SHARES_KEY, JSON.stringify(allShares));

            // Döküman paylaşım sayısını güncelle
            const docs = await AsyncStorage.getItem(this.DOCUMENTS_KEY);
            const allDocs: Document[] = docs ? JSON.parse(docs) : [];
            const updatedDocs = allDocs.map(doc => 
                doc.id === share.documentId 
                    ? { ...doc, shareCount: (doc.shareCount || 0) + 1 } 
                    : doc
            );
            await AsyncStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(updatedDocs));
        } catch (error) {
            console.error('Error sharing document:', error);
            throw error;
        }
    }

    private async deleteDocumentTags(documentId: string): Promise<void> {
        try {
            const docTags = await AsyncStorage.getItem(this.DOC_TAGS_KEY);
            const allDocTags: {documentId: string, tagId: string}[] = docTags ? JSON.parse(docTags) : [];
            const filteredDocTags = allDocTags.filter(dt => dt.documentId !== documentId);
            await AsyncStorage.setItem(this.DOC_TAGS_KEY, JSON.stringify(filteredDocTags));
        } catch (error) {
            console.error('Error deleting document tags:', error);
            throw error;
        }
    }
}

export default DatabaseService.getInstance();