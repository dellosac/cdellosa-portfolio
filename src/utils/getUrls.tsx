/**
 * Utility function to dynamically load images from the assets folder
 *
 * Usage:
 * import { getImageUrl } from './utils/getImageUrl';
 *
 * // For a single subfolder
 * const imageUrl = getImageUrl('emails', 'example.jpg');
 * <img src={imageUrl} alt="Example" />
 *
 * // For nested subfolders
 * const imageUrl = getImageUrl('emails/sent', 'email1.png');
 * <img src={imageUrl} alt="Email 1" />
 */

/**
 * Get the URL for an image in the assets folder
 * @param folder - Subfolder path within src/assets (e.g., 'emails', 'images/products')
 * @param filename - Image filename (e.g., 'example.jpg')
 * @returns Resolved image URL
 */

export const getImageUrl = (folder: string, filename: string): string => {
    try {
        // Construct the relative path from this file to the assets folder
        // Adjust the number of '../' based on where you place this file
        return new URL(`../assets/${folder}/${filename}`, import.meta.url).href;
    } catch (error) {
        console.error(`Failed to load image: ${folder}/${filename}`, error);
        return ""; // Return empty string as fallback
    }
};

/**
 * Get the URL for a video file
 * @param folder - Subfolder path within src/assets
 * @param filename - Video filename
 * @returns Resolved video URL
 */
export const getVideoUrl = (folder: string, filename: string): string => {
    try {
        return new URL(`../assets/${folder}/${filename}`, import.meta.url).href;
    } catch (error) {
        console.error(`Failed to load video: ${folder}/${filename}`, error);
        return "";
    }
};
