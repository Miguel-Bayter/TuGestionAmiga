import { readdir } from 'fs/promises';
import { join } from 'path';

/**
 * Get path to covers directory
 * Directory structure: apps/frontend/src/shared/infrastructure/assets/images
 */
function getCoversDirectory(): string {
  // Get project root and navigate to frontend images
  // Process working directory is apps/backend
  // Target: apps/frontend/src/shared/infrastructure/assets/images
  const projectRoot = process.cwd();
  return join(projectRoot, '..', 'frontend', 'src', 'shared', 'infrastructure', 'assets', 'images');
}

/**
 * List available cover images from the covers directory
 * @returns Promise with array of image filenames
 */
export async function listAvailableCovers(): Promise<string[]> {
  try {
    const coversDir = getCoversDirectory();
    const files = await readdir(coversDir);

    // Filter to only image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const imageFiles = files.filter((file) => {
      const ext = file.toLowerCase().substring(file.lastIndexOf('.'));
      return imageExtensions.includes(ext);
    });

    // Sort alphabetically
    return imageFiles.sort();
  } catch {
    // If directory doesn't exist or can't be read, return empty array
    return [];
  }
}
