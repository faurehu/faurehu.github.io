// Peru Data Widget - Main Entry Point
// This file initializes and renders the Peru data widget

// Import dependencies (these will be loaded via script tags in the HTML)
// const { peruData, metrics, dataSources } = require('./data.js');
// const { formatNumber, getTrendIndicator, getTrendColor } = require('./utils.js');
// const PeruDataWidget = require('./PeruDataWidget.jsx');

// Main initialization function
const initPeruDataWidget = () => {
  // Check if React is available
  if (typeof React === 'undefined') {
    console.error('React is not loaded. Please include React and ReactDOM scripts.');
    return;
  }
  
  // Check if the container exists
  const container = document.getElementById('peru-data-widget');
  if (!container) {
    console.error('Container element with id "peru-data-widget" not found.');
    return;
  }
  
  // Create root and render the widget
  try {
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(PeruDataWidget));
    console.log('Peru Data Widget initialized successfully');
  } catch (error) {
    console.error('Error initializing Peru Data Widget:', error);
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPeruDataWidget);
} else {
  initPeruDataWidget();
}

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initPeruDataWidget };
} 