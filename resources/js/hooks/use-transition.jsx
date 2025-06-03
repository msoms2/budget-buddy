import { useMemo } from 'react';

/**
 * Hook that provides CSS transition classes for common UI animations.
 * These transitions can be applied to elements to create smooth animations.
 * 
 * @returns {Object} Object containing CSS transition classes
 */
export function useTransitionStyles() {
  const styles = useMemo(() => ({
    // Fade transitions
    fadeIn: 'transition-opacity duration-200 ease-in-out opacity-0 animate-in fade-in',
    fadeOut: 'transition-opacity duration-200 ease-in-out opacity-100 animate-out fade-out',
    
    // Slide transitions
    slideIn: 'transition-all duration-300 ease-in-out translate-y-4 animate-in slide-in-from-bottom',
    slideOut: 'transition-all duration-300 ease-in-out translate-y-0 animate-out slide-out-to-bottom',
    
    // Slide from sides
    slideInFromRight: 'transition-all duration-300 ease-in-out translate-x-4 animate-in slide-in-from-right',
    slideOutToRight: 'transition-all duration-300 ease-in-out translate-x-0 animate-out slide-out-to-right',
    
    // Scale transitions
    scaleIn: 'transition-all duration-200 ease-in-out scale-95 animate-in zoom-in',
    scaleOut: 'transition-all duration-200 ease-in-out scale-100 animate-out zoom-out',
    
    // Delay variants
    delaySmall: 'delay-75',
    delayMedium: 'delay-150',
    delayLarge: 'delay-300',
    
    // Combined animations
    popIn: 'transition-all duration-300 ease-in-out opacity-0 scale-95 animate-in fade-in zoom-in',
    popOut: 'transition-all duration-200 ease-in-out opacity-100 scale-100 animate-out fade-out zoom-out',
  }), []);

  return styles;
}