/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { triggerHaptic } from '../telegram';

interface AnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  darkMode: boolean;
  onThemeToggle: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ 
  transactions, 
  categories,
  darkMode,
  onThemeToggle,
}) => {
  const [analyticsType, setAnalyticsType] = useState<TransactionType>('expense');

  // Filter transactions of active type for the CURRENT MONTH to keep statistical context tight and clean
  const currentMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    const now = new Date();
    return (
      tDate.getMonth() === now.getMonth() &&
      tDate.getFullYear() === now.getFullYear() &&
      t.type === analyticsType
    );
  });

  const totalSum = currentMonthTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  interface CategoryTotal {
    category: Category;
    amount: number;
    percentage: number;
  }

  const categoryGroupingObj: Record<string, number> = {};
  currentMonthTransactions.forEach((t) => {
    categoryGroupingObj[t.category] = (categoryGroupingObj[t.category] || 0) + t.amount;
  });

  const groupedData: CategoryTotal[] = Object.keys(categoryGroupingObj)
    .map((catId) => {
      const category = categories.find((c) => c.id === catId) || {
        id: catId,
        name: 'Другое',
        icon: 'HelpCircle',
        color: '#6B7280',
        type: analyticsType,
      };

      const amount = categoryGroupingObj[catId];
      const percentage = totalSum > 0 ? Math.round((amount / totalSum) * 100) : 0;

      return {
        category,
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // General Metrics
  const averageTxVal =
    currentMonthTransactions.length > 0 ? Math.round(totalSum / currentMonthTransactions.length) : 0;

  const maxTxVal =
    currentMonthTransactions.length > 0
      ? Math.max(...currentMonthTransactions.map((t) => t.amount))
      : 0;

  // Pie chart variables
  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius; // Approx 314.16

  let accumulatedPercentage = 0;

  const handleTypeToggle = (type: TransactionType) => {
    triggerHaptic.selection();
    setAnalyticsType(type);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            Аналитика и Статистика
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Анализ за расчетный текущий месяц
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

      {/* Tabs */}
      <div className="bg-gray-100 dark:bg-slate-800/80 p-1 rounded-2xl flex relative h-11 w-full">
        <button
          onClick={() => handleTypeToggle('expense')}
          className={`flex-1 flex items-center justify-center font-semibold text-sm rounded-xl transition-all ${
            analyticsType === 'expense'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-450 shadow-xs'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Расходы
        </button>
        <button
          onClick={() => handleTypeToggle('income')}
          className={`flex-1 flex items-center justify-center font-semibold text-sm rounded-xl transition-all ${
            analyticsType === 'income'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-450 shadow-xs'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Доходы
        </button>
      </div>

      {groupedData.length === 0 ? (
        <div className="bg-gray-50/50 dark:bg-slate-950/40 rounded-2xl p-10 border border-dashed border-gray-200 dark:border-slate-800 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <CategoryIcon name="Info" className="text-gray-400 dark:text-gray-505" size={22} />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Нет данных для графиков</p>
          <p className="text-xs text-gray-400 dark:text-gray-550 mt-1">Добавьте транзакции этого месяца для аналитики.</p>
        </div>
      ) : (
        <>
          {/* Native SVG Circular Donut Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/60 flex flex-col items-center justify-center shadow-xs">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background Track */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="fill-transparent stroke-gray-50 dark:stroke-slate-800"
                  strokeWidth={strokeWidth}
                />

                {/* Segments */}
                {groupedData.map((data, idx) => {
                  const percentage = data.amount / totalSum;
                  const strokeLength = percentage * circumference;
                  const strokeOffset = circumference - accumulatedPercentage * circumference;

                  // Advance accumulated counter
                  accumulatedPercentage += percentage;

                  return (
                    <circle
                      key={data.category.id}
                      cx="60"
                      cy="60"
                      r={radius}
                      className="fill-transparent transition-all duration-500"
                      stroke={data.category.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Central text representation */}
              <div className="absolute text-center flex flex-col justify-center items-center">
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-550 uppercase tracking-widest font-mono">
                  ИТОГО
                </span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5 truncate max-w-[130px]">
                  {totalSum.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {/* Quick Legend indicators */}
            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2 mt-6 pt-5 border-t border-gray-100 dark:border-slate-800/60">
              {groupedData.slice(0, 4).map((data) => (
                <div key={data.category.id} className="flex items-center space-x-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: data.category.color }}
                  ></span>
                  <span className="text-gray-500 dark:text-gray-400 truncate">{data.category.name}</span>
                  <span className="text-gray-800 dark:text-gray-200 font-bold font-mono ml-auto">
                    {data.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Categorical Breakdowns */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono px-1">
              Разбивка по категориям
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/60 divide-y divide-gray-50 dark:divide-slate-800/50 overflow-hidden shadow-xs">
              {groupedData.map((data) => (
                <div key={data.category.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    <div
                      className="p-2 w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: `${data.category.color}15`,
                        color: data.category.color,
                      }}
                    >
                      <CategoryIcon name={data.category.icon} size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {data.category.name}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white font-mono text-xs">
                          {data.amount.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      
                      {/* Linear progress bar */}
                      <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${data.percentage}%`,
                            backgroundColor: data.category.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 font-mono ml-4 w-8 text-right shrink-0">
                    {data.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* General Math Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-xs space-y-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-550 font-mono leading-none">
                СРЕДНИЙ ЧЕК
              </p>
              <p className="text-md font-bold text-gray-800 dark:text-gray-100 font-mono">
                {averageTxVal.toLocaleString('ru-RU')} ₽
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-550">На одну транзакцию</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-xs space-y-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-550 font-mono leading-none">
                {analyticsType === 'expense' ? 'МАКС. РАСХОД' : 'МАКС. ДОХОД'}
              </p>
              <p className="text-md font-bold text-gray-800 dark:text-gray-100 font-mono">
                {maxTxVal.toLocaleString('ru-RU')} ₽
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-550">Было зафиксировано</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Analytics;
