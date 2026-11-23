export type SystemRole = 'USER' | 'ADMIN';
export type AccountPlan = 'FREE' | 'ANNUAL_50K' | 'LIFETIME_VIP_200K';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  role: SystemRole;
  plan: AccountPlan;
  planExpiresAt?: string | null;
  isPro?: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface UpgradeModalConfig {
  defaultType?: 'PLAN_LIFETIME_VIP_200K' | 'PLAN_ANNUAL_50K' | 'SINGLE_TEMPLATE_VIP';
  templateId?: string;
  templateName?: string;
  templatePrice?: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPro: boolean;
  purchasedTemplateIds: string[];
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isUpgradeModalOpen: boolean;
  upgradeModalConfig: UpgradeModalConfig;
  openUpgradeModal: (config?: UpgradeModalConfig) => void;
  closeUpgradeModal: () => void;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (data?: { email?: string; name?: string; avatar?: string; credential?: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  loginDemoUser: (role?: 'chure' | 'codau' | 'admin') => Promise<{ success: boolean; error?: string } | void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  canUseTemplate: (templateId: string, templateTier?: 'BASIC' | 'VIP' | 'FREE' | 'PREMIUM' | string) => boolean;
}
