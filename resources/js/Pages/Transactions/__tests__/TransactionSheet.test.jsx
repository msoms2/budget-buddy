import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionSheet from '../Partials/TransactionSheet';
import { useForm } from '@inertiajs/react';
import { useToast } from '@/hooks/use-toast.js';

// Mock the useForm hook
jest.mock('@inertiajs/react', () => ({
    useForm: jest.fn(),
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast.js', () => ({
    useToast: jest.fn(),
}));

// Mock the Sheet components
jest.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children }) => <div data-testid="mock-sheet">{children}</div>,
    SheetContent: ({ children }) => <div data-testid="mock-sheet-content">{children}</div>,
    SheetHeader: ({ children }) => <div data-testid="mock-sheet-header">{children}</div>,
    SheetFooter: ({ children }) => <div data-testid="mock-sheet-footer">{children}</div>,
    SheetTitle: ({ children }) => <div data-testid="mock-sheet-title">{children}</div>,
    SheetDescription: ({ children }) => <div data-testid="mock-sheet-description">{children}</div>,
}));

// Mock the form components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('@/components/ui/input', () => ({
    Input: ({ name, value, onChange, type = 'text', ...props }) => (
        <input
            data-testid={`mock-input-${name}`}
            name={name}
            value={value}
            onChange={onChange}
            type={type}
            {...props}
        />
    ),
}));

jest.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor }) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('@/components/ui/textarea', () => ({
    Textarea: ({ name, value, onChange, ...props }) => (
        <textarea
            data-testid={`mock-textarea-${name}`}
            name={name}
            value={value}
            onChange={onChange}
            {...props}
        />
    ),
}));

describe('TransactionSheet', () => {
    const mockCategories = [
        { id: 1, name: 'Food' },
        { id: 2, name: 'Transport' },
    ];

    const defaultProps = {
        isOpen: true,
        categories: mockCategories,
        transactionType: 'expense',
        onClose: jest.fn(),
        stay_on_page: false,
    };

    const mockToast = {
        toast: jest.fn(),
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup default form state
        useForm.mockReturnValue({
            data: {
                name: '',
                description: '',
                amount: '',
                category_id: '',
                date: new Date().toISOString().substr(0, 10),
                is_recurring: false,
                frequency: '',
                stay_on_page: true,
                source_page: '',
                type: 'expense',
            },
            setData: jest.fn(),
            post: jest.fn(),
            reset: jest.fn(),
            errors: {},
            processing: false,
            clearErrors: jest.fn(),
        });

        // Setup toast mock
        useToast.mockReturnValue(mockToast);
    });

    it('renders expense form when transaction type is expense', () => {
        render(<TransactionSheet {...defaultProps} />);
        expect(screen.getByText('Add New Expense')).toBeInTheDocument();
    });

    it('renders income form when transaction type is income', () => {
        render(<TransactionSheet {...defaultProps} transactionType="income" />);
        expect(screen.getByText('Add New Income')).toBeInTheDocument();
    });

    it('submits form with correct data for expense', async () => {
        const mockPost = jest.fn();
        const mockSetData = jest.fn();
        useForm.mockReturnValue({
            data: {
                name: 'Test Expense',
                description: 'Test Description',
                amount: '100',
                category_id: '1',
                date: '2024-03-20',
                is_recurring: false,
                frequency: '',
                stay_on_page: true,
                source_page: '',
                type: 'expense',
            },
            setData: mockSetData,
            post: mockPost,
            reset: jest.fn(),
            errors: {},
            processing: false,
            clearErrors: jest.fn(),
        });

        render(<TransactionSheet {...defaultProps} />);

        // Fill in the form
        await userEvent.type(screen.getByTestId('mock-input-name'), 'Test Expense');
        await userEvent.type(screen.getByTestId('mock-textarea-description'), 'Test Description');
        await userEvent.type(screen.getByTestId('mock-input-amount'), '100');
        await userEvent.type(screen.getByTestId('mock-input-date'), '2024-03-20');

        // Submit the form
        await userEvent.click(screen.getByText('Save'));

        // Verify form submission
        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith(route('expenses.store'), {
                preserveScroll: true,
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            });
        });
    });

    it('submits form with correct data for income', async () => {
        const mockPost = jest.fn();
        const mockSetData = jest.fn();
        useForm.mockReturnValue({
            data: {
                name: 'Test Income',
                description: 'Test Description',
                amount: '200',
                date: '2024-03-20',
                is_recurring: false,
                frequency: '',
                stay_on_page: true,
                source_page: '',
                type: 'income',
            },
            setData: mockSetData,
            post: mockPost,
            reset: jest.fn(),
            errors: {},
            processing: false,
            clearErrors: jest.fn(),
        });

        render(<TransactionSheet {...defaultProps} transactionType="income" />);

        // Fill in the form
        await userEvent.type(screen.getByTestId('mock-input-name'), 'Test Income');
        await userEvent.type(screen.getByTestId('mock-textarea-description'), 'Test Description');
        await userEvent.type(screen.getByTestId('mock-input-amount'), '200');
        await userEvent.type(screen.getByTestId('mock-input-date'), '2024-03-20');

        // Submit the form
        await userEvent.click(screen.getByText('Save'));

        // Verify form submission
        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith(route('earnings.store'), {
                preserveScroll: true,
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            });
        });
    });

    it('shows validation errors when required fields are missing', async () => {
        useForm.mockReturnValue({
            data: {
                name: '',
                description: '',
                amount: '',
                category_id: '',
                date: '',
                is_recurring: false,
                frequency: '',
                stay_on_page: true,
                source_page: '',
                type: 'expense',
            },
            setData: jest.fn(),
            post: jest.fn(),
            reset: jest.fn(),
            errors: {
                name: 'The name field is required.',
                amount: 'The amount field is required.',
                date: 'The date field is required.',
            },
            processing: false,
            clearErrors: jest.fn(),
        });

        render(<TransactionSheet {...defaultProps} />);

        // Submit the form without filling required fields
        await userEvent.click(screen.getByText('Save'));

        // Verify error messages are displayed
        expect(screen.getByText('The name field is required.')).toBeInTheDocument();
        expect(screen.getByText('The amount field is required.')).toBeInTheDocument();
        expect(screen.getByText('The date field is required.')).toBeInTheDocument();
    });
}); 