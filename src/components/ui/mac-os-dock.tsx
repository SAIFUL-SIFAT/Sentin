'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

// Types for the component
export interface DockApp {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  content?: React.ReactNode;
}

interface MacOSDockProps {
  apps: DockApp[];
  onAppClick: (appId: string) => void;
  onAppHover?: (appId: string, isHovering: boolean) => void;
  openApps?: string[];
  className?: string;
}

const MacOSDock: React.FC<MacOSDockProps> = ({ 
  apps, 
  onAppClick, 
  onAppHover,
  openApps = [],
  className = ''
}) => {
  const [mousePos, setMousePos] = useState<number | null>(null);
  const [currentScales, setCurrentScales] = useState<number[]>(apps.map(() => 1));
  const [currentPositions, setCurrentPositions] = useState<number[]>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastMouseMoveTime = useRef<number>(0);

  // Responsive size calculations based on viewport
  const getResponsiveConfig = useCallback(() => {
    if (typeof window === 'undefined') {
      return { baseIconSize: 52, maxScale: 1.4, effectWidth: 200 };
    }

    const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
    
    if (smallerDimension < 480) {
      return {
        baseIconSize: 40,
        maxScale: 1.2,
        effectWidth: 150
      };
    } else if (smallerDimension < 768) {
      return {
        baseIconSize: 44,
        maxScale: 1.3,
        effectWidth: 180
      };
    } else {
      return {
        baseIconSize: 52,
        maxScale: 1.5,
        effectWidth: 250
      };
    }
  }, []);

  const [config, setConfig] = useState(getResponsiveConfig);
  const { baseIconSize, maxScale, effectWidth } = config;
  const minScale = 1.0;
  const baseSpacing = 8;

  useEffect(() => {
    const handleResize = () => {
      setConfig(getResponsiveConfig());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getResponsiveConfig]);

  const calculateTargetMagnification = useCallback((mousePosition: number | null) => {
    if (mousePosition === null) {
      return apps.map(() => minScale);
    }

    return apps.map((_, index) => {
      const normalIconCenter = (index * (baseIconSize + baseSpacing)) + (baseIconSize / 2);
      const minX = mousePosition - (effectWidth / 2);
      const maxX = mousePosition + (effectWidth / 2);
      
      if (normalIconCenter < minX || normalIconCenter > maxX) {
        return minScale;
      }
      
      const theta = ((normalIconCenter - minX) / effectWidth) * 2 * Math.PI;
      const cappedTheta = Math.min(Math.max(theta, 0), 2 * Math.PI);
      const scaleFactor = (1 - Math.cos(cappedTheta)) / 2;
      
      return minScale + (scaleFactor * (maxScale - minScale));
    });
  }, [apps, baseIconSize, baseSpacing, effectWidth, maxScale, minScale]);

  const calculatePositions = useCallback((scales: number[]) => {
    let currentX = 0;
    
    return scales.map((scale) => {
      const scaledWidth = baseIconSize * scale;
      const centerX = currentX + (scaledWidth / 2);
      currentX += scaledWidth + baseSpacing;
      return centerX;
    });
  }, [baseIconSize, baseSpacing]);

  useEffect(() => {
    const initialScales = apps.map(() => minScale);
    const initialPositions = calculatePositions(initialScales);
    setCurrentScales(initialScales);
    setCurrentPositions(initialPositions);
  }, [apps, calculatePositions, minScale, config]);

  const animateToTarget = useCallback(() => {
    const targetScales = calculateTargetMagnification(mousePos);
    const lerpFactor = mousePos !== null ? 0.15 : 0.08;

    setCurrentScales(prevScales => {
      let changed = false;
      const nextScales = prevScales.map((currentScale, index) => {
        const target = targetScales[index] || minScale;
        const diff = target - currentScale;
        if (Math.abs(diff) < 0.001) return target;
        changed = true;
        return currentScale + (diff * lerpFactor);
      });
      return changed ? nextScales : prevScales;
    });

    if (mousePos !== null || currentScales.some((s, i) => Math.abs(s - (targetScales[i] || minScale)) > 0.001)) {
      animationFrameRef.current = requestAnimationFrame(animateToTarget);
    }
  }, [mousePos, calculateTargetMagnification, minScale, currentScales]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateToTarget);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animateToTarget]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      setMousePos(e.clientY - rect.top);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  const handleAppClick = (appId: string, index: number) => {
    if (iconRefs.current[index]) {
      const el = iconRefs.current[index]!;
      el.animate([
        { transform: 'translateY(0) scale(1)', filter: 'brightness(1)' },
        { transform: 'translateY(-25px) scale(1.1)', filter: 'brightness(1.2)' },
        { transform: 'translateY(0) scale(1)', filter: 'brightness(1)' }
      ], {
        duration: 500,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      });
    }
    onAppClick(appId);
  };

  const padding = 16;

  return (
    <div 
      ref={dockRef}
      className={`relative flex flex-col items-end justify-center ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: `${baseIconSize * maxScale + padding}px`,
        padding: `${padding/2}px ${padding}px ${padding/2}px 0`,
        background: 'rgba(15, 15, 15, 0.8)',
        backdropFilter: 'blur(40px) saturate(150%)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        height: 'fit-content'
      }}
    >
      <div className="flex flex-col items-end gap-3 w-full py-2">
        {apps.map((app, index) => {
          const scale = currentScales[index] || 1;
          
          return (
            <div
              key={app.id}
              ref={(el) => { iconRefs.current[index] = el; }}
              className="relative cursor-pointer flex flex-row items-center justify-end group/item"
              onClick={() => handleAppClick(app.id, index)}
              onMouseEnter={() => onAppHover?.(app.id, true)}
              onMouseLeave={() => onAppHover?.(app.id, false)}
              style={{
                width: `${baseIconSize * scale}px`,
                height: `${baseIconSize * scale}px`,
                marginRight: `${(scale - 1) * baseIconSize / 2.5}px`,
                transition: 'margin-right 0.1s ease-out'
              }}
            >
              <div className="w-full h-full flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-[22%] group-hover/item:bg-white/10 group-hover/item:border-white/20 transition-all duration-300 shadow-lg relative overflow-visible">
                <div className="w-3/5 h-3/5 flex items-center justify-center text-soft-white/60 group-hover/item:text-accent transition-all duration-300 transform group-active/item:scale-90">
                  {app.icon}
                </div>
              </div>
              
              {openApps.includes(app.id) && (
                <div 
                  className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(74,222,128,0.8)] z-10"
                />
              )}

              {app.content && (
                <div className="absolute right-[calc(100%+20px)] top-1/2 -translate-y-1/2 z-[200]">
                  {app.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MacOSDock;
