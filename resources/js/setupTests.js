import '@testing-library/jest-dom';

// Mock Inertia.js router and hooks
jest.mock('@inertiajs/react', () => ({
    useForm: () => ({
        data: {},
        setData: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        reset: jest.fn(),
        errors: {},
        clearErrors: jest.fn(),
        processing: false,
    }),
    router: {
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
    usePage: () => ({
        url: '',
        props: {
            auth: {
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                },
            },
        },
    }),
    Link: ({ children }) => <a>{children}</a>,
}));

// Mock route function
global.route = jest.fn((name) => ({
    current: jest.fn(() => 'dashboard'),
    url: jest.fn(() => `/${name}`),
}));

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock the AppSidebar component
jest.mock('@/components/app-sidebar', () => ({
    AppSidebar: () => <div data-testid="mock-sidebar" />,
}));

// Mock the Sidebar components
jest.mock('@/components/ui/sidebar', () => ({
    SidebarProvider: ({ children }) => <div data-testid="mock-sidebar-provider">{children}</div>,
    SidebarInset: ({ children, className }) => <div data-testid="mock-sidebar-inset" className={className}>{children}</div>,
    SidebarMenu: ({ children }) => <div data-testid="mock-sidebar-menu">{children}</div>,
    SidebarMenuItem: ({ children }) => <div data-testid="mock-sidebar-menu-item">{children}</div>,
    SidebarMenuButton: ({ children }) => <div data-testid="mock-sidebar-menu-button">{children}</div>,
}));

// Mock the Breadcrumb components
jest.mock('@/components/ui/breadcrumb', () => ({
    Breadcrumb: ({ children }) => <div data-testid="mock-breadcrumb">{children}</div>,
    BreadcrumbItem: ({ children }) => <div data-testid="mock-breadcrumb-item">{children}</div>,
    BreadcrumbLink: ({ children }) => <div data-testid="mock-breadcrumb-link">{children}</div>,
    BreadcrumbList: ({ children }) => <div data-testid="mock-breadcrumb-list">{children}</div>,
    BreadcrumbPage: ({ children }) => <div data-testid="mock-breadcrumb-page">{children}</div>,
    BreadcrumbSeparator: () => <div data-testid="mock-breadcrumb-separator" />,
}));

// Mock the Separator component
jest.mock('@/components/ui/separator', () => ({
    Separator: ({ orientation, className }) => <div data-testid="mock-separator" className={className} />,
})); 