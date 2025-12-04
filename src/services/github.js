/**
 * GitHub API Service
 * Handles all interactions with the GitHub API
 */

const GITHUB_API_BASE = 'https://api.github.com';

const headers = {
  'Accept': 'application/vnd.github.v3+json'
};

/**
 * Parse a GitHub URL to extract owner and repo
 * @param {string} url - GitHub repository URL
 * @returns {{ owner: string, repo: string } | null}
 */
export const parseRepoUrl = (url) => {
  try {
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = url.match(regex);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Decode base64 content from GitHub API
 * @param {string} base64 - Base64 encoded content
 * @returns {string}
 */
export const decodeContent = (base64) => {
  try {
    return decodeURIComponent(escape(window.atob(base64)));
  } catch {
    return "Unable to decode file content.";
  }
};

/**
 * Fetch repository details
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 */
export const fetchRepoDetails = async (owner, repo) => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });
  if (!response.ok) {
    throw new Error("Could not access repository. Is it private?");
  }
  return response.json();
};

/**
 * Fetch repository file tree
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 */
export const fetchRepoTree = async (owner, repo, branch) => {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers }
  );
  if (!response.ok) {
    throw new Error("Could not scan files.");
  }
  return response.json();
};

/**
 * Fetch README content
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 */
export const fetchReadme = async (owner, repo) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, { headers });
    if (response.ok) {
      const data = await response.json();
      return decodeContent(data.content);
    }
    return "";
  } catch {
    console.warn("No README found");
    return "";
  }
};

/**
 * Fetch file content
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - File path
 */
export const fetchFileContent = async (owner, repo, path) => {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );
    if (response.ok) {
      const data = await response.json();
      return decodeContent(data.content);
    }
    return null;
  } catch {
    console.warn(`Failed to read ${path}`);
    return null;
  }
};

/**
 * Filter interesting files from the repo tree
 * @param {Array} tree - GitHub tree response
 * @returns {string[]}
 */
export const filterInterestingFiles = (tree) => {
  return tree
    .filter(f => {
      if (f.type !== 'blob') return false;
      const path = f.path;

      // Skip common non-source directories
      if (
        path.includes('node_modules/') ||
        path.includes('dist/') ||
        path.includes('build/') ||
        path.includes('.git/') ||
        path.includes('coverage/')
      ) return false;

      // Include common source file extensions
      return (
        path.match(/\.(js|jsx|ts|tsx|py|rb|go|java|rs|cpp|c|h|php|swift|kt|dart|vue|svelte|html|css|sql|graphql)$/i) &&
        !path.match(/\.(min\.js|test\.js|spec\.js|d\.ts)$/i)
      );
    })
    .map(f => f.path)
    .slice(0, 50);
};
