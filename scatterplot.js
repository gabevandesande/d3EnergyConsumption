/*eslint-env es6*/
/*eslint-env browser*/
/*eslint no-console: 0*/
/*global d3 */


//Pan+Drag:
//    Hold the cursor anywhere in svg to pan-drag
//    Both x-axis and y-axis are scaled automatically
//Zoom: 
//    Scroll forward to zoom in
//    Scroll backward to zoom out
//    Both x-axis and y-axis are scaled automatically
//Tooltip:
//    Appears next to the country
//    Moves automatically with pan-drag-zoom function

function rowConverter(data) { //Reads data based on given key word of columns.
    return {
        country: data.country, //Associates these values to values to be used in the code.
        gdp: data.gdp,
        population: data.population,
        ecc: data.ecc,
        ec: data.ec,
    };
}

d3.csv("scatterdata.csv", rowConverter).then(function (data) {

    var colors = d3.scaleOrdinal(d3.schemePaired); //Input color scale from d3 Scale Ordinal (category20 outdated, schemepaired has 12 values)

    var svg = d3.select("svg"), //Target svg element in html, set width and height values
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var zoom = d3.zoom() //Establish zoom function (From Zoom axes code given in assignment pdf)
        .scaleExtent([1, 40]) //Sets allowed zoom range
        .translateExtent([[-100, -100], [width + 90, height + 100]]) //Sets zoom boundaries
        .on("zoom", zoomed); // Call 'zoomed' state on zoom, to apply changes to the code when zoomed

    var xScale = d3.scaleLinear() //Set xScale based on perceived data ranges
        .domain([-1, 16])
        .range([-1, width + 1]);

    var yScale = d3.scaleLinear() //Same for yScale
        .domain([-1, height + 1])
        .range([-1, height + 1]);

    var xAxis = d3.axisBottom(xScale) //Initiate xAxis
        .ticks((width + 2) / (height + 2) * 10)
        .tickSize(height)
        .tickPadding(8 - height);

    var yAxis = d3.axisRight(yScale) //Initiate yAxis
        .ticks(10)
        .tickSize(width)
        .tickPadding(8 - width);

    var view = svg.append("rect") //Establish view rectangle for zoom function (Invisible rect on top of svg to allow for zooming.)
        .attr("class", "view")
        .attr("x", 0.5)
        .attr("y", 0.5)
        .attr("width", width - 1)
        .attr("height", height - 1);

    var gX = svg.append("g") //Axes of view rect
        .attr("class", "axis axis--x")
        .call(xAxis);

    var gY = svg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    d3.select("button") //Target reset button, set to resetted state
        .on("click", resetted);

    svg.call(zoom); //Call zoom function

    //Console functions to make sure everything is loading correctly
    console.log(data.columns);
    console.log(data.length);
    console.log(data.columns.slice(1));
    console.log(data.columns.slice(1).map(function (dummy) {
        return dummy.toUpperCase();
    }));
    console.log(data.columns.slice(1).map(function (c) {
        return c
    }));

    function zoomed() {
        view.attr("transform", d3.event.transform); //Transform view attributes relatively
        gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale))); //Scale x axis dynamically
        gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));//Scale y axis dynamically
        dot.attr("transform", d3.event.transform).attr("stroke-width", 1 / d3.event.transform.k); //Scale stroke-width of circles, so that not too big when zoomed in
        dot.attr("transform", d3.event.transform).attr("r", function (d) { //Scale radius of circles proportionally
            return (xScale(d.ec) / 100) / d3.event.transform.k;
        });
    }

    function resetted() { //Set attributes for a resetted state, as well as a transition
        svg.transition()
            .duration(500)
            .call(zoom.transform, d3.zoomIdentity);
    }

    var dot = svg.selectAll(".dot") //Draw scatterplot circles
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function (d) {
            return xScale(d.ec) / 100; //Radius proporional to total EC
        })
        .attr("cx", function (d) { //xPosition based on gdp
            return xScale(d.gdp);
        })
        .attr("cy", function (d) { //yPosition based on ecc
            return yScale(d.ecc);
        })
        .style("fill", function (d) { //Colors according to colorscale
            return colors(d.country);
        })
        .on("mouseover", function (d) { //Show tooltip on mouseover
            //Update the tooltip position and value
            d3.select("#tooltip")
                .style("left", (event.pageX + 20) + "px") //Sets x and y based on mouseposition, so that we don't have to scale proportionally
                .style("top", (event.pageY - 5) + "px")
                .select("#population")
                .text(d.population + " Million"); //Set text based on element id

            d3.select("#tooltip")
                .select("#gdp")
                .text("$" + d.gdp + " Trillion"); //GDP text

            d3.select("#tooltip")
                .select("#ecc")
                .text(d.ecc + " Million BTU's"); //ECC text

            d3.select("#tooltip")
                .select("#ec")
                .text(d.ec + " Trillion BTU's"); //EC text

            d3.select("#tooltip")
                .select("#countryName")
                .text(d.country)
            //Show the tooltip
            d3.select("#tooltip").classed("hidden", false); //Show tooltip on mouseover by removing hidden class
        })
        .on("mouseout", function () {
            //Hide the tooltip
            d3.select("#tooltip").classed("hidden", true); //Hide again with hidden class
        });


    svg.append("g") //Legend rectangle
        .append("rect")
        .attr("y", 340)
        .attr("x", 620)
        .attr("width", 220)
        .attr("height", 150)
        .style("fill", "#f2f2f2")
        .style("stroke", "black");

    svg.append("g") //Legend large circle
        .append("circle")
        .attr("cy", 440 - xScale(100) / 200)
        .attr("cx", 660 + xScale(100) / 200)
        .attr("r", xScale(100) / 100)
        .style("stroke", "#4287f5")
        .style("fill", "#f2f2f2");

    svg.append("g") //Legend Medium circle
        .append("circle")
        .attr("cy", 440)
        .attr("cx", 660 + xScale(100) / 200)
        .attr("r", xScale(50) / 100)
        .style("stroke", "#fa7443")
        .style("fill", "#f2f2f2");

    svg.append("g") //Legend Small circle
        .append("circle")
        .attr("cy", 440 + xScale(100) / 250)
        .attr("cx", 660 + xScale(100) / 200)
        .attr("r", xScale(10) / 100)
        .style("stroke", "#29ab66")
        .style("fill", "#f2f2f2");

    svg.append("g") //Legend text 1
        .append("text")
        .attr("class", "label")
        .attr("y", 380)
        .attr("x", 730 + xScale(100) / 200)
        .style("stroke", "#4287f5")
        .attr("font-size", "9px")
        .attr("font-weight", "100")
        .text("100 Trillion BTU's");

    svg.append("g") //Legend text 2
        .append("text")
        .attr("class", "label")
        .attr("y", 420)
        .attr("x", 730 + xScale(100) / 200)
        .style("stroke", "#fa7443")
        .attr("font-size", "9px")
        .attr("font-weight", "100")
        .text("50 Trillion BTU's");

    svg.append("g") //Legend text 3
        .append("text")
        .attr("class", "label")
        .attr("y", 440 + xScale(100) / 250)
        .attr("x", 730 + xScale(100) / 200)
        .style("stroke", "#29ab66")
        .attr("font-size", "9px")
        .attr("font-weight", "100")
        .text("10 Trillion BTU's");

    svg.append("g") //X Axis label
        .append("text")
        .attr("class", "label")
        .attr("y", 30)
        .attr("x", width / 2)
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("GDP (in Trillion US Dollars) in 2010");


    svg.append("g") //Y-axis Label
        .append("text")
        .attr("class", "label")
        .attr("y", 30)
        .attr("x", -90)
        .attr("transform", "rotate(-90)")
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("font-size", "12px")
        .text("Energy Consumption per Capita (in Million BTUs per person)");

});