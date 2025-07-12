// Peru Data - Economic and Demographic Indicators
// This file contains all the data used by the Peru Data Widget

const peruData = [
  {
    year: 2020,
    population: 32971854,
    gdp: 202.6,
    inflation: 1.8,
    exports: 40.9,
    imports: 35.2,
    unemployment: 7.4,
    currency: "PEN",
    exchangeRate: 3.49
  },
  {
    year: 2021,
    population: 33359464,
    gdp: 223.2,
    inflation: 6.4,
    exports: 67.2,
    imports: 52.1,
    unemployment: 6.8,
    currency: "PEN",
    exchangeRate: 3.95
  },
  {
    year: 2022,
    population: 33715471,
    gdp: 242.6,
    inflation: 8.6,
    exports: 67.3,
    imports: 58.9,
    unemployment: 6.0,
    currency: "PEN",
    exchangeRate: 3.83
  },
  {
    year: 2023,
    population: 34049588,
    gdp: 264.6,
    inflation: 3.2,
    exports: 65.1,
    imports: 55.3,
    unemployment: 5.7,
    currency: "PEN",
    exchangeRate: 3.71
  }
];

// Metric definitions with formatting and units
const metrics = {
  population: { 
    label: 'Population', 
    format: (num) => num.toLocaleString(), 
    unit: '',
    description: 'Total population in millions'
  },
  gdp: { 
    label: 'GDP', 
    format: (num) => `$${num}B`, 
    unit: 'Billions USD',
    description: 'Gross Domestic Product in billions of US dollars'
  },
  inflation: { 
    label: 'Inflation Rate', 
    format: (num) => `${num}%`, 
    unit: '%',
    description: 'Annual inflation rate percentage'
  },
  exports: { 
    label: 'Exports', 
    format: (num) => `$${num}B`, 
    unit: 'Billions USD',
    description: 'Total exports in billions of US dollars'
  },
  imports: { 
    label: 'Imports', 
    format: (num) => `$${num}B`, 
    unit: 'Billions USD',
    description: 'Total imports in billions of US dollars'
  },
  unemployment: { 
    label: 'Unemployment', 
    format: (num) => `${num}%`, 
    unit: '%',
    description: 'Unemployment rate percentage'
  },
  exchangeRate: { 
    label: 'Exchange Rate', 
    format: (num) => `${num} PEN/USD`, 
    unit: 'PEN/USD',
    description: 'Peruvian Sol to US Dollar exchange rate'
  }
};

// Data sources information
const dataSources = {
  population: "World Bank - World Development Indicators",
  gdp: "International Monetary Fund (IMF) - World Economic Outlook",
  inflation: "International Monetary Fund (IMF) - World Economic Outlook",
  exports: "World Trade Organization (WTO) - Trade Statistics",
  imports: "World Trade Organization (WTO) - Trade Statistics",
  unemployment: "International Labour Organization (ILO) - ILOSTAT",
  exchangeRate: "International Monetary Fund (IMF) - International Financial Statistics"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { peruData, metrics, dataSources };
} 