// StackedAreaChart Component
// Renders a stacked area chart using D3

const StackedAreaChart = ({ data, item, width = 800, height = 600, sidebarOpen = true }) => {
  const chartRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Extract parameters from item
  const valueKey = item && item.params && item.params.value ? item.params.value : null;
  const xKey = item && item.params && item.params.x ? item.params.x : null;
  const areaParam = item && item.params && item.params.area;
  
  // Check if this is a single area chart (area = false) or stacked area chart
  const isSingleArea = areaParam === false;
  const areaKeys = !isSingleArea && areaParam ? 
    (Array.isArray(areaParam) ? areaParam : [areaParam]) : null;
  
  // State for selected area variable
  const [selectedAreaKey, setSelectedAreaKey] = React.useState(null);
  const [categoryKey, setCategoryKey] = React.useState(null);
  const [subcategoryKey, setSubcategoryKey] = React.useState(null);

  // Determine category vs subcategory and set default selected area
  React.useEffect(() => {
    if (!data || !areaKeys || areaKeys.length === 0) return;
    
    // Count unique values for each area key to determine which is category vs subcategory
    const uniqueCounts = areaKeys.map(key => ({
      key,
      uniqueCount: new Set(data.map(d => d[key])).size
    }));
    
    // Sort by unique count - fewer unique values = category, more unique values = subcategory
    uniqueCounts.sort((a, b) => a.uniqueCount - b.uniqueCount);
    
    if (uniqueCounts.length >= 2) {
      setCategoryKey(uniqueCounts[0].key); // Fewer unique values = category
      setSubcategoryKey(uniqueCounts[1].key); // More unique values = subcategory
      setSelectedAreaKey(uniqueCounts[1].key); // Default to subcategory for more detailed view
    } else {
      setCategoryKey(uniqueCounts[0].key);
      setSelectedAreaKey(uniqueCounts[0].key);
    }
  }, [data, areaKeys]);

  // Render the area chart (single or stacked)
  React.useEffect(() => {
    if (!data || !chartRef.current || !valueKey || !xKey) {
      return;
    }
    
    // For single area charts, we don't need selectedAreaKey
    if (!isSingleArea && !selectedAreaKey) {
      return;
    }

    // Clear previous chart and any existing tooltips
    d3.select(chartRef.current).selectAll("*").remove();
    d3.select("body").selectAll(".tooltip").remove();

    // Get the actual container width for responsive sizing
    const containerWidth = chartRef.current.offsetWidth;
    
    // Set up the chart dimensions
    const margin = isSingleArea ? 
      { top: 40, right: 40, bottom: 40, left: 80 } : 
      { top: 40, right: 130, bottom: 40, left: 80 };
    const chartWidth = isSingleArea ? 
      containerWidth - margin.left - margin.right : 
      (sidebarOpen ? containerWidth - margin.left - margin.right + 100 : containerWidth - margin.left - margin.right - 60);
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height);

    // Create chart group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "1000")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.3)")
      .style("border", "1px solid rgba(255,255,255,0.2)");

    // Get unique x values
    const xValues = [...new Set(data.map(d => d[xKey]))].sort((a, b) => a - b);
    
    let groupedData, areaCategories, stackData;
    
    if (isSingleArea) {
      // Single area chart - just use the raw data values
      groupedData = xValues.map(xVal => {
        const row = data.find(d => d[xKey] === xVal);
        return {
          [xKey]: xVal,
          value: row ? Number(row[valueKey]) || 0 : 0
        };
      });
      
      areaCategories = ['value'];
      
      // For single area, create a simple stack with one layer
      stackData = d3.stack()
        .keys(['value'])
        .value((d, key) => d[key] || 0)(groupedData);
    } else {
      // Stacked area chart - use the existing logic
      areaCategories = [...new Set(data.map(d => d[selectedAreaKey]))];

      // Prepare data for stacking - group by x value and create objects for each area category
      groupedData = xValues.map(xVal => {
        const obj = { [xKey]: xVal };
        
        if (selectedAreaKey === categoryKey && subcategoryKey) {
          // When displaying at category level, sum all subcategories for each category
          areaCategories.forEach(category => {
            // Find all rows that belong to this category for this x value
            const categoryRows = data.filter(d => 
              d[xKey] === xVal && d[categoryKey] === category
            );
            
            // Sum all values for this category
            const categorySum = d3.sum(categoryRows, d => Number(d[valueKey]) || 0);
            obj[category] = categorySum;
          });
        } else {
          // When displaying at subcategory level, use direct mapping
          areaCategories.forEach(category => {
            const row = data.find(d => d[xKey] === xVal && d[selectedAreaKey] === category);
            obj[category] = row ? Number(row[valueKey]) || 0 : 0;
          });
        }
        
        return obj;
      });
      
      // Calculate total sum for each category to determine stacking order
      const categoryTotals = areaCategories.map(category => ({
        category,
        total: d3.sum(groupedData, d => d[category] || 0)
      }));
      
      // Sort categories by total sum (largest at bottom)
      const sortedCategories = categoryTotals
        .sort((a, b) => b.total - a.total)
        .map(d => d.category);
      
      // Create stack data with sorted categories
      stackData = d3.stack()
        .keys(sortedCategories)
        .value((d, key) => d[key] || 0)(groupedData);
        }

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(xValues), d3.max(xValues)])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackData, layer => d3.max(layer, d => d[1]))])
      .range([chartHeight, 0]);

    // Create color scale
    const colorScale = d3.scaleOrdinal()
      .domain(areaCategories)
      .range(isSingleArea ? ['#1f77b4'] : d3.schemeCategory10);

    // Create area generator
    const area = d3.area()
      .x(d => xScale(d.data[xKey]))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Create line generator for the top of each area
    const line = d3.line()
      .x(d => xScale(d.data[xKey]))
      .y(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

        // Draw the areas
    const areas = g.selectAll(".area")
      .data(stackData)
      .enter()
      .append("path")
      .attr("class", "area")
      .attr("d", area)
      .attr("fill", d => colorScale(d.key))
      .attr("opacity", 0.8)
      .style("pointer-events", "all")
      .style("stroke-width", 10)
      .on("mousemove", function(event, d) {
        d3.select(this).attr("opacity", 1);

        let xValue = 'Unknown';
        let categoryValue = '';
        let subcategoryValue = '';

        const mouseX = event.offsetX - margin.left; // Adjust for chart margins
        const dataX = xScale.invert(mouseX); //
        xValue = Math.round(dataX); // Round dataX to the nearest integer

        let displayValue;
        
        if (isSingleArea) {
          // For single area chart, get the value directly
          const row = data.find(d => d[xKey] === xValue);
          displayValue = row ? Number(row[valueKey]) || 0 : 0;
        } else {
          // For stacked area chart, use the existing logic
          const foundData = d.find(i => i.data.año === xValue);
          displayValue = foundData ? foundData.data[d.key] : null;

          // Get category and subcategory values if available
          if (categoryKey && subcategoryKey) {
            // Find the original data point to get category/subcategory info
            const originalDataPoint = data.find(row => 
              row[xKey] === xValue && row[selectedAreaKey] === d.key
            );
            if (originalDataPoint) {
              categoryValue = originalDataPoint[categoryKey] || '';
              subcategoryValue = originalDataPoint[subcategoryKey] || '';
            }
          }
        }
        
        // Build tooltip content
        let tooltipContent = '';
        
        if (isSingleArea) {
          tooltipContent = `<div>${xValue}: ${displayValue.toLocaleString()}</div>`;
        } else {
          tooltipContent = `<div style="font-weight: bold; margin-bottom: 4px;">${d.key}</div>`;
          
          // Only show category information when viewing subcategories (more detailed view)
          if (selectedAreaKey === subcategoryKey && categoryValue) {
            tooltipContent += `<div style="font-size: 11px; color: #ccc; margin-bottom: 4px;">${categoryKey}: ${categoryValue}</div>`;
          }
          
          tooltipContent += `<div>${xKey}: ${xValue}</div>`;
          tooltipContent += `<div>${valueKey}: ${displayValue.toLocaleString()}</div>`;
        }
        
        tooltip.html(tooltipContent)
          .style("opacity", 1)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 15) + "px");

        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.8);
        tooltip.style("opacity", 0);
      });
    
    // Add a simple test to see if areas are visible
    if (areas.size() === 0) {
      g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight / 2)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "red")
        .text("No areas created - check data structure");
    }

    // Draw the lines on top of areas
    g.selectAll(".line")
      .data(stackData)
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.key))
      .attr("stroke-width", 2);

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => xKey === 'año' ? d : d.toLocaleString());
    
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    // Add Y axis
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => d.toLocaleString())
      .tickValues(yScale.ticks().filter(t => t !== 0));
    
    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "12px");

    if (!sidebarOpen && !isSingleArea) {
      // Add legend only for stacked area charts
      const legend = svg.append("g")
        .attr("transform", `translate(${containerWidth - margin.right - 50}, ${margin.top})`);

      legend.attr("max-width", "161px");

      legend.selectAll(".legend-item")
        .data(areaCategories)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .on("mouseover", function(event, d) {
          d3.select(this).select("rect").attr("opacity", 1);
          d3.select(this).select("line").attr("opacity", 1);
          
          // Dim all areas and lines except the one being hovered
          d3.selectAll(".area").attr("opacity", 0.3);
          d3.selectAll(".line").attr("opacity", 0.3);
          
          // Highlight the specific area and line for this category
          d3.selectAll(".area").filter(function() {
            return d3.select(this).datum().key === d;
          }).attr("opacity", 1);
          
          d3.selectAll(".line").filter(function() {
            return d3.select(this).datum().key === d;
          }).attr("opacity", 1);
        })
        .on("mouseout", function() {
          d3.selectAll(".area").attr("opacity", 0.8);
          d3.selectAll(".line").attr("opacity", 1);
        });

      legend.selectAll(".legend-item")
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorScale(d))
        .attr("opacity", 0.8);

      legend.selectAll(".legend-item")
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(d => d);
    }

  }, [data, item, width, height, sidebarOpen, valueKey, xKey, selectedAreaKey]);

  // Cleanup tooltips when component unmounts
  React.useEffect(() => {
    return () => {
      d3.select("body").selectAll(".tooltip").remove();
    };
  }, []);

  if (error) {
    return (
      <div style={{ 
        color: "#dc3545", 
        padding: "20px", 
        textAlign: "center",
        fontSize: "16px"
      }}>
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        color: "#6c757d", 
        padding: "20px", 
        textAlign: "center",
        fontSize: "16px"
      }}>
        Loading chart...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        color: "#888", 
        padding: "40px", 
        textAlign: "center",
        fontSize: "18px"
      }}>
        Data no disponible
      </div>
    );
  }

  // Render area selection using centralized ChartOptions component
  const renderAreaSelector = () => {
    if (isSingleArea || !areaKeys || areaKeys.length <= 1) return null;
    
    const handleSelectionChange = (option, value) => {
      setSelectedAreaKey(value);
    };
    
    // Create a simple dropdown/toggle for selecting which area variable to group by
    const renderSimpleAreaSelector = () => {
      if (areaKeys.length === 2) {
        // Toggle buttons for 2 options
        return (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>
                Agrupar por:
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {areaKeys.map(key => (
                  <button
                    key={key}
                    onClick={() => setSelectedAreaKey(key)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: selectedAreaKey === key ? '#007bff' : 'white',
                      color: selectedAreaKey === key ? 'white' : '#555',
                      fontWeight: selectedAreaKey === key ? 'bold' : 'normal'
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
                    {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      } else {
        // Dropdown for more than 2 options
        return (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#555' }}>Agrupar por:</label>
              <select
                value={selectedAreaKey || ''}
                onChange={e => setSelectedAreaKey(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' }}
              >
                {areaKeys.map(key => (
                  <option key={key} value={key}>
                    {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      }
    };
    
    return (
      <div style={{ marginBottom: '20px' }}>
        {renderSimpleAreaSelector()}
      </div>
    );
  };

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center"
    }}>
      {renderAreaSelector()}
      <div 
        ref={chartRef}
        style={{ 
          width: "100%", 
          height: height,
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      />
    </div>
  );
}; 