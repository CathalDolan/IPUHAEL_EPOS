console.log("charts.js");
dc.config.defaultColors(d3.schemeCategory10);
const data = await d3.csv("/static/data/LineItems.csv");
console.log("data = ", data);

var ndx = crossfilter(data);
var all = ndx.groupAll();

// var productDim = ndx.dimension(dc.pluck("name"))
var productDim = ndx.dimension(function (d) {
    return d["name"];
});
var productGroup = productDim.group();
// var dim = ndx.dimension(dc.pluck("name"));
// var group = dim.group();
var productGroupAll = productGroup.all();
for (let i = 0; i < productGroupAll.length; i++) {
    console.log(typeof productGroupAll[i]["value"]);
}
var rowchart = new dc.RowChart("#testChart");
rowchart
    // .width(1000)
    .height(1550)
    // .margins({ top: 10, right: 50, bottom: 80, left: 50 })
    // .x(d3.scaleLinear())
    // .elasticX(true)
    .dimension(productDim)
    .group(productGroup);
// .data(function(group) {
//     return group.top(10);
// });
// .transitionDuration(500);
// .x(d3.scaleBand())
// .xUnits(dc.units.ordinal)
// .xAxisLabel("Gender")
// .xAxis()
// .ticks(20);
// chart.renderlet(function (obj) {
//     obj.selectAll("g.x text").attr(
//         "transform",
//         "translate(-20,30) rotate(315)",
//     );
// })
rowchart.render();

var sunburstchart = new dc.SunburstChart("#sunburstChart");
sunburstchart
    .dimension(productDim)
    .group(productGroup)
    ;
sunburstchart.render();
