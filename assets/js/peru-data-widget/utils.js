// Peru Data Widget - Utilities
// Common utility functions for the Peru data widget

// Format numbers based on metric type
const formatNumber = (num, metricType) => {
  const formatters = {
    population: (n) => n.toLocaleString(),
    gdp: (n) => `$${n}B`,
    inflation: (n) => `${n}%`,
    exports: (n) => `$${n}B`,
    imports: (n) => `$${n}B`,
    unemployment: (n) => `${n}%`,
    exchangeRate: (n) => `${n} PEN/USD`
  };
  
  return formatters[metricType] ? formatters[metricType](num) : num.toString();
};

// Calculate percentage change between two values
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Get trend indicator (up, down, or stable)
const getTrendIndicator = (current, previous, threshold = 0.1) => {
  const change = calculatePercentageChange(current, previous);
  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'up' : 'down';
};

// Generate trend color based on metric and direction
const getTrendColor = (metric, trend) => {
  const colorMap = {
    population: { up: '#28a745', down: '#dc3545', stable: '#6c757d' },
    gdp: { up: '#28a745', down: '#dc3545', stable: '#6c757d' },
    inflation: { up: '#dc3545', down: '#28a745', stable: '#6c757d' },
    exports: { up: '#28a745', down: '#dc3545', stable: '#6c757d' },
    imports: { up: '#dc3545', down: '#28a745', stable: '#6c757d' },
    unemployment: { up: '#dc3545', down: '#28a745', stable: '#6c757d' },
    exchangeRate: { up: '#dc3545', down: '#28a745', stable: '#6c757d' }
  };
  
  return colorMap[metric]?.[trend] || '#6c757d';
};

// Get trend arrow symbol
const getTrendArrow = (trend) => {
  const arrows = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };
  return arrows[trend] || '→';
};

// Validate data structure
const validateData = (data) => {
  if (!Array.isArray(data)) return false;
  
  const requiredFields = ['year', 'population', 'gdp'];
  return data.every(item => 
    requiredFields.every(field => 
      item.hasOwnProperty(field) && item[field] !== null && item[field] !== undefined
    )
  );
};

// Sort data by year
const sortDataByYear = (data, ascending = true) => {
  return [...data].sort((a, b) => {
    return ascending ? a.year - b.year : b.year - a.year;
  });
};

// Get latest data point
const getLatestData = (data) => {
  const sorted = sortDataByYear(data, false);
  return sorted[0] || null;
};

// Get data for specific year
const getDataForYear = (data, year) => {
  return data.find(item => item.year === year) || null;
};

// Calculate average for a metric
const calculateAverage = (data, metric) => {
  const values = data.map(item => item[metric]).filter(val => !isNaN(val));
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

// URL utilities for chart routing
const chartNameToSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

const slugToChartName = (slug, allItems) => {
  // Find the item that matches this slug
  return allItems.find(item => chartNameToSlug(item.name) === slug);
};

const getChartFromURL = (allItems) => {
  const path = window.location.pathname;
  const match = path.match(/\/peru-data\/(.+?)\/?$/);
  
  if (match) {
    const slug = match[1];
    const item = slugToChartName(slug, allItems);
    
    // If we found a valid item, update the URL to the clean format
    if (item) {
      // Update URL without triggering a page reload
      const cleanURL = `/peru-data/${slug}`;
      if (window.location.pathname !== cleanURL) {
        window.history.replaceState({ chart: item.name }, item.title, cleanURL);
      }
    }
    
    return item;
  }
  
  return null;
};

const updateURL = (item) => {
  if (!item) return;
  
  const slug = chartNameToSlug(item.name);
  const newURL = `/peru-data/${slug}`;
  
  // Update URL without reloading the page
  window.history.pushState({ chart: item.name }, item.title, newURL);
};

const handleInvalidChartURL = (slug) => {
  // If someone visits an invalid chart URL, redirect to the main page
  console.warn(`Invalid chart slug: ${slug}. Redirecting to main page.`);
  window.history.replaceState({}, 'Peru Data', '/peru-data');
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatNumber,
    calculatePercentageChange,
    getTrendIndicator,
    getTrendColor,
    getTrendArrow,
    validateData,
    sortDataByYear,
    getLatestData,
    getDataForYear,
    calculateAverage
  };
} 