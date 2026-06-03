/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from './types';
import { DEFAULT_CATEGORIES, getMockTransactions } from './data';
import { initTelegramBg, getTelegramUser, triggerHaptic, showAlert } from './telegram';
import { Dashboard } from './components/Dashboard';
import { TransactionHistory } from './components/TransactionHistory';
import { TransactionForm } from './components/TransactionForm';
import { Analytics } from './components/Analytics';
import { CategoryIcon } from './components/CategoryIcon';
import { FamilySettings } from './components/FamilySettings';
import { About } from './components/About';
import { 
  db, 
  auth, 
  getUserProfile, 
  saveUserProfile, 
  subscribeTransactions, 
  addTransactionToDb, 
  deleteTransactionFromDb 
} from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'analytics' | 'about'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [showFamilySettings, setShowFamilySettings] = useState(false);
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [userDisplayName, setUserDisplayName] = useState('Финансист');
  
  // Real-time Cloud states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [familyCode, setFamilyCode] = useState('LOCAL');
  const [offlineTxs, setOfflineTxs] = useState<Transaction[]>([]);

  // Dark mode state with localStorage and Telegram system automatic synchronization
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('tg_finance_theme');
    if (saved) {
      return saved === 'dark';
    }
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.colorScheme) {
        return tg.colorScheme === 'dark';
      }
    } catch (e) {}
    return false;
  });

  // Toggle CSS class on the root documents
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tg_finance_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tg_finance_theme', 'light');
    }
  }, [darkMode]);

  // 1. Mount Initializer
  useEffect(() => {
    initTelegramBg();

    // Set Telegram display name as early default
    const tgUser = getTelegramUser();
    setUserDisplayName(tgUser.first_name);

    // Load offline local transactions fallback
    const stored = localStorage.getItem('tg_finance_transactions');
    if (stored) {
      try {
        setOfflineTxs(JSON.parse(stored));
      } catch (e) {
        const mocks = getMockTransactions();
        setOfflineTxs(mocks);
        localStorage.setItem('tg_finance_transactions', JSON.stringify(mocks));
      }
    } else {
      const mocks = getMockTransactions();
      setOfflineTxs(mocks);
      localStorage.setItem('tg_finance_transactions', JSON.stringify(mocks));
    }
  }, []);

  // 2. Firebase Session & Profile Real-time Listener
  useEffect(() => {
    let unsubscribeTxs: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setUserDisplayName(user.displayName || getTelegramUser().first_name);

        // Fetch user profile from Firestore or provision a new one
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setFamilyCode(profile.familyCode);
            // Subscribe to cloud transactions matching this familyCode
            if (unsubscribeTxs) unsubscribeTxs();
            unsubscribeTxs = subscribeTransactions(profile.familyCode, (cloudTxs) => {
              setTransactions(cloudTxs);
            }, (err) => {
              console.error('Subscription error:', err);
            });
          } else {
            // New user! Let's generate a unique, readable family code for them
            const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
            const newCode = `FAM-${randomSuffix}`;
            await saveUserProfile(user.uid, user.displayName || 'Пользователь', newCode);
            setFamilyCode(newCode);

            // Set up listener for new family budget
            if (unsubscribeTxs) unsubscribeTxs();
            unsubscribeTxs = subscribeTransactions(newCode, (cloudTxs) => {
              setTransactions(cloudTxs);
            }, (err) => {
              console.error('Subscription error:', err);
            });
          }
        } catch (e) {
          console.error('Failed to sync workspace session:', e);
        }
      } else {
        // Logged out / local mode active
        setFirebaseUser(null);
        setFamilyCode('LOCAL');
        setUserDisplayName(getTelegramUser().first_name);
        if (unsubscribeTxs) {
          unsubscribeTxs();
          unsubscribeTxs = null;
        }
        // Fallback transactions state to local offline records
        setTransactions(offlineTxs);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTxs) unsubscribeTxs();
    };
  }, [offlineTxs]);

  // Synchronise state changes to disk/cloud based on current session
  const handleAddTransaction = async (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    date: string;
  }) => {
    const creatorName = firebaseUser 
      ? (firebaseUser.displayName || firebaseUser.email || 'Член семьи') 
      : getTelegramUser().first_name;

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: data.amount,
      description: data.description || DEFAULT_CATEGORIES.find((c) => c.id === data.category)?.name || 'Операция',
      category: data.category,
      type: data.type,
      date: data.date,
      createdAt: Date.now(),
      familyCode,
      createdByUser: creatorName,
    };

    if (firebaseUser) {
      // Cloud database synced save
      try {
        await addTransactionToDb(newTx);
      } catch (err) {
        console.error('Cloud save failed:', err);
        showAlert('Ошибка при сохранении операции в облако. Проверьте стабильность соединения.');
      }
    } else {
      // Offline fallback save
      const updated = [newTx, ...offlineTxs];
      setOfflineTxs(updated);
      localStorage.setItem('tg_finance_transactions', JSON.stringify(updated));
    }
    
    setShowForm(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (firebaseUser) {
      // Cloud database synced delete
      try {
        await deleteTransactionFromDb(id);
        triggerHaptic.notification('success');
      } catch (err) {
        console.error('Cloud delete failed:', err);
        showAlert('Не удалось удалить операцию из облака. Проверьте сеть.');
      }
    } else {
      // Offline fallback delete
      const updated = offlineTxs.filter((t) => t.id !== id);
      setOfflineTxs(updated);
      localStorage.setItem('tg_finance_transactions', JSON.stringify(updated));
      triggerHaptic.notification('success');
    }
  };

  const handleJoinFamilyCode = async (newCode: string) => {
    if (!firebaseUser) return;
    try {
      await saveUserProfile(firebaseUser.uid, firebaseUser.displayName || 'Пользователь', newCode);
      setFamilyCode(newCode);
      setShowFamilySettings(false);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'history' | 'analytics' | 'about') => {
    triggerHaptic.selection();
    setActiveTab(tab);
  };

  const handleThemeToggle = () => {
    triggerHaptic.impact('light');
    setDarkMode((prev) => !prev);
  };

  const openAddForm = (type: 'income' | 'expense') => {
    setFormType(type);
    setShowForm(true);
  };

  return (
    <div className="bg-[#FAFBFD] dark:bg-slate-950 min-h-screen text-gray-800 dark:text-gray-100 antialiased font-sans flex flex-col justify-between selection:bg-slate-200">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto bg-white dark:bg-slate-900 border-x border-gray-100 dark:border-slate-800/60 min-h-screen shadow-md flex flex-col relative">
        
        {/* Core content scroll containers */}
        <main className="flex-1 px-5 pt-8 pb-24 overflow-y-auto">
          {/* New Transaction sliding Form */}
          {showForm && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs transition-all duration-300">
              <div className="absolute bottom-0 inset-x-0">
                <TransactionForm
                  categories={DEFAULT_CATEGORIES}
                  initialType={formType}
                  onSave={handleAddTransaction}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          )}

          {/* Family configuration sliding Modal */}
          {showFamilySettings && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs transition-all duration-300">
              <div className="absolute bottom-0 inset-x-0 overflow-y-auto max-h-[90vh]">
                <FamilySettings
                  user={firebaseUser}
                  familyCode={familyCode}
                  onClose={() => setShowFamilySettings(false)}
                  onJoinFamily={handleJoinFamilyCode}
                  onRefreshLogin={() => {}}
                />
              </div>
            </div>
          )}

          {/* Switch tab contents */}
          {activeTab === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              categories={DEFAULT_CATEGORIES}
              userDisplayName={userDisplayName}
              onAddTransactionClick={openAddForm}
              onViewAllClick={() => setActiveTab('history')}
              onTransactionDelete={handleDeleteTransaction}
              onFamilyClick={() => setShowFamilySettings(true)}
              firebaseUserConnected={firebaseUser !== null}
              darkMode={darkMode}
              onThemeToggle={handleThemeToggle}
            />
          )}

          {activeTab === 'history' && (
            <TransactionHistory
              transactions={transactions}
              categories={DEFAULT_CATEGORIES}
              onTransactionDelete={handleDeleteTransaction}
              darkMode={darkMode}
              onThemeToggle={handleThemeToggle}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics 
              transactions={transactions} 
              categories={DEFAULT_CATEGORIES} 
              darkMode={darkMode}
              onThemeToggle={handleThemeToggle}
            />
          )}

          {activeTab === 'about' && (
            <About
              darkMode={darkMode}
              onThemeToggle={handleThemeToggle}
            />
          )}
        </main>

        {/* Persistent Bottom Tabbar Navigation */}
        {!showForm && !showFamilySettings && (
          <nav className="fixed bottom-0 max-w-md md:max-w-2xl lg:max-w-4xl w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-100 dark:border-slate-800/80 py-2.5 px-4 md:px-8 grid grid-cols-4 gap-1 z-40 rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.03)] h-18">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`flex flex-col items-center justify-between text-[11px] font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'text-slate-900 dark:text-white scale-105'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-350'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-50' : ''}`}>
                <CategoryIcon name="Wallet" size={20} />
              </div>
              <span className="mb-0.5">Главная</span>
            </button>

            <button
              onClick={() => handleTabChange('history')}
              className={`flex flex-col items-center justify-between text-[11px] font-semibold transition-all ${
                activeTab === 'history'
                  ? 'text-slate-900 dark:text-white scale-105'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-350'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${activeTab === 'history' ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-50' : ''}`}>
                <CategoryIcon name="SlidersHorizontal" size={19} />
              </div>
              <span className="mb-0.5">Операции</span>
            </button>

            <button
              onClick={() => handleTabChange('analytics')}
              className={`flex flex-col items-center justify-between text-[11px] font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'text-slate-900 dark:text-white scale-105'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-350'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-50' : ''}`}>
                <CategoryIcon name="TrendingUp" size={20} />
              </div>
              <span className="mb-0.5">Аналитика</span>
            </button>

            <button
              onClick={() => handleTabChange('about')}
              className={`flex flex-col items-center justify-between text-[11px] font-semibold transition-all ${
                activeTab === 'about'
                  ? 'text-slate-900 dark:text-white scale-105'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-350'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${activeTab === 'about' ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-50' : ''}`}>
                <CategoryIcon name="Info" size={20} />
              </div>
              <span className="mb-0.5">О проекте</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
