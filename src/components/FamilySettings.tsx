/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { auth, googleProvider, saveUserProfile } from '../firebase';
import { signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { CategoryIcon } from './CategoryIcon';
import { triggerHaptic, showAlert, isTelegram } from '../telegram';

interface FamilySettingsProps {
  user: FirebaseUser | null;
  familyCode: string;
  onClose: () => void;
  onJoinFamily: (code: string) => Promise<void>;
  onRefreshLogin: () => void;
}

export const FamilySettings: React.FC<FamilySettingsProps> = ({
  user,
  familyCode,
  onClose,
  onJoinFamily,
  onRefreshLogin,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    triggerHaptic.impact('medium');
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      triggerHaptic.notification('success');
      onRefreshLogin();
    } catch (e: any) {
      console.error(e);
      triggerHaptic.notification('error');
      // Graceful help explaining popup constraints inside some frame sandboxes
      setError('Не удалось открыть окно авторизации Google. Если вы открыли приложение внутри Telegram, нажмите три точки сверху справа и выберите "Открыть в браузере", чтобы войти в Google аккаунт.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    triggerHaptic.impact('light');
    if (confirm('Вы уверены, что хотите выйти из аккаунта? Свежие данные перестанут синхронизироваться в облако.')) {
      setLoading(true);
      try {
        await signOut(auth);
        triggerHaptic.notification('success');
        onRefreshLogin();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopyCode = () => {
    triggerHaptic.impact('light');
    navigator.clipboard.writeText(familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    if (code === familyCode) {
      triggerHaptic.notification('warning');
      setError('Вы уже находитесь в этом семейном пространстве.');
      return;
    }

    if (!/^[A-Z0-9_-]+$/.test(code)) {
      triggerHaptic.notification('error');
      setError('Код может содержать только латинские буквы, цифры и дефис.');
      return;
    }

    setLoading(true);
    try {
      await onJoinFamily(code);
      triggerHaptic.notification('success');
      setInputCode('');
      showAlert('Вы успешно присоединились к новому семейному бюджету!');
    } catch (e: any) {
      triggerHaptic.notification('error');
      setError('Ошибка при смене семейного кода. Убедитесь в стабильности сети.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-[90vh] rounded-t-3xl border-t border-gray-100 dark:border-slate-800 shadow-2xl p-6 relative max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            triggerHaptic.impact('light');
            onClose();
          }}
          className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 p-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors active:scale-90"
        >
          <CategoryIcon name="X" size={18} />
        </button>
        <h3 className="text-md font-bold tracking-tight text-gray-800 dark:text-gray-100">
          Семейный доступ и Синхронизация
        </h3>
        <div className="w-8"></div>
      </div>

      <div className="space-y-6">
        {!user ? (
          /* Locked State Banner */
          <div className="space-y-6">
            <div className="bg-blue-50/75 dark:bg-sky-950/25 rounded-2xl p-5 border border-blue-100 dark:border-sky-900/30 space-y-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-500 dark:text-sky-400 shadow-xs">
                <CategoryIcon name="TrendingUp" size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Совместный учет расходов</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Синхронизируйте свои доходы и траты с супругом, партнером или членами семьи в реальном времени. Все изменения мгновенно отобразятся на других устройствах!
                </p>
              </div>
            </div>

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full h-12 bg-slate-900 dark:bg-slate-100 dark:active:bg-slate-200 active:bg-black font-semibold text-sm rounded-xl text-white dark:text-slate-950 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2.5 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {/* Google Custom Clean Icon representation */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.5 1.7l2.4-2.4C17.3 1.5 14.9.5 12.24.5c-5.8 0-10.5 4.7-10.5 10.5s4.7 10.5 10.5 10.5c6 0 10.4-4.2 10.4-10.5 0-.7-.1-1.3-.2-1.7H12.24z"/>
                  </svg>
                  <span>Войти с Google</span>
                </>
              )}
            </button>

            {error && (
              <p className="text-xs text-rose-500 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 font-medium leading-relaxed">
                ⚠ {error}
              </p>
            )}

            <div className="bg-amber-50/70 dark:bg-amber-950/25 p-4.5 rounded-xl border border-amber-100/50 dark:border-amber-900/30 flex space-x-2.5">
              <span className="text-amber-500 shrink-0"><CategoryIcon name="Info" size={18} /></span>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Сейчас вы используете <strong>Локальный режим</strong>. Данные хранятся только в памяти вашего браузера. Чтобы подключить семью, войдите в аккаунт!
              </p>
            </div>
          </div>
        ) : (
          /* Authenticated Active Sync */
          <div className="space-y-6">
            {/* Connected Badge */}
            <div className="bg-emerald-50 dark:bg-emerald-950/25 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="bg-emerald-500 text-white p-2 rounded-xl">
                  <CategoryIcon name="Briefcase" size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">Статус облака</h4>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Облако подключено</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-450">LIVE</span>
              </div>
            </div>

            {/* Account Details CARD */}
            <div className="space-y-1 bg-gray-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-805/80">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider block">Авторизован</span>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.displayName || 'Пользователь Google'}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">{user.email}</p>
            </div>

            {/* FAMILY CODE SHARING CARD */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-5 relative overflow-hidden space-y-4">
              <div className="absolute right-0 top-0 -mr-10 -mt-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono tracking-wider uppercase block">
                  Ваш семейный код
                </span>
                <p className="text-xs text-slate-300 dark:text-slate-400">
                  Поделитесь им, чтобы объединить кошельки
                </p>
              </div>

              <div className="bg-white/10 dark:bg-white/5 p-3 rounded-xl flex items-center justify-between">
                <span className="font-mono text-lg font-bold tracking-widest text-emerald-300 dark:text-emerald-400 pl-1">
                  {familyCode}
                </span>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="bg-white text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-lg active:scale-95 transition-transform shrink-0 flex items-center space-x-1 hover:bg-slate-100"
                >
                  <CategoryIcon name={copied ? 'Briefcase' : 'ShoppingBag'} size={14} />
                  <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
            </div>

            {/* JOIN FAMILY BENTOS FORM */}
            <form onSubmit={handleJoin} className="space-y-2.5">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono block">
                Подключить другой семейный код
              </label>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-normal">
                При вводе чужого кода, вы сотрете текущую локальную привязку и переключитесь на общий семейный бюджет этого кода.
              </p>
              <div className="flex space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="ВВЕДИТЕ СЕМЕЙНЫЙ КОД"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-800/80 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 text-sm text-gray-700 dark:text-gray-200 font-mono font-bold uppercase placeholder-gray-400 dark:placeholder-gray-600"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 dark:bg-slate-100 dark:text-slate-950 text-white font-semibold text-xs px-4 rounded-xl hover:bg-black dark:hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  Объединить
                </button>
              </div>
            </form>

            {error && (
              <p className="text-xs text-rose-500 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 font-medium">
                ⚠ {error}
              </p>
            )}

            {/* Logout button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-3 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 active:bg-gray-50 dark:active:bg-slate-800/60 font-semibold text-xs rounded-xl text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-2.5 transition-all"
              >
                <span>Выйти из аккаунта</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FamilySettings;
