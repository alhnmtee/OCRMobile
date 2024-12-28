// src/navigation/types.ts
import { Document } from '../models/Document';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Camera: undefined;
  Documents: undefined;
  DocumentTags: {
    documentId: string;
    documentName: string;
  };
  BluetoothShare: {
    document: Document;
  };
};