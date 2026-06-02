import React from 'react';
import { LayoutDashboard, CreditCard, ArrowLeftRight, Settings, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ currentView, setView }: SidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-600 p-2">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">Runway Tracker</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              currentView === id 
                ? "bg-indigo-600 text-white" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">v1.2.0</p>
      </div>
    </aside>
  );
};
