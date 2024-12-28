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