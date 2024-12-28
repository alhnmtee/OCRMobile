// src/database/DatabaseService.ts

import SQLite from 'react-native-sqlite-storage';
import { Document } from './models/Document';
import { Share } from './models/share';
import { Tag } from './models/tag';

SQLite.enablePromise(true);

class DatabaseService {
    private database: SQLite.SQLiteDatabase | null = null;
    private static instance: DatabaseService;

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async initDatabase(): Promise<void> {
        try {
            const db = await SQLite.openDatabase({
                name: 'OCRMobileDB.db',
                location: 'default'
            });
            this.database = db;
            await this.createTables();
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        const createTableQueries = [
            `CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                createdAt INTEGER NOT NULL,
                size INTEGER NOT NULL,
                mimeType TEXT NOT NULL,
                ocrText TEXT,
                ocrCompleted INTEGER DEFAULT 0,
                userId TEXT NOT NULL,
                shareCount INTEGER DEFAULT 0,
                lastModified INTEGER NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS shares (
                id TEXT PRIMARY KEY,
                documentId TEXT NOT NULL,
                sharedByUserId TEXT NOT NULL,
                sharedWithUserId TEXT NOT NULL,
                sharedAt INTEGER NOT NULL,
                accessType TEXT NOT NULL,
                status TEXT NOT NULL,
                FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
            )`,
            `CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                createdAt INTEGER NOT NULL,
                userId TEXT NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS document_tags (
                documentId TEXT NOT NULL,
                tagId TEXT NOT NULL,
                PRIMARY KEY (documentId, tagId),
                FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE,
                FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE
            )`
        ];

        if (!this.database) {
            throw new Error('Database not initialized');
        }

        try {
            await this.database.transaction(tx => {
                createTableQueries.forEach(query => {
                    tx.executeSql(query);
                });
            });
        } catch (error) {
            console.error('Error creating tables:', error);
            throw error;
        }
    }

    public async insertDocument(document: Document): Promise<void> {
        if (!this.database) {
            throw new Error('Database not initialized');
        }

        const query = `INSERT INTO documents 
            (id, name, path, createdAt, size, mimeType, ocrText, ocrCompleted, userId, shareCount, lastModified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        try {
            await this.database.executeSql(query, [
                document.id,
                document.name,
                document.path,
                document.createdAt,
                document.size,
                document.mimeType,
                document.ocrText,
                document.ocrCompleted ? 1 : 0,
                document.userId,
                document.shareCount,
                document.lastModified
            ]);
        } catch (error) {
            console.error('Error inserting document:', error);
            throw error;
        }
    }

    public async getDocuments(userId: string): Promise<Document[]> {
        if (!this.database) {
            throw new Error('Database not initialized');
        }

        const query = 'SELECT * FROM documents WHERE userId = ? ORDER BY createdAt DESC';

        try {
            const [results] = await this.database.executeSql(query, [userId]);
            const documents: Document[] = [];

            for (let i = 0; i < results.rows.length; i++) {
                const row = results.rows.item(i);
                documents.push({
                    ...row,
                    ocrCompleted: row.ocrCompleted === 1
                });
            }

            return documents;
        } catch (error) {
            console.error('Error getting documents:', error);
            throw error;
        }
    }

    public async deleteDocument(id: string): Promise<void> {
        if (!this.database) {
            throw new Error('Database not initialized');
        }

        const query = 'DELETE FROM documents WHERE id = ?';

        try {
            await this.database.executeSql(query, [id]);
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    public async updateDocumentOCR(id: string, ocrText: string): Promise<void> {
        if (!this.database) {
            throw new Error('Database not initialized');
        }

        const query = 'UPDATE documents SET ocrText = ?, ocrCompleted = 1 WHERE id = ?';

        try {
            await this.database.executeSql(query, [ocrText, id]);
        } catch (error) {
            console.error('Error updating document OCR:', error);
            throw error;
        }
    }

    public async createTag(tag: Tag): Promise<void> {
        if (!this.database) {
            throw new Error('Database not initialized');
        }

        const query = 'INSERT INTO tags (id, name, createdAt, userId) VALUES (?, ?, ?, ?)';

        try {
            await this.database.executeSql(query, [
                tag.id,
                tag.name,
                tag.createdAt,
                tag.userId
            ]);
        } catch (error) {
            console.error('Error creating tag:', error);
            throw error;
        }
    }

    public async addTagToDocument(documentId: string, tagId: string): Promise<void> {
        if (!this.database) {
            throw new Error('Database not initialized');
        }

        const query = 'INSERT INTO document_tags (documentId, tagId) VALUES (?, ?)';

        try {
            await this.database.executeSql(query, [documentId, tagId]);
        } catch (error) {
            console.error('Error adding tag to document:', error);
            throw error;
        }
    }

    public async shareDocument(share: Share): Promise<void> {
        if (!this.database) {
            throw new Error('Database not initialized');
        }

        const query = `INSERT INTO shares 
            (id, documentId, sharedByUserId, sharedWithUserId, sharedAt, accessType, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        try {
            await this.database.executeSql(query, [
                share.id,
                share.documentId,
                share.sharedByUserId,
                share.sharedWithUserId,
                share.sharedAt,
                share.accessType,
                share.status
            ]);

            await this.database.executeSql(
                'UPDATE documents SET shareCount = shareCount + 1 WHERE id = ?',
                [share.documentId]
            );
        } catch (error) {
            console.error('Error sharing document:', error);
            throw error;
        }
    }
}

export default DatabaseService.getInstance();