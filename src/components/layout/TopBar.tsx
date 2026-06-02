import React from 'react';

interface TopBarProps {
  title: string;
  children?: React.ReactNode;
}

export const TopBar = ({ title, children }: TopBarProps) => {
  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-6 justify-between">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        {children}
      </div>
    </header>
  );
};
