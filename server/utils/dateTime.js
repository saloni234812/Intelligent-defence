const moment = require('moment-timezone');

class DateTimeUtils {
  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @param {string} format - Moment.js format string
   * @param {string} timezone - Timezone (default: UTC)
   * @returns {string} Formatted date string
   */
  static formatDate(date, format = 'YYYY-MM-DD HH:mm:ss', timezone = 'UTC') {
    return moment(date).tz(timezone).format(format);
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   * @param {Date|string} date - Date to compare
   * @returns {string} Relative time string
   */
  static getRelativeTime(date) {
    return moment(date).fromNow();
  }

  /**
   * Check if date is within specified range
   * @param {Date|string} date - Date to check
   * @param {number} minutes - Minutes range
   * @returns {boolean} True if within range
   */
  static isWithinMinutes(date, minutes) {
    return moment().diff(moment(date), 'minutes') <= minutes;
  }

  /**
   * Get current timestamp in ISO format
   * @returns {string} ISO timestamp
   */
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Parse date string safely
   * @param {string} dateString - Date string to parse
   * @returns {Date|null} Parsed date or null if invalid
   */
  static parseDate(dateString) {
    const date = moment(dateString);
    return date.isValid() ? date.toDate() : null;
  }

  /**
   * Get timezone offset in minutes
   * @param {string} timezone - Timezone identifier
   * @returns {number} Offset in minutes
   */
  static getTimezoneOffset(timezone) {
    return moment.tz(timezone).utcOffset();
  }

  /**
   * Convert UTC time to timezone
   * @param {Date|string} utcDate - UTC date
   * @param {string} timezone - Target timezone
   * @returns {Date} Converted date
   */
  static convertToTimezone(utcDate, timezone) {
    return moment(utcDate).tz(timezone).toDate();
  }

  /**
   * Get start and end of day for a date
   * @param {Date|string} date - Date
   * @param {string} timezone - Timezone
   * @returns {Object} Object with start and end dates
   */
  static getDayBounds(date, timezone = 'UTC') {
    const momentDate = moment(date).tz(timezone);
    return {
      start: momentDate.startOf('day').toDate(),
      end: momentDate.endOf('day').toDate()
    };
  }

  /**
   * Calculate duration between two dates
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @param {string} unit - Unit (seconds, minutes, hours, days)
   * @returns {number} Duration in specified unit
   */
  static getDuration(startDate, endDate, unit = 'minutes') {
    return moment(endDate).diff(moment(startDate), unit);
  }
}

module.exports = DateTimeUtils;


