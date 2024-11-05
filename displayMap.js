const width = 900, height = 900;
const svg = d3.select("#map").attr("width", width).attr("height", height);

const projection = d3.geoMercator()
    .center([-3.4360,55.3781]) 
    .scale(2700)        
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

d3.json("ukmap.geojson").then((data) => {
    svg.selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#b6d7a8") //#b8b78f #cce5df
        .attr("stroke", "#333");     
});

const townUrl = "http://34.147.162.172/Circles/Towns/"; 
var slider = document.getElementById("tNumber");
var townCountDisplay = document.getElementById("tNumberValue");


d3.select("#tNumber").on("input",function(){
    townCountDisplay.textContent = slider.value;  //for displayinf slider value
});

d3.select("#updateButton").on("click", function(){
    loadTowns(slider.value);
});

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

function handleBoundedTranslate(transform) {
    const scale = transform.k;
    const bounds = getMapBoundary(scale);
    const x = Math.max(bounds.minX, Math.min(bounds.maxX, transform.x));
    const y = Math.max(bounds.minY, Math.min(bounds.maxY, transform.y));

    return { x, y, k: scale };
}

//zoom function
const zoom = d3.zoom()
    .scaleExtent([1, 8])  
    .translateExtent([[0, 0], [width, height]]) //restricting translation to map area
    .on("zoom", (event) => {
    const boundedTransform = handleBoundedTranslate(event.transform);
    projection.scale(2700 * boundedTransform.k) 
              .translate([width / 2 + boundedTransform.x, height / 2 + boundedTransform.y]);

    svg.selectAll("path").attr("d", path);  
    svg.selectAll("circle")
        .attr("cx", d => projection([d.lng, d.lat])[0])
        .attr("cy", d => projection([d.lng, d.lat])[1]);  
});
svg.call(zoom);

//zoom buttons functions
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
            .attr("fill", "red")
            .attr("stroke", "black")
            .merge(circles)
            .transition()
            .duration(1500)
            .ease(d3.easeSin)
            .attr("cx", d => projection([d.lng, d.lat])[0])
            .attr("cy", d => projection([d.lng, d.lat])[1])
            .attr("r", d => Math.sqrt(d.Population * 0.0004));

        //checking commented coz it looks cluttered
        /*svg.selectAll("text")
            .data(townsData)
            .enter()
            .append("text")
            .attr("x", d => projection([d.lng, d.lat])[0])
            .attr("y", d => projection([d.lng, d.lat])[1] + 15) //10
            .text(d => d.Town)
            .attr("font-size", "12px")
            .attr("fill", "grey")  //black
            .attr("text-anchor", "middle");*/

        //tooltip
        svg.selectAll("circle")
        .on("mouseover", function(event, d) {
            console.log(d);
            d3.select(this)
                .attr('fill','#8F00FF');

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
              .attr('fill','red')
              .attr('r',Math.sqrt(d.Population * 0.0004)); 

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

const defTownNumber=50;
loadTowns(defTownNumber);