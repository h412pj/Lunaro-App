/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface WebAppUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface WebAppThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: WebAppUser;
    receiver?: any;
    start_param?: string;
    auth_date?: string;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: WebAppThemeParams;
  isExpanded: boolean;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive: boolean): void;
    hideProgress(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback: (approved: boolean) => void): void;
  setBackgroundColor(color: string): void;
  setHeaderColor(color: 'bg_color' | 'secondary_bg_color' | string): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Safely access the Telegram WebApp SDK, providing mock patterns if not in Telegram
const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const tg = getTelegramWebApp();

// Check if running in Telegram
export const isTelegram = tg !== null;

// Get Telegram WebApp user details
export const getTelegramUser = (): {
  first_name: string;
  last_name: string;
  username: string;
  avatar_url?: string;
  id?: number;
} => {
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    return {
      first_name: user.first_name || 'Пользователь',
      last_name: user.last_name || '',
      username: user.username || 'user',
      id: user.id
    };
  }
  
  // Return attractive mock details for local development/preview environments
  return {
    first_name: 'Финансист',
    last_name: 'Telegram',
    username: 'finance_tma_user',
    id: 123456789
  };
};

// Safe Haptic feedback triggers
export const triggerHaptic = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred(style);
      } catch (e) {
        console.log('Haptic feedback not supported on this platform');
      }
    }
  },
  notification: (type: 'success' | 'warning' | 'error') => {
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.notificationOccurred(type);
      } catch (e) {
        console.log('Haptic feedback notification not supported');
      }
    }
  },
  selection: () => {
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.selectionChanged();
      } catch (e) {
        console.log('Haptic selection feedback not supported');
      }
    }
  }
};

// Safe show alert wrapper that falls back gracefully
export const showAlert = (message: string, callback?: () => void) => {
  if (tg) {
    tg.showAlert(message, callback);
  } else {
    alert(message);
    if (callback) callback();
  }
};

// Safe confirm wrapper that falls back gracefully
export const showConfirm = (message: string, callback: (approved: boolean) => void) => {
  if (tg) {
    tg.showConfirm(message, callback);
  } else {
    const approved = window.confirm(message);
    callback(approved);
  }
};

// Set beautiful initial Telegram configurations
export const initTelegramBg = () => {
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      
      // Set background color based on current Telegram scheme or custom slate colors
      if (tg.themeParams.bg_color) {
        tg.setBackgroundColor(tg.themeParams.bg_color);
      }
      tg.setHeaderColor('secondary_bg_color');
    } catch (e) {
      console.warn('Failed to initialize Telegram WebApp configs:', e);
    }
  }
};
