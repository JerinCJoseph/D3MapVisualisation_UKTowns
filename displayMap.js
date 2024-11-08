//map dimensions
const width = 1000, height = 1000;
const svg = d3.select("#map").attr("width", width).attr("height", height);

//Setting up map projection
const projection = d3.geoMercator()
    .center([-3.4360,55.3781]) 
    .scale(2700)        
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

let countyPopulationData = {};
let geoJsonData = null;
let isChoroplethActive = false;

//Loading UK map GeoJSON data
d3.json("ukmap.geojson").then((data) => {
    geoJsonData = data;
    svg.selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#b6d7a8")
        .attr("stroke", "#333"); 
    
    //Fetching population data for towns and aggregating by county    
    d3.json("http://34.147.162.172/Circles/Towns/500").then((townsData) => {
        townsData.forEach(town => {
            const county = town.County;
            countyPopulationData[county] = (countyPopulationData[county] || 0) + town.Population;
        });
    }).catch(error => console.error("Population data fetch error:", error));
}).catch(error => console.error("GeoJSON data fetch error:", error));

const townUrl = "http://34.147.162.172/Circles/Towns/"; 
var slider = document.getElementById("tNumber");
var townCountDisplay = document.getElementById("tNumberValue");


d3.select("#tNumber").on("input",function(){
    townCountDisplay.textContent = slider.value;  //for displaying slider value
});

d3.select("#updateButton").on("click", function(){
    loadTowns(slider.value);
});

//function to get the map boundaries for zooming with constraints
function getMapBoundary(scale) {
    const [[x0, y0], [x1, y1]] = path.bounds({ type: "Sphere" });
    const mapWidth = (x1 - x0) * scale;
    const mapHeight = (y1 - y0) * scale;

    return {
        minX: width / 2 - mapWidth / 2,
        maxX: width / 2 + mapWidth / 2,
        minY: height / 2 - mapHeight / 2,
        maxY: height / 2 + mapHeight / 2
    };
}

//handling the map transform to stay within boundaries during zoom
function handleBoundedTranslate(transform) {
    const scale = transform.k;
    const bounds = getMapBoundary(scale);
    const x = Math.max(bounds.minX, Math.min(bounds.maxX, transform.x));
    const y = Math.max(bounds.minY, Math.min(bounds.maxY, transform.y));

    return { x, y, k: scale };
}

//zoom function
const zoom = d3.zoom()
    .scaleExtent([0.8, 3])  
    .translateExtent([[0, 0], [width, height]]) //restricting translation to map area
    .on("zoom", (event) => {
    const boundedTransform = handleBoundedTranslate(event.transform);
    projection.scale(2700 * boundedTransform.k) 
              .translate([width / 2 + boundedTransform.x, height / 2 + boundedTransform.y]);

    svg.selectAll("path").attr("d", path);  
    svg.selectAll("circle")
        .attr("cx", d => projection([d.lng, d.lat])[0])
        .attr("cy", d => projection([d.lng, d.lat])[1]);
    
    const zoomPercent = Math.round(boundedTransform.k * 100);
    d3.select("#zoomPercentage").text(`${zoomPercent}%`);
});
svg.call(zoom).on("wheel.zoom",null);

//zoom control buttons functions
d3.select("#zoomIn").on("click", function() {
    svg.transition().call(zoom.scaleBy, 1.2);  
});

d3.select("#zoomOut").on("click", function() {
    svg.transition().call(zoom.scaleBy, 0.8);  
});

d3.select("#reset").on("click", function() {
    projection.scale(2700).translate([width / 2, height / 2]);
    svg.selectAll("path").attr("d", path);
    svg.selectAll("circle")
        .attr("cx", d => projection([d.lng, d.lat])[0])
        .attr("cy", d => projection([d.lng, d.lat])[1]);
    svg.transition().duration(750).call(
        zoom.transform,       
        d3.zoomIdentity      
    );
});

//filters for 3d effects on map and town circles
svg.append("defs").append("filter")
    .attr("id", "raisedEffect")
    .attr("x", "-60%")
    .attr("y", "-60%")
    .attr("width", "250%")
    .attr("height", "250%")
    .append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 7)
    .attr("stdDeviation", 7)
    .attr("flood-color", "black")
    .attr("flood-opacity", 0.7);

