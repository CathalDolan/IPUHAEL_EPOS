console.log("takings.js");
//Get the host name from url and set the fetch url accordingly
const host = window.location.host;
var url = '';
if (host.includes("heroku")) {
    console.log("HEROKU")
    url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/generate_report"
} else {
    console.log("GITPOD")
    url = 'http://127.0.0.1:8000/generate_report';
}

var xArray = [];
var yArray = [];

fetch(`${url}?` + new URLSearchParams({
    // from_date: from_date.toUTCString(),
    // to_date: to_date.toUTCString()
}).toString())
.then(response => response.json())
.then(data => {
    console.log("data = ", data)
    var highestId = Math.max.apply(null, data.map(function(e) {
        return e.grand_totals;
    }));
    console.log("highestId = ", highestId)
    drawBarGraph(data)
    formatGroups(data)
})
.catch(err => console.error(err));

function roundMinutes(date) {
    date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
    date.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
    return date;
}

function drawBarGraph(entries) {
    // Bar graph
    var item_time = 0;
    var hourly_amount = 0;
    entries.forEach((item, index) => {
        var date = new Date(item.order_date_li)
        var rounded_date = roundMinutes(date)
        item.price_line_total = Number(item.price_line_total)
        if(Date.parse(rounded_date) == Date.parse(item_time)) {
            hourly_amount += item.price_line_total
        } 
        else {
            if(index != 0) {
                xArray.push(item_time);
                yArray.push(hourly_amount)
            } 
            item_time = rounded_date;
            hourly_amount = item.price_line_total
        }
    })

    const data = [{
        x: xArray,
        y: yArray,
        type: "bar",
        orientation:"v",
        marker: {color:"rgba(0,0,255)"}
    }];
    const layout = {title:"Sales per hour"};
    Plotly.newPlot("barPlot", data, layout);
}

///////////////////////////////////////
function formatGroups(entries) {
    var groups = [];
    var transactions = [];
    var cashTransactions = {"number": 0, "total": 0};
    var cardTransactions = {"number": 0, "total": 0};
    var wasteTransactions = {"number": 0, "total": 0};
    var compTransactions = {"number": 0, "total": 0};
    var revenue_total = 0;
    var xyValues = [];

    entries.forEach(item => {
        var groupItem = groups.find(x => x.name == item.name && x.size == item.size);
        var groupItemIndex = groups.findIndex(x => x.name == item.name && x.size == item.size);
        if(groupItem == undefined) {
            groups.push({
                // "staff": item.staff_member__name,
                "name": item.name,
                "category": item.category,
                "size": item.size,
                "quantity": Number(item.quantity),
                "total": Number(item.price_line_total)
            })
        }
        else {
            groups[groupItemIndex].quantity += Number(item.quantity);
            groups[groupItemIndex].total += Number(item.price_line_total);
        }
            
        var transaction = transactions.find(x => x.id == item.grand_totals_id);
        var transactionIndex = transactions.findIndex(x => x.id == item.grand_totals_id);
        var cashIncrement = 0;
        var cashTotalIncrement = 0;
        var cardIncrement = 0;
        var cardTotalIncrement = 0;
        var wasteIncrement = 0;
        var wasteTotalIncrement = 0;
        var compIncrement = 0;
        var compTotalIncrement = 0;
        switch (item.grand_totals_id__payment_method) {
            case "Cash":
                cashIncrement = 1;
                cashTotalIncrement = Number(item.price_line_total);
                break;
            case "Credit Card":
                cardIncrement = 1;
                cardTotalIncrement = Number(item.price_line_total);
                break;
            case "Waste":
                wasteIncrement = 1;
                wasteTotalIncrement = Number(item.price_line_total);
                break;
            case "Complimentary":
                compIncrement = 1;
                compTotalIncrement = Number(item.price_line_total);
                break;
        }    
        if(transaction == undefined) {
            transactions.push({"id": item.grand_totals});
            cashTransactions.number += cashIncrement;
            cashTransactions.total += cashTotalIncrement;
            cardTransactions.number += cardIncrement;
            cardTransactions.total += cardTotalIncrement;
            wasteTransactions.number += wasteIncrement;
            wasteTransactions.total += wasteTotalIncrement;
            compTransactions.number += compIncrement;
            compTransactions.total += compTotalIncrement;
        }
        else {
            cashTransactions.total += cashTotalIncrement;
            cardTransactions.total += cardTotalIncrement;
            wasteTransactions.total += wasteTotalIncrement;
            compTransactions.total += compTotalIncrement;
        }          
        // console.log("cashTransactions = ", cashTransactions)
        // console.log("cardTransactions = ", cardTransactions)
        // console.log("wasteTransactions = ", wasteTransactions)
        // console.log("compTransactions = ", compTransactions)
    })
    revenue_total = cashTransactions.total + cardTransactions.total;

    groups.sort((a,b) => a.name.localeCompare(b.name));
    console.log("groups = ", groups);

    drawMySunburst(groups)
}

