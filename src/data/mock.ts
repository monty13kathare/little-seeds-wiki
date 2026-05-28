import { User, Project, Document, Category } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'SUPER_ADMIN', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'PROJECT_MANAGER', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'DEVELOPER', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Alice Client', email: 'alice@client.com', role: 'CLIENT', avatar: 'https://i.pravatar.cc/150?u=5' },
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    workspaceId: 'w1',
    name: 'Little Seeds Platform v1',
    description: 'Enterprise documentation platform development.',
    status: 'ACTIVE',
    category: 'Software Development',
    teamIds: ['1', '2', '4'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    workspaceId: 'w1',
    name: 'Cloud Migration',
    description: 'Moving legacy infrastructure to AWS.',
    status: 'ON_HOLD',
    category: 'Infrastructure',
    teamIds: ['3', '4'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockCategories: Category[] = [
  { id: 'c1', projectId: 'p1', name: 'Technical Specs' },
  { id: 'c2', projectId: 'p1', name: 'SOPs' },
  { id: 'c3', projectId: 'p1', name: 'Onboarding' },
];

export const mockDocuments: Document[] = [
  {
    id: 'd1',
    projectId: 'p1',
    categoryId: 'c1',
    title: 'Architecture Overview',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to the Little Seeds Platform architecture guide."}]}]}',
    authorId: '1',
    status: 'PUBLISHED',
    isPrivate: false,
    tags: ['tech', 'architecture'],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
