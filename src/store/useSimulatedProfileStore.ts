import { create } from 'zustand';

export interface SimulatedProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  allowedProjects: string[];
  allowedCategories: ('teacher' | 'developer' | 'admin' | 'student')[];
  isWriter: boolean;
}

export const simulatedProfiles: SimulatedProfile[] = [
  {
    id: 'super-admin',
    name: 'Little Seeds Super Admin',
    role: 'Creator & Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    allowedProjects: ['p1', 'p2', 'p3'],
    allowedCategories: ['teacher', 'admin', 'student', 'developer'],
    isWriter: true,
  },
  {
    id: 'littleseeds-developer',
    name: 'Alex (Little Seeds Developer)',
    role: 'Core Engineering Team',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
    allowedProjects: ['p1', 'p2', 'p3'],
    allowedCategories: ['developer'],
    isWriter: false,
  },
  {
    id: 'teacher-client',
    name: 'Mrs. Jenkins (Teacher)',
    role: 'Client - Little Seeds',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    allowedProjects: ['p1'],
    allowedCategories: ['teacher'],
    isWriter: false,
  },
  {
    id: 'parent-client',
    name: 'The Davis Family (Parents)',
    role: 'Client - Little Seeds',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    allowedProjects: ['p1'],
    allowedCategories: ['student'],
    isWriter: false,
  },
  {
    id: 'apex-merchant',
    name: 'Marco (Merchant Retailer)',
    role: 'Client - ApexCommerce',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    allowedProjects: ['p3'],
    allowedCategories: ['teacher', 'admin'],
    isWriter: false,
  }
];

interface SimulatedProfileStore {
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  getActiveProfile: () => SimulatedProfile;
}

export const useSimulatedProfileStore = create<SimulatedProfileStore>((set, get) => ({
  activeProfileId: 'super-admin',
  setActiveProfileId: (id) => set({ activeProfileId: id }),
  getActiveProfile: () => {
    return simulatedProfiles.find(p => p.id === get().activeProfileId) || simulatedProfiles[0];
  }
}));