function drawMySunburst(groups) {
    console.log("groups = ", groups)
    var ids = ["Drinks", "Food", "Gifts"];
    var labels = ["Drinks", "Food", "Gifts"];
    var parents = ["", "", "",];
    var drinksTotal = 0;
    var foodTotal = 0;
    var giftsTotal = 0;
    var values = [drinksTotal, foodTotal, giftsTotal];
    var item_name = "";

        // 1st iteration
    groups.forEach(item => {
        // console.log(item);
        var item_total = Number(item.quantity)
        if(item_name == item.name) {
            values[values.length-1] += item.quantity;
            if(item.category.includes("food")) {
                foodTotal += item.quantity
            }
            else if(item.category.includes("gift")) {
                giftsTotal += item.quantity
            }
            else {
                drinksTotal += item.quantity
            }
        } 
        else {
            if(item.category.includes("food")) {
                foodTotal += item.quantity;
                ids.push(`Food-${item.name}`)
                labels.push(`${item.name} (${item.quantity})`);
                parents.push(`Food`)
                values.push(item.quantity)
                // labels.push(item.size)
                // parents.push(`${item.name}`)
                // values.push(item.total)
            }
            else if(item.category.includes("gift")) {
                // console.log("GIFT")
                giftsTotal += item.quantity;
                ids.push(`Gifts-${item.name}`)
                labels.push(`${item.name} (${item.quantity})`);
                parents.push(`Gifts`)
                values.push(item.quantity)
                // labels.push(item.size)
                // parents.push(`${item.name}`)
                // values.push(item.total)
            } 
            else {
                // console.log("DRINK")
                drinksTotal += item.quantity;
                ids.push(`Drinks-${item.name}`)
                labels.push(`${item.name} (${item.quantity})`);
                parents.push(`Drinks`)
                values.push(item.quantity)
                // labels.push(item.size)
                // parents.push(`${item.name}`)
                // values.push(item.total)
            }
        }           
        item_name = item.name;
    })

        // 2nd iteration
    groups.forEach(item => {
        if(item.category.includes("food")) {
            // foodTotal += item.total;
            // labels.push(item.name);
            // parents.push(`Food`)
            // values.push(item.total)
            ids.push(`${item.name}-${item.size}`)
            labels.push(`${item.size} (${item.quantity})`)
            parents.push(`Food-${item.name}`)
            values.push(item.quantity)
        }
        else if(item.category.includes("gift")) {
            // console.log("GIFT")
            // giftsTotal += item.total;
            // labels.push(item.name);
            // parents.push(`Gifts`)
            // values.push(item.total)
            ids.push(`${item.name}-${item.size}`)
            labels.push(`${item.size} (${item.quantity})`)
            parents.push(`Gifts-${item.name}`)
            values.push(item.quantity)
        } 
        else {
            // console.log("DRINK")
            // drinksTotal += item.total;
            // labels.push(item.name);
            // parents.push(`Drinks`)
            // values.push(item.total)
            ids.push(`${item.name}-${item.size}`)
            labels.push(`${item.size} (${item.quantity})`)
            parents.push(`Drinks-${item.name}`)
            values.push(item.quantity)
        }
    })
    values[0] = drinksTotal;
    values[1] = foodTotal;
    values[2] = giftsTotal;
    labels[0] = `Drinks (${drinksTotal})`
    labels[1] = `Food (${foodTotal})`
    labels[2] = `Gifts (${giftsTotal})`
    // for(i=0; i< ids.length; i++) {
    //     console.log("id = ", ids[i])
    //     console.log("labels = ", labels[i])
    //     console.log("parents = ", parents[i])
    //     console.log("values = ", values[i])
    // }

    var data = [
        {
            type: "sunburst",
            // maxdepth: 3,
            ids:ids,
            labels: labels,
            parents: parents,
            values: values,
            branchvalues: 'total',
            textposition: 'inside',
            textcase: "word caps"
            // insidetextorientation: 'radial'
        }
    ];

    var layout = {
        margin: {l: 0, r: 0, b: 0, t:0},
        sunburstcolorway:[
            "#636efa","#EF553B","#00cc96","#ab63fa","#19d3f3",
            "#e763fa", "#FECB52","#FFA15A","#FF6692","#B6E880"
        ],
        extendsunburstcolorway: true
    };
    console.log("data = ", data[0])
    // for(i=0; i<data[0]['ids'].length; i++) {
    //     console.log(`[i] = ${i}`)
    //     console.log(`id = ${data[0]['ids'][i]}`)
    //     console.log(`label = ${data[0]['labels'][i]}`)
    //     console.log(`parent = ${data[0]['parents'][i]}`)
    // }

    Plotly.newPlot('sunburst', data, layout, {showSendToCloud: true});
}
//     console.log("entries = ", entries)
//     var subCategories = []
//     var ids = ["Drinks", "Food", "Gifts"];
//     var labels = ["Drinks", "Food", "Gifts"];
//     var parents = ["", "", "",];
//     var drinksTotal = 0;
//     var foodTotal = 0;
//     var giftsTotal = 0;
//     var values = [drinksTotal, foodTotal, giftsTotal];
//     var item_name = "";

