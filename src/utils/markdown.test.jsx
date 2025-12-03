import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('should return null for empty input', () => {
    expect(renderMarkdown(null, false)).toBeNull();
    expect(renderMarkdown('', false)).toBeNull();
    expect(renderMarkdown(undefined, false)).toBeNull();
  });

  it('should render plain text unchanged', () => {
    const { container } = render(<div>{renderMarkdown('Hello World', false)}</div>);
    expect(container.textContent).toBe('Hello World');
  });

  it('should render bold text with strong tags', () => {
    render(<div>{renderMarkdown('This is **bold** text', false)}</div>);
    
    const boldElement = screen.getByText('bold');
    expect(boldElement.tagName).toBe('STRONG');
  });

  it('should render inline code with code tags', () => {
    render(<div>{renderMarkdown('Use `console.log` for debugging', false)}</div>);
    
    const codeElement = screen.getByText('console.log');
    expect(codeElement.tagName).toBe('CODE');
  });

  it('should handle multiple bold sections', () => {
    render(<div>{renderMarkdown('**first** and **second**', false)}</div>);
    
    expect(screen.getByText('first').tagName).toBe('STRONG');
    expect(screen.getByText('second').tagName).toBe('STRONG');
  });

  it('should apply dark mode styles to bold text', () => {
    render(<div>{renderMarkdown('This is **bold** text', true)}</div>);
    
    const boldElement = screen.getByText('bold');
    expect(boldElement).toHaveClass('text-cyan-300');
  });

  it('should apply light mode styles to bold text', () => {
    render(<div>{renderMarkdown('This is **bold** text', false)}</div>);
    
    const boldElement = screen.getByText('bold');
    expect(boldElement).toHaveClass('text-cyan-700');
  });

  it('should apply dark mode styles to code', () => {
    render(<div>{renderMarkdown('Use `code` here', true)}</div>);
    
    const codeElement = screen.getByText('code');
    expect(codeElement).toHaveClass('bg-slate-800');
  });

  it('should apply light mode styles to code', () => {
    render(<div>{renderMarkdown('Use `code` here', false)}</div>);
    
    const codeElement = screen.getByText('code');
    expect(codeElement).toHaveClass('bg-slate-100');
  });

  it('should handle mixed bold and code', () => {
    render(<div>{renderMarkdown('**Bold** and `code` together', false)}</div>);
    
    expect(screen.getByText('Bold').tagName).toBe('STRONG');
    expect(screen.getByText('code').tagName).toBe('CODE');
  });
});
