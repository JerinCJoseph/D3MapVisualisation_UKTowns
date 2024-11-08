function getStringDist(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      
                matrix[i][j - 1] + 1,      
                matrix[i - 1][j - 1] + cost 
            );
        }
    }
    return matrix[a.length][b.length];
}

function getClosestCountyName(countyName, countyData) {
    return d3.least(Object.keys(countyData), name => getStringDist(name.toLowerCase(), countyName.toLowerCase()));
}

function applyChoroColouring() {
    if (!countyPopulationData || !geoJsonData) {
        console.log("data not fully loaded for choro");
        return;
    }

    const populationValues = Object.values(countyPopulationData);
    const colorScale = d3.scaleSequential(d3.interpolateWarm)
        .domain([d3.min(populationValues), d3.max(populationValues)]);

    svg.selectAll("path")
        .data(geoJsonData.features)
        .attr("fill", d => {
            const countyName = d.properties.NAME_2 || d.properties.NAME_3;
            let population = countyPopulationData[countyName];

            if (!population) {
                const closestMatch = getClosestCountyName(countyName, countyPopulationData);
                population = countyPopulationData[closestMatch];
            }

            return  colorScale(population); 
        })
        .on("mouseover", (event, d) => {
            const countyName = d.properties.NAME_2 || d.properties.NAME_3;
            let population = countyPopulationData[countyName] || countyPopulationData[getClosestCountyName(countyName, countyPopulationData)];
            if (isChoroplethActive) { 
            d3.select(event.currentTarget).style("filter", "url(#raisedEffect)");
            }
            const choroTooltip = d3.select(".choroTooltip").style("display", "block")
            .style("top", (event.pageY - 55) + 'px')
            .style("left", (event.pageX + 20) + 'px');

            choroTooltip.select('#choroCounty span').text(countyName);
            choroTooltip.select("#choroPopulation span").text(population ? population : "No data");
        })
        .on("mouseout", (event) => {
            if (isChoroplethActive) {
            d3.select(event.currentTarget).style("filter", null);}
            d3.select(".choroTooltip").style("display", "none");
        });

    let legendGroup = d3.select(".choroLegend");
    if (legendGroup.empty()) {
        const legendGroup = svg.append("g")
            .attr("class", "choroLegend")
            .attr("transform", `translate(50, 50)`);
        
        const legendScale = d3.scaleLinear()
            .domain([d3.min(populationValues), d3.max(populationValues)]) 
            .range([0, 200]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".0s"));

        legendGroup.selectAll("rect")
            .data(d3.range(0, 1, 0.01))
            .enter().append("rect")
            .attr("x", d => legendScale(d * d3.max(populationValues)))
            .attr("y", -10)
            .attr("width", 4)
            .attr("height", 10)
            .style("fill", d => colorScale(d * d3.max(populationValues)));

        legendGroup.append("g")
            .attr("class", "choroLegendAxis")
            .attr("transform", `translate(0, 0)`)
            .call(legendAxis);
    } else {
        d3.select(".choroLegend").style("visibility", "visible");
    }
}

applyChoroColouring();