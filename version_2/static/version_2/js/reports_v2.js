// Open reports_v2.js and wrap your very first code lines like this:
document.addEventListener("DOMContentLoaded", () => {
    console.log("reports_v2.js loaded successfully");

    const scriptElement = document.getElementById("reports-script");
    if (!scriptElement) {
        console.error("Critical: Could not find script element placeholder");
        return;
    }
    const jsonFileUrl = scriptElement.dataset.jsonUrl;

    console.log("Targeting JSON endpoint location:", jsonFileUrl);

    fetch(jsonFileUrl)
        .then((response) => {
            if (!response.ok)
                throw new Error(`Network failure. Status: ${response.status}`);
            return response.json();
        })
        .then((loadedData) => {
            console.log("JSON file successfully imported! Record count:", loadedData.length);
            
            window.parseISOString = d3.utcParse("%Y-%m-%d %H:%M:%S.%L%Z");
            
            prepopulateDatePickers(loadedData);
            initDatePickerListeners(loadedData);
            renderDashboardWithData(loadedData);
        })
        .catch((error) => {
            console.error("Critical Failure: Unable to fetch JSON file:", error);
        });
}); // 👈 Close the DOMContentLoaded block here

// Global chart handles accessible to all app modules
var hourlyChart, categoryChart, dataCountWidget, sunburstChart;
var ndx, dateDimension; 

/**
 * Universal safe currency parser
 */
