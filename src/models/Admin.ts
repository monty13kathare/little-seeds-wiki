import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IAdmin extends MongooseDocument {
  id: string; // custom id string matching frontend Zustand state
  name: string;
  email: string;
  role: string;
  password?: string;
  assignedProjectId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, required: true, default: 'admin' },
    password: { type: String },
    assignedProjectId: { type: String },
    avatar: { type: String },
    preferences: {
      theme: { type: String, default: 'dark' },
      sidebarLayout: { type: String, default: 'default' },
      fontFamily: { type: String, default: 'inter' },
      accentColor: { type: String, default: 'blue' },
      fontSize: { type: String, default: 'base' }
    }
  },
  { timestamps: true, collection: 'admins' } // Explicitly name it 'admins'
);

// Delete cached model in dev so schema changes always take effect
if (process.env.NODE_ENV !== 'production' && mongoose.models.Admin) {
  delete (mongoose.models as any).Admin;
}

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
