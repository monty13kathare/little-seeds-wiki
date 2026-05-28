import { create } from 'zustand';
import axios from 'axios';

export interface ProjectSection {
  id: string;
  label: string;
  icon?: string;
}

export interface ProjectPortalTheme {
  mode: 'dark' | 'light';
  accentColor: string;
  fontFamily: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  version?: string;
  category?: string;
  createdAt: string;
  sections?: ProjectSection[];
  portalTheme?: ProjectPortalTheme;
  sectionLabels?: {
    teacher?: string;
    admin?: string;
    student?: string;
    developer?: string;
  };
}

export const getProjectSections = (project: Project | null | undefined): ProjectSection[] => {
  if (!project) return [];
  return project.sections || [];
};

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string | null) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get('/api/projects');
      if (res.data.success) {
        let projectsList = res.data.data;
        if (projectsList.length === 0) {
          try {
            const seedRes = await axios.get('/api/seed');
            if (seedRes.data.success) {
              const retryRes = await axios.get('/api/projects');
              if (retryRes.data.success) {
                projectsList = retryRes.data.data;
              }
            }
          } catch (seedErr) {
            console.error('Failed to auto-seed database:', seedErr);
          }
        }
        set({ projects: projectsList, isLoading: false });
        // Set active project to first seeded project if none active or if the current active project is no longer available
        const activeExists = projectsList.some((p: any) => p.id === get().activeProjectId);
        if (projectsList.length > 0 && (!get().activeProjectId || !activeExists)) {
          set({ activeProjectId: projectsList[0].id });
        }
      } else {
        set({ error: res.data.error, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post('/api/projects', projectData);
      if (res.data.success) {
        const newProject = res.data.data;
        set((state) => ({
          projects: [...state.projects, newProject],
          isLoading: false,
        }));
        return newProject;
      } else {
        throw new Error(res.data.error);
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateProject: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.put(`/api/projects/${id}`, updates);
      if (res.data.success) {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? res.data.data : p)),
          isLoading: false,
        }));
      } else {
        throw new Error(res.data.error);
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.delete(`/api/projects/${id}`);
      if (res.data.success) {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
          isLoading: false,
        }));
      } else {
        throw new Error(res.data.error);
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  setActiveProject: (id) => set({ activeProjectId: id }),
}));
