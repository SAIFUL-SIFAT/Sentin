'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, FileText, Layout, Zap, ShieldCheck, Braces } from 'lucide-react';

interface DockItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface DockItemProps {
  item: DockItem;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  isActive: boolean;
}

const DockItemComponent: React.FC<DockItemProps> = ({ item, isHovered, onHover, isActive }) => {
  return (
    <div
      className="relative group flex flex-col items-center"
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      onClick={item.onClick}
    >
      <div
        className={`
          relative flex items-center justify-center
          w-12 h-12 rounded-xl
          backdrop-blur-xl transition-all duration-300 ease-out
          cursor-pointer
          ${isActive 
            ? 'bg-accent/20 border-accent/40 text-accent' 
            : 'bg-white/5 border-white/10 text-soft-white/60 hover:bg-white/10 hover:text-white'
          }
          border
          ${isHovered ? '-translate-y-1.5' : ''}
        `}
      >
        <div className={`
          transition-all duration-300
          ${isHovered ? 'scale-110' : ''}
        `}>
          {item.icon}
        </div>

        {isActive && (
          <motion.div 
            layoutId="active-dot"
            className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-accent"
          />
        )}
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2
            px-3 py-1.5 rounded-lg
            bg-black/80 backdrop-blur-md
            text-white text-[10px] font-mono uppercase tracking-widest
            border border-white/10
            pointer-events-none
            whitespace-nowrap
            shadow-2xl z-[110]"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface MinimalistDockProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const MinimalistDock: React.FC<MinimalistDockProps> = ({ currentView, onViewChange }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const dockItems: DockItem[] = [
    { id: 'home', icon: <Home size={18} strokeWidth={1.5} />, label: 'Home', onClick: () => onViewChange('home') },
    { id: 'category:documents', icon: <FileText size={18} strokeWidth={1.5} />, label: 'Documents', onClick: () => onViewChange('category:documents') },
    { id: 'category:pdf', icon: <Layout size={18} strokeWidth={1.5} />, label: 'PDF Suite', onClick: () => onViewChange('category:pdf') },
    { id: 'category:media', icon: <Zap size={18} strokeWidth={1.5} />, label: 'Media', onClick: () => onViewChange('category:media') },
    { id: 'category:security', icon: <ShieldCheck size={18} strokeWidth={1.5} />, label: 'Security', onClick: () => onViewChange('category:security') },
    { id: 'category:developer', icon: <Braces size={18} strokeWidth={1.5} />, label: 'Developer', onClick: () => onViewChange('category:developer') },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] md:hidden">
      <div className="relative">
        {/* Dock Container */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-[24px] bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {dockItems.map((item) => (
            <DockItemComponent
              key={item.id}
              item={item}
              isHovered={hoveredItem === item.id}
              onHover={setHoveredItem}
              isActive={currentView === item.id || (item.id === 'home' && currentView === 'home')}
            />
          ))}
        </div>
        
        {/* Subtle Reflection */}
        <div className="absolute top-full left-4 right-4 h-8 overflow-hidden opacity-20 pointer-events-none">
          <div className="flex items-center gap-2 transform scale-y-[-1] blur-sm">
            {dockItems.map((item) => (
              <div key={`ref-${item.id}`} className="w-12 h-12 flex items-center justify-center text-white">
                {item.icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalistDock;