function cleanPrice(item) {
    return parseFloat(String(item.price_line_total || "0").replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
}

/**
 * Fallback calculation engine when price_line_total is zero (Complimentary/Waste)
 */
function calculateEffectivePrice(v) {
    let price = cleanPrice(v);
    if (price === 0) {
        const quantity = parseInt(v.quantity, 10) || 0;
        const unitPrice = parseFloat(String(v.price_unit || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
        price = quantity * unitPrice;
    }
    return price;
}

/**
 * Pre-populates HTML date inputs with dataset boundary limits
 */
function prepopulateDatePickers(masterData) {
    if (!masterData || masterData.length === 0) return;

    let minDate = null;
    let maxDate = null;

    masterData.forEach((item) => {
        const rawDate = item.transaction__order_date;
        if (!rawDate) return;

        const currentParsed = new Date(rawDate);
        if (isNaN(currentParsed.getTime())) return;

        if (!minDate || currentParsed < minDate) minDate = currentParsed;
        if (!maxDate || currentParsed > maxDate) maxDate = currentParsed;
    });

    function formatToDateInputString(dateObject) {
        if (!dateObject) return "";
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, "0");
        const day = String(dateObject.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    if (minDate && maxDate) {
        const fromInput = document.getElementById("date-from");
        const toInput = document.getElementById("date-to");

        if (fromInput && toInput) {
            fromInput.value = formatToDateInputString(minDate);
            toInput.value = formatToDateInputString(maxDate);
        }
    }
}

/**
 * Initializes date picker inputs using native Crossfilter range controls
 */
function initDatePickerListeners(masterData) {
    const fromInput = document.getElementById("date-from");
    const toInput = document.getElementById("date-to");
    const clearButton = document.getElementById("clear-date-filter");

    function processAndFilterData() {
        const fromVal = fromInput.value;
        const toVal = toInput.value;

        if (!fromVal || !toVal) return;

        const fromDate = new Date(fromVal);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(toVal);
        toDate.setHours(23, 59, 59, 999);

        if (fromDate <= toDate) {
            console.log(`Filtering crossfilter data layer between: ${fromVal} and ${toVal}`);
            dateDimension.filterRange([fromDate, toDate]);
            dc.redrawAll();
        }
    }

    fromInput.addEventListener("change", processAndFilterData);
    toInput.addEventListener("change", processAndFilterData);

    clearButton.addEventListener("click", function () {
        console.log("Resetting calendar ranges cleanly via crossfilter engine.");
        prepopulateDatePickers(masterData);
        dateDimension.filterAll();
        dc.redrawAll();
    });
}

/**
 * Main dashboard setup and orchestration pipeline
 */
function renderDashboardWithData(orderData) {
    console.log("Rendering dashboard instance with active rows:", orderData.length);

    ndx = crossfilter(orderData);
    
    dateDimension = ndx.dimension((d) => {
        if (!d.transaction__order_date) return new Date(1970, 0, 1);
        const parsed = new Date(d.transaction__order_date);
        return isNaN(parsed.getTime()) ? new Date(1970, 0, 1) : parsed;
    });
    
    const allRecordsDimension = ndx.dimension((d) => d);

    // Setup Dimensions
    const continuousHourDimension = ndx.dimension((currentItem) => {
        const rawIsoDate = currentItem.transaction__order_date;
        if (!rawIsoDate) return new Date(Date.UTC(1970, 0, 1));

        const dateObj = new Date(rawIsoDate);
        if (isNaN(dateObj.getTime())) return new Date(Date.UTC(1970, 0, 1));

        return new Date(Date.UTC(
            dateObj.getUTCFullYear(),
            dateObj.getUTCMonth(),
            dateObj.getUTCDate(),
            dateObj.getUTCHours()
        ));
    });

    const categoryDimension = ndx.dimension((currentItem) => {
        return String(currentItem.category__name || "Other").toLowerCase().trim();
    });

    const multiTierProductDimension = ndx.dimension((d) => {
        const categoryName = String(d.category__name || "Other").toLowerCase().trim();
        const productName  = String(d.name || "Unknown Product").trim();
        const productSize  = String(d.size || "Standard").trim();
        return [categoryName, productName, productSize];
    });

    // Setup Groups & Reducers
    const revenueByMultiTierGroup = multiTierProductDimension.group().reduceSum(calculateEffectivePrice);
    const rawHourlyGroup = continuousHourDimension.group().reduceSum(calculateEffectivePrice);
    
    const categoryRevenueGroup = categoryDimension.group().reduce(
        function (p, v) {
            let price = calculateEffectivePrice(v);
            const method = String(v.transaction__payment_method || '').toLowerCase().trim();
            const reason = String(v.transaction__payment_reason || '').toLowerCase().trim();
            const discount = String(v.discount || '').toLowerCase().trim();

            p.all += price;
            if (method.includes('cash')) p.cash += price;
            else if (method.includes('card') || method.includes('credit')) p.card += price;
            else if (method.includes('waste') || reason.includes('waste') || discount.includes('waste')) p.waste += price;
            else if (method.includes('comp') || method.includes('free') || reason.includes('comp') || discount.includes('comp')) p.complimentary += price;
            return p;
        },
        function (p, v) {
            let price = calculateEffectivePrice(v);
            const method = String(v.transaction__payment_method || '').toLowerCase().trim();
            const reason = String(v.transaction__payment_reason || '').toLowerCase().trim();
            const discount = String(v.discount || '').toLowerCase().trim();

            p.all -= price;
            if (method.includes('cash')) p.cash -= price;
            else if (method.includes('card') || method.includes('credit')) p.card -= price;
            else if (method.includes('waste') || reason.includes('waste') || discount.includes('waste')) p.waste -= price;
            else if (method.includes('comp') || method.includes('free') || reason.includes('comp') || discount.includes('comp')) p.complimentary -= price;
            return p;
        },
        function () {
            return { all: 0, cash: 0, card: 0, waste: 0, complimentary: 0 };
        }
    );

    const groupAllRevenue = allRecordsDimension.groupAll().reduce(
        (p, v) => { p.total += calculateEffectivePrice(v); return p; },
        (p, v) => { p.total -= calculateEffectivePrice(v); return p; },
        () => ({ total: 0 }),
    );

    const filledHourlyGroup = {
        all: function () {
            const currentFilteredData = rawHourlyGroup.all();
            if (currentFilteredData.length === 0) return [];

            const minDate = new Date(d3.min(currentFilteredData, (d) => d.key));
            const maxDate = new Date(d3.max(currentFilteredData, (d) => d.key));

            const lookup = new Map(currentFilteredData.map((d) => [d.key.getTime(), d.value]));
            const fullTimeline = [];

            let currentCursor = new Date(Date.UTC(
                minDate.getUTCFullYear(),
                minDate.getUTCMonth(),
                minDate.getUTCDate(),
                minDate.getUTCHours()
            ));

            while (currentCursor <= maxDate) {
                const timeKey = currentCursor.getTime();
                fullTimeline.push({
                    key: new Date(currentCursor),
                    value: lookup.has(timeKey) ? lookup.get(timeKey) : 0,
                });
                currentCursor.setUTCHours(currentCursor.getUTCHours() + 1);
            }
            return fullTimeline;
        },
    };

    // Instantiate Chart Elements
    hourlyChart = new dc.BarChart("#dc-hourly-chart");
    categoryChart = new dc.BarChart("#dc-category-chart");
    sunburstChart = new dc.SunburstChart("#dc-sunburst-chart");
    dataCountWidget = new dc.DataCount("#dc-data-count");

    // Configure 3-Tier Sunburst Chart
    sunburstChart
        .width(null) 
        .height(380)
        .dimension(multiTierProductDimension)
        .group(revenueByMultiTierGroup)
        .transitionDuration(400)
        .controlsUseVisibility(true)
        .innerRadius(30)
        .title((d) => {
            const labelPath = Array.isArray(d.key) ? d.key.join(" ➔ ") : d.key;
            return `text: €${d3.format(",.2f")(d.value)}`;
        })
        .ordinalColors(['#636efa', '#EF553B', '#ff9f1c', '#00cc96', '#ab63fa', '#19d3f3']);
    
    // 🚀 THE FIX: Use native filterHandler to translate parent nodes into array paths smoothly
    sunburstChart.filterHandler(function(dimension, filters) {
        // If there are no active filters, clear the dimension memory cleanly
        if (filters.length === 0) {
            dimension.filterAll();
            return filters;
        }

        // Target the latest path clicked (e.g., "drink", ["drink", "Guinness"], or ["drink", "Guinness", "pint"])
        const activeFilter = filters[filters.length - 1];

        dimension.filterFunction(function(recordArray) {
            // Case 1: Slices wrapped in an array path
            if (Array.isArray(activeFilter)) {
                return recordArray.every((val, i) => i >= activeFilter.length || val === activeFilter[i]);
            }
            // Case 2: Standard fallback matching for top parent string nodes
            return recordArray[0] === activeFilter;
        });

        return filters;
    });    
    
    // Configure Hourly Timeline
    hourlyChart
        .width(null)
        .height(350)
        .dimension(continuousHourDimension)
        .group(filledHourlyGroup)
        .transitionDuration(400)
        .x(d3.scaleUtc())
        .elasticX(true)
        .elasticY(true)
        .controlsUseVisibility(true)
        .xUnits(d3.timeHours)
        .centerBar(false)
        .barPadding(0.1)
        .xAxisLabel("Timeline Sequence (Hourly Blocks)")
        .margins({ top: 20, right: 30, bottom: 65, left: 60 });
    
    hourlyChart.on("renderlet.rotateLabels", function (chart) {
        chart.selectAll("g.x text")
            .style("text-anchor", "end")
            .attr("transform", "translate(-10, 2) rotate(-45)");
    });
    
    hourlyChart.xAxis().tickFormat(d3.timeFormat("%d %b %H:%M"));
    hourlyChart.yAxis().tickFormat((val) => `€${d3.format(",.2f")(val)}`);
    
    // Configure Category Breakdown Side-By-Side Chart
    const initialTotals = categoryRevenueGroup.all();
    const maxCategoryValue = d3.max(initialTotals, (d) => d.value.all) || 100;
    const lockedMaxLimit = maxCategoryValue * 1.15;
    
    categoryChart
        .width(null)
        .height(380)
        .dimension(categoryDimension)
        .group(categoryRevenueGroup, "All", d => Number((d && d.value && d.value.all ? d.value.all : 0).toFixed(2)))
        .transitionDuration(400)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(false)
        .y(d3.scaleLinear().domain([0, lockedMaxLimit]))
        .controlsUseVisibility(true)
        .xAxisLabel("Categories Broken Down by Method")
        .margins({ top: 35, right: 20, bottom: 45, left: 60 })
        .ordinalColors(['#333333', '#636efa', '#EF553B', '#ff9f1c', '#00cc96']);
    
    categoryChart.stack(categoryRevenueGroup, "Cash", d => Number((d && d.value && d.value.cash ? d.value.cash : 0).toFixed(2)));
    categoryChart.stack(categoryRevenueGroup, "Credit Card", d => Number((d && d.value && d.value.card ? d.value.card : 0).toFixed(2)));
    categoryChart.stack(categoryRevenueGroup, "Waste", d => Number((d && d.value && d.value.waste ? d.value.waste : 0).toFixed(2)));
    categoryChart.stack(categoryRevenueGroup, "Complimentary", d => Number((d && d.value && d.value.complimentary ? d.value.complimentary : 0).toFixed(2)));
    
    categoryChart.on('preRender.sideBySide', function (chart) {
        chart.centerBar(false);
    });
    
    categoryChart.on('renderlet.sideBySide', function (chart) {
        const numStacks = 5;
        const stacks = chart.selectAll('g.stack');
        const totalBandWidth = chart.x().bandwidth();
        const barWidth = (totalBandWidth / numStacks) * 0.88;
        const spacing = (totalBandWidth / numStacks) * 0.12;
        const yScale = chart.y();
        const chartHeight = chart.effectiveHeight();
    
        stacks.each(function (d, stackIndex) {
            const currentStack = d3.select(this);
    
            currentStack.selectAll('rect.bar')
                .attr('width', barWidth)
                .attr('transform', function (barData) {
                    const currentXTranslation = (barWidth + spacing) * stackIndex;
                    return `translate(${currentXTranslation}, 0)`;
                })
                .attr('y', function (barData) {
                    const trueValue = barData.data.value[Object.keys(barData.data.value)[stackIndex]];
                    return yScale(trueValue);
                })
                .attr('height', function (barData) {
                    const trueValue = barData.data.value[Object.keys(barData.data.value)[stackIndex]];
                    return chartHeight - yScale(trueValue);
                });
    
            currentStack.selectAll('text.bar-label').remove();
    
            currentStack.selectAll('rect.bar').each(function (barData) {
                const targetKey = Object.keys(barData.data.value)[stackIndex];
                const trueVal = barData.data.value[targetKey];
                if (trueVal === 0) return;
    
                const currentBar = d3.select(this);
                const rawX = parseFloat(currentBar.attr('x')) + ((barWidth + spacing) * stackIndex);
                const labelX = rawX + (barWidth / 2);
                const labelY = yScale(trueVal) - 6;
    
                currentStack.append('text')
                    .attr('class', 'bar-label')
                    .attr('x', labelX)
                    .attr('y', labelY)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '9px')
                    .style('font-weight', 'bold')
                    .style('fill', '#444')
                    .text(`€${d3.format(",.2f")(trueVal)}`);
            });
        });
    });
    
    categoryChart.yAxis().tickFormat(val => `€${d3.format(",.2f")(val)}`);
    categoryChart.legend(new dc.Legend().x(65).y(10).itemHeight(11).gap(8).horizontal(true));
    
    // Configure Record Tracker Widget
    // Configure Record Tracker Widget with your exact original terms restored
    dataCountWidget
        .crossfilter(ndx)
        .groupAll(ndx.groupAll())
        .html({
            some: "<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records | <a href='javascript:dc.filterAll(); dc.redrawAll();'>Reset All Filters</a>",
            all: "All records selected. Total records: <strong>%total-count</strong>"
        });
    
    // Custom Live Currency Counter Event Listener
    hourlyChart.on("renderlet.revenueCounter", function () {
        const activeSummary = groupAllRevenue.value();
        document.getElementById("dc-data-count").textContent = `€${activeSummary.total.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    });
    
    dc.renderAll();
    resizeCharts();
    }
    
    /** Handle dynamic structural sizing calculations */
    function resizeCharts() {
        const hourlyContainer = document.getElementById("dc-hourly-chart");
        const categoryContainer = document.getElementById("dc-category-chart");
        const sunburstContainer = document.getElementById("dc-sunburst-chart");
    
        if (hourlyContainer && categoryContainer && hourlyChart && categoryChart) {
            const hourlyWidth = hourlyContainer.parentElement.clientWidth - 30;
            const categoryWidth = categoryContainer.parentElement.clientWidth - 30;
    
            hourlyChart.width(hourlyWidth).rescale();
            categoryChart.width(categoryWidth).rescale();
    
            if (sunburstContainer && sunburstChart) {
                const sunburstWidth = sunburstContainer.parentElement.clientWidth - 30;
                sunburstChart.width(sunburstWidth);
            }
    
            dc.redrawAll();
        }
    }
    
    window.addEventListener("resize", resizeCharts);
    