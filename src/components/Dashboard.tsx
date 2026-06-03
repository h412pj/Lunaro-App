/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { triggerHaptic } from '../telegram';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  userDisplayName: string;
  onAddTransactionClick: (type: 'income' | 'expense') => void;
  onViewAllClick: () => void;
  onTransactionDelete: (id: string) => void;
  onFamilyClick: () => void;
  firebaseUserConnected: boolean;
  darkMode: boolean;
  onThemeToggle: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  categories,
  userDisplayName,
  onAddTransactionClick,
  onViewAllClick,
  onTransactionDelete,
  onFamilyClick,
  firebaseUserConnected,
  darkMode,
  onThemeToggle,
}) => {
  const [activeRange, setActiveRange] = useState<'month' | 'all'>('month');

  // Filter transactions based on selected range
  const filteredTransactions = transactions.filter((t) => {
    if (activeRange === 'all') return true;
    
    // Check if within current calendar month
    const tDate = new Date(t.date);
    const now = new Date();
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
  });

  // Calculations
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = transactions
    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

  // Get category helper
  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId);
  };

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const handleQuickAdd = (type: 'income' | 'expense') => {
    triggerHaptic.impact('medium');
    onAddTransactionClick(type);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* User Hello Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => {
              triggerHaptic.impact('light');
              onFamilyClick();
            }}
            className="w-11 h-11 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform relative shrink-0"
          >
            <CategoryIcon name="Briefcase" size={18} />
            {firebaseUserConnected ? (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            )}
          </button>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-400 font-mono tracking-wider block uppercase leading-none">СЕМЬЯ</span>
            <span className="text-md font-bold text-gray-800 dark:text-gray-100 tracking-tight block mt-1 truncate max-w-[130px]">
              {userDisplayName}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          {/* Beautiful Ambient Theme Toggle */}
          <button
            onClick={() => {
              triggerHaptic.impact('light');
              onThemeToggle();
            }}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 flex items-center justify-center active:scale-90 transition-all hover:bg-gray-200 dark:hover:bg-slate-700/80"
            title="Переключить тему"
          >
            <CategoryIcon name={darkMode ? "Sun" : "Moon"} size={16} />
          </button>

          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs font-medium shrink-0">
            <button
              onClick={() => {
                triggerHaptic.selection();
                setActiveRange('month');
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRange === 'month'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => {
                triggerHaptic.selection();
                setActiveRange('all');
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeRange === 'all'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Все
            </button>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-radial from-slate-900 via-slate-900 to-black p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 -ml-10 -mb-10 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Общий Баланс счета</p>
        <p className="text-3xl font-bold tracking-tight mt-1 truncate">
          {formatCurrency(totalBalance)}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
              <span className="bg-emerald-500/20 p-1 rounded-full"><CategoryIcon name="ArrowDownLeft" size={14} /></span>
              <span>Доходы за период</span>
            </div>
            <p className="text-lg font-semibold mt-1 text-emerald-100 truncate">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-medium">
              <span className="bg-rose-500/20 p-1 rounded-full"><CategoryIcon name="ArrowUpRight" size={14} /></span>
              <span>Расходы за период</span>
            </div>
            <p className="text-lg font-semibold mt-1 text-rose-100 truncate">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Tablet-Responsive Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 space-y-6 md:space-y-0 items-start border-0">
        
        {/* Left column on tablets - Quick Access Actions */}
        <div className="md:col-span-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
            Быстрые операции
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <button
              onClick={() => handleQuickAdd('expense')}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-xs transition-transform active:scale-[0.98] text-left"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Добавить расход</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Траты, покупки</p>
              </div>
              <span className="bg-rose-50 dark:bg-rose-955/40 text-rose-500 dark:text-rose-400 p-2.5 rounded-xl shrink-0 ml-1">
                <CategoryIcon name="TrendingDown" size={20} />
              </span>
            </button>

            <button
              onClick={() => handleQuickAdd('income')}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-xs transition-transform active:scale-[0.98] text-left"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Добавить доход</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Зарплата, перевод</p>
              </div>
              <span className="bg-emerald-50 dark:bg-emerald-955/40 text-emerald-500 dark:text-emerald-400 p-2.5 rounded-xl shrink-0 ml-1">
                <CategoryIcon name="Wallet" size={20} />
              </span>
            </button>
          </div>
        </div>

        {/* Right column on tablets - Recent Transactions List */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
              Последние операции
            </h3>
            <button
              onClick={() => {
                triggerHaptic.impact('light');
                onViewAllClick();
              }}
              className="text-xs font-semibold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              Все
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="bg-gray-50/50 dark:bg-slate-950/40 rounded-2xl p-8 border border-dashed border-gray-200 dark:border-slate-800 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <CategoryIcon name="Info" className="text-gray-400 dark:text-gray-500" size={22} />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Нет операций за выбранный период</p>
              <p className="text-xs text-gray-400 dark:text-gray-550 mt-1">Добавьте доходы или расходы кнопками!</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/60 divide-y divide-gray-50 dark:divide-slate-800/50 overflow-hidden shadow-xs font-sans">
              {recentTransactions.map((t) => {
                const category = getCategory(t.category);
                return (
                  <div key={t.id} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className="p-2.5 rounded-xl shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: `${category?.color}15`, color: category?.color }}
                      >
                        <CategoryIcon name={category?.icon || 'HelpCircle'} size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                          {t.description || category?.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-550 truncate mt-0.5">
                          {category?.name} {t.createdByUser ? `• ${t.createdByUser}` : ''} • {new Date(t.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 pr-1 shrink-0">
                      <span
                        className={`text-sm font-semibold font-mono ${
                          t.type === 'income' ? 'text-emerald-500' : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('ru-RU')} ₽
                      </span>

                      <button
                        onClick={() => {
                          triggerHaptic.impact('rigid');
                          if (confirm(`Удалить операцию "${t.description || category?.name}"?`)) {
                            onTransactionDelete(t.id);
                          }
                        }}
                        className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-lg transition-colors active:scale-90"
                      >
                        <CategoryIcon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
