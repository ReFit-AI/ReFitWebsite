import React from 'react';
import { render, screen } from '../../test-utils';
import HomePage from '../HomePage';

describe('HomePage', () => {
  it('renders the hero section', () => {
    render(<HomePage />);
    
    // Check for main heading
    expect(screen.getByText(/Trade your phone/i)).toBeInTheDocument();
    expect(screen.getByText(/on Solana/i)).toBeInTheDocument();
    
    // Check for call to action buttons
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /learn more/i })).toBeInTheDocument();
  });

  it('displays feature cards', () => {
    render(<HomePage />);
    
    // Check for feature cards
    expect(screen.getByText(/Instant Quotes/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure & Transparent/i)).toBeInTheDocument();
    expect(screen.getByText(/Best Prices/i)).toBeInTheDocument();
  });

  it('shows how it works section', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/How it works/i)).toBeInTheDocument();
    
    // Check for steps
    expect(screen.getByText(/Submit Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Quote/i)).toBeInTheDocument();
    expect(screen.getByText(/Ship & Get Paid/i)).toBeInTheDocument();
  });
});
