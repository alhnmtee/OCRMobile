// src/database/models/Document.ts
export interface Document {
    id: string;
    name: string;
    path: string;
    createdAt: number;
    size: number;
    mimeType: string;
    ocrText?: string;
    ocrCompleted: boolean;
    userId: string;
    shareCount: number;
    lastModified: number;
  }
  
  // src/database/models/Share.ts
  export interface Share {
    id: string;
    documentId: string;
    sharedByUserId: string;
    sharedWithUserId: string;
    sharedAt: number;
    accessType: 'read' | 'write';
    status: 'pending' | 'accepted' | 'rejected';
  }
  
  // src/database/models/Tag.ts
  export interface Tag {
    id: string;
    name: string;
    createdAt: number;
    userId: string;
  }
  
  // src/database/models/DocumentTag.ts
  export interface DocumentTag {
    documentId: string;
    tagId: string;
  }
  
  // src/database/DatabaseService.ts
  