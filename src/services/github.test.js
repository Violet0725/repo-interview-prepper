import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  parseRepoUrl, 
  decodeContent, 
  filterInterestingFiles,
  fetchRepoDetails,
  fetchRepoTree
} from './github';

describe('GitHub Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseRepoUrl', () => {
    it('should parse a valid GitHub URL', () => {
      const result = parseRepoUrl('https://github.com/facebook/react');
      expect(result).toEqual({ owner: 'facebook', repo: 'react' });
    });

    it('should handle URLs with .git suffix', () => {
      const result = parseRepoUrl('https://github.com/facebook/react.git');
      expect(result).toEqual({ owner: 'facebook', repo: 'react' });
    });

    it('should handle URLs without https://', () => {
      const result = parseRepoUrl('github.com/facebook/react');
      expect(result).toEqual({ owner: 'facebook', repo: 'react' });
    });

    it('should return null for invalid URLs', () => {
      expect(parseRepoUrl('not-a-url')).toBeNull();
      expect(parseRepoUrl('https://gitlab.com/user/repo')).toBeNull();
      expect(parseRepoUrl('')).toBeNull();
    });
  });

  describe('decodeContent', () => {
    it('should decode base64 content', () => {
      // "Hello World" in base64
      const base64 = 'SGVsbG8gV29ybGQ=';
      const result = decodeContent(base64);
      expect(result).toBe('Hello World');
    });

    it('should handle decode errors gracefully', () => {
      const result = decodeContent('invalid-base64!!!');
      expect(result).toBe('Unable to decode file content.');
    });
  });

  describe('filterInterestingFiles', () => {
    it('should filter source code files', () => {
      const tree = [
        { type: 'blob', path: 'src/App.jsx' },
        { type: 'blob', path: 'src/index.js' },
        { type: 'blob', path: 'src/styles.css' },
        { type: 'tree', path: 'src' }, // directory, should be filtered
        { type: 'blob', path: 'node_modules/react/index.js' }, // should be filtered
        { type: 'blob', path: 'dist/bundle.js' }, // should be filtered
        { type: 'blob', path: 'README.md' }, // not a source file
      ];

      const result = filterInterestingFiles(tree);
      
      expect(result).toContain('src/App.jsx');
      expect(result).toContain('src/index.js');
      expect(result).toContain('src/styles.css');
      expect(result).not.toContain('node_modules/react/index.js');
      expect(result).not.toContain('dist/bundle.js');
      expect(result).not.toContain('README.md');
    });

    it('should filter out test and type definition files', () => {
      const tree = [
        { type: 'blob', path: 'src/App.jsx' },
        { type: 'blob', path: 'src/App.test.js' },
        { type: 'blob', path: 'src/App.spec.js' },
        { type: 'blob', path: 'src/types.d.ts' },
        { type: 'blob', path: 'src/bundle.min.js' },
      ];

      const result = filterInterestingFiles(tree);
      
      expect(result).toContain('src/App.jsx');
      expect(result).not.toContain('src/App.test.js');
      expect(result).not.toContain('src/App.spec.js');
      expect(result).not.toContain('src/types.d.ts');
      expect(result).not.toContain('src/bundle.min.js');
    });

    it('should limit results to 50 files', () => {
      const tree = Array.from({ length: 100 }, (_, i) => ({
        type: 'blob',
        path: `src/file${i}.js`
      }));

      const result = filterInterestingFiles(tree);
      expect(result.length).toBe(50);
    });
  });

  describe('fetchRepoDetails', () => {
    it('should fetch repository details', async () => {
      const mockResponse = { 
        name: 'react', 
        default_branch: 'main' 
      };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await fetchRepoDetails('facebook', 'react');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/facebook/react',
        expect.objectContaining({ headers: expect.any(Object) })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for private/non-existent repo', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(fetchRepoDetails('user', 'private-repo'))
        .rejects.toThrow('Could not access repository');
    });
  });

  describe('fetchRepoTree', () => {
    it('should fetch repository tree', async () => {
      const mockTree = { 
        tree: [
          { type: 'blob', path: 'src/index.js' }
        ] 
      };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree)
      });

      const result = await fetchRepoTree('facebook', 'react', 'main');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/facebook/react/git/trees/main?recursive=1',
        expect.any(Object)
      );
      expect(result).toEqual(mockTree);
    });
  });
});