//     entries.forEach((item, index) => {
//         // console.log(index, item)
//         if(subCategories.indexOf(item.category) === -1) {
//             console.log("YES NOT")
//             subCategories.push(item.category)
//         }
//         if(item.category.includes("food")) {
//             foodTotal += item.total;
//             // ids.push(`Food-${item.name}`)
//             // labels.push(item.name);
//             // parents.push(`Food`)
//             // values.push(item.total)
//         }
//         else if(item.category.includes("gift")) {
//             giftsTotal += item.total;
//             // ids.push(`Gifts-${item.name}`)
//             // labels.push(item.name);
//             // parents.push(`Gifts`)
//             // values.push(item.total)
//         } 
//         else {
//             drinksTotal += item.total;
//             // ids.push(`Drinks-${item.name}`)
//             // labels.push(item.name);
//             // parents.push(`Drinks`)
//             // values.push(item.total)
//         }
//     })
//     console.log("subCategories = ", subCategories)
// }

///////////////////////////////////////
// d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/coffee-flavors.csv', function(err, rows){
//   function unpack(rows, key) {
//   return rows.map(function(row) { return row[key]; });
// }

// var data = [
//     {
//       type: "sunburst",
//       maxdepth: 3,
//       ids: unpack(rows, 'ids'),
//       labels: unpack(rows, 'labels'),
//       parents:unpack(rows, 'parents')
//     }
//   ];

// var layout = {
//   margin: {l: 0, r: 0, b: 0, t:0},
//   sunburstcolorway:[
//     "#636efa","#EF553B","#00cc96","#ab63fa","#19d3f3",
//     "#e763fa", "#FECB52","#FFA15A","#FF6692","#B6E880"
//   ],
//   extendsunburstcolorway: true
// };
// // console.log("data = ", data[0])
// // for(i=0; i<data[0]['ids'].length; i++) {
// //     console.log(`[i] = ${i}`)
// //     console.log(`id = ${data[0]['ids'][i]}`)
// //     console.log(`label = ${data[0]['labels'][i]}`)
// //     console.log(`parent = ${data[0]['parents'][i]}`)
// // }

// Plotly.newPlot('myDiv', data, layout, {showSendToCloud: true});
// })
