/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TransactionType, Category, Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { triggerHaptic } from '../telegram';

interface TransactionFormProps {
  categories: Category[];
  initialType?: TransactionType;
  onSave: (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    date: string;
  }) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  initialType = 'expense',
  onSave,
  onCancel,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string>('');

  // Auto-filter categories based on type
  const filteredCategories = categories.filter((cat) => cat.type === type);

  // Auto-select first category of this type if current is empty or mismatched
  useEffect(() => {
    const currentCatObj = categories.find((c) => c.id === category);
    if (!currentCatObj || currentCatObj.type !== type) {
      if (filteredCategories.length > 0) {
        setCategory(filteredCategories[0].id);
      } else {
        setCategory('');
      }
    }
  }, [type, categories, filteredCategories, category]);

  const handleTypeChange = (newType: TransactionType) => {
    triggerHaptic.selection();
    setType(newType);
  };

  const handleCategorySelection = (catId: string) => {
    triggerHaptic.impact('light');
    setCategory(catId);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount.replace(/\s/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      triggerHaptic.notification('error');
      setError('Пожалуйста, введите корректную сумму больше нуля.');
      return;
    }

    if (!category) {
      triggerHaptic.notification('error');
      setError('Пожалуйста, выберите категорию.');
      return;
    }

    triggerHaptic.notification('success');
    onSave({
      amount: parsedAmount,
      description: description.trim(),
      category,
      type,
      date,
    });
  };

  const setRelativeDate = (offset: number) => {
    triggerHaptic.impact('light');
    const d = new Date();
    d.setDate(d.getDate() - offset);
    setDate(d.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className="bg-white dark:bg-slate-900 min-h-[85vh] rounded-t-3xl border-t border-gray-100 dark:border-slate-800 shadow-2xl p-6 relative text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            triggerHaptic.impact('light');
            onCancel();
          }}
          className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 p-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-705 rounded-lg transition-colors active:scale-90"
        >
          <CategoryIcon name="X" size={18} />
        </button>
        <h3 className="text-md font-bold tracking-tight text-gray-800 dark:text-gray-100">
          Новая операция
        </h3>
        <div className="w-8"></div> {/* Blank spacer */}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggle Expense/Income */}
        <div className="bg-gray-100 dark:bg-slate-950/50 p-1 rounded-2xl flex relative h-12 w-full">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 flex items-center justify-center font-semibold text-sm rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Расход
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 flex-1 flex items-center justify-center font-semibold text-sm rounded-xl transition-all ${
              type === 'income'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Доход
          </button>
        </div>

        {/* Input Amount Card */}
        <div className="bg-gray-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-gray-100 dark:border-slate-805/80 text-center space-y-2">
          <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
            Сумма операции
          </label>
          <div className="flex items-center justify-center text-center focus-within:ring-2 focus-within:ring-slate-800/10 rounded-xl transition-all">
            <input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              name="amount"
              id="amount-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-48 bg-transparent text-center text-3xl font-extrabold focus:outline-none placeholder-gray-300 dark:placeholder-gray-700 font-mono text-gray-800 dark:text-gray-100"
              required
              autoFocus
            />
            <span className="text-2xl font-bold ml-1 text-gray-400 dark:text-gray-500">₽</span>
          </div>
        </div>

        {/* Categories Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono mb-3 block">
            Категория
          </label>
          <div className="grid grid-cols-4 gap-3 max-h-[30vh] overflow-y-auto pr-1">
            {filteredCategories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelection(cat.id)}
                  className={`flex flex-col items-center p-2 rounded-2xl border transition-all active:scale-95 ${
                    isSelected
                      ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-800/50'
                      : 'border-gray-100 dark:border-slate-800/60 hover:border-gray-200 dark:hover:border-slate-700 bg-white dark:bg-slate-950/30'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5 shadow-xs"
                    style={{
                      backgroundColor: isSelected ? cat.color : `${cat.color}15`,
                      color: isSelected ? '#FFFFFF' : cat.color,
                    }}
                  >
                    <CategoryIcon name={cat.icon} size={18} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center truncate w-full">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Memo Input */}
        <div>
          <label htmlFor="memo-input" className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono mb-1 block">
            Описание / Бумажник
          </label>
          <input
            id="memo-input"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: Супермаркет Лента, Такси в аэропорт..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-slate-800 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-900 text-sm text-gray-800 dark:text-gray-200 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-600"
          />
        </div>

        {/* Date Selector */}
        <div>
          <label htmlFor="date-input" className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono mb-1.5 block">
            Дата операции
          </label>
          <div className="flex space-x-2 mb-2">
            <button
              type="button"
              onClick={() => setRelativeDate(0)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                date === todayStr
                  ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white'
                  : 'bg-white dark:bg-slate-950/40 border-gray-100 dark:border-slate-850 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              Сегодня
            </button>
            <button
              type="button"
              onClick={() => setRelativeDate(1)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                date === yesterdayStr
                  ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white'
                  : 'bg-white dark:bg-slate-950/40 border-gray-100 dark:border-slate-850 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              Вчера
            </button>
          </div>
          <input
            id="date-input"
            type="date"
            value={date}
            onChange={(e) => {
              triggerHaptic.selection();
              setDate(e.target.value);
            }}
            max={todayStr}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800/80 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 text-sm text-gray-500 dark:text-gray-400 font-mono"
            required
          />
        </div>

        {error && (
          <p className="text-xs text-rose-500 dark:text-rose-450 font-medium bg-rose-50 dark:bg-rose-955/35 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40">
            ⚠ {error}
          </p>
        )}

        {/* Buttons */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-12 bg-slate-900 dark:bg-slate-100 dark:active:bg-slate-200 active:bg-black font-semibold text-sm rounded-xl text-white dark:text-slate-950 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2"
          >
            <span>Сохранить</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default TransactionForm;
