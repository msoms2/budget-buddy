import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AnalysisTypeSelector from '../AnalysisTypeSelector';

// Mock the Select components
jest.mock('@/components/ui/select', () => ({
    Select: ({ children, value, onValueChange }) => (
        <div data-testid="mock-select" data-value={value}>
            {React.Children.map(children, child =>
                React.cloneElement(child, { onValueChange })
            )}
        </div>
    ),
    SelectTrigger: ({ children }) => (
        <div data-testid="mock-trigger">{children}</div>
    ),
    SelectValue: ({ placeholder }) => (
        <div data-testid="mock-value">{placeholder}</div>
    ),
    SelectContent: ({ children }) => (
        <div data-testid="mock-content">{children}</div>
    ),
    SelectGroup: ({ children }) => (
        <div data-testid="mock-group">{children}</div>
    ),
    SelectLabel: ({ children }) => (
        <div data-testid="mock-label">{children}</div>
    ),
    SelectItem: ({ children, value, onClick }) => (
        <button 
            data-testid="mock-item" 
            data-value={value}
            onClick={() => onClick && onClick(value)}
        >
            {children}
        </button>
    ),
}));

describe('AnalysisTypeSelector', () => {
    const mockOnChange = jest.fn();
    const defaultProps = {
        value: 'monthly',
        onChange: mockOnChange
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders with default props', () => {
        render(<AnalysisTypeSelector {...defaultProps} />);
        
        const select = screen.getByTestId('mock-select');
        expect(select).toHaveAttribute('data-value', 'monthly');
        
        const placeholder = screen.getByTestId('mock-value');
        expect(placeholder).toHaveTextContent('Select analysis type');
    });

    test('renders custom label', () => {
        const customLabel = 'Custom Analysis Types';
        render(<AnalysisTypeSelector {...defaultProps} label={customLabel} />);
        
        const label = screen.getByTestId('mock-label');
        expect(label).toHaveTextContent(customLabel);
    });

    test('renders custom types', () => {
        const customTypes = [
            { value: 'type1', label: 'Type One' },
            { value: 'type2', label: 'Type Two' },
        ];
        
        render(<AnalysisTypeSelector {...defaultProps} types={customTypes} />);
        
        const items = screen.getAllByTestId('mock-item');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent('Type One');
        expect(items[1]).toHaveTextContent('Type Two');
    });

    test('renders default types', () => {
        render(<AnalysisTypeSelector {...defaultProps} />);
        
        const items = screen.getAllByTestId('mock-item');
        expect(items).toHaveLength(4);
        expect(items[0]).toHaveTextContent('Daily Analysis');
        expect(items[1]).toHaveTextContent('Weekly Analysis');
        expect(items[2]).toHaveTextContent('Monthly Analysis');
        expect(items[3]).toHaveTextContent('Yearly Analysis');
    });

    test('calls onChange when value changes', () => {
        render(<AnalysisTypeSelector {...defaultProps} />);
        
        const items = screen.getAllByTestId('mock-item');
        fireEvent.click(items[0]); // Click "Daily Analysis"
        
        expect(mockOnChange).toHaveBeenCalledWith('daily');
    });

    test('applies custom className', () => {
        const customClass = 'custom-class';
        render(<AnalysisTypeSelector {...defaultProps} className={customClass} />);
        
        const container = screen.getByTestId('mock-select').parentElement;
        expect(container).toHaveClass(customClass);
    });

    test('handles undefined value', () => {
        render(<AnalysisTypeSelector onChange={mockOnChange} />);
        
        const select = screen.getByTestId('mock-select');
        expect(select).not.toHaveAttribute('data-value');
    });

    test('handles empty types array', () => {
        render(<AnalysisTypeSelector {...defaultProps} types={[]} />);
        
        const items = screen.queryAllByTestId('mock-item');
        expect(items).toHaveLength(0);
    });
});