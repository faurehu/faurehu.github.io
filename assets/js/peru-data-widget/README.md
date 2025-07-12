# Peru Data Widget

A React-based interactive widget for displaying Peru's economic and demographic indicators.

## 📁 File Structure

```
assets/js/peru-data-widget/
├── README.md              # This documentation file
├── main.js               # Main entry point and initialization
├── PeruDataWidget.jsx    # Main React component
├── data.js              # Data definitions and sources
└── utils.js             # Utility functions
```

## 🚀 Features

- **Interactive Data Display**: View Peru's key indicators from 2020-2023
- **Multiple Metrics**: Population, GDP, Inflation, Exports, Imports, Unemployment, Exchange Rate
- **Two View Modes**: Cards view and Table view
- **Responsive Design**: Works on desktop and mobile devices
- **Trend Indicators**: Visual indicators for data trends
- **Data Validation**: Built-in data validation and error handling

## 📊 Available Metrics

| Metric | Unit | Description |
|--------|------|-------------|
| Population | Count | Total population |
| GDP | Billions USD | Gross Domestic Product |
| Inflation Rate | % | Annual inflation rate |
| Exports | Billions USD | Total exports |
| Imports | Billions USD | Total imports |
| Unemployment | % | Unemployment rate |
| Exchange Rate | PEN/USD | Peruvian Sol to US Dollar |

## 🛠️ Usage

### Basic Implementation

1. Include the required scripts in your HTML:
```html
<!-- React and ReactDOM -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<!-- Widget container -->
<div id="peru-data-widget"></div>

<!-- Widget scripts -->
<script type="text/babel" src="/assets/js/peru-data-widget/data.js"></script>
<script type="text/babel" src="/assets/js/peru-data-widget/utils.js"></script>
<script type="text/babel" src="/assets/js/peru-data-widget/PeruDataWidget.jsx"></script>
<script type="text/babel" src="/assets/js/peru-data-widget/main.js"></script>
```

### Customization

#### Adding New Metrics

1. Add the metric to `data.js`:
```javascript
const metrics = {
  // ... existing metrics
  newMetric: { 
    label: 'New Metric', 
    format: (num) => `${num} units`, 
    unit: 'units',
    description: 'Description of the new metric'
  }
};
```

2. Add data to the `peruData` array:
```javascript
const peruData = [
  {
    year: 2020,
    // ... existing data
    newMetric: 123.45
  }
  // ... other years
];
```

#### Styling Customization

The widget uses inline styles for easy customization. You can modify the styles in `PeruDataWidget.jsx` to match your site's theme.

## 📈 Data Sources

- **Population**: World Bank - World Development Indicators
- **GDP & Inflation**: International Monetary Fund (IMF) - World Economic Outlook
- **Trade Data**: World Trade Organization (WTO) - Trade Statistics
- **Unemployment**: International Labour Organization (ILO) - ILOSTAT
- **Exchange Rate**: International Monetary Fund (IMF) - International Financial Statistics

## 🔧 Development

### Adding New Features

1. **New View Mode**: Add a new rendering function in `PeruDataWidget.jsx`
2. **Data Processing**: Add utility functions in `utils.js`
3. **Data Updates**: Modify the `peruData` array in `data.js`

### Testing

The widget is designed to work in any modern browser. Test across different screen sizes to ensure responsive behavior.

## 📝 Notes

- The widget is completely static and doesn't require a build process
- All data is embedded in the component for offline functionality
- Uses Babel for JSX transformation in the browser
- Compatible with Jekyll static site generation

## 🤝 Contributing

To contribute to this widget:

1. Follow the existing code structure
2. Add appropriate comments for new functions
3. Update this README for any new features
4. Test across different browsers and devices 