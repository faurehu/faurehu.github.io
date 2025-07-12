// Data Loader for Peru Data Widget
// Handles loading configuration and CSV data files

class DataLoader {
  constructor() {
    this.config = null;
    this.dataCache = new Map();
  }

  // Load the main configuration file
  async loadConfig() {
    try {
      const response = await fetch('/assets/js/peru-data-widget/config.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      this.config = await response.json();
      return this.config;
    } catch (error) {
      console.error('Error loading config:', error);
      throw error;
    }
  }

  // Load a CSV file and parse it
  async loadCSV(filename) {
    // Check cache first
    if (this.dataCache.has(filename)) {
      return this.dataCache.get(filename);
    }

    try {
      const response = await fetch(`/assets/data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load CSV ${filename}: ${response.status}`);
      }
      
      const csvText = await response.text();
      const data = this.parseCSV(csvText);
      
      // Cache the result
      this.dataCache.set(filename, data);
      return data;
    } catch (error) {
      console.error(`Error loading CSV ${filename}:`, error);
      throw error;
    }
  }

  // Parse CSV text into array of objects
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index] ? values[index].trim() : '';
      });
      return obj;
    });
  }

  // Load all data for a specific item
  async loadItemData(item) {
    if (!item.datafile) {
      throw new Error('Item has no datafile specified');
    }
    
    const data = await this.loadCSV(item.datafile);
    
    // Convert string values to appropriate types
    return data.map(row => {
      const processedRow = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        // Try to convert to number if it looks like one
        if (!isNaN(value) && value !== '') {
          processedRow[key] = Number(value);
        } else {
          processedRow[key] = value;
        }
      });
      return processedRow;
    });
  }

  // Get all categories and their items
  getCategories() {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    return this.config.categories;
  }

  // Find an item by its name across all categories
  findItemByName(itemName) {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    
    for (const category of this.config.categories) {
      const item = category.items.find(item => item.name === itemName);
      if (item) {
        return { category, item };
      }
    }
    return null;
  }

  // Get all items flattened
  getAllItems() {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    
    const items = [];
    this.config.categories.forEach(category => {
      category.items.forEach(item => {
        items.push({
          ...item,
          categoryName: category.name,
          categoryVariable: category.variable
        });
      });
    });
    return items;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
} 