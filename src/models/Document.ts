import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  id: string;
  folderId: string | null;
  parentId: string | null;
  projectId: string | null;
  title: string;
  content: string;
  category: string;
  emoji?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  isPinned: boolean;
  isFavorite: boolean;
  wordCount: number;
  authorName: string;
  authorAvatar?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    folderId: { type: String, default: null, index: true },
    parentId: { type: String, default: null },
    projectId: { type: String, default: null, index: true },
    title: { type: String, required: true },
    content: { type: String, default: '{"type":"doc","content":[]}' },
    category: { type: String, required: true, index: true },
    emoji: { type: String, default: '📄' },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    isPinned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    wordCount: { type: Number, default: 0 },
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
