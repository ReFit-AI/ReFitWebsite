import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhoneForm from '../PhoneForm';

describe('PhoneForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    render(<PhoneForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/phone model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/storage capacity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/device condition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get instant quote/i })).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(<PhoneForm onSubmit={mockOnSubmit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /get instant quote/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/please select a phone model/i)).toBeInTheDocument();
      expect(screen.getByText(/please select storage capacity/i)).toBeInTheDocument();
      expect(screen.getByText(/please select device condition/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    render(<PhoneForm onSubmit={mockOnSubmit} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/phone model/i), {
      target: { value: 'iPhone 15 Pro' },
    });
    
    fireEvent.click(screen.getByText(/256GB/));
    
    fireEvent.click(screen.getByText(/excellent/).closest('label'));
    
    fireEvent.change(screen.getByLabelText(/color/i), {
      target: { value: 'Space Black' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /get instant quote/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        model: 'iPhone 15 Pro',
        storage: '256GB',
        condition: 'excellent',
        color: 'Space Black',
        carrier: 'unlocked',
        description: '',
      });
    });
  });

  it('updates the form fields when user interacts', async () => {
    render(<PhoneForm onSubmit={mockOnSubmit} />);
    
    // Test phone model selection
    fireEvent.change(screen.getByLabelText(/phone model/i), {
      target: { value: 'iPhone 15 Pro' },
    });
    expect(screen.getByDisplayValue('iPhone 15 Pro')).toBeInTheDocument();
    
    // Test storage selection
    fireEvent.click(screen.getByText('256GB'));
    expect(screen.getByText('256GB').closest('button')).toHaveClass('border-solana-purple');
    
    // Test condition selection
    fireEvent.click(screen.getByText('excellent').closest('label'));
    expect(screen.getByText('excellent').closest('label')).toHaveClass('border-solana-purple');
    
    // Test color input
    fireEvent.change(screen.getByLabelText(/color/i), {
      target: { value: 'Space Black' },
    });
    expect(screen.getByDisplayValue('Space Black')).toBeInTheDocument();
  });
});
