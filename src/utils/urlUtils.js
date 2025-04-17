/**
 * URL utility functions for handling URL-friendly transformations
 */

/**
 * Converts a string to a URL-friendly slug
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
};