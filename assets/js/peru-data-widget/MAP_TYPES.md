# Map Types for Choropleth Maps

The choropleth map component now supports three different map types through the `map_type` parameter:

## Available Map Types

### 1. `"departments"` (Default)
- **Map File**: `peru_departamentos.json`
- **Geographic Level**: Department level (25 departments)
- **Data Matching**: Matches by `DEPARTAMENTO` column in data
- **Use Case**: National-level indicators, department-level data

### 2. `"lima"` 
- **Map Files**: `peru_departamentos.json` + `lima_metropolitana.geojson`
- **Geographic Level**: Departments + detailed Lima Metropolitan area
- **Data Matching**: Matches by `DEPARTAMENTO` column in data
- **Use Case**: When you need detailed Lima Metropolitan area visualization

### 3. `"districts"`
- **Map File**: `peru_distritos.geojson`
- **Geographic Level**: District level (1,874 districts)
- **Data Matching**: Matches by `DEPARTAMENTO`, `PROVINCIA`, and `DISTRITO` columns
- **Use Case**: Fine-grained analysis, electoral data, district-level indicators

## Configuration Examples

### Departments Map (Default)
```json
{
  "type": "choropleth",
  "datafile": "temperatura_promedio.csv",
  "params": {
    "value": "temperatura_promedio",
    "by": ["año"],
    "map_type": "departments"
  }
}
```

### Lima Metropolitan Map
```json
{
  "type": "choropleth",
  "datafile": "poblacion_censada.csv",
  "params": {
    "value": "personas",
    "by": ["año"],
    "map_type": "lima",
    "total": true
  }
}
```

### Districts Map
```json
{
  "type": "choropleth",
  "datafile": "presidenciales_2021_distritos.csv",
  "params": {
    "value": "votos",
    "by": ["partido"],
    "map_type": "districts"
  }
}
```

## Data Requirements

### For Departments/Lima Maps
Your CSV data should have a `DEPARTAMENTO` column:
```csv
DEPARTAMENTO,año,valor
LIMA,2020,1000
AREQUIPA,2020,800
```

### For Districts Map
Your CSV data should have `DEPARTAMENTO`, `PROVINCIA`, and `DISTRITO` columns:
```csv
DEPARTAMENTO,PROVINCIA,DISTRITO,año,valor
LIMA,LIMA,LIMA,2020,1000
LIMA,LIMA,SAN ISIDRO,2020,500
```

## Backward Compatibility

The system maintains backward compatibility with the old parameters:
- `with_lima: true` → `map_type: "lima"`
- `with_distritos: true` → `map_type: "districts"`
- No parameter → `map_type: "departments"`

## Performance Considerations

- **Departments map**: Fastest, suitable for most use cases
- **Lima map**: Moderate performance, good for Lima-focused analysis
- **Districts map**: Slower due to large file size (73MB), use only when district-level detail is needed 