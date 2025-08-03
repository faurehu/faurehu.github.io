// ChartOptions Component
// Centralized component for handling chart option UI (sliders, dropdowns, toggles)

const ChartOptions = ({ 
  data, 
  options, 
  selections, 
  onSelectionChange, 
  style = {},
  chartType = 'choropleth' // Add chartType parameter to differentiate behavior
}) => {
  if (!data || !options || !Array.isArray(options) || options.length === 0) {
    return null;
  }

  // Helper function to check if a variable is numeric
  const isNumericVariable = (values) => {
    // Check if all values can be converted to numbers
    return values.every(val => {
      const num = Number(val);
      return !isNaN(num) && isFinite(num);
    });
  };

  const renderOptionControl = (option, index) => {
    const uniqueVals = [...new Set(data.map(row => row[option]).filter(v => v !== undefined))];
    const sortedVals = uniqueVals.sort((a, b) => {
      // Sort numerically if possible, otherwise alphabetically
      const aNum = Number(a);
      const bNum = Number(b);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return String(a).localeCompare(String(b));
    });

    // Check if this variable is numeric
    const isNumeric = isNumericVariable(sortedVals);

    // For stacked area charts, only use sliders for 'año' when it has more than 3 values
    // For choropleth charts, use the original logic
    if (chartType === 'stacked-area') {
      // For stacked area charts, always use dropdowns for area grouping variables
      if (sortedVals.length === 2) {
        return (
          <div key={option} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>
              {option.replace(/_/g, ' ').charAt(0).toUpperCase() + option.replace(/_/g, ' ').slice(1)}
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {sortedVals.map(val => (
                <button
                  key={val}
                  onClick={() => {
                    const parsed = val !== '' && !isNaN(Number(val)) ? Number(val) : val;
                    onSelectionChange(option, parsed);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: (selections[option] === val || (!selections[option] && val === sortedVals[0])) ? '#007bff' : 'white',
                    color: (selections[option] === val || (!selections[option] && val === sortedVals[0])) ? 'white' : '#555',
                    fontWeight: (selections[option] === val || (!selections[option] && val === sortedVals[0])) ? 'bold' : 'normal'
                  }}
                  onMouseEnter={(e) => {
                    if (e.target.style.backgroundColor !== 'rgb(0, 123, 255)') {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.target.style.backgroundColor !== 'rgb(0, 123, 255)') {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        );
      } else {
        // Dropdown for stacked area charts
        return (
          <div key={option} style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: isMobile ? '6px' : '8px',
            width: isMobile ? '100%' : 'auto'
          }}>
            <label style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: '#555',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {option.replace(/_/g, ' ').charAt(0).toUpperCase() + option.replace(/_/g, ' ').slice(1)}
            </label>
            <select
              value={selections[option] || ''}
              onChange={e => {
                const val = e.target.value;
                const parsed = val !== '' && !isNaN(Number(val)) ? Number(val) : val;
                onSelectionChange(option, parsed);
              }}
              style={{ 
                padding: isMobile ? '8px 12px' : '6px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                fontSize: isMobile ? '14px' : '15px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {sortedVals.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        );
      }
    } else {
      // Logic for choropleth charts
      // Use slider only for numeric variables with 3 or more values
      // Use toggle for exactly 2 values, dropdown for others
      
      // Check if there are exactly 2 values - use toggle button for any variable
      if (sortedVals.length === 2) {
        return (
          <div key={option} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>
              {option.replace(/_/g, ' ').charAt(0).toUpperCase() + option.replace(/_/g, ' ').slice(1)}
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {sortedVals.map(val => (
                <button
                  key={val}
                  onClick={() => {
                    const parsed = val !== '' && !isNaN(Number(val)) ? Number(val) : val;
                    onSelectionChange(option, parsed);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: (selections[option] === val || (!selections[option] && val === sortedVals[0])) ? '#007bff' : 'white',
                    color: (selections[option] === val || (!selections[option] && val === sortedVals[0])) ? 'white' : '#555',
                    fontWeight: (selections[option] === val || (!selections[option] && val === sortedVals[0])) ? 'bold' : 'normal'
                  }}
                  onMouseEnter={(e) => {
                    if (e.target.style.backgroundColor !== 'rgb(0, 123, 255)') {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.target.style.backgroundColor !== 'rgb(0, 123, 255)') {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        );
      }
      
      // Use slider only for numeric variables with 3 or more values
      if (isNumeric && sortedVals.length >= 3) {
        return (
          <div key={option} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: isMobile ? '6px' : '8px',
            minWidth: isMobile ? '100%' : '200px'
          }}>
            <label style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: '#555', 
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {option.replace(/_/g, ' ').charAt(0).toUpperCase() + option.replace(/_/g, ' ').slice(1)}
            </label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: isMobile ? '8px' : '12px', 
              width: '100%' 
            }}>
              <span style={{ fontSize: '12px', color: '#666', minWidth: '40px' }}>
                {sortedVals[0]}
              </span>
              <input
                type="range"
                min={0}
                max={sortedVals.length - 1}
                value={sortedVals.indexOf(selections[option]) || 0}
                onChange={e => {
                  const selectedIndex = parseInt(e.target.value);
                  const selectedVal = sortedVals[selectedIndex];
                  const parsed = selectedVal !== '' && !isNaN(Number(selectedVal)) ? Number(selectedVal) : selectedVal;
                  onSelectionChange(option, parsed);
                }}
                style={{
                  flex: '1',
                  height: '6px',
                  borderRadius: '3px',
                  background: '#ddd',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '12px', color: '#666', minWidth: '40px' }}>
                {sortedVals[sortedVals.length - 1]}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#007bff', fontWeight: 'bold' }}>
              {selections[option] || sortedVals[0]}
            </div>
          </div>
        );
      } else {
        // Dropdown for non-numeric variables or numeric variables with fewer than 3 values
        return (
          <div key={option} style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: isMobile ? '6px' : '8px',
            width: isMobile ? '100%' : 'auto'
          }}>
            <label style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: '#555',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {option.replace(/_/g, ' ').charAt(0).toUpperCase() + option.replace(/_/g, ' ').slice(1)}
            </label>
            <select
              value={selections[option] || ''}
              onChange={e => {
                const val = e.target.value;
                const parsed = val !== '' && !isNaN(Number(val)) ? Number(val) : val;
                onSelectionChange(option, parsed);
              }}
              style={{ 
                padding: isMobile ? '8px 12px' : '6px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                fontSize: isMobile ? '14px' : '15px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {sortedVals.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        );
      }
    }
  };

  // Detect mobile for responsive design
  const isMobile = window.innerWidth < 768;
  
  return (
    <div style={{ 
      display: 'flex', 
      gap: isMobile ? '12px' : '16px', 
      justifyContent: 'center', 
      marginBottom: isMobile ? '16px' : '24px', 
      flexWrap: 'wrap',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      ...style
    }}>
      {options.map((option, index) => renderOptionControl(option, index))}
    </div>
  );
}; 