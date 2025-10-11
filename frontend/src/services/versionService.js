import axios from 'axios';
import packageJson from '../../package.json';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/cli1337/flomark/refs/heads/main';

/**
 * Version Service
 * Checks for available updates by comparing local version with GitHub
 */

/**
 * Get current local version
 */
export const getCurrentVersion = () => {
  return {
    frontend: packageJson.version,
    backend: null // Will be fetched from API
  };
};

/**
 * Check for available updates
 * @returns {Promise<{hasUpdate: boolean, current: object, latest: object}>}
 */
export const checkForUpdates = async () => {
  try {
    // Fetch latest versions from GitHub
    const [backendResponse, frontendResponse] = await Promise.all([
      axios.get(`${GITHUB_RAW_BASE}/backend/package.json`, { timeout: 5000 }),
      axios.get(`${GITHUB_RAW_BASE}/frontend/package.json`, { timeout: 5000 })
    ]);

    const latestBackend = backendResponse.data.version;
    const latestFrontend = frontendResponse.data.version;
    const currentFrontend = packageJson.version;

    // Fetch current backend version from health endpoint
    let currentBackend = 'unknown';
    try {
      const healthResponse = await axios.get('/api/health');
      currentBackend = healthResponse.data.version?.backend || healthResponse.data.version || 'unknown';
    } catch (error) {
      console.warn('Could not fetch backend version from health endpoint');
    }

    const hasUpdate = 
      compareVersions(latestBackend, currentBackend) > 0 ||
      compareVersions(latestFrontend, currentFrontend) > 0;

    return {
      hasUpdate,
      current: {
        backend: currentBackend,
        frontend: currentFrontend
      },
      latest: {
        backend: latestBackend,
        frontend: latestFrontend
      }
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    throw error;
  }
};

/**
 * Compare two semantic versions
 * @param {string} v1 - Version 1 (e.g., "1.0.1")
 * @param {string} v2 - Version 2 (e.g., "1.0.0")
 * @returns {number} - Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export const compareVersions = (v1, v2) => {
  if (v1 === 'unknown' || v2 === 'unknown') return 0;
  
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
};

/**
 * Format version for display
 */
export const formatVersion = (version) => {
  return version === 'unknown' ? 'Unknown' : `v${version}`;
};

