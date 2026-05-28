import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectSection {
  id: string;
  label: string;
  icon?: string;
}

export interface IPortalTheme {
  mode: 'dark' | 'light';
  accentColor: string;
  fontFamily: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export interface IProject extends Document {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  version: string;
  category?: string;
  sections?: IProjectSection[];
  portalTheme?: IPortalTheme;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSectionSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: String }
});

const ProjectSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '🚀' },
    color: { type: String, default: '#6366f1' },
    version: { type: String, default: 'v1.0.0' },
    category: { type: String, default: 'Tech Based' },
    sections: [ProjectSectionSchema],
    portalTheme: {
      mode: { type: String, default: 'dark' },
      accentColor: { type: String, default: 'blue' },
      fontFamily: { type: String, default: 'inter' },
      fontSize: { type: String, default: 'base' },
    },
  },
  { timestamps: true }
);

// Delete cached model in dev so schema changes (like portalTheme) always take effect
if (process.env.NODE_ENV !== 'production' && mongoose.models.Project) {
  delete (mongoose.models as any).Project;
}

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
