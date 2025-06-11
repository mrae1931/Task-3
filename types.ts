export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Operation {
  type: 'insert' | 'delete';
  position: number;
  text?: string;
  length?: number;
  version: number;
}
