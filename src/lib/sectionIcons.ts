import React from 'react';
import { 
  GraduationCap, BookOpen, BookMarked, School, PenLine, ClipboardList, 
  ShieldAlert, Settings, ClipboardCheck, FileCheck, Lock, Gavel, 
  Backpack, Users, HeartHandshake, MessageCircle, Star, Code, 
  Terminal, GitBranch, Database, Webhook, Bug, Briefcase, 
  BarChart2, DollarSign, TrendingUp, Target, HeartPulse, 
  Stethoscope, Pill, Activity, Palette, Image, Video, Mic, 
  Package, Truck, MapPin, CalendarCheck, Bell, Workflow 
} from 'lucide-react';

import {
  FaGraduationCap, FaSchool, FaPersonChalkboard, FaUsers, FaUserShield,
  FaBookOpen, FaBriefcase, FaCode, FaTerminal, FaHeartPulse, FaGear,
  FaBookOpenReader, FaUserGraduate, FaFileInvoiceDollar, FaLaptopCode
} from 'react-icons/fa6';

import {
  MdDashboard, MdSettings, MdSecurity, MdSchool, MdClass, MdOutlineSettings,
  MdOutlineMenuBook, MdOutlinePeople, MdManageAccounts, MdAnalytics
} from 'react-icons/md';

import {
  HiAcademicCap, HiBookOpen, HiOutlineBookOpen, HiOutlineUserGroup,
  HiUserGroup, HiShieldCheck, HiOutlineCpuChip, HiOutlineBriefcase
} from 'react-icons/hi2';

import {
  BsBook, BsBackpack, BsGear, BsPeople, BsShieldLock, BsJournalText,
  BsAward, BsDatabase
} from 'react-icons/bs';

import {
  IoSchoolOutline, IoBookOutline, IoPeopleOutline, IoSettingsOutline,
  IoHardwareChipOutline, IoShieldCheckmarkOutline
} from 'react-icons/io5';

export interface SectionIconOption {
  value: string;   // Icon component key in SECTION_ICONS_MAP
  label: string;   // Human-readable label shown in the dropdown
  emoji: string;   // Emoji shown as icon prefix
}

// Global registry of all supported section icons
export const SECTION_ICONS_MAP: Record<string, React.ComponentType<any>> = {
  // Lucide / Lu originals
  GraduationCap: GraduationCap,
  BookOpen: BookOpen,
  BookMarked: BookMarked,
  School: School,
  PenLine: PenLine,
  ClipboardList: ClipboardList,
  ShieldAlert: ShieldAlert,
  Settings: Settings,
  ClipboardCheck: ClipboardCheck,
  FileCheck: FileCheck,
  Lock: Lock,
  Gavel: Gavel,
  Backpack: Backpack,
  Users2: Users,
  HeartHandshake: HeartHandshake,
  MessageCircle: MessageCircle,
  Star: Star,
  Code2: Code,
  Terminal: Terminal,
  GitBranch: GitBranch,
  Database: Database,
  Webhook: Webhook,
  Bug: Bug,
  Briefcase: Briefcase,
  BarChart2: BarChart2,
  DollarSign: DollarSign,
  TrendingUp: TrendingUp,
  Target: Target,
  HeartPulse: HeartPulse,
  Stethoscope: Stethoscope,
  Pill: Pill,
  Activity: Activity,
  Palette: Palette,
  Image: Image,
  Video: Video,
  Mic: Mic,
  Package: Package,
  Truck: Truck,
  MapPin: MapPin,
  CalendarCheck: CalendarCheck,
  Bell: Bell,
  Workflow: Workflow,

  // Fa6 (FontAwesome 6)
  FaGraduationCap,
  FaSchool,
  FaPersonChalkboard,
  FaUsers,
  FaUserShield,
  FaBookOpen,
  FaBriefcase,
  FaCode,
  FaTerminal,
  FaHeartPulse,
  FaGear,
  FaBookOpenReader,
  FaUserGraduate,
  FaFileInvoiceDollar,
  FaLaptopCode,

  // Md (Material Design)
  MdDashboard,
  MdSettings,
  MdSecurity,
  MdSchool,
  MdClass,
  MdOutlineSettings,
  MdOutlineMenuBook,
  MdOutlinePeople,
  MdManageAccounts,
  MdAnalytics,

  // Hi2 (Heroicons 2)
  HiAcademicCap,
  HiBookOpen,
  HiOutlineBookOpen,
  HiOutlineUserGroup,
  HiUserGroup,
  HiShieldCheck,
  HiOutlineCpuChip,
  HiOutlineBriefcase,

  // Bs (Bootstrap Icons)
  BsBook,
  BsBackpack,
  BsGear,
  BsPeople,
  BsShieldLock,
  BsJournalText,
  BsAward,
  BsDatabase,

  // Io5 (Ionicons 5)
  IoSchoolOutline,
  IoBookOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoHardwareChipOutline,
  IoShieldCheckmarkOutline,
};

