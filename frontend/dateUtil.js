/**
 * Date utility functions for formatting and parsing dates
 */

/**
 * Format date string to Israeli format (dd-mm-yyyy)
 * @param {string} dateString - ISO format date string (yyyy-mm-dd)
 * @returns {string} Formatted date in dd-mm-yyyy format
 */
function formatDateToIsraeli(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
}

/**
 * Parse Israeli date format (dd-mm-yyyy) to ISO format (yyyy-mm-dd)
 * @param {string} israeliDateString - Date in dd-mm-yyyy format
 * @returns {string} ISO format date string
 */
function parseIsraeliDate(israeliDateString) {
  if (!israeliDateString) return '';
  
  try {
    const parts = israeliDateString.split('-');
    if (parts.length !== 3) return israeliDateString;
    
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error parsing date:", error);
    return '';
  }
}
