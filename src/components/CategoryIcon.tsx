/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Utensils,
  Coffee,
  Car,
  Sparkles,
  ShoppingBag,
  Home,
  HeartPulse,
  HelpCircle,
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  CircleDollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Plus,
  Calendar,
  X,
  Search,
  SlidersHorizontal,
  TrendingDown,
  Info,
  Sun,
  Moon
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = '', size = 20 }) => {
  const map: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Utensils,
    Coffee,
    Car,
    Sparkles,
    ShoppingBag,
    Home,
    HeartPulse,
    HelpCircle,
    Briefcase,
    Laptop,
    Gift,
    TrendingUp,
    CircleDollarSign,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Trash2,
    Edit2,
    Plus,
    Calendar,
    X,
    Search,
    SlidersHorizontal,
    TrendingDown,
    Info,
    Sun,
    Moon
  };

  const Component = map[name] || HelpCircle;
  return <Component className={className} size={size} />;
};

export default CategoryIcon;
