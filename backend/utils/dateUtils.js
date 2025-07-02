// utils/dateUtils.js
module.exports = {
  formatDate: (date) => {
    return new Date(date).toISOString().split('T')[0];
  },
  getCurrentMonthYear: () => {
    const now = new Date();
    return {
      month: now.getMonth() + 1, // Months are 0-indexed
      year: now.getFullYear()
    };
  },
  isFutureDate: (date) => {
    return new Date(date) > new Date();
  }
};