/**
 * Utility functions for journal components
 */

/**
 * Format a date string (YYYY-MM-DD) into a human-readable format
 * @param {string} dateString - The date in YYYY-MM-DD format
 * @returns {string} Formatted date string (e.g., "Monday, May 10, 2025")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  // Check if date is valid
  if (isNaN(date.getTime())) return dateString;
  
  // Format the date
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date string (YYYY-MM-DD) into a short format
 * @param {string} dateString - The date in YYYY-MM-DD format
 * @returns {string} Formatted date string (e.g., "May 10")
 */
export function formatShortDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  // Check if date is valid
  if (isNaN(date.getTime())) return dateString;
  
  // Format the date
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 * @returns {string} Yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Check if a date is today
 * @param {string} dateString - The date in YYYY-MM-DD format
 * @returns {boolean} True if the date is today
 */
export function isToday(dateString) {
  return dateString === getTodayString();
}

/**
 * Check if a date is yesterday
 * @param {string} dateString - The date in YYYY-MM-DD format
 * @returns {boolean} True if the date is yesterday
 */
export function isYesterday(dateString) {
  return dateString === getYesterdayString();
}

/**
 * Get a relative date description (Today, Yesterday, or formatted date)
 * @param {string} dateString - The date in YYYY-MM-DD format
 * @returns {string} Relative date description
 */
export function getRelativeDateString(dateString) {
  if (isToday(dateString)) return 'Today';
  if (isYesterday(dateString)) return 'Yesterday';
  return formatDate(dateString);
}

/**
 * Get emoji for a given mood
 * @param {string} mood - The mood identifier
 * @returns {string} Emoji representing the mood
 */
export function getMoodEmoji(mood) {
  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    excited: '🤩',
    tired: '😴',
    angry: '😠',
    anxious: '😰',
    calm: '😌',
    surprised: '😲',
    proud: '😄',
    grateful: '🙏'
  };
  
  return moodEmojis[mood] || '😐';
}