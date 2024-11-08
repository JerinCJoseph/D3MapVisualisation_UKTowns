# D3MapVisualisation_UKTowns
AC50002 - Programming languages for Data Engineering, D3 Assignment

This project presents an interactive map visualization of the UK built with D3.js, designed to dynamically display town locations and population data retrieved from a remote API. It includes features such as data reloading, zoom functionality, choropleth mapping, tooltips, and animations for a visually engaging and informative experience.

## Features

1. **Interactive UK Map**:
   - The UK map is drawn using GeoJSON data, with counties outlined and filled with a base color.
   - The map is zoomable and pannable, with buttons to zoom in, zoom out, and reset the view.

2. **Dynamic Town Data**:
   - Town data is retrieved from an API endpoint (e.g., `http://34.147.162.172/Circles/Towns/`) with a maximum limit of 500 towns. 
   - A slider is provided for the users to select the number of towns (1–500) to be displayed and should click on the update button to load the number of towns on the map.
   - The town data, including coordinates and population, is dynamically loaded and visualized on the map.

3. **Toggle Map View**:
    - This button allows users to switch seamlessly between two views: a choropleth map showing county populations and a detailed town-specific map.
    - Choropleth Mode: Highlights county population data with shaded gradients, where each county’s color intensity reflects its population density. A gradient legend provides a reference for population levels, and hovering over a county applies a raised 3D effect to emphasize focus.
    - Town Mode: Displays individual towns, with each town marker sized proportionally to its population. Markers feature a 3D gradient sphere effect for visual depth. Hovering over a town temporarily enlarges the marker, making it easier to focus on specific locations.

4. **Tooltips**:
   - Hovering over towns displays a tooltip with details such as town name, county, and population.
   - Choropleth mode provides tooltips with county names and population data when hovering over counties.

5. **Animations**:
   - Town data points animate in place when loaded or updated, with a smooth transition effect(easeElastic) on radius and position based on population data.

6. **Customizable UI**:
   - Includes interactive buttons to update the map data, adjust the map's zoom level, and toggle views (town data or choropleth).
   
## Enhancements and Visual Effects

- **Zoom Bounds**: Zoom and pan are restricted to keep the map centered within the view. Current zoom level can be seen just above the zoom control.
- **Gradients and Shadows**: Created custom visual effects, including gradients for town circles to give it a spherical 3D effect and a shadow filter on the map for a raised 3D effect.
- **Responsive Map Size**: The SVG container adjusts based on screen dimensions to ensure the map is visible on various devices.

## Dependencies

- **D3.js**: For data-driven document manipulation and map rendering.
- **Bootstrap**: For layout and styling of the HTML components.
- **GeoJSON Data**: Provides the UK map outline, loaded asynchronously for flexibility.

### References

1. **D3.js Library**  
   D3.js - Data-Driven Documents. [https://d3js.org/](https://d3js.org/)

2. **SVG Documentation**  
   Mozilla Developer Network - SVG (Scalable Vector Graphics). [https://developer.mozilla.org/en-US/docs/Web/SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)

3. **D3 Background Maps**  
   D3 Graph Gallery - Background Maps in D3. [https://d3-graph-gallery.com/backgroundmap.html](https://d3-graph-gallery.com/backgroundmap.html)

4. **D3 Choropleth Maps**  
   D3 Graph Gallery - Choropleth Maps in D3. [https://d3-graph-gallery.com/choropleth.html](https://d3-graph-gallery.com/choropleth.html)

5. **Levenshtein Distance Explanation**  
   GeeksforGeeks - Introduction to Levenshtein Distance. [https://www.geeksforgeeks.org/introduction-to-levenshtein-distance/](https://www.geeksforgeeks.org/introduction-to-levenshtein-distance/)