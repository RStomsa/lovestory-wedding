'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthContextType, UpgradeModalConfig } from '@/types/auth';
import AuthModal from '@/components/auth/AuthModal';
import UpgradeModal from '@/components/payment/UpgradeModal';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [purchasedTemplateIds, setPurchasedTemplateIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalConfig, setUpgradeModalConfig] = useState<UpgradeModalConfig>({
    defaultType: 'PLAN_LIFETIME_VIP_200K',
  });

  // Fetch current user from server session
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser({
            ...data.user,
            isPro: data.user.plan === 'ANNUAL_50K' || data.user.plan === 'LIFETIME_VIP_200K',
          });
          setPurchasedTemplateIds(data.purchasedTemplateIds || []);
        } else {
          setUser(null);
          setPurchasedTemplateIds([]);
        }
      } else {
        setUser(null);
        setPurchasedTemplateIds([]);
      }
    } catch (err) {
      console.error('Failed to check auth state:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openUpgradeModal = (config?: UpgradeModalConfig) => {
    if (config) {
      setUpgradeModalConfig(config);
    } else {
      setUpgradeModalConfig({ defaultType: 'PLAN_LIFETIME_VIP_200K' });
    }
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
  };

  const login = async ({ email, password }: LoginCredentials): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Đăng nhập không thành công' };
      }

      await refreshUser();
      closeAuthModal();
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Lỗi kết nối máy chủ' };
    }
  };

  const register = async ({ name, email, password, phone }: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Đăng ký không thành công' };
      }

      await refreshUser();
      closeAuthModal();
      return { success: true };
    } catch {
      return { success: false, error: 'Lỗi kết nối máy chủ' };
    }
  };

  const loginWithGoogle = async (data?: { email?: string; name?: string; avatar?: string; credential?: string }): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {
          email: 'vinhtaithan@gmail.com',
          name: 'Vĩnh Tài (Google)',
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        await refreshUser();
        closeAuthModal();
        return { success: true, user: resData.user };
      }
      return { success: false, error: resData.error || 'Đăng nhập Google thất bại' };
    } catch (err) {
      console.error('Google login error:', err);
      return { success: false, error: 'Lỗi kết nối máy chủ' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoUser = async (role: 'chure' | 'codau' | 'admin' = 'chure'): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshUser();
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: data.error || 'Đăng nhập demo thất bại' };
    } catch (err) {
      console.error('Demo login failed:', err);
      return { success: false, error: 'Lỗi kết nối máy chủ' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setPurchasedTemplateIds([]);
    }
  };

  // Check if current user has permission to use a specific template
  const canUseTemplate = (templateId: string, templateTier: 'BASIC' | 'VIP' | 'FREE' | 'PREMIUM' | string = 'BASIC'): boolean => {
    // 1. Basic & Free templates are free for everyone
    if (templateTier === 'BASIC' || templateTier === 'FREE') return true;

    // 2. Admins can use everything
    if (user?.role === 'ADMIN') return true;

    // 3. Lifetime VIP (200k) users get ALL VIP templates included
    if (user?.plan === 'LIFETIME_VIP_200K') return true;

    // 4. Check if user individually purchased this VIP template
    if (purchasedTemplateIds.includes(templateId)) return true;

    return false;
  };

  const isAdmin = user?.role === 'ADMIN';
  const isPro = user?.plan === 'ANNUAL_50K' || user?.plan === 'LIFETIME_VIP_200K';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        isPro,
        purchasedTemplateIds,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isUpgradeModalOpen,
        upgradeModalConfig,
        openUpgradeModal,
        closeUpgradeModal,
        login,
        register,
        loginWithGoogle,
        loginDemoUser,
        logout,
        refreshUser,
        canUseTemplate,
      }}
    >
      {children}
      <AuthModal />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        defaultType={upgradeModalConfig.defaultType}
        templateId={upgradeModalConfig.templateId}
        templateName={upgradeModalConfig.templateName}
        templatePrice={upgradeModalConfig.templatePrice}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
