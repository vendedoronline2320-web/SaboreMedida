
export interface Recipe {
  id: string;
  name: string;
  image: string;
  category: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  time?: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  description: string; // Conteúdo Completo / Receita
  shortDescription?: string; // Nova
  category?: string; // Nova
  videoUrl: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: number;
  read: boolean;
}

export interface Activity {
  id: string;
  type: 'video' | 'recipe';
  contentId: string;
  timestamp: number;
  title: string;
}

export type ViewType = 'landing' | 'login' | 'dashboard';
export type DashboardSection = 'home' | 'recipes' | 'videos' | 'favorites' | 'profile' | 'settings' | 'admin';

export interface UserProfile {
  name: string;
  email: string;
  plan: 'free_trial' | 'essential' | 'premium';
  avatar?: string;
  goal?: string;
  weight?: string;
  isAdmin?: boolean;
  lastLogin: number;
  darkMode?: boolean;
  targetWeight?: string;
  startWeight?: string;
  notificationsEnabled?: boolean;
  streak?: number;
  lastStreakUpdate?: number;
  trialExpiresAt?: number;
}

export interface User {
  id: string;
  profile: UserProfile;
  favorites: string[];
  history: Activity[];
  notifications: Notification[];
  password?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isAdmin: boolean;
}

export interface ChatSession {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: ChatMessage;
  unreadCount?: number;
}
