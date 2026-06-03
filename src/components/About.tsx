/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { triggerHaptic } from '../telegram';
import { CategoryIcon } from './CategoryIcon';

interface AboutProps {
  darkMode: boolean;
  onThemeToggle: () => void;
}

export const About: React.FC<AboutProps> = ({ darkMode, onThemeToggle }) => {
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            О приложении
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            История создания Lunaro и информация об авторе
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

      {/* Main Branding Card */}
      <div className="bg-radial from-indigo-900 via-slate-900 to-black p-6 rounded-3xl text-white shadow-xl relative overflow-hidden text-center">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 -ml-12 -mb-12 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-16 h-16 bg-white/10 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg">
          <CategoryIcon name="Sparkles" className="text-purple-300 animate-pulse" size={32} />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-white">Lunaro</h1>
        <p className="text-[11px] text-purple-300 font-mono tracking-widest uppercase mt-1">Семейный финансовый ассистент</p>
        
        <p className="text-sm text-gray-300 max-w-sm mx-auto mt-4 leading-relaxed">
          Умное и элегантное решение для ведения совместного или личного бюджета. Ведите учет доходов, контролируйте расходы и достигайте финансовых целей вместе в режиме реального времени.
        </p>
      </div>

      {/* Multi-column grid for tablets (md:grid-cols-2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* App Key Capabilities Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 p-2 rounded-xl">
              <CategoryIcon name="Wallet" size={18} />
            </span>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
              Возможности приложения
            </h3>
          </div>
          
          <ul className="space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
            <li className="flex items-start space-x-2.5">
              <span className="text-emerald-500 font-semibold mt-0.5">•</span>
              <div>
                <strong className="text-gray-800 dark:text-gray-100 block">Семейная Синхронизация</strong>
                Синхронизируйте транзакции с партнером, просто поделившись кодом семьи.
              </div>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="text-emerald-500 font-semibold mt-0.5">•</span>
              <div>
                <strong className="text-gray-800 dark:text-gray-100 block">Прекрасная Аналитика</strong>
                Понятные интерактивные графики распределения расходов по категориям.
              </div>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="text-emerald-500 font-semibold mt-0.5">•</span>
              <div>
                <strong className="text-gray-800 dark:text-gray-100 block">Offline-First</strong>
                Все транзакции моментально сохраняются локально, даже если интернет отсутствует.
              </div>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="text-emerald-500 font-semibold mt-0.5">•</span>
              <div>
                <strong className="text-gray-800 dark:text-gray-100 block">Умный Дизайн</strong>
                Приятные тактильные вибрации (Haptics), динамический темный режим и продуманные шрифты.
              </div>
            </li>
          </ul>
        </div>

        {/* Author details Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-500 p-2 rounded-xl">
                <CategoryIcon name="Laptop" size={18} />
              </span>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                Об авторе проекта
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                Бюджетный трекер <strong>Lunaro</strong> спроектирован и создан опытным веб-инженером, увлеченным разработкой безупречных интерфейсов и высокопроизводительных микросервисов.
              </p>
              <p>
                Главная идея проекта — превратить скучную рутину финансового планирования в приятное, тактильное и визуально вдохновляющее событие, которое мотивирует сохранять и приумножать семейный капитал.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-slate-800/50 flex items-center justify-between text-xs text-gray-400 dark:text-gray-550 font-mono">
            <span>Автор: Lunaro Dev</span>
            <span>Версия: 1.2.0</span>
          </div>
        </div>

      </div>

      {/* Decorative footer */}
      <div className="text-center text-[11px] text-gray-400 dark:text-gray-550 font-mono py-4">
        <p>© {new Date().getFullYear()} Lunaro. Все права защищены.</p>
        <p className="mt-1">Сделано с любовью к финансам и дизайну интерфейсов</p>
      </div>
    </div>
  );
};

export default About;
