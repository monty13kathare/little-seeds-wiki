export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'QA' | 'CLIENT' | 'user' | 'admin';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  sidebarLayout: 'default' | 'compact';
  fontFamily: string;
  accentColor?: string;
  fontSize?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  logo?: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  category: string;
  clientId?: string;
  teamIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  categoryId: string;
  title: string;
  content: string; // JSON for TipTap
  authorId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPrivate: boolean;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  projectId: string;
  name: string;
  parentId?: string; // For nesting
}
