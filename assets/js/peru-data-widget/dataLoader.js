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
      const response = await fetch(`/assets/data/${filename}`, {
        headers: {
          'Accept': 'text/csv, text/plain, */*',
          'Accept-Charset': 'utf-8'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to load CSV ${filename}: ${response.status}`);
      }
      
      // Explicitly decode as UTF-8
      const csvText = await response.text();
      
      // Check for BOM and remove if present
      const cleanText = csvText.startsWith('\uFEFF') ? csvText.slice(1) : csvText;
      
      // Debug: Check for encoding issues
      if (cleanText.includes('') || cleanText.includes('?')) {
        console.warn(`Potential encoding issues detected in ${filename}`);
      }
      
      const data = this.parseCSV(cleanText);
      
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
    // Normalize line endings and split
    const lines = csvText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        // Clean and decode the value
        let value = values[index] ? values[index].trim() : '';
        
        // Handle potential encoding issues
        if (value && typeof value === 'string') {
          // Decode any HTML entities that might have been encoded
          value = value.replace(/&amp;/g, '&')
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'")
                      .replace(/&nbsp;/g, ' ');
        }
        
        obj[header] = value;
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