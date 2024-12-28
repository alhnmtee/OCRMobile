export interface Share {
    id: string;
    documentId: string;
    sharedByUserId: string;
    sharedWithUserId: string;
    sharedAt: number;
    accessType: 'read' | 'write';
    status: 'pending' | 'accepted' | 'rejected';
}