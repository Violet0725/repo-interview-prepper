import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepoInput } from './RepoInput';

describe('RepoInput', () => {
  const defaultProps = {
    repoUrl: '',
    setRepoUrl: vi.fn(),
    loading: false,
    error: null,
    recentSearches: [],
    onScan: vi.fn(),
    isDark: false
  };

  it('should render input field', () => {
    render(<RepoInput {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('github.com/username/repository')).toBeInTheDocument();
  });

  it('should render scan button', () => {
    render(<RepoInput {...defaultProps} />);
    
    expect(screen.getByText('SCAN REPO')).toBeInTheDocument();
  });

  it('should display step guides', () => {
    render(<RepoInput {...defaultProps} />);
    
    expect(screen.getByText('1. Target')).toBeInTheDocument();
    expect(screen.getByText('2. Select')).toBeInTheDocument();
    expect(screen.getByText('3. Simulate')).toBeInTheDocument();
  });

  it('should call setRepoUrl when typing', () => {
    const setRepoUrl = vi.fn();
    render(<RepoInput {...defaultProps} setRepoUrl={setRepoUrl} />);
    
    fireEvent.change(screen.getByPlaceholderText('github.com/username/repository'), {
      target: { value: 'https://github.com/user/repo' }
    });
    
    expect(setRepoUrl).toHaveBeenCalledWith('https://github.com/user/repo');
  });

  it('should call onScan when clicking button', () => {
    const onScan = vi.fn();
    render(<RepoInput {...defaultProps} repoUrl="https://github.com/user/repo" onScan={onScan} />);
    
    fireEvent.click(screen.getByText('SCAN REPO'));
    
    expect(onScan).toHaveBeenCalled();
  });

  it('should call onScan when pressing Enter', () => {
    const onScan = vi.fn();
    render(<RepoInput {...defaultProps} repoUrl="https://github.com/user/repo" onScan={onScan} />);
    
    fireEvent.keyDown(screen.getByPlaceholderText('github.com/username/repository'), {
      key: 'Enter'
    });
    
    expect(onScan).toHaveBeenCalled();
  });

  it('should disable button when loading', () => {
    render(<RepoInput {...defaultProps} loading={true} repoUrl="test" />);
    
    // Button shows loader icon when loading, so we find by role without name
    const buttons = screen.getAllByRole('button');
    const scanButton = buttons.find(btn => btn.classList.contains('bg-cyan-600'));
    expect(scanButton).toBeDisabled();
  });

  it('should disable button when no URL', () => {
    render(<RepoInput {...defaultProps} repoUrl="" />);
    
    expect(screen.getByText('SCAN REPO')).toBeDisabled();
  });

  it('should display error message', () => {
    render(<RepoInput {...defaultProps} error="Invalid repository URL" />);
    
    expect(screen.getByText('Invalid repository URL')).toBeInTheDocument();
  });

  it('should display recent searches', () => {
    const recentSearches = [
      'https://github.com/facebook/react',
      'https://github.com/vuejs/vue'
    ];
    render(<RepoInput {...defaultProps} recentSearches={recentSearches} />);
    
    expect(screen.getByText('Recent Targets')).toBeInTheDocument();
    expect(screen.getByText('facebook/react')).toBeInTheDocument();
    expect(screen.getByText('vuejs/vue')).toBeInTheDocument();
  });

  it('should call onScan with URL when clicking recent search', () => {
    const onScan = vi.fn();
    const setRepoUrl = vi.fn();
    const recentSearches = ['https://github.com/facebook/react'];
    
    render(<RepoInput 
      {...defaultProps} 
      recentSearches={recentSearches} 
      onScan={onScan}
      setRepoUrl={setRepoUrl}
    />);
    
    fireEvent.click(screen.getByText('facebook/react'));
    
    expect(setRepoUrl).toHaveBeenCalledWith('https://github.com/facebook/react');
    expect(onScan).toHaveBeenCalledWith('https://github.com/facebook/react');
  });
});
