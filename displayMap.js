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

const townUrl = "http://34.147.162.172/Circles/Towns/"; //removing towns count for now...just base url
var slider = document.getElementById("tNumber");
var townCountDisplay = document.getElementById("tNumberValue");


d3.select("#tNumber").on("input",function(){
    townCountDisplay.textContent = slider.value;  //for displayinf slider value
});

d3.select("#updateButton").on("click", function(){
    loadTowns(slider.value);
});

function loadTowns(count) {
    d3.json(`${townUrl}${count}`).then((townsData) => {
        var circles = svg.selectAll("circle")
            .data(townsData, d => d.Town);
        
        circles.exit().remove();
        //svg.selectAll("circle").remove();
        svg.selectAll("text").remove();

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

        //checking 
        svg.selectAll("text")
            .data(townsData)
            .enter()
            .append("text")
            .attr("x", d => projection([d.lng, d.lat])[0])
            .attr("y", d => projection([d.lng, d.lat])[1] + 15) //10
            .text(d => d.Town)
            .attr("font-size", "12px")
            .attr("fill", "grey")  //black
            .attr("text-anchor", "middle");
    }).catch(error => console.error("Data fetch error:", error));
}

const defTownNumber=50;
loadTowns(defTownNumber);