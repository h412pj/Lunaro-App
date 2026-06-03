/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { triggerHaptic } from '../telegram';

interface TransactionHistoryProps {
  transactions: Transaction[];
  categories: Category[];
  onTransactionDelete: (id: string) => void;
  darkMode: boolean;
  onThemeToggle: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  categories,
  onTransactionDelete,
  darkMode,
  onThemeToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Helpers
  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId);
  };

  const handleTypePillChange = (type: TransactionType | 'all') => {
    triggerHaptic.selection();
    setFilterType(type);
  };

  const filteredTransactions = transactions
    .filter((t) => {
      // Filter by type
      if (filterType !== 'all' && t.type !== filterType) return false;

      // Filter by category
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const descriptionMatch = t.description.toLowerCase().includes(query);
        const categoryMatch = getCategory(t.category)?.name.toLowerCase().includes(query) || false;
        return descriptionMatch || categoryMatch;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort newest first
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff === 0) {
        return b.createdAt - a.createdAt; // Secondary sort on creation timestamp
      }
      return dateDiff;
    });

  // Group transactions by date
  interface DateGroup {
    date: string;
    items: Transaction[];
    totalIncome: number;
    totalExpense: number;
  }

  const groups: DateGroup[] = [];
  filteredTransactions.forEach((t) => {
    let group = groups.find((g) => g.date === t.date);
    if (!group) {
      group = { date: t.date, items: [], totalIncome: 0, totalExpense: 0 };
      groups.push(group);
    }
    group.items.push(t);
    if (t.type === 'income') {
      group.totalIncome += t.amount;
    } else {
      group.totalExpense += t.amount;
    }
  });

  const formatDateHeader = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    })();

    if (dateStr === today) {
      return 'Сегодня';
    } else if (dateStr === yesterday) {
      return 'Вчера';
    }

    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Unique categories belonging to current filterType
  const availableCategories = categories.filter(
    (c) => filterType === 'all' || c.type === filterType
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            История операций
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Полный список всех ваших доходов и расходов
          </p>
        </div>

        {/* Ambient Dark-Mode toggle button */}
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
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 dark:text-gray-500">
            <CategoryIcon name="Search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Поиск по названию или категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-slate-850 dark:focus:border-slate-700 text-sm placeholder-gray-400 text-gray-700 dark:text-gray-200 shadow-xs transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-550 hover:text-gray-600"
            >
              <CategoryIcon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Buttons / Tabs for Expense vs Income */}
        <div className="bg-gray-100 dark:bg-slate-800/80 p-0.5 rounded-lg flex text-xs font-semibold h-9 items-center">
          <button
            onClick={() => handleTypePillChange('all')}
            className={`flex-1 text-center py-1.5 rounded-md transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-405 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => handleTypePillChange('expense')}
            className={`flex-1 text-center py-1.5 rounded-md transition-all ${
              filterType === 'expense'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-gray-500 dark:text-gray-405 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Расходы
          </button>
          <button
            onClick={() => handleTypePillChange('income')}
            className={`flex-1 text-center py-1.5 rounded-md transition-all ${
              filterType === 'income'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-500 dark:text-gray-405 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Доходы
          </button>
        </div>

        {/* Category Pill Horizontal scroll filtering */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide shrink-0 max-w-full">
          <button
            onClick={() => {
              triggerHaptic.selection();
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-slate-800/80 hover:border-gray-200 dark:hover:border-slate-700'
            }`}
          >
            Все категории
          </button>

          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic.selection();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border shrink-0 flex items-center space-x-1.5 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-slate-800/80 hover:border-gray-200 dark:hover:border-slate-700'
              }`}
            >
              <span style={{ color: selectedCategory === cat.id ? (darkMode ? '#0F172A' : '#FFFFFF') : cat.color }}>
                <CategoryIcon name={cat.icon} size={13} />
              </span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* History List Grouped */}
      <div className="space-y-5">
        {groups.length === 0 ? (
          <div className="bg-gray-50/50 dark:bg-slate-950/40 rounded-2xl p-10 border border-dashed border-gray-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <CategoryIcon name="Info" className="text-gray-400 dark:text-gray-500" size={22} />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Операции не найдены</p>
            <p className="text-xs text-gray-400 dark:text-gray-550 mt-1">
              Попробуйте изменить параметры поиска или фильтров.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Daily Header */}
              <div className="flex items-center justify-between text-xs px-1 text-gray-400 dark:text-gray-500 font-medium font-mono">
                <span>{formatDateHeader(group.date)}</span>
                <div className="space-x-2">
                  {group.totalIncome > 0 && (
                    <span className="text-emerald-500 font-bold">
                      +{group.totalIncome.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                  {group.totalExpense > 0 && (
                    <span className="text-gray-600 dark:text-gray-400 font-bold">
                      -{group.totalExpense.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in This Day Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/60 divide-y divide-gray-50 dark:divide-slate-800/50 overflow-hidden shadow-xs">
                {group.items.map((t) => {
                  const category = getCategory(t.category);
                  return (
                    <div key={t.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div
                          className="p-2.5 rounded-xl shrink-0 flex items-center justify-center"
                          style={{
                            backgroundColor: `${category?.color}15`,
                            color: category?.color,
                          }}
                        >
                          <CategoryIcon name={category?.icon || 'HelpCircle'} size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-150 truncate">
                            {t.description || category?.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-550 truncate mt-0.5">
                            {category?.name} {t.createdByUser ? `• ${t.createdByUser}` : ''}
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
                          className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-lg transition-colors active:scale-95"
                        >
                          <CategoryIcon name="Trash2" size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default TransactionHistory;
