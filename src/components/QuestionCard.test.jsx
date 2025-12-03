import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from './QuestionCard';

// Mock the MockChat component
vi.mock('./MockChat', () => ({
  MockChat: ({ onBack }) => (
    <div data-testid="mock-chat">
      <button onClick={onBack}>Back</button>
    </div>
  ),
  default: ({ onBack }) => (
    <div data-testid="mock-chat">
      <button onClick={onBack}>Back</button>
    </div>
  )
}));

const mockQuestion = {
  category: 'Technical',
  q: 'What is the purpose of useEffect?',
  strategy: 'Explain the lifecycle and cleanup functions.',
  sample_answer: 'useEffect is used for side effects in React...',
  difficulty: 'Mid'
};

describe('QuestionCard', () => {
  it('should render question text', () => {
    render(<QuestionCard q={mockQuestion} isDark={false} />);
    
    expect(screen.getByText('What is the purpose of useEffect?')).toBeInTheDocument();
  });

  it('should display category badge', () => {
    render(<QuestionCard q={mockQuestion} isDark={false} />);
    
    expect(screen.getByText('Technical')).toBeInTheDocument();
  });

  it('should display difficulty badge', () => {
    render(<QuestionCard q={mockQuestion} isDark={false} />);
    
    expect(screen.getByText('Mid')).toBeInTheDocument();
  });

  it('should expand on click to show strategy', async () => {
    render(<QuestionCard q={mockQuestion} isDark={false} />);
    
    // Card should be collapsed initially
    expect(screen.queryByText('Answer Strategy')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByText('What is the purpose of useEffect?'));
    
    // Strategy should now be visible
    expect(screen.getByText('Answer Strategy')).toBeInTheDocument();
  });

  it('should toggle model answer visibility', async () => {
    render(<QuestionCard q={mockQuestion} isDark={false} />);
    
    // Expand the card
    fireEvent.click(screen.getByText('What is the purpose of useEffect?'));
    
    // Answer should be hidden initially
    expect(screen.queryByText(/useEffect is used for side effects/)).not.toBeInTheDocument();
    
    // Click to reveal answer
    fireEvent.click(screen.getByText('Reveal Model Answer'));
    
    // Answer should now be visible
    expect(screen.getByText(/useEffect is used for side effects/)).toBeInTheDocument();
    
    // Click to hide answer
    fireEvent.click(screen.getByText('Hide Model Answer'));
    
    // Answer should be hidden again
    expect(screen.queryByText(/useEffect is used for side effects/)).not.toBeInTheDocument();
  });

  it('should enter mock interview mode', async () => {
    render(<QuestionCard q={mockQuestion} isDark={false} />);
    
    // Expand the card
    fireEvent.click(screen.getByText('What is the purpose of useEffect?'));
    
    // Click mock interview button
    fireEvent.click(screen.getByText('Enter Mock Interview Mode'));
    
    // MockChat should be rendered
    expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
  });

  it('should apply dark mode styles', () => {
    const { container } = render(<QuestionCard q={mockQuestion} isDark={true} />);
    
    // Check for dark mode gradient div (glow effect)
    const glowDiv = container.querySelector('.bg-gradient-to-r');
    expect(glowDiv).toBeInTheDocument();
  });

  it('should display correct difficulty color for Senior', () => {
    const seniorQuestion = { ...mockQuestion, difficulty: 'Senior' };
    render(<QuestionCard q={seniorQuestion} isDark={false} />);
    
    const badge = screen.getByText('Senior');
    expect(badge).toHaveClass('text-red-700');
  });

  it('should display correct difficulty color for Junior', () => {
    const juniorQuestion = { ...mockQuestion, difficulty: 'Junior' };
    render(<QuestionCard q={juniorQuestion} isDark={false} />);
    
    const badge = screen.getByText('Junior');
    expect(badge).toHaveClass('text-green-700');
  });
});
