// Peru Data Widget - Main Component
// This component displays key economic and demographic indicators for Peru

const PeruDataWidget = () => {
  const [config, setConfig] = React.useState(null);
  const [data, setData] = React.useState({});
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true); // Sidebar is open by default
  const [expandedCategories, setExpandedCategories] = React.useState([]); // Categories expanded by default
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [showAbout, setShowAbout] = React.useState(false); // About page state
  
  const dataLoader = React.useRef(new DataLoader());
  
  // Get all items flattened for pagination
  const getAllItems = () => {
    if (!config) return [];
    const items = [];
    config.categories.forEach(category => {
      category.items.forEach(item => {
        items.push({
          ...item,
          categoryName: category.name,
          categoryVariable: category.variable
        });
      });
    });
    return items;
  };
  
  // Navigate to next item
  const goToNextItem = async () => {
    if (!selectedItem) return;
    
    const allItems = getAllItems();
    const currentIndex = allItems.findIndex(item => item.name === selectedItem.name);
    
    if (currentIndex >= 0 && currentIndex < allItems.length - 1) {
      const nextItem = allItems[currentIndex + 1];
      
      try {
        // Load data for next item if not already loaded
        if (!data[nextItem.name]) {
          const itemData = await dataLoader.current.loadItemData(nextItem);
          setData(prev => ({ ...prev, [nextItem.name]: itemData }));
        }
        
        setSelectedItem(nextItem);
        
        // Expand the category if it's not already expanded
        if (!expandedCategories.includes(nextItem.categoryVariable)) {
          setExpandedCategories(prev => [...prev, nextItem.categoryVariable]);
        }
        
        // Update URL
        updateURL(nextItem);
      } catch (err) {
        console.error('Error loading next item data:', err);
      }
    }
  };
  
  // Navigate to previous item
  const goToPreviousItem = async () => {
    if (!selectedItem) return;
    
    const allItems = getAllItems();
    const currentIndex = allItems.findIndex(item => item.name === selectedItem.name);
    
    if (currentIndex > 0) {
      const prevItem = allItems[currentIndex - 1];
      
      try {
        // Load data for previous item if not already loaded
        if (!data[prevItem.name]) {
          const itemData = await dataLoader.current.loadItemData(prevItem);
          setData(prev => ({ ...prev, [prevItem.name]: itemData }));
        }
        
        setSelectedItem(prevItem);
        
        // Expand the category if it's not already expanded
        if (!expandedCategories.includes(prevItem.categoryVariable)) {
          setExpandedCategories(prev => [...prev, prevItem.categoryVariable]);
        }
        
        // Update URL
        updateURL(prevItem);
      } catch (err) {
        console.error('Error loading previous item data:', err);
      }
    }
  };
  
  // Check if navigation is possible
  const canGoNext = () => {
    if (!selectedItem) return false;
    const allItems = getAllItems();
    const currentIndex = allItems.findIndex(item => item.name === selectedItem.name);
    return currentIndex >= 0 && currentIndex < allItems.length - 1;
  };
  
  const canGoPrevious = () => {
    if (!selectedItem) return false;
    const allItems = getAllItems();
    const currentIndex = allItems.findIndex(item => item.name === selectedItem.name);
    return currentIndex > 0;
  };

  // Get next/previous item names for tooltips
  const getNextItemName = () => {
    if (!selectedItem) return '';
    const allItems = getAllItems();
    const currentIndex = allItems.findIndex(item => item.name === selectedItem.name);
    if (currentIndex >= 0 && currentIndex < allItems.length - 1) {
      return allItems[currentIndex + 1].name;
    }
    return '';
  };

  const getPreviousItemName = () => {
    if (!selectedItem) return '';
    const allItems = getAllItems();
    const currentIndex = allItems.findIndex(item => item.name === selectedItem.name);
    if (currentIndex > 0) {
      return allItems[currentIndex - 1].name;
    }
    return '';
  };
  
  // Load configuration and initial data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const configData = await dataLoader.current.loadConfig();
        setConfig(configData);
        
        // Get all items for URL routing
        const allItems = [];
        configData.categories.forEach(category => {
          category.items.forEach(item => {
            allItems.push({
              ...item,
              categoryName: category.name,
              categoryVariable: category.variable
            });
          });
        });
        
        // Check if there's a specific chart requested in the URL
              const path = window.location.pathname;
      const match = path.match(/\/peru-data\/(.+?)\/?$/);
        
        if (match) {
          const slug = match[1];
          const requestedItem = slugToChartName(slug, allItems);
          
          if (requestedItem) {
            // Load the requested item
            const itemData = await dataLoader.current.loadItemData(requestedItem);
            setData({ [requestedItem.name]: itemData });
            setSelectedItem(requestedItem);
            setExpandedCategories([requestedItem.categoryVariable]);
          } else {
            // Invalid chart URL - redirect to main page
            handleInvalidChartURL(slug);
            // Load data for the first item (default behavior)
            if (configData.categories.length > 0 && configData.categories[0].items.length > 0) {
              const firstItem = configData.categories[0].items[0];
              const itemData = await dataLoader.current.loadItemData(firstItem);
              setData({ [firstItem.name]: itemData });
              setSelectedItem(firstItem);
              setExpandedCategories([configData.categories[0].variable]);
            }
          }
        } else {
          // Load data for the first item (default behavior)
          if (configData.categories.length > 0 && configData.categories[0].items.length > 0) {
            const firstItem = configData.categories[0].items[0];
            const itemData = await dataLoader.current.loadItemData(firstItem);
            setData({ [firstItem.name]: itemData });
            setSelectedItem(firstItem);
            setExpandedCategories([configData.categories[0].variable]);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = async (event) => {
      if (!config) return;
      
      const allItems = getAllItems();
      const path = window.location.pathname;
      const match = path.match(/\/peru-data\/(.+?)\/?$/);
      
      if (match) {
        const slug = match[1];
        const requestedItem = slugToChartName(slug, allItems);
        
        if (requestedItem) {
          try {
            // Load data for the requested item if not already loaded
            if (!data[requestedItem.name]) {
              const itemData = await dataLoader.current.loadItemData(requestedItem);
              setData(prev => ({ ...prev, [requestedItem.name]: itemData }));
            }
            setSelectedItem(requestedItem);
            setExpandedCategories([requestedItem.categoryVariable]);
          } catch (err) {
            console.error('Error loading item data from URL:', err);
          }
        } else {
          // Invalid chart URL - redirect to main page
          handleInvalidChartURL(slug);
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [config, data]);
  
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
  
  const renderCards = () => {
    if (!selectedItem || !data[selectedItem.name]) {
      return <div>No data available</div>;
    }
    
    const itemData = data[selectedItem.name];
    const valueKey = Object.keys(itemData[0] || {}).find(key => key !== 'year');
    
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px' 
      }}>
        {itemData.map((item, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '6px',
            border: '1px solid #e9ecef',
            textAlign: 'center',
            transition: 'transform 0.2s ease-in-out',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#007bff',
              marginBottom: '5px' 
            }}>
              {formatNumber(item[valueKey], selectedItem)}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#6c757d' 
            }}>
              {item.year}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // State for 'by' variable selections
  const [bySelections, setBySelections] = React.useState({});

  // Update bySelections when selectedItem changes
  React.useEffect(() => {
    if (selectedItem && selectedItem.type === 'choropleth' && selectedItem.params && selectedItem.params.by) {
      // Set default selection to the first value for each 'by' variable
      const itemData = data[selectedItem.name] || [];
      const newSelections = {};
      selectedItem.params.by.forEach(byVar => {
        const uniqueVals = [...new Set(itemData.map(row => row[byVar]).filter(v => v !== undefined))];
        if (uniqueVals.length > 0) {
          newSelections[byVar] = uniqueVals[0];
        }
      });
      setBySelections(newSelections);
    }
  }, [selectedItem, data]);

  // Render dropdowns and sliders for 'by' variables using centralized ChartOptions component
  const renderByDropdowns = () => {
    if (!selectedItem || selectedItem.type !== 'choropleth' || !selectedItem.params || !selectedItem.params.by) return null;
    const itemData = data[selectedItem.name] || [];
    
    const handleSelectionChange = (option, value) => {
      setBySelections(prev => ({ ...prev, [option]: value }));
    };
    
    return (
      <ChartOptions
        data={itemData}
        options={selectedItem.params.by}
        selections={bySelections}
        onSelectionChange={handleSelectionChange}
      />
    );
  };

  // Filter data for choropleth based on bySelections
  // Get total value for choropleth when total is true
  const getTotalValue = () => {
    if (!selectedItem || selectedItem.type !== 'choropleth' || !selectedItem.params || !selectedItem.params.total) return null;
    const itemData = data[selectedItem.name] || [];
    
    // Filter data by current selections
    const filteredData = itemData.filter(row =>
      selectedItem.params.by.every(byVar => bySelections[byVar] === undefined || row[byVar] === bySelections[byVar])
    );
    
    // Check all fields that might contain "Total" values
    const fieldsToCheck = ['departamento', 'tipo_superficie', 'superficie', 'tipo'];
    const valueKey = selectedItem.params.value;
    
    for (const field of fieldsToCheck) {
      const totalRow = filteredData.find(row => 
        row[field] && row[field].toString().includes('Total')
      );
      
      if (totalRow && valueKey && totalRow[valueKey] !== undefined && !isNaN(Number(totalRow[valueKey]))) {
        return Number(totalRow[valueKey]);
      }
    }
    
    return null;
  };

  const getFilteredChoroplethData = () => {
    if (!selectedItem || selectedItem.type !== 'choropleth' || !selectedItem.params || !selectedItem.params.by) return data[selectedItem.name] || [];
    const itemData = data[selectedItem.name] || [];
    
    // First, filter by the selected 'by' variables
    let filteredData = itemData.filter(row =>
      selectedItem.params.by.every(byVar => bySelections[byVar] === undefined || row[byVar] === bySelections[byVar])
    );

    // If total is true, check if there are any "Total" entries and exclude them from map display
    // but keep them available for total value calculation
    if (selectedItem.params.total === true) {

      // Check all fields that might contain "Total" values
      const fieldsToCheck = ['departamento'];
      
      fieldsToCheck.forEach(field => {
        if (itemData.some(row => row[field] && row[field].toString().includes('Total'))) {
          // Exclude rows where this field contains "Total" from the map data
          // but these will be used for total value calculation
          filteredData = filteredData.filter(row => 
            !row[field] || !row[field].toString().includes('Total')
          );
        }
      });
    }

    return filteredData;
  };

  const renderChoropleth = () => {
    if (!selectedItem || !data[selectedItem.name]) {
      return <div>No data available</div>;
    }
    const filteredData = getFilteredChoroplethData();
    const totalValue = getTotalValue();
    
    return (
      <>
        {renderByDropdowns()}
        <ChoroplethMap 
          data={filteredData}
          item={selectedItem}
          width={800}
          height={500}
          sidebarOpen={sidebarOpen}
          totalValue={totalValue}
        />
      </>
    );
  };

  const renderStackedChart = () => {
    if (!selectedItem || !data[selectedItem.name]) {
      return <div>No data available</div>;
    }
    return (
      <>
        {/* Chart component */}
        <StackedAreaChart
          data={data[selectedItem.name] || []}
          item={selectedItem}
          width={sidebarOpen ? 800 : 1000}
          height={500}
          sidebarOpen={sidebarOpen}
        />
      </>
    );
  };

  // Main render function that selects visualization based on item type
  const renderAboutPage = () => {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#333',
          marginBottom: '20px'
        }}>
          He pasado suficiente tiempo ploteando datos que se me hizo más eficiente crear un módulo para organizar mis visualizaciones. Aquí las comparto.
        </div>
        <button
          onClick={() => setShowAbout(false)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Volver a las visualizaciones
        </button>
      </div>
    );
  };

  const renderVisualization = () => {
    if (showAbout) {
      return renderAboutPage();
    }

    if (!selectedItem) {
      return <div>Please select a metric from the sidebar</div>;
    }

    switch (selectedItem.type) {
      case 'cards':
        return renderCards();
      case 'choropleth':
        return renderChoropleth();
      case 'stacked_area':
        return renderStackedChart();
      default:
        return <div>Unsupported visualization type: {selectedItem.type}</div>;
    }
  };
  
  // Mobile device detection
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      // Simple mobile detection
      if (/android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(userAgent)) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    checkMobile();
  }, []);

  if (isMobile) {
    return (
      <div style={{
        maxWidth: '500px',
        margin: '40px auto',
        padding: '32px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeeba',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '1.2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        Lo siento, esta visualización no está disponible en dispositivos móviles.
      </div>
    );
  }
  
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '20px auto', 
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Main Content Area */}
      <div style={{ 
        display: 'flex',
        minHeight: '900px',
        maxHeight: '900px'
      }}>
        {/* Sidebar */}
        {sidebarOpen && !showAbout && (
          <div style={{
            width: '250px',
            backgroundColor: 'white',
            borderRight: '1px solid #e9ecef',
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'stretch'
          }}>
            {/* Hamburger Menu Button - positioned in top-right of sidebar */}
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '15px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              ✕
            </button>
            
            {/* Scrollable content area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              paddingTop: '50px'
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px'
              }}>
                {config && config.categories.map(category => {
                  const isExpanded = expandedCategories.includes(category.variable);
                  
                  return (
                    <div key={category.variable} style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px' }}>
                      {/* Category Header */}
                      <button
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedCategories(expandedCategories.filter(c => c !== category.variable));
                          } else {
                            setExpandedCategories([...expandedCategories, category.variable]);
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef',
                          backgroundColor: '#f8f9fa',
                          color: '#495057',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: isExpanded ? '8px' : '0'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      >
                        <span>{category.name}</span>
                        <span style={{ fontSize: '12px' }}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </button>
                      
                      {/* Category Options */}
                      {isExpanded && (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '6px',
                          marginLeft: '10px',
                          marginBottom: '8px'
                        }}>
                          {category.items.map(item => (
                            <button
                              key={item.name}
                              onClick={async () => {
                                try {
                                  // Load data for this item if not already loaded
                                  if (!data[item.name]) {
                                    const itemData = await dataLoader.current.loadItemData(item);
                                    setData(prev => ({ ...prev, [item.name]: itemData }));
                                  }
                                  setSelectedItem(item);
                                  
                                  // Update URL
                                  updateURL(item);
                                } catch (err) {
                                  console.error('Error loading item data:', err);
                                }
                              }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #e9ecef',
                                backgroundColor: selectedItem && selectedItem.name === item.name ? '#007bff' : 'white',
                                color: selectedItem && selectedItem.name === item.name ? 'white' : '#495057',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '13px',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                              onMouseEnter={(e) => {
                                if (!selectedItem || selectedItem.name !== item.name) {
                                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!selectedItem || selectedItem.name !== item.name) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }
                              }}
                            >
                              <span>{item.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Question Mark Button at bottom of sidebar */}
              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid #e9ecef'
              }}>
                <button
                  onClick={() => setShowAbout(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    backgroundColor: showAbout ? '#007bff' : 'white',
                    color: showAbout ? 'white' : '#495057',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!showAbout) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showAbout) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>?</span>
                  <span>Acerca de</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Main Content Column */}
        <div style={{ flex: 1, padding: '40px 40px 40px 40px', position: 'relative', minWidth: 0 }}>
          {/* Hamburger Menu Button - appears when sidebar is closed */}
          {!sidebarOpen && !showAbout && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                position: 'absolute',
                left: '10px',
                top: '20px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              ☰
            </button>
          )}
          {/* Visualization Title (constrained) */}
          {selectedItem && !showAbout && (
            <div style={{ 
              maxWidth: '600px',
              maxHeight: '80px',
              margin: '0 auto',
              fontSize: 'clamp(1rem, 1vw, 1rem)',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '0 0 32px 0',
              color: '#222',
              wordBreak: 'break-word',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center', 
              whiteSpace: 'pre-line'
            }}>
              {selectedItem.title}
            </div>
          )}
          
          {/* Pagination Container */}
          {!showAbout && (
            <div style={{ 
              position: 'relative',
              width: '100%'
            }}>
              {/* Left Chevron */}
              {canGoPrevious() && (
                <button
                  onClick={goToPreviousItem}
                  title={getPreviousItemName()}
                  style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #ccc',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#666',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.color = '#007bff';
                    e.target.style.transform = 'translateY(-50%) scale(1.05)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,123,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#ccc';
                    e.target.style.color = '#666';
                    e.target.style.transform = 'translateY(-50%) scale(1)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  ‹
                </button>
              )}
              
              {/* Right Chevron */}
              {canGoNext() && (
                <button
                  onClick={goToNextItem}
                  title={getNextItemName()}
                  style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #ccc',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#666',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.color = '#007bff';
                    e.target.style.transform = 'translateY(-50%) scale(1.05)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,123,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#ccc';
                    e.target.style.color = '#666';
                    e.target.style.transform = 'translateY(-50%) scale(1)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  ›
                </button>
              )}
              
              {/* Visualization Content */}
              <div style={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {renderVisualization()}
              </div>
            </div>
          )}
          
          {/* About Page Content */}
          {showAbout && renderAboutPage()}
          
          {/* Data Source Information */}
          {selectedItem && !showAbout && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: 'white', 
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              {selectedItem.detalle && (
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6c757d' }}>
                  {selectedItem.detalle}
                </p>
              )}
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                <strong>Fuente:</strong> {selectedItem.source}
              </p>
              {selectedItem.params && selectedItem.params.description && (
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                  {selectedItem.params.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PeruDataWidget;
} 