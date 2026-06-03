/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind hex or class color representation
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string; // Category ID
  type: TransactionType;
  date: string; // ISO String (YYYY-MM-DD)
  createdAt: number; // Unix timestamp
  familyCode?: string; // ID of the shared family space
  createdByUser?: string; // Display name of creator user
}

export interface UserStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}
