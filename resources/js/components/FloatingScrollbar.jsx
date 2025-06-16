import React, { useEffect } from 'react';

export default function FloatingScrollbar() {
    useEffect(() => {
        let scrollTimer = null;
        let hoverTimer = null;
        const scrollElements = new Set();
        const elementTimers = new WeakMap();

        // Function to show scrollbars with fade-in animation
        const showScrollbars = (element) => {
            // Clear any existing hide timer for this element
            const existingTimer = elementTimers.get(element);
            if (existingTimer) {
                clearTimeout(existingTimer);
                elementTimers.delete(element);
            }

            element.classList.add('scrollbar-visible');
            element.classList.remove('scrollbar-hidden');
            scrollElements.add(element);
        };

        // Function to hide scrollbars with fade-out animation
        const hideScrollbars = (element) => {
            element.classList.remove('scrollbar-visible', 'scrollbar-active');
            element.classList.add('scrollbar-hidden');
            scrollElements.delete(element);
        };

        // Function to set active state during scrolling
        const setActiveScrollbars = (element) => {
            element.classList.add('scrollbar-active');
            element.classList.remove('scrollbar-hidden');
        };

        // Function to handle scroll events
        const handleScroll = (event) => {
            const element = event.target;
            
            // Skip if this isn't a scrollable element or is document/window
            if (element === document || element === window || element === document.documentElement || element === document.body) {
                return;
            }

            // Show scrollbar immediately when scrolling with active state
            setActiveScrollbars(element);
            showScrollbars(element);

            // Clear existing global timer
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }

            // Clear element-specific timer
            const existingTimer = elementTimers.get(element);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }

            // Set timer to hide scrollbar after 2 seconds of scroll inactivity
            const hideTimer = setTimeout(() => {
                if (document.contains(element) && !element.matches(':hover')) {
                    hideScrollbars(element);
                }
                elementTimers.delete(element);
            }, 2000);

            elementTimers.set(element, hideTimer);
        };

        // Function to handle mouse enter on scrollable elements
        const handleMouseEnter = (event) => {
            const element = event.target;
            
            // Skip if element is not in the DOM
            if (!document.contains(element)) return;
            
            // Check if element is actually scrollable
            const isScrollableY = element.scrollHeight > element.clientHeight;
            const isScrollableX = element.scrollWidth > element.clientWidth;
            const isScrollable = isScrollableY || isScrollableX;

            if (isScrollable) {
                showScrollbars(element);
                
                // Clear any existing hide timer
                const existingTimer = elementTimers.get(element);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                    elementTimers.delete(element);
                }
            }
        };

        // Function to handle mouse leave on scrollable elements
        const handleMouseLeave = (event) => {
            const element = event.target;
            
            // Skip if element is not in the DOM
            if (!document.contains(element)) return;
            
            // Clear any existing timer
            const existingTimer = elementTimers.get(element);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }

            // Hide scrollbar after a short delay when mouse leaves
            const hideTimer = setTimeout(() => {
                if (document.contains(element)) {
                    hideScrollbars(element);
                }
                elementTimers.delete(element);
            }, 500);

            elementTimers.set(element, hideTimer);
        };

        // Function to check if element is scrollable
        const isElementScrollable = (element) => {
            if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
            
            const computedStyle = window.getComputedStyle(element);
            const overflowY = computedStyle.overflowY;
            const overflowX = computedStyle.overflowX;
            
            const hasScrollableOverflow = 
                overflowY === 'auto' || overflowY === 'scroll' ||
                overflowX === 'auto' || overflowX === 'scroll';
            
            const hasScrollableContent =
                element.scrollHeight > element.clientHeight ||
                element.scrollWidth > element.clientWidth;
            
            return hasScrollableOverflow && hasScrollableContent;
        };

        // Initialize scrollbar visibility for existing elements
        const initializeScrollbars = () => {
            // Target specific scrollable containers and common scrollable elements
            const potentialScrollables = document.querySelectorAll([
                '[class*="overflow"]',
                '[class*="scroll"]',
                '.overflow-auto',
                '.overflow-y-auto', 
                '.overflow-x-auto',
                '.overflow-scroll',
                'main',
                'section',
                'div[style*="overflow"]',
                'textarea',
                'pre',
                'code'
            ].join(', '));
            
            potentialScrollables.forEach(element => {
                if (isElementScrollable(element)) {
                    // Initially hide scrollbars
                    hideScrollbars(element);
                    
                    // Add event listeners
                    element.addEventListener('scroll', handleScroll, { passive: true });
                    element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
                    element.addEventListener('mouseleave', handleMouseLeave, { passive: true });
                }
            });

            // Also check body and html for page-level scrolling
            [document.documentElement, document.body].forEach(element => {
                if (element && isElementScrollable(element)) {
                    hideScrollbars(element);
                }
            });
        };

        // Observer for dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check the added element itself
                        if (isElementScrollable(node)) {
                            hideScrollbars(node);
                            node.addEventListener('scroll', handleScroll, { passive: true });
                            node.addEventListener('mouseenter', handleMouseEnter, { passive: true });
                            node.addEventListener('mouseleave', handleMouseLeave, { passive: true });
                        }

                        // Check child elements that might be scrollable
                        const scrollableChildren = node.querySelectorAll && node.querySelectorAll([
                            '[class*="overflow"]',
                            '[class*="scroll"]',
                            '.overflow-auto',
                            '.overflow-y-auto',
                            '.overflow-x-auto',
                            'textarea',
                            'pre'
                        ].join(', '));

                        if (scrollableChildren) {
                            scrollableChildren.forEach(element => {
                                if (isElementScrollable(element)) {
                                    hideScrollbars(element);
                                    element.addEventListener('scroll', handleScroll, { passive: true });
                                    element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
                                    element.addEventListener('mouseleave', handleMouseLeave, { passive: true });
                                }
                            });
                        }
                    }
                });
            });
        });

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeScrollbars);
        } else {
            initializeScrollbars();
        }

        // Start observing for dynamic content
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });

        // Global scroll handler for window/document scrolling
        const handleDocumentScroll = () => {
            const documentElement = document.documentElement;
            if (documentElement && isElementScrollable(documentElement)) {
                setActiveScrollbars(documentElement);
                showScrollbars(documentElement);

                if (scrollTimer) {
                    clearTimeout(scrollTimer);
                }

                scrollTimer = setTimeout(() => {
                    hideScrollbars(documentElement);
                }, 2000);
            }
        };

        window.addEventListener('scroll', handleDocumentScroll, { passive: true });

        // Cleanup function
        return () => {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            
            if (hoverTimer) {
                clearTimeout(hoverTimer);
            }

            // Clear all element timers
            elementTimers.clear();
            
            observer.disconnect();
            window.removeEventListener('scroll', handleDocumentScroll);
            
            // Remove event listeners from all elements
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                element.removeEventListener('scroll', handleScroll);
                element.removeEventListener('mouseenter', handleMouseEnter);
                element.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []);

    // This component doesn't render anything visible
    return null;
}