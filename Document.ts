import mongoose from 'mongoose';

interface IDocument extends mongoose.Document {
  _id: string;
  content: string;
  users: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new mongoose.Schema({
  content: { type: String, default: '' },
  users: { type: [String], default: [] },
  version: { type: Number, default: 0 }
}, { timestamps: true });

const Document = mongoose.model<IDocument>('Document', documentSchema);

export default Document;
