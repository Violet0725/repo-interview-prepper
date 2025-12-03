import { useState, useCallback } from 'react';
import {
  parseRepoUrl,
  fetchRepoDetails,
  fetchRepoTree,
  fetchReadme,
  fetchFileContent,
  filterInterestingFiles
} from '../services/github';

/**
 * Custom hook for GitHub repository operations
 */
export const useGitHub = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  const [repoData, setRepoData] = useState(null);

  /**
   * Scan a repository and get its file structure
   */
  const scanRepository = useCallback(async (repoUrl) => {
    const repoInfo = parseRepoUrl(repoUrl);

    if (!repoInfo) {
      setError("Invalid GitHub URL. Format: https://github.com/owner/repo");
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      // Get repo details to find default branch
      const repoDetails = await fetchRepoDetails(repoInfo.owner, repoInfo.repo);
      const defaultBranch = repoDetails.default_branch || 'main';

      // Fetch file tree
      const treeData = await fetchRepoTree(repoInfo.owner, repoInfo.repo, defaultBranch);
      const interestingFiles = filterInterestingFiles(treeData.tree);

      setFileTree(interestingFiles);
      setRepoData({ owner: repoInfo.owner, repo: repoInfo.repo });

      return { success: true, files: interestingFiles };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch code context from selected files
   */
  const fetchCodeContext = useCallback(async (selectedFiles) => {
    if (!repoData) return { readme: '', codeContext: '' };

    const { owner, repo } = repoData;

    // Fetch README
    const readme = await fetchReadme(owner, repo);

    // Fetch selected files
    let codeContext = "";
    for (const file of selectedFiles) {
      const content = await fetchFileContent(owner, repo, file);
      if (content) {
        codeContext += `\n--- FILE: ${file} ---\n${content.slice(0, 2000)}\n`;
      }
    }

    return { readme, codeContext };
  }, [repoData]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setFileTree([]);
    setRepoData(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    fileTree,
    repoData,
    scanRepository,
    fetchCodeContext,
    reset,
    setError
  };
};

export default useGitHub;
