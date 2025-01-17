$('document').ready(function() {
    console.log("reports_ndx.js");
    const host = window.location.host;
    var url = '';
    if(host.includes("heroku")) {
        console.log("HEROKU")
        url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/"
    }
    else {
        console.log("GITPOD")
        url = "https://8000-cathaldolan-ipuhaelepos-ttnjevm7y7g.ws-eu114.gitpod.io/";
    }

    d3.json(url + 'generate_report').then(function (data) {
        console.log("data = ", data)
        //Parse the date
        // const dateFormatSpecifier = '%d/%m/%Y';
        // const dateFormatParser = d3.timeParse(dateFormatSpecifier);
        var products = [];
        var sizes = [];
        var staff = [];
        data.forEach((d, i) => {
            window['name' + i] = d.staff_member__name;
            const dateTimeInParts = d.order_date_li.split( "T" ) 
            d.date = Date.parse(dateTimeInParts[0]);
            d.time = dateTimeInParts[1].slice(0,-5);

            if(!products.includes(d.name) && d.name != null) {
                products.push(d.name)
            }

            if(!sizes.includes(d.size) && d.size != null) {
                sizes.push(d.size)
            }
            if(!staff.includes(d.staff_member__name)) {
                staff.push(d.staff_member__name)
            }
            console.log("name = ", name0)
        });

        console.log("data = ", data)
        console.log("products = ", products)
        console.log("sizes = ", sizes)
        console.log("staff = ", staff)

        //Create the crossfilter
        const ndx = crossfilter(data);
        const all = ndx.groupAll();

        // Stacked chart
        var name_dim = ndx.dimension(dc.pluck('name'));
        sizes.forEach((size) => {
            window[size] = name_dim.group().reduceSum(dc.pluck('qty'))
        })

        console.log("pint=", pint);
        // var sizePerProduct = name_dim.group().reduceSum(function (d) {
        //     if (d.store === 'A') {
        //         return +d.spend;
        //     } else {
        //         return 0;
        //     }
        // });
        // var spendByNameStoreB = name_dim.group().reduceSum(function (d) {
        //     if (d.store === 'B') {
        //         return +d.spend;
        //     } else {
        //         return 0;
        //     }
        // });
        // var stackedChart = dc.barChart("#stacked-chart");
        // stackedChart
        //     .width(1500)
        //     .height(500)
        //     .dimension(name_dim)
        //     .group(pint, "Pint")
        //     .stack(0o4, "04")
        //     .x(d3.scaleLinear())
        //     .xUnits(dc.units.linear)
        //     .legend(dc.legend().x(420).y(0).itemHeight(15).gap(5));
        // stackedChart.margins().right = 100;


        // Daily totals line chart
        var date_dim = ndx.dimension(dc.pluck('date'));
        var total_spend_per_date = date_dim.group().reduceSum(dc.pluck('price_line_total'));
        var minDate = date_dim.bottom(1)[0].date;
        var maxDate = date_dim.top(1)[0].date;

        dc.lineChart("#line-graph")
            .width(1000)
            .height(300)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(date_dim)
            .group(total_spend_per_date)
            .transitionDuration(500)
            .x(d3.scaleTime().domain([minDate,maxDate]))
            .xAxisLabel("Date")
            .yAxis().ticks(4);
        
            

        // Spend per day chart
        var name_dim = ndx.dimension(dc.pluck('date'));
        var total_spend_per_day = name_dim.group().reduceSum(dc.pluck('price_line_total'));
        console.log("total_spend_per_day = ", total_spend_per_day)
        dc.barChart('#per-day-chart')
            .width(1000)
            .height(300)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(name_dim)
            .group(total_spend_per_day)
            .transitionDuration(500)
            .x(d3.scaleTime().domain([minDate,maxDate]))
            .xAxisLabel("Date")
            .yAxisLabel("€")
            .yAxis().ticks(4);
        
        
        dc.renderAll();
        
        // new Chart("scatterplot", {
        //     type: "scatter",
        //     data: {
        //         datasets: [{
        //             pointRadius: 4,
        //             pointBackgroundColor: "rgba(0,0,255,1)",
        //             data: xyValues
        //         }]
        //     }
        // });


    })


})