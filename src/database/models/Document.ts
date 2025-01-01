export interface Tag {
    id: string;
    name: string;
    createdAt: number;
    userId: string;
  }
  
  export interface Document {
    id: string;
    name: string;
    path: string;
    createdAt: number;
    size: number;
    mimeType: string;
    ocrCompleted: boolean;
    ocrText?: string;
    userId: string;
    shareCount: number;
    lastModified: number;
    tags?: Tag[]; 
  }