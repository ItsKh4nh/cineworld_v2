/**
 * Utility functions for formatting data
 */

/**
 * Format a date string to a human-readable format
 * @param {string} dateString - Date string in ISO format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";
  
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
};

/**
 * Format a monetary amount to USD
 * @param {number} amount - Amount in dollars
 * @returns {string} Formatted money string
 */
export const formatMoney = (amount) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format runtime minutes to hours and minutes
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time string (e.g., "2h 15m")
 */
export const formatRuntime = (minutes) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Calculate age from birthday to current date or death date
 * @param {string} birthday - Birthday in ISO format
 * @param {string} deathday - Death day in ISO format (optional)
 * @returns {number|string} Age or "N/A" if birthday not provided
 */
export const calculateAge = (birthday, deathday) => {
  if (!birthday) return "N/A";
  
  const birthDate = new Date(birthday);
  let endDate = deathday ? new Date(deathday) : new Date();
  
  let age = endDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = endDate.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}; 