svg.append("defs")
    .append("radialGradient")
    .attr("id", "sphereEffect")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .attr("fx", "30%")
    .attr("fy", "30%")
    .selectAll("stop")
    .data([
        { offset: "0%", color: "#FF668D", opacity: 0.7 },
        { offset: "80%", color: "#FF0B48", opacity: 0.9 },
        { offset: "100%", color: "#800020", opacity: 1 } 
    ])
    .enter()
    .append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color)
    .attr("stop-opacity", d => d.opacity);

//handling choropleth and town mode toggle functionality   
const updateDiv = d3.select("#tUpdate");
const choroButton = d3.select("#viewChoropleth");
choroButton.text("View Choropleth");

const choroToggleText = d3.select("#choroControlsText");
choroToggleText.text("Population by County(500 Towns) :");

choroButton.on("click", function() {
    let currentText = choroButton.text();
    choroButton.text(currentText === "View Choropleth" ? "View Town Data" : "View Choropleth");

    let currentViewText = choroToggleText.text();
    choroToggleText.text(currentViewText === "Population by County(500 Towns) :" ? "Population by Town:" : "Population by County(500 Towns) :");

    if (!isChoroplethActive) {
        isChoroplethActive = true;

        svg.selectAll("circle").remove();
        updateDiv.style("visibility", "hidden");
        d3.select(".choroTooltip").style("visibility", "visible");
        applyChoroColouring();
    } else {
        isChoroplethActive = false;

        svg.selectAll("path").attr("fill", "#b6d7a8"); 
        d3.select(".choroLegend").style("visibility", "hidden"); 
        d3.select(".choroTooltip").style("visibility", "hidden");
        updateDiv.style("visibility", "visible");

        loadTowns(defTownNumber);
    }
});

//main function to load town data and create town markers
function loadTowns(count) {
    d3.json(`${townUrl}${count}`).then((townsData) => {
        var circles = svg.selectAll("circle")
            .data(townsData, function(d){
                return d.Town;
            });  
        
        circles.exit().remove();
        //svg.selectAll("text").remove();

        const Tooltip = d3.select(".tdataTooltip").style("display", "none");

        circles.enter()
            .append("circle")
            .attr("cx", d => projection([d.lng, d.lat])[0])
            .attr("cy", d => projection([d.lng, d.lat])[1])
            .attr("r", 0)
            .attr("fill", "url(#sphereEffect)")
            .attr("stroke", "FF0B48")
            .merge(circles)
            .transition()
            .duration(1500)
            .ease(d3.easeElastic)
            .attr("cx", d => projection([d.lng, d.lat])[0])
            .attr("cy", d => projection([d.lng, d.lat])[1])
            .attr("r", d => Math.sqrt(d.Population * 0.0004));

        //tooltip for town markers
        svg.selectAll("circle")
        .on("mouseover", function(event, d) {
            console.log(d);
            d3.select(this)
                .attr('fill','url(#sphereEffect)')
                .attr('r',Math.sqrt(d.Population * 0.002))
                .style("filter", "url(#raisedEffect)");

            Tooltip.style('display','block')
                   .style('top', (event.pageY - 55) +'px')  
                   .style('left', (event.pageX + 20) + 'px'); 
    
            Tooltip.select('#tdataCounty span').text(d.County);
            Tooltip.select('#tdataTown span').text(d.Town);
            Tooltip.select('#tdataPopulation span').text(d.Population);      
        })
        .on("mousemove", function(event) {
            Tooltip.style('top', (event.pageY - 55) + 'px')
                   .style('left', (event.pageX + 20) + 'px');
        })
        .on("mouseout",function(event, d) {
            d3.select(this)
              .attr('fill','url(#sphereEffect)')
              .attr('r',Math.sqrt(d.Population * 0.0004)) 
              .style("filter", null);
            Tooltip.style('display','none');
        }); 

        svg.on("click", function(event) {
            const isCircle = event.target.tagName === 'circle';
            if (!isCircle) {
                Tooltip.style('display', 'none');
            }
        });
    }).catch(error => console.error("Data fetch error:", error));
}

//calling loadTowns for initial load with 50towns
 const defTownNumber=50;
 loadTowns(defTownNumber);