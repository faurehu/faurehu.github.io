// ChoroplethMap Component
// Renders a choropleth map using D3 and TopoJSON

const ChoroplethMap = ({ data, item, width = 800, height = 600, sidebarOpen = true, totalValue = null }) => {
  const mapRef = React.useRef(null);
  const [mapData, setMapData] = React.useState(null);
  const [limaData, setLimaData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Calculate valueKey and values at the top level for use in JSX and map rendering
  const valueKey = item && item.params && item.params.value ? item.params.value : null;
  // Accept numbers or numeric strings
  const values = valueKey ? data.map(d => d[valueKey]).filter(v => v !== '' && v !== null && v !== undefined && !isNaN(Number(v))).map(Number) : [];

  // Determine map type from params at component level
  const mapType = item && item.params && item.params.map_type;
  const useLima = item && item.params && item.params.with_lima;
  const useDistritos = item && item.params && item.params.with_distritos;

  // Load and process the shapefile data
  React.useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        
        // Priority: map_type > with_distritos > with_lima > default
        if (mapType === 'districts' || useDistritos) {
          // Load districts map
          const response = await fetch('/assets/js/peru-data-widget/peru_distritos.geojson');
          if (!response.ok) {
            throw new Error('Failed to load districts map data');
          }
          const districtsData = await response.json();
          setMapData(districtsData);
          setLimaData(null);
        } else if (mapType === 'lima' || useLima) {
          // Load both the original departments shapefile and Lima Metropolitana
          const [departmentsResponse, limaResponse] = await Promise.all([
            fetch('/assets/js/peru-data-widget/peru_departamentos.json'),
            fetch('/assets/js/peru-data-widget/lima_metropolitana.geojson')
          ]);
          
          if (!departmentsResponse.ok) {
            throw new Error('Failed to load departments map data');
          }
          if (!limaResponse.ok) {
            throw new Error('Failed to load Lima Metropolitana map data');
          }
          
          const departmentsData = await departmentsResponse.json();
          const limaMetropolitanaData = await limaResponse.json();
          
          setMapData(departmentsData);
          setLimaData(limaMetropolitanaData);
        } else {
          // Default: Load only the original departments shapefile
          const response = await fetch('/assets/js/peru-data-widget/peru_departamentos.json');
          if (!response.ok) {
            throw new Error('Failed to load map data');
          }
          const geojsonData = await response.json();
          setMapData(geojsonData);
          setLimaData(null);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading map data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [item]);

  // Helper to normalize region names (remove accents, lowercase)
  const normalizeRegion = str => {
    if (!str) return '';
    
    // Handle potential encoding issues first
    let cleanStr = str;
    if (typeof str === 'string') {
      // Decode any HTML entities that might have been encoded
      cleanStr = str.replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'")
                   .replace(/&nbsp;/g, ' ');
    }
    
    return cleanStr.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  };

  // Render the choropleth map
  React.useEffect(() => {
    if (!mapData || !data || !mapRef.current) return;

    // Clear previous map
    d3.select(mapRef.current).selectAll("*").remove();

    // Set up the map dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const mapWidth = width - margin.left - margin.right;
    const mapHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(mapRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create projection - use the main map data for fitting
    const projection = d3.geoMercator()
      .fitSize([mapWidth, mapHeight], mapData);

    // Adjust translation: move left and lower, and shift if sidebar is closed
    const sidebarShift = sidebarOpen ? 0 : 100;
    const currentTranslate = projection.translate();
    projection.translate([currentTranslate[0] - 130 + sidebarShift, currentTranslate[1] + 14]);

    // Create path generator
    const path = d3.geoPath().projection(projection);

    // Create color scale
    // Accept numbers or numeric strings
    const values = valueKey ? data.map(d => d[valueKey]).filter(v => v !== '' && v !== null && v !== undefined && !isNaN(Number(v))).map(Number) : [];
    // Debug: log extracted values
    if (!valueKey || values.length === 0) {
      d3.select(mapRef.current).selectAll("*").remove();
      d3.select(mapRef.current)
        .append("div")
        .style("color", "#888")
        .style("fontSize", "18px")
        .style("padding", "40px")
        .style("textAlign", "center")
        .text("Data no disponible");
      return;
    }

    const colorScale = d3.scaleSequential()
      .domain([d3.min(values), d3.max(values)])
      .interpolator(d3.interpolateBlues);

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Draw the main map (departments or districts)
    svg.selectAll("path.region")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr("class", "region")
      .attr("d", path)
      .attr("fill", d => {
        // Find matching data for this region
        let regionData = null;

        if (mapType === 'districts' || useDistritos) {
          // For districts map, match by DEPARTAMENTO, PROVINCIA, DISTRITO
          const departamento = normalizeRegion(d.properties.NOMBDEP);
          const provincia = normalizeRegion(d.properties.NOMBPROV);
          const distrito = normalizeRegion(d.properties.NOMBDIST);

          regionData = data.find(item => 
            (item.departamento && normalizeRegion(item.departamento) === departamento) &&
            (item.provincia && normalizeRegion(item.provincia) === provincia) &&
            (item.distrito && normalizeRegion(item.distrito) === distrito)
          );
        } else {
          // For departments map, match by NOMBDEP
          const regionName = normalizeRegion(d.properties.NOMBDEP);
          regionData = data.find(item => 
            (item.region && normalizeRegion(item.region) === regionName) ||
            (item.departamento && normalizeRegion(item.departamento) === regionName)
          );
        }
        
        if (regionData && valueKey && regionData[valueKey] !== undefined && !isNaN(Number(regionData[valueKey]))) {
          return colorScale(Number(regionData[valueKey]));
        }
        return "#ccc"; // Transparent for regions without data
      })
      .attr("stroke", "#888")
      .attr("stroke-width", 0.5)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("stroke-width", 2).attr("stroke", "#888");
        
        // Find data for this region
        let regionData = null;
        let tooltipContent = "";
        
        if (mapType === 'districts' || useDistritos) {
          // For districts map, show full hierarchy
          const departamento = normalizeRegion(d.properties.NOMBDEP);
          const provincia = normalizeRegion(d.properties.NOMBPROV);
          const distrito = normalizeRegion(d.properties.NOMBDIST);
          
          regionData = data.find(item => 
            (item.departamento && normalizeRegion(item.departamento) === departamento) &&
            (item.provincia && normalizeRegion(item.provincia) === provincia) &&
            (item.distrito && normalizeRegion(item.distrito) === distrito)
          );
          
          tooltipContent = `<strong style='color:white'>${d.properties.NOMBDIST}</strong><br/>${d.properties.NOMBPROV}, ${d.properties.NOMBDEP}`;
        } else {
          // For departments map
          const regionName = normalizeRegion(d.properties.NOMBDEP);
          regionData = data.find(item => 
            (item.region && normalizeRegion(item.region) === regionName) ||
            (item.departamento && normalizeRegion(item.departamento) === regionName)
          );
          
          tooltipContent = `<strong style='color:white'>${d.properties.NOMBDEP}</strong>`;
        }
        
        if (regionData && valueKey && regionData[valueKey] !== undefined && !isNaN(Number(regionData[valueKey]))) {
          tooltipContent += `<br/>${formatNumber(Number(regionData[valueKey]), item)}`;
        } else {
          tooltipContent += `<br/>Data no disponible`;
        }
        
        tooltip.html(tooltipContent)
          .style("opacity", 1)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-width", 0.5).attr("stroke", "#888");
        tooltip.style("opacity", 0);
      });

    // Draw Lima Metropolitana overlay if available
    if (limaData) {
      svg.selectAll("path.lima")
        .data(limaData.features)
        .enter()
        .append("path")
        .attr("class", "lima")
        .attr("d", path)
        .attr("fill", d => {
          // Find matching data for Lima Metropolitana
          const regionName = normalizeRegion(d.properties.NOMBDEP);
          const regionData = data.find(item => 
            (item.region && normalizeRegion(item.region) === regionName) ||
            (item.departamento && normalizeRegion(item.departamento) === regionName)
          );
          
          if (regionData && valueKey && regionData[valueKey] !== undefined && !isNaN(Number(regionData[valueKey]))) {
            return colorScale(Number(regionData[valueKey]));
          }
          return "#ccc"; // Transparent for regions without data
        })
        .attr("stroke", "#888")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("stroke-width", 2).attr("stroke", "#888");
          
          // Find data for this region
          const regionName = normalizeRegion(d.properties.NOMBDEP);
          const regionData = data.find(item => 
            (item.region && normalizeRegion(item.region) === regionName) ||
            (item.departamento && normalizeRegion(item.departamento) === regionName)
          );
          
          let tooltipContent = `<strong style='color:white'>${d.properties.NOMBDEP}</strong>`;
          if (regionData && valueKey && regionData[valueKey] !== undefined && !isNaN(Number(regionData[valueKey]))) {
            tooltipContent += `<br/>${formatNumber(Number(regionData[valueKey]), item)}`;
          } else {
            tooltipContent += `<br/>Data no disponible`;
          }
          
          tooltip.html(tooltipContent)
            .style("opacity", 1)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("stroke-width", 0.5).attr("stroke", "#888");
          tooltip.style("opacity", 0);
        });
    }

    // Add legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - 580 + sidebarShift;
    const legendY = height - legendHeight - 20;

    // Create legend gradient
    const legendGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    legendGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(d3.min(values)));

    legendGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(d3.max(values)));

    // Draw legend rectangle
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .style("stroke", "#ccc");

    // Add legend labels
    svg.append("text")
      .attr("x", legendX)
      .attr("y", legendY - 5)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text(formatNumber(d3.min(values), item));

    svg.append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY - 5)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text(formatNumber(d3.max(values), item));

    // Cleanup function
    return () => {
      d3.select("body").selectAll(".tooltip").remove();
    };
  }, [mapData, limaData, data, item, width, height, sidebarOpen]);

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        textAlign: 'center',
        flex: '1, 1, 0%',
        width: '100%',
        position: 'relative',
        height: height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '16px',
          color: '#6c757d'
        }}>
          Loading map...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        textAlign: 'center',
        flex: '1, 1, 0%',
        width: '100%',
        position: 'relative',
        height: height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          color: '#721c24',
          maxWidth: '400px'
        }}>
          <strong>Error loading map:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      textAlign: 'center',
      flex: '1, 1, 0%',
      width: '100%',
      position: 'relative'
    }}>
      {/* Total label in top left if item.total is true */}
      {item && item.params.total && (totalValue !== null || (valueKey && values.length > 0)) && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 20,
          fontWeight: 'bold',
          fontSize: '1.1rem',
          color: '#333',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: '4px',
          padding: '4px 12px',
          zIndex: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          Total: {totalValue !== null ? formatNumber(totalValue, item) : values.reduce((a, b) => a + b, 0).toLocaleString()}
        </div>
      )}
      <div ref={mapRef} style={{
        width: '100%',
        height: '100%',
        flex: '1, 1, 0%'
      }}></div>
    </div>
  );
};

// Helper function to format numbers (same as in PeruDataWidget)
const formatNumber = (num, item) => {
  if (!item || !item.params) return num.toString();
  
  switch (item.params.format) {
    case 'number':
      return num.toLocaleString();
    case 'percentage':
      return `${num}%`;
    case 'currency':
      return `$${num.toLocaleString()}`;
    default:
      return num.toString();
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChoroplethMap;
} 