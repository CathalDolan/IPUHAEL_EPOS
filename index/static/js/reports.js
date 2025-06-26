
//Get the host name from url and set the fetch url accordingly
const host = window.location.host;
var url = '';
if (host.includes("heroku")) {
    console.log("HEROKU")
    url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/reports"
} else {
    console.log("GITPOD")
    url = "https://8000-cathaldolan-ipuhaelepos-ttnjevm7y7g.ws-eu120.gitpod.io/reports";
}

$('document').ready(function () {
    console.log("reports.js");
    const DATA = JSON.parse(document.getElementById('data').textContent);
    console.log("DATA = ", DATA)
    console.log("DATA = ", DATA.length)

    generateCharts()

    // Function to display the filter dropdown lists when clicked
    $('.anchor').on('click', function () {
        if (this.parentNode.classList.contains('visible')) {
            this.parentNode.classList.remove('visible')
        } else {
            $('.dropdown-check-list').removeClass('visible')
            this.parentNode.classList.add('visible');
        }
    })

    $('.datepicker').on("change", function () {
        fetchData()
    })
    $('.timepicker').on("change", function () {
        fetchData()
    })
    $('.checkbox').click(function () {
        if (this.name == "all") {
            if ($(this).is(':checked')) {
                $(this).parent().siblings().children().prop("checked", true)
            } else {
                $(this).parent().siblings().children().prop("checked", false)
            }
        }
        else {
            $(this).parents('.items').find("[name='all']").prop("checked", false)
        }
        generateCharts();
    })
        
    var timeOut;
    function generateCharts(data) {
        console.log("generateCharts data = ", data)
        var time = new Date()
        console.log(`time = ${time.getHours()<10?'0':''}${time.getHours()}:${time.getMinutes()<10?'0':''}${time.getMinutes()}:${time.getSeconds()<10?'0':''}${time.getSeconds()}`)
        
        // timeOut = setTimeout(fetchData, 60000)

        if(data !== undefined) {
            orders = data;
        }
        else {
            orders = DATA;
        }
        var from_date = new Date($('#from_date').val());
        var to_date = new Date($('#to_date').val());
        to_date.setHours($('#to_time').val().split(':')[0])
        to_date.setMinutes($('#to_time').val().split(':')[1])

        var selected_staff = $('#staff').find("input:checked").map(function () {
            return this.name;
        });
        var selected_categories = $('#category').find("input:checked").map(function () {
            return this.name;
        });
        var selected_drinks = $('#drinks').find("input:checked").map(function () {
            return this.name;
        });
        var selected_food = $('#food').find("input:checked").map(function () {
            return this.name;
        });
        var selected_gifts = $('#gifts').find("input:checked").map(function () {
            return this.name;
        });
        var selected_sizes = $('#size').find("input:checked").map(function () {
            return this.name;
        });
        var selected_transaction_type = $('#transaction_type').find("input:checked").map(function() {
            return this.name
        })
        
        let data_filtered = orders.filter(item => 
            ((Date.parse(item.order_date_li) >= `${Date.parse(from_date)}`) 
            && (Date.parse(item.order_date_li) <= `${Date.parse(to_date)}`) 
            && Object.values(selected_staff).includes(item.staff_member__name)
            && Object.values(selected_categories).includes(item.category)
            && Object.values(selected_sizes).includes(item.size)
            && Object.values(selected_transaction_type).includes(item.grand_totals_id__payment_method))
            && ((Object.values(selected_drinks).includes(item.name) || (item.category == 'Open drink' && Object.values(selected_categories).includes(item.category)))
            || Object.values(selected_food).includes(item.name)
            || Object.values(selected_gifts).includes(item.name))
        );
        console.log("data_filtered = ", data_filtered);
        // data_filtered.forEach(item => {
        //     console.log(item)
        //     // if(!data_filtered.includes(item))
        //     //      {
        //     //         console.log("YES")
        //     // }
        //     // else {
        //     //     console.log(item.id)  
        //     // }
        // })

        var groups = [];
        var transactions = [];
        var cashTransactions = {"number": 0, "total": 0};
        var cardTransactions = {"number": 0, "total": 0};
        var wasteTransactions = {"number": 0, "total": 0};
        var compTransactions = {"number": 0, "total": 0};
        var revenue_total = 0;
        var xyValues = [];
        data_filtered.forEach(item => {
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
        
        $('#summary-table').empty()
        $('#summary-table').append(
            `<tr>
                <td>${transactions.length}</td>
                <td>€${revenue_total.toFixed(2)}</td>
                <td>${cashTransactions.number}</td>
                <td>€${cashTransactions.total.toFixed(2)}</td>
                <td>${cardTransactions.number}</td>
                <td>€${cardTransactions.total.toFixed(2)}</td>
                <td>${wasteTransactions.number}</td>
                <td>€${wasteTransactions.total.toFixed(2)}</td>
                <td>${compTransactions.number}</td>
                <td>€${compTransactions.total.toFixed(2)}</td>
            </tr>`
        )


        groups.sort((a,b) => a.name.localeCompare(b.name));
        console.log("groups = ", groups);
        $('#group-table').empty();
        groups.forEach(item => {
            $('#group-table').append(
                `<tr>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.size}</td>
                    <td>${item.quantity}</td>
                    <td>€${item.total.toFixed(2)}</td>
                </tr>`
            )
        })
        // drawMySunburst(groups)

    }
    
    function fetchData() {
        from_time = $('#from_time').val()
        from_date = new Date($('#from_date').val())
        from_date.setHours(from_time.split(':')[0])
        from_date.setMinutes(from_time.split(':')[1])

        to_time = $('#to_time').val()
        to_date = new Date($('#to_date').val())
        to_date.setHours(to_time.split(':')[0])
        to_date.setMinutes(to_time.split(':')[1])
        
        // clearTimeout(timeOut)

        fetch(`${url}?` + new URLSearchParams({
            from_date: from_date.toUTCString(),
            to_date: to_date.toUTCString()
        }).toString())
        .then(response => response.json())
        .then(data => {
            console.log("data = ", data)
            orders = data.orders;
            generateCharts(data.orders)
            }
        )
        .catch(err => console.error(err));
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
            console.log(item);
            var item_total = Number(item.total)
            if(item_name == item.name) {
                values[values.length-1] += item.total;
                if(item.category.includes("food")) {
                    foodTotal += item.total
                }
                else if(item.category.includes("gift")) {
                    giftsTotal += item.total
                }
                else {
                    drinksTotal += item.total
                }
            } 
            else {
                if(item.category.includes("food")) {
                    foodTotal += item.total;
                    ids.push(`Food-${item.name}`)
                    labels.push(item.name);
                    parents.push(`Food`)
                    values.push(item.total)
                    // labels.push(item.size)
                    // parents.push(`${item.name}`)
                    // values.push(item.total)
                }
                else if(item.category.includes("gift")) {
                    // console.log("GIFT")
                    giftsTotal += item.total;
                    ids.push(`Gifts-${item.name}`)
                    labels.push(item.name);
                    parents.push(`Gifts`)
                    values.push(item.total)
                    // labels.push(item.size)
                    // parents.push(`${item.name}`)
                    // values.push(item.total)
                } 
                else {
                    // console.log("DRINK")
                    drinksTotal += item.total;
                    ids.push(`Drinks-${item.name}`)
                    labels.push(item.name);
                    parents.push(`Drinks`)
                    values.push(item.total)
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
                labels.push(`${item.size}`)
                parents.push(`Food-${item.name}`)
                values.push(item.total)
            }
            else if(item.category.includes("gift")) {
                // console.log("GIFT")
                // giftsTotal += item.total;
                // labels.push(item.name);
                // parents.push(`Gifts`)
                // values.push(item.total)
                ids.push(`${item.name}-${item.size}`)
                labels.push(`${item.size}`)
                parents.push(`Gifts-${item.name}`)
                values.push(item.total)
            } 
            else {
                // console.log("DRINK")
                // drinksTotal += item.total;
                // labels.push(item.name);
                // parents.push(`Drinks`)
                // values.push(item.total)
                ids.push(`${item.name}-${item.size}`)
                labels.push(`${item.size}`)
                parents.push(`Drinks-${item.name}`)
                values.push(item.total)
            }
        })
        values[0] = drinksTotal;
        values[1] = foodTotal;
        values[2] = giftsTotal;

        for(i=0; i< ids.length; i++) {
            console.log("id = ", ids[i])
            console.log("labels = ", labels[i])
            console.log("parents = ", parents[i])
            console.log("values = ", values[i])
        }

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
})