export const SECTION_ICON_OPTIONS: SectionIconOption[] = [
  // ── Education & Training ─────────────────────────────────────────────
  { value: 'GraduationCap',        label: 'Education (Lu)',           emoji: '🎓' },
  { value: 'FaGraduationCap',      label: 'Education (FontAwesome)',  emoji: '🎓' },
  { value: 'FaUserGraduate',       label: 'Graduate (FontAwesome)',   emoji: '🧑‍🎓' },
  { value: 'HiAcademicCap',        label: 'Academia (Heroicons)',     emoji: '🏛️' },
  { value: 'IoSchoolOutline',      label: 'School (Ionicons)',        emoji: '🏫' },
  { value: 'FaPersonChalkboard',  label: 'Teacher (FontAwesome)',    emoji: '👩‍🏫' },
  
  // ── Documentation & Guides ───────────────────────────────────────────
  { value: 'BookOpen',             label: 'Documentation (Lu)',       emoji: '📖' },
  { value: 'FaBookOpen',           label: 'Manual (FontAwesome)',     emoji: '📚' },
  { value: 'HiOutlineBookOpen',    label: 'Guide (Heroicons)',        emoji: '📒' },
  { value: 'BsJournalText',        label: 'Journal (Bootstrap)',      emoji: '📓' },
  { value: 'IoBookOutline',        label: 'Books (Ionicons)',         emoji: '📖' },

  // ── Operations & Settings ────────────────────────────────────────────
  { value: 'Settings',             label: 'Settings (Lu)',            emoji: '⚙️' },
  { value: 'FaGear',               label: 'Config (FontAwesome)',     emoji: '⚙️' },
  { value: 'MdOutlineSettings',    label: 'Settings (Material)',      emoji: '🛠️' },
  { value: 'IoSettingsOutline',    label: 'Control (Ionicons)',       emoji: '🔧' },

  // ── Security & Shield ────────────────────────────────────────────────
  { value: 'ShieldAlert',          label: 'Alert Shield (Lu)',        emoji: '🛡️' },
  { value: 'FaUserShield',         label: 'Security (FontAwesome)',   emoji: '👮' },
  { value: 'HiShieldCheck',        label: 'Verified (Heroicons)',     emoji: '✅' },
  { value: 'IoShieldCheckmarkOutline', label: 'Shield (Ionicons)',     emoji: '🛡️' },
  { value: 'BsShieldLock',         label: 'Access (Bootstrap)',       emoji: '🔒' },

  // ── People & Community ───────────────────────────────────────────────
  { value: 'Users2',               label: 'Users (Lu)',               emoji: '👥' },
  { value: 'FaUsers',              label: 'Team (FontAwesome)',       emoji: '👥' },
  { value: 'HiOutlineUserGroup',   label: 'Group (Heroicons)',        emoji: '👥' },
  { value: 'IoPeopleOutline',      label: 'Community (Ionicons)',     emoji: '🤝' },
  { value: 'BsPeople',             label: 'Clients (Bootstrap)',      emoji: '👥' },

  // ── Tech & Dev ───────────────────────────────────────────────────────
  { value: 'Code2',                label: 'Code (Lu)',                emoji: '💻' },
  { value: 'FaCode',               label: 'Dev (FontAwesome)',        emoji: '👨‍💻' },
  { value: 'FaTerminal',           label: 'Terminal (FontAwesome)',   emoji: '🖥️' },
  { value: 'HiOutlineCpuChip',     label: 'Tech (Heroicons)',         emoji: '🔌' },
];

export const getSectionIconSelectOptions = () =>
  SECTION_ICON_OPTIONS.map(opt => ({
    value: opt.value,
    label: `${opt.emoji}  ${opt.label}`,
  }));

export function getSectionEmoji(iconValue: string): string {
  return SECTION_ICON_OPTIONS.find(o => o.value === iconValue)?.emoji ?? '📝';
}
