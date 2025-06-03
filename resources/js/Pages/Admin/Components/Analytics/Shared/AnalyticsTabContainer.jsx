/**
 * Main tab container for unified analytics dashboard
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  PiggyBank, 
  Tags, 
  Target, 
  CreditCard, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllTabs, getTabConfig, TAB_GROUPS } from '../Utils/tabConfiguration';

// Icon mapping
const ICONS = {
  BarChart3,
  PiggyBank,
  Tags,
  Target,
  CreditCard,
  TrendingUp
};

const AnalyticsTabContainer = ({ 
  activeTab, 
  onTabChange, 
  isLoading = false,
  className,
  children,
  showTabIndicators = true,
  variant = 'default', // 'default' | 'compact' | 'pills'
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  enableKeyboardNavigation = true
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState([]);
  const [overflowTabs, setOverflowTabs] = useState([]);
  
  // Use a ref to prevent recomputation on every render
  const tabsContainerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const previousSizeRef = useRef({ width: 0, height: 0 });
  
  // Compute hasOverflowItems property instead of using state
  const hasOverflowItems = overflowTabs.length > 0;

  // Memoize tabs to prevent unnecessary recalculations
  const tabs = useMemo(() => getAllTabs(), []);

  // Handle responsive design with optimized checks
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      
      // Only update state if it actually changed
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
      
      // Calculate visible and overflow tabs based on screen size
      const calculateTabVisibility = () => {
        let visibleTabList = [];
        let overflowTabList = [];
        
        if (mobile) {
          // On mobile, show primary tabs first, overflow the rest
          const primaryTabs = tabs.filter(tab => 
            TAB_GROUPS.PRIMARY.includes(tab.id)
          );
          const secondaryTabs = tabs.filter(tab => 
            TAB_GROUPS.SECONDARY.includes(tab.id)
          );
          
          visibleTabList = primaryTabs.slice(0, 3);
          overflowTabList = [...primaryTabs.slice(3), ...secondaryTabs];
        } else {
          visibleTabList = tabs;
          overflowTabList = [];
        }
        
        // Only update states if they actually changed
        const newVisibleJSON = JSON.stringify(visibleTabList.map(t => t.id));
        const currentVisibleJSON = JSON.stringify(visibleTabs.map(t => t.id));
        
        if (newVisibleJSON !== currentVisibleJSON) {
          setVisibleTabs(visibleTabList);
        }
        
        const newOverflowJSON = JSON.stringify(overflowTabList.map(t => t.id));
        const currentOverflowJSON = JSON.stringify(overflowTabs.map(t => t.id));
        
        if (newOverflowJSON !== currentOverflowJSON) {
          setOverflowTabs(overflowTabList);
        }
      };
      
      calculateTabVisibility();
    };

    checkMobile();
    
    // Use ResizeObserver instead of resize event for better performance
    if (!resizeObserverRef.current && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        
        // Only recalculate if size changed significantly
        if (
          Math.abs(width - previousSizeRef.current.width) > 50 ||
          Math.abs(height - previousSizeRef.current.height) > 20
        ) {
          previousSizeRef.current = { width, height };
          checkMobile();
        }
      });
      
      if (tabsContainerRef.current) {
        resizeObserverRef.current.observe(tabsContainerRef.current);
      }
    } else {
      // Fallback to resize event listener
      window.addEventListener('resize', checkMobile);
    }
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', checkMobile);
      }
    };
  }, [tabs, isMobile]);

  // Get tab icon component - memoized
  const getTabIcon = useCallback((iconName) => {
    const IconComponent = ICONS[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  }, []);

  // Get tab color classes - memoized
  const getTabColorClasses = useCallback((tab, isActive) => {
    const colorMap = {
      blue: isActive 
        ? 'bg-blue-100 text-blue-700 border-blue-300' 
        : 'text-blue-600 hover:bg-blue-50',
      green: isActive 
        ? 'bg-green-100 text-green-700 border-green-300' 
        : 'text-green-600 hover:bg-green-50',
      purple: isActive 
        ? 'bg-purple-100 text-purple-700 border-purple-300' 
        : 'text-purple-600 hover:bg-purple-50',
      orange: isActive 
        ? 'bg-orange-100 text-orange-700 border-orange-300' 
        : 'text-orange-600 hover:bg-orange-50',
      red: isActive 
        ? 'bg-red-100 text-red-700 border-red-300' 
        : 'text-red-600 hover:bg-red-50',
      emerald: isActive 
        ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
        : 'text-emerald-600 hover:bg-emerald-50'
    };
    
    return colorMap[tab.color] || (isActive 
      ? 'bg-gray-100 text-gray-700 border-gray-300' 
      : 'text-gray-600 hover:bg-gray-50');
  }, []);

  // Render individual tab - memoized to prevent unnecessary re-renders
  const renderTab = useCallback((tab, isActive, showIcon = true, showTitle = true) => {
    const baseClasses = cn(
      'relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    );

    const variantClasses = {
      default: cn(
        'border',
        isActive 
          ? 'bg-white shadow-sm' 
          : 'bg-transparent border-transparent hover:border-gray-200'
      ),
      compact: cn(
        'px-2 py-1.5 text-xs',
        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      ),
      pills: cn(
        'rounded-full px-4',
        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
      )
    };

    return (
      <Button
        key={tab.id}
        variant="ghost"
        className={cn(
          baseClasses,
          variantClasses[variant],
          getTabColorClasses(tab, isActive),
          orientation === 'vertical' && 'w-full justify-start'
        )}
        onClick={() => onTabChange(tab.id)}
        disabled={isLoading}
        aria-selected={isActive}
        role="tab"
      >
        {showIcon && getTabIcon(tab.icon)}
        {showTitle && (
          <span className={cn(
            isMobile && variant !== 'compact' && 'hidden sm:inline'
          )}>
            {tab.title}
          </span>
        )}
        
        {/* Loading indicator */}
        {isLoading && isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
            <div className="h-3 w-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
        
        {/* Tab indicator */}
        {showTabIndicators && isActive && (
          <div className={cn(
            'absolute bg-current',
            orientation === 'horizontal' 
              ? 'bottom-0 left-0 right-0 h-0.5' 
              : 'left-0 top-0 bottom-0 w-0.5'
          )} />
        )}
      </Button>
    );
  }, [getTabColorClasses, getTabIcon, isMobile, isLoading, onTabChange, orientation, showTabIndicators, variant]);

  // Render overflow menu - memoized using useCallback
  const renderOverflowMenu = useCallback(() => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {overflowTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <DropdownMenuItem
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2',
                isActive && 'bg-gray-100'
              )}
            >
              {getTabIcon(tab.icon)}
              <span>{tab.title}</span>
              {isActive && (
                <Badge variant="secondary" className="ml-auto">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  ), [overflowTabs, activeTab, onTabChange, getTabIcon]);

  // Navigation arrows for horizontal scrolling - memoized using useCallback
  const renderNavigationArrows = useCallback(() => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        onClick={() => {
          const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          onTabChange(tabs[prevIndex].id);
        }}
        disabled={isLoading}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        onClick={() => {
          const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
          const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          onTabChange(tabs[nextIndex].id);
        }}
        disabled={isLoading}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  ), [tabs, activeTab, onTabChange, isLoading]);

  // Loading skeleton
  const renderLoadingSkeleton = useCallback(() => (
    <div className={cn(
      'flex gap-2',
      orientation === 'vertical' && 'flex-col'
    )}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-9',
            orientation === 'horizontal' ? 'w-24' : 'w-full'
          )} 
        />
      ))}
    </div>
  ), [orientation]);

  if (isLoading && !activeTab) {
    return renderLoadingSkeleton();
  }

  // Tab description - memoized
  const tabDescription = useMemo(() => {
    return activeTab ? getTabConfig(activeTab).description : null;
  }, [activeTab]);

  return (
    <div 
      className={cn(
        'analytics-tab-container',
        orientation === 'vertical' ? 'flex flex-col' : 'flex flex-col',
        className
      )}
      role="tablist"
      aria-orientation={orientation}
      ref={tabsContainerRef}
    >
      {/* Tab Navigation */}
      <div className={cn(
        'flex items-center gap-2 p-1 bg-gray-50 rounded-lg',
        orientation === 'vertical' ? 'flex-col w-48' : 'flex-row',
        isMobile && 'bg-white border-b'
      )}>
        {/* Visible tabs */}
        <div className={cn(
          'flex gap-1',
          orientation === 'vertical' ? 'flex-col w-full' : 'flex-row flex-1'
        )}>
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return renderTab(tab, isActive);
          })}
        </div>

        {/* Mobile navigation controls */}
        {isMobile && (
          <div className="flex items-center gap-1 ml-auto">
            {renderNavigationArrows()}
            {hasOverflowItems && renderOverflowMenu()}
          </div>
        )}

        {/* Desktop overflow menu */}
        {!isMobile && hasOverflowItems && renderOverflowMenu()}
      </div>

      {/* Tab Content */}
      <div className="flex-1 mt-4">
        {children}
      </div>

      {/* Tab Description */}
      {tabDescription && (
        <div className="mt-2 text-sm text-gray-500">
          {tabDescription}
        </div>
      )}
    </div>
  );
};

export default React.memo(AnalyticsTabContainer);