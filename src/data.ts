/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Transaction } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Расходы (Expenses)
  { id: 'exp_food', name: 'Продукты', icon: 'Utensils', color: '#10B981', type: 'expense' }, // emerald
  { id: 'exp_cafe', name: 'Кафе и Рестораны', icon: 'Coffee', color: '#F59E0B', type: 'expense' }, // amber
  { id: 'exp_transport', name: 'Транспорт и Такси', icon: 'Car', color: '#3B82F6', type: 'expense' }, // blue
  { id: 'exp_leisure', name: 'Развлечения', icon: 'Sparkles', color: '#8B5CF6', type: 'expense' }, // violet
  { id: 'exp_shopping', name: 'Одежда и Покупки', icon: 'ShoppingBag', color: '#EC4899', type: 'expense' }, // pink
  { id: 'exp_home', name: 'Жилье и ЖКХ', icon: 'Home', color: '#06B6D4', type: 'expense' }, // cyan
  { id: 'exp_health', name: 'Здоровье и Аптека', icon: 'HeartPulse', color: '#EF4444', type: 'expense' }, // red
  { id: 'exp_other', name: 'Другие расходы', icon: 'HelpCircle', color: '#6B7280', type: 'expense' }, // gray

  // Доходы (Income)
  { id: 'inc_salary', name: 'Зарплата', icon: 'Briefcase', color: '#10B981', type: 'income' }, // emerald
  { id: 'inc_freelance', name: 'Подработка', icon: 'Laptop', color: '#3B82F6', type: 'income' }, // blue
  { id: 'inc_gift', name: 'Подарки', icon: 'Gift', color: '#EC4899', type: 'income' }, // pink
  { id: 'inc_invest', name: 'Инвестиции', icon: 'TrendingUp', color: '#F59E0B', type: 'income' }, // amber
  { id: 'inc_other', name: 'Другие доходы', icon: 'CircleDollarSign', color: '#14B8A6', type: 'income' } // teal
];

// Helper to get formatted ISO date string minus offset days
const getDateDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const getMockTransactions = (): Transaction[] => {
  return [
    {
      id: 't-1',
      amount: 45000,
      description: 'Аванс по зарплате',
      category: 'inc_salary',
      type: 'income',
      date: getDateDaysAgo(5),
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
    },
    {
      id: 't-2',
      amount: 1200,
      description: 'Супермаркет Перекресток',
      category: 'exp_food',
      type: 'expense',
      date: getDateDaysAgo(4),
      createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000 - 100000
    },
    {
      id: 't-3',
      amount: 15000,
      description: 'Разработка Telegram бота',
      category: 'inc_freelance',
      type: 'income',
      date: getDateDaysAgo(3),
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
    },
    {
      id: 't-4',
      amount: 850,
      description: 'Ужин в пиццерии',
      category: 'exp_cafe',
      type: 'expense',
      date: getDateDaysAgo(2),
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: 't-5',
      amount: 350,
      description: 'Поездка на Яндекс Такси',
      category: 'exp_transport',
      type: 'expense',
      date: getDateDaysAgo(1),
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
    },
    {
      id: 't-6',
      amount: 3200,
      description: 'Покупка новой футболки',
      category: 'exp_shopping',
      type: 'expense',
      date: getDateDaysAgo(0),
      createdAt: Date.now() - 60 * 60 * 1000
    },
    {
      id: 't-7',
      amount: 4300,
      description: 'Коммунальные платежи',
      category: 'exp_home',
      type: 'expense',
      date: getDateDaysAgo(1),
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000
    },
    {
      id: 't-8',
      amount: 600,
      description: 'Капли для глаз в аптеке',
      category: 'exp_health',
      type: 'expense',
      date: getDateDaysAgo(3),
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 - 50000
    },
    {
      id: 't-9',
      amount: 1500,
      description: 'Кино с друзьями',
      category: 'exp_leisure',
      type: 'expense',
      date: getDateDaysAgo(2),
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 - 30000
    }
  ];
};
