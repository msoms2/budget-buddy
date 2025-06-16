/**
 * Floating Scrollbar System
 * Manages scrollbar visibility based on hover and scroll events
 */

class FloatingScrollbar {
    constructor() {
        this.scrollTimers = new Map();
        this.init();
    }

    init() {
        // Add CSS class to indicate JavaScript is loaded
        document.documentElement.classList.add('floating-scrollbar-js');
        
        // Set up event listeners
        this.setupScrollListeners();
        this.setupHoverListeners();
        
        // Initial setup
        this.hideAllScrollbars();
    }

    setupScrollListeners() {
        // Listen for scroll events on all scrollable elements
        const scrollableElements = document.querySelectorAll('*');
        
        scrollableElements.forEach(element => {
            element.addEventListener('scroll', (e) => {
                this.handleScroll(e.target);
            }, { passive: true });
        });

        // Use a MutationObserver to handle dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        node.addEventListener('scroll', (e) => {
                            this.handleScroll(e.target);
                        }, { passive: true });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupHoverListeners() {
        // Global mouse move listener for better hover detection
        document.addEventListener('mousemove', (e) => {
            // Find the scrollable element under the cursor
            const element = e.target.closest('*');
            if (this.isScrollable(element)) {
                this.showScrollbar(element);
                
                // Hide after a delay when not hovering
                clearTimeout(element._hoverTimeout);
                element._hoverTimeout = setTimeout(() => {
                    this.hideScrollbar(element);
                }, 1000);
            }
        });

        // Hide scrollbars when mouse leaves the window
        document.addEventListener('mouseleave', () => {
            this.hideAllScrollbars();
        });
    }

    handleScroll(element) {
        if (!element) return;

        // Show scrollbar immediately
        this.showScrollbar(element);

        // Clear existing timer
        if (this.scrollTimers.has(element)) {
            clearTimeout(this.scrollTimers.get(element));
        }

        // Hide after scroll stops
        const timer = setTimeout(() => {
            this.hideScrollbar(element);
            this.scrollTimers.delete(element);
        }, 1500);

        this.scrollTimers.set(element, timer);
    }

    isScrollable(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        const overflow = style.overflow + style.overflowX + style.overflowY;
        
        return (
            (overflow.includes('scroll') || overflow.includes('auto')) &&
            (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)
        );
    }

    showScrollbar(element) {
        if (!element) return;
        element.classList.add('scrollbar-visible');
        element.classList.remove('scrollbar-hidden');
    }

    hideScrollbar(element) {
        if (!element) return;
        element.classList.remove('scrollbar-visible');
        element.classList.add('scrollbar-hidden');
    }

    hideAllScrollbars() {
        document.querySelectorAll('.scrollbar-visible').forEach(element => {
            this.hideScrollbar(element);
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FloatingScrollbar();
    });
} else {
    new FloatingScrollbar();
}

export default FloatingScrollbar;
