
//Get the host name from url and set the fetch url accordingly
const host = window.location.host;
var url = '';
if (host.includes("heroku")) {
    console.log("HEROKU")
    url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/reports"
} else {
    console.log("GITPOD")
    url = 'http://127.0.0.1:8000/reports';
}

$('document').ready(function () {
    console.log("reports_v2.js");
    const DATA = JSON.parse(document.getElementById('data').textContent);
    console.log("DATA = ", DATA)
    console.log("DATA = ", DATA.length)
    // const ndx = crossfilter(DATA);
    // const all = ndx.groupAll();
    
    // console.log("ndx = ", ndx)
    // console.log("all = ", all)
    generateCharts()

    drawSalesBarChart()

    drawHourlySalesChart()

    
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
        
    // var timeOut;
    function generateCharts(data) {
        // console.log("generateCharts data = ", data)
        var time = new Date()

        if(data !== undefined) {
            orders = data;
        }
        else {
            orders = DATA;
        }
        // console.log("orders = ", orders)
        // var from_date = new Date($('#from_date').val());
        // var to_date = new Date($('#to_date').val());
        // to_date.setHours($('#to_time').val().split(':')[0])
        // to_date.setMinutes($('#to_time').val().split(':')[1])

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
        // console.log("selected_staff = ", selected_staff)
        // console.log("selected_categories = ", selected_categories)
        // console.log("selected_drinks = ", selected_drinks)
        // console.log("selected_food = ", selected_food)
        // console.log("selected_gifts = ", selected_gifts)
        // console.log("selected_sizes = ", selected_sizes)
        // console.log("selected_transaction_type = ", selected_transaction_type)
        // let data_filtered = orders.filter(item => 
        //     ((Date.parse(item.order_date_li) >= `${Date.parse(from_date)}`) 
        //     && (Date.parse(item.order_date_li) <= `${Date.parse(to_date)}`) 
        //     && Object.values(selected_staff).includes(item.staff_member__name)
        //     && Object.values(selected_categories).includes(item.category)
        //     && Object.values(selected_sizes).includes(item.size)
        //     && Object.values(selected_transaction_type).includes(item.grand_totals_id__payment_method))
        //     && ((Object.values(selected_drinks).includes(item.name) || (item.category == 'Open drink' && Object.values(selected_categories).includes(item.category)))
        //     || Object.values(selected_food).includes(item.name)
        //     || Object.values(selected_gifts).includes(item.name))
        // );
        // console.log("data_filtered = ", data_filtered);
        
        // var groups = [];
        // var transactions = [];
        // var cashTransactions = {"number": 0, "total": 0};
        // var cardTransactions = {"number": 0, "total": 0};
        // var wasteTransactions = {"number": 0, "total": 0};
        // var compTransactions = {"number": 0, "total": 0};
        // var revenue_total = 0;
        // var xyValues = [];
        // orders.forEach(item => {
        //     var groupItem = groups.find(x => x.name == item.name && x.size == item.size);
        //     var groupItemIndex = groups.findIndex(x => x.name == item.name && x.size == item.size);
        //     if(groupItem == undefined) {
        //         groups.push({
        //             // "staff": item.staff_member__name,
        //             "name": item.name,
        //             "category": item.category,
        //             "size": item.size,
        //             "quantity": Number(item.quantity),
        //             "total": Number(item.price_line_total)
        //         })
        //     }
        //     else {
        //         groups[groupItemIndex].quantity += Number(item.quantity);
        //         groups[groupItemIndex].total += Number(item.price_line_total);
        //     }
            
        //     var transaction = transactions.find(x => x.id == item.grand_totals_id);
        //     var transactionIndex = transactions.findIndex(x => x.id == item.grand_totals_id);
        //     var cashIncrement = 0;
        //     var cashTotalIncrement = 0;
        //     var cardIncrement = 0;
        //     var cardTotalIncrement = 0;
        //     var wasteIncrement = 0;
        //     var wasteTotalIncrement = 0;
        //     var compIncrement = 0;
        //     var compTotalIncrement = 0;
        //     switch (item.transaction__payment_method) {
        //         case "Cash":
        //             cashIncrement = 1;
        //             cashTotalIncrement = Number(item.price_line_total);
        //           break;
        //         case "Credit Card":
        //             cardIncrement = 1;
        //             cardTotalIncrement = Number(item.price_line_total);
        //           break;
        //         case "Waste":
        //             wasteIncrement = 1;
        //             wasteTotalIncrement = Number(item.price_line_total);
        //           break;
        //         case "Complimentary":
        //             compIncrement = 1;
        //             compTotalIncrement = Number(item.price_line_total);
        //           break;
        //     }    
        //     if(transaction == undefined) {
        //         transactions.push({"id": item.grand_totals});
        //         cashTransactions.number += cashIncrement;
        //         cashTransactions.total += cashTotalIncrement;
        //         cardTransactions.number += cardIncrement;
        //         cardTransactions.total += cardTotalIncrement;
        //         wasteTransactions.number += wasteIncrement;
        //         wasteTransactions.total += wasteTotalIncrement;
        //         compTransactions.number += compIncrement;
        //         compTransactions.total += compTotalIncrement;
        //     }
        //     else {
        //         cashTransactions.total += cashTotalIncrement;
        //         cardTransactions.total += cardTotalIncrement;
        //         wasteTransactions.total += wasteTotalIncrement;
        //         compTransactions.total += compTotalIncrement;
        //     }          
        //     // console.log("cashTransactions = ", cashTransactions)
        //     // console.log("cardTransactions = ", cardTransactions)
        //     // console.log("wasteTransactions = ", wasteTransactions)
        //     // console.log("compTransactions = ", compTransactions)
        // })
        // revenue_total = cashTransactions.total + cardTransactions.total;
        // Set up an empty Set to track completely unique transaction numbers
        const uniqueTransactionIds = new Set();

        // Initialize all the metrics containers
        const analyticsSummary = {
            totalTransactions: 0,
            totalRevenue: 0,
            cashTransactionsCount: 0,
            cashTotal: 0,
            cardTransactionsCount: 0,
            cardTotal: 0,
            wasteTransactionsCount: 0,
            wasteTotal: 0,
            complimentaryTransactionsCount: 0,
            complimentaryTotal: 0
        };

        // Assuming your array of 219 items is named 'orderData'
        const groupedOrders = Object.values(orders.reduce((accumulator, currentItem) => {

            // 1. Clean and convert prices safely
            // const linePrice = parseFloat(String(currentItem.price_line_total || '0'));
            const txNumber = currentItem.transaction__transaction_number || '';
            // Normalize string metrics for matching filters
            const payment_method = String(currentItem.transaction__payment_method || '').toLowerCase().trim();

            const payment_reason = String(currentItem.transaction__payment_reason || '').toLowerCase().trim();

            // 1. Establish a grouping signature combining name and size
            const key = `${currentItem.name}_${currentItem.size}`;
            
            // 2. Heavy-duty cleaning for string numbers (handles '€10.50', ' 10.50 ', or '10,50')
            let rawPrice = String(currentItem.price_line_total || '0')
                .replace(/[^0-9.,]/g, '') // Strips out symbols like € or letters
                .replace(',', '.');       // Swaps European commas to dots if present
            
            const linePrice = parseFloat(rawPrice) || 0;
            
            // 3. Convert quantity string to a base-10 integer
            const quantity = parseInt(String(currentItem.quantity || '0').replace(/[^0-9]/g, ''), 10) || 0;

            // 2. Add to global total revenue
            analyticsSummary.totalRevenue += linePrice;

            // 3. Track Unique Transactions overall and by conditional category
            let isNewTransactionForThisId = false;
            if (txNumber && !uniqueTransactionIds.has(txNumber)) {
                uniqueTransactionIds.add(txNumber);
                analyticsSummary.totalTransactions++;
                isNewTransactionForThisId = true; // Mark that this row is the start of a fresh ticket
            }

            // 4. Calculate Payment Methods (Cash vs Card)
            if (payment_method.includes('cash') || payment_method.includes('pfand')) {
                analyticsSummary.cashTotal += linePrice;
                if (isNewTransactionForThisId) analyticsSummary.cashTransactionsCount++;
            } 
            else if (payment_method.includes('card')) {
                analyticsSummary.cardTotal += linePrice;
                if (isNewTransactionForThisId) analyticsSummary.cardTransactionsCount++;
            }

            if (payment_method.includes('waste')) {
                analyticsSummary.wasteTotal += currentItem.quantity * currentItem.price_unit;
                if (isNewTransactionForThisId) analyticsSummary.wasteTransactionsCount++;
            } 
            else if (payment_method.includes('comp')) {
                analyticsSummary.complimentaryTotal += currentItem.quantity * currentItem.price_unit;
                if (isNewTransactionForThisId) analyticsSummary.complimentaryTransactionsCount++;
            }

            // 4. Build group container if it is the first time seeing this key
            if (!accumulator[key]) {
                accumulator[key] = {
                    name: currentItem.name,
                    category: currentItem.category__name,
                    size: currentItem.size,
                    total_quantity: 0,
                    total_price: 0
                };
            }
            
            // 5. Merge values into the group matching key
            accumulator[key].total_quantity += quantity;
            accumulator[key].total_price += linePrice;
            
            return accumulator;
        }, {}));

        // 6. Hard format all numeric financial prices to currency outputs
        const currencyFields = ['totalRevenue', 'cashTotal', 'cardTotal', 'wasteTotal', 'complimentaryTotal'];
        currencyFields.forEach(field => {
            analyticsSummary[field] = `€${analyticsSummary[field].toFixed(2)}`;
        });

        console.log("Analytics Breakdown Summary:", analyticsSummary);

        // 6. Hard-convert values back to formatted currency strings
        groupedOrders.forEach(item => {
            item.total_price = `€${item.total_price.toFixed(2)}`;
        });

        console.log(groupedOrders);



        $('#summary-table').empty()
        $('#summary-table').append(
            `<tr>
                <td>${analyticsSummary.totalTransactions}</td>
                <td>€${analyticsSummary.totalRevenue}</td>
                <td>${analyticsSummary.cashTransactionsCount}</td>
                <td>€${analyticsSummary.cashTotal}</td>
                <td>${analyticsSummary.cardTransactionsCount}</td>
                <td>€${analyticsSummary.cardTotal}</td>
                <td>${analyticsSummary.wasteTransactionsCount}</td>
                <td>€${analyticsSummary.wasteTotal}</td>
                <td>${analyticsSummary.complimentaryTransactionsCount}</td>
                <td>€${analyticsSummary.complimentaryTotal}</td>
            </tr>`
        )


        groupedOrders.sort((a,b) => a.name.localeCompare(b.name));
        // console.log("groups = ", groups);
        $('#group-table').empty();
        groupedOrders.forEach(item => {
            $('#group-table').append(
                `<tr>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.size}</td>
                    <td>${item.total_quantity}</td>
                    <td>${item.total_price}</td>
                </tr>`
            )
        })
        drawMySunburst(groupedOrders)


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
            drawSalesBarChart(data.orders)
            }
        )
        .catch(err => console.error(err));
    }

    // // MY SUNBURST CODE
    // function drawMySunburst(groups) {
    //     console.log("groups = ", groups)
    //     var ids = ["Drinks", "Food", "Gifts"];
    //     var labels = ["Drinks", "Food", "Gifts"];
    //     var parents = ["", "", "",];
    //     var drinksTotal = 0;
    //     var foodTotal = 0;
    //     var giftsTotal = 0;
    //     var values = [drinksTotal, foodTotal, giftsTotal];
    //     var item_name = "";

    //     // 1st iteration
    //     groups.forEach(item => {
    //         console.log(item);
    //         var item_total = Number(item.total)
    //         if(item_name == item.name) {
    //             values[values.length-1] += item.total;
    //             if(item.category.includes("food")) {
    //                 foodTotal += item.total_price
    //             }
    //             else if(item.category.includes("gift")) {
    //                 giftsTotal += item.total_price
    //             }
    //             else {
    //                 drinksTotal += item.total_price
    //             }
    //         } 
    //         else {
    //             if(item.category.includes("food")) {
    //                 foodTotal += item.total;
    //                 ids.push(`Food-${item.name}`)
    //                 labels.push(item.name);
    //                 parents.push(`Food`)
    //                 values.push(item.total_price)
    //                 // labels.push(item.size)
    //                 // parents.push(`${item.name}`)
    //                 // values.push(item.total)
    //             }
    //             else if(item.category.includes("gift")) {
    //                 // console.log("GIFT")
    //                 giftsTotal += item.total;
    //                 ids.push(`Gifts-${item.name}`)
    //                 labels.push(item.name);
    //                 parents.push(`Gifts`)
    //                 values.push(item.total_price)
    //                 // labels.push(item.size)
    //                 // parents.push(`${item.name}`)
    //                 // values.push(item.total)
    //             } 
    //             else {
    //                 // console.log("DRINK")
    //                 drinksTotal += item.total;
    //                 ids.push(`Drinks-${item.name}`)
    //                 labels.push(item.name);
    //                 parents.push(`Drinks`)
    //                 values.push(item.total_price)
    //                 // labels.push(item.size)
    //                 // parents.push(`${item.name}`)
    //                 // values.push(item.total)
    //             }
    //         }           
    //         item_name = item.name;
    //     })

    //     // 2nd iteration
    //     groups.forEach(item => {
    //         if(item.category.includes("food")) {
    //             // foodTotal += item.total;
    //             // labels.push(item.name);
    //             // parents.push(`Food`)
    //             // values.push(item.total)
    //             ids.push(`${item.name}-${item.size}`)
    //             labels.push(`${item.size}`)
    //             parents.push(`Food-${item.name}`)
    //             values.push(item.total_price)
    //         }
    //         else if(item.category.includes("gift")) {
    //             // console.log("GIFT")
    //             // giftsTotal += item.total;
    //             // labels.push(item.name);
    //             // parents.push(`Gifts`)
    //             // values.push(item.total)
    //             ids.push(`${item.name}-${item.size}`)
    //             labels.push(`${item.size}`)
    //             parents.push(`Gifts-${item.name}`)
    //             values.push(item.total_price)
    //         } 
    //         else {
    //             // console.log("DRINK")
    //             // drinksTotal += item.total;
    //             // labels.push(item.name);
    //             // parents.push(`Drinks`)
    //             // values.push(item.total)
    //             ids.push(`${item.name}-${item.size}`)
    //             labels.push(`${item.size}`)
    //             parents.push(`Drinks-${item.name}`)
    //             values.push(item.total_price)
    //         }
    //     })
    //     values[0] = drinksTotal;
    //     values[1] = foodTotal;
    //     values[2] = giftsTotal;

    //     for(i=0; i< ids.length; i++) {
    //         console.log("id = ", ids[i])
    //         console.log("labels = ", labels[i])
    //         console.log("parents = ", parents[i])
    //         console.log("values = ", values[i])
    //     }

    //     var data = [
    //             {
    //                 type: "sunburst",
    //                 // maxdepth: 3,
    //                 ids:ids,
    //                 labels: labels,
    //                 parents: parents,
    //                 values: values,
    //                 branchvalues: 'total',
    //                 textposition: 'inside',
    //                 textcase: "word caps"
    //                 // insidetextorientation: 'radial'
    //             }
    //         ];

    //         var layout = {
    //             margin: {l: 0, r: 0, b: 0, t:0},
    //             sunburstcolorway:[
    //                 "#636efa","#EF553B","#00cc96","#ab63fa","#19d3f3",
    //                 "#e763fa", "#FECB52","#FFA15A","#FF6692","#B6E880"
    //             ],
    //             extendsunburstcolorway: true
    //         };
    //         console.log("data = ", data[0])
    //         // for(i=0; i<data[0]['ids'].length; i++) {
    //         //     console.log(`[i] = ${i}`)
    //         //     console.log(`id = ${data[0]['ids'][i]}`)
    //         //     console.log(`label = ${data[0]['labels'][i]}`)
    //         //     console.log(`parent = ${data[0]['parents'][i]}`)
    //         // }

    //         Plotly.newPlot('sunburst', data, layout, {showSendToCloud: true});
    // }



    // AI ATTEMP 1
    function drawMySunburst(groups) {
        console.log("Incoming groups data = ", groups);
    
        // 1. Establish top-level primary category roots
        var ids = ["Drinks", "Food", "Gifts"];
        var labels = ["Drinks", "Food", "Gifts"];
        var parents = ["", "", ""];
        
        var drinksTotal = 0;
        var foodTotal = 0;
        var giftsTotal = 0;
    
        // Fast-lookup dictionaries to group matching items and avoid layout duplicates
        const uniqueProducts = {}; // Keeps tracking unique Category -> Product Name
        const uniqueSizes = {};    // Keeps tracking unique Product Name -> Size variation
    
        // 2. Single-pass loop to clean strings, accumulate totals, and build hierarchies
        groups.forEach(item => {
            // Parse numerical values safely (stripping currency signs or strings)
            var itemTotal = parseFloat(String(item.total_price || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
            var category = String(item.category || '').toLowerCase().trim();
            var name = item.name || 'Unknown Item';
            var size = item.size || 'Standard';
    
            // Resolve top-level destination branch
            var branchName = "Drinks";
            if (category.includes("food")) {
                branchName = "Food";
                foodTotal += itemTotal;
            } else if (category.includes("gift")) {
                branchName = "Gifts";
                giftsTotal += itemTotal;
            } else {
                drinksTotal += itemTotal;
            }
    
            // --- LAYER 1: Link Product Names to Main Categories ---
            var productKey = `${branchName}-${name}`;
            if (!uniqueProducts[productKey]) {
                uniqueProducts[productKey] = {
                    id: productKey,
                    label: name,
                    parent: branchName,
                    total: 0
                };
            }
            uniqueProducts[productKey].total += itemTotal;
    
            // --- LAYER 2: Link Sizes to Product Names ---
            var sizeKey = `${productKey}-${size}`;
            if (!uniqueSizes[sizeKey]) {
                uniqueSizes[sizeKey] = {
                    id: sizeKey,
                    label: size,
                    parent: productKey,
                    total: 0
                };
            }
            uniqueSizes[sizeKey].total += itemTotal;
        });
    
        // 3. Flatten the processed product definitions into Plotly array rows
        Object.values(uniqueProducts).forEach(prod => {
            ids.push(prod.id);
            labels.push(prod.label);
            parents.push(prod.parent);
        });
    
        // 4. Flatten the size variations into the final outermost ring arrays
        Object.values(uniqueSizes).forEach(sz => {
            ids.push(sz.id);
            labels.push(sz.label);
            parents.push(sz.parent);
        });
    
        // 5. Prepend top-tier values at matching layout array indices (0, 1, 2)
        var values = [drinksTotal, foodTotal, giftsTotal];
    
        // Append child totals sequentially matching structural arrays
        Object.values(uniqueProducts).forEach(prod => values.push(prod.total));
        Object.values(uniqueSizes).forEach(sz => values.push(sz.total));
    
        // Optional debug loop to verify array alignment
        for(var i = 0; i < ids.length; i++) {
            // console.log(`Index [${i}] -> ID: ${ids[i]} | Label: ${labels[i]} | Parent: ${parents[i]} | Value: ${values[i]}`);
        }
    
        // 6. Define chart properties
        var data = [
            {
                type: "sunburst",
                ids: ids,
                labels: labels,
                parents: parents,
                values: values,
                branchvalues: 'total',
                textposition: 'inside',
                textcase: "word caps"
            }
        ];
    
        var layout = {
            margin: {l: 0, r: 0, b: 0, t: 0},
            sunburstcolorway: [
                "#636efa","#EF553B","#00cc96","#ab63fa","#19d3f3",
                "#e763fa", "#FECB52","#FFA15A","#FF6692","#B6E880"
            ],
            extendsunburstcolorway: true
        };

        // Clean any NaN bugs out of the values list right before plotting
        values = values.map(val => isNaN(val) || val === null ? 0 : val);

        Plotly.newPlot('sunburst', data, layout, {showSendToCloud: true});
        // Force Plotly to look at the screen space again after rendering
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    function drawSalesBarChart(data) {
        if(data !== undefined) {
            orderData = data;
        }
        else {
            orderData = DATA;
        }
        console.log("Bar chart incoming data trace = ", orderData);

    // 1. Structural tracking array maps
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hourData = {}; // Format: hourData[hourString][dayName] = totalSum

    // 2. Loop through your items to group by calendar day and hour
    orderData.forEach(currentItem => {
        // Safe numerical parse matching your data key 'price_line_total'
        const linePrice = parseFloat(String(currentItem.price_line_total || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
        
        // Target your exact flat object date property key
        const rawIsoDate = currentItem.transaction__order_date;
        if (!rawIsoDate) return; // Skip row if it lacks a valid timestamp

        // Parse the ISO text string into a dynamic native Date engine object
        const dateObj = new Date(rawIsoDate);
        if (isNaN(dateObj.getTime())) return; // Safeguard against broken date strings

        // Extract day of the week (e.g., "Thursday")
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        // Extract hour number and normalize it to a clean block text string (e.g., "21:00")
        const hourNumber = dateObj.getHours();
        const hourBlock = `${String(hourNumber).padStart(2, '0')}:00`;

        // Initialize nested day matrices inside the targeted hour object if fresh
        if (!hourData[hourBlock]) {
            hourData[hourBlock] = {};
            daysOfWeek.forEach(day => hourData[hourBlock][day] = 0);
        }

        // Add row line total price directly into the slot tracker
        hourData[hourBlock][dayName] += linePrice;
    });

    // 3. Flatten the processed metrics into separate Plotly stacked traces
    const sortedHours = Object.keys(hourData).sort();
    
    const chartTraces = sortedHours.map(hour => {
        // Map totals down to values ordered to match daysOfWeek array sequences
        const yValues = daysOfWeek.map(day => Number(hourData[hour][day].toFixed(2)));

        return {
            x: daysOfWeek,
            y: yValues,
            name: hour, // Labels our individual legend item markers on the sidebar panels
            type: 'bar',
            hovertemplate: `<b>Hour block: ${hour}</b><br>Revenue: €%{y:.2f}<extra></extra>`
        };
    });

    // 4. Define UI and Stack structural configurations
    const layout = {
        barmode: 'stack', // 👈 Crucial parameter: forces items to pile vertically
        title: {
            text: 'Revenue Matrix Breakdown (Days vs Hours Allocation)',
            font: { size: 16 }
        },
        xaxis: {
            title: 'Days of the Week',
            tickmode: 'array',
            tickvals: daysOfWeek
        },
        yaxis: {
            title: 'Total Invoiced (€)',
            tickformat: '€,.2f'
        },
        legend: {
            title: { text: '<b>Sales Hour</b>' },
            traceorder: 'normal'
        },
        margin: { l: 60, r: 40, b: 60, t: 50 },
        // Expanded dynamic colorway layout loop to handle alternating timeline panels
        colorway: [
            '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', 
            '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5',
            '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f'
        ]
    };

    // 5. Render directly to your target placeholder element container
    Plotly.newPlot('stackedBarChart', chartTraces, layout, { responsive: true });
    }
    
    function drawHourlySalesChart(orderData) {
        if(orderData !== undefined) {
            orderData = data;
        }
        else {
            orderData = DATA;
        }
        console.log("Bar chart incoming data trace = ", orderData);
        console.log("Processing hourly metrics loop: ", orderData);
    
        // 1. Initialize an array of 24 slots (one for each hour of the day) set to 0
        const hourlyTotals = Array(24).fill(0);
    
        // 2. Aggregate the line totals into their respective hour bucket
        orderData.forEach(currentItem => {
            const linePrice = parseFloat(String(currentItem.price_line_total || '0'));
            const rawIsoDate = currentItem.transaction__order_date;
            
            if (!rawIsoDate) return;
    
            const dateObj = new Date(rawIsoDate);
            if (isNaN(dateObj.getTime())) return;
    
            // Extract the integer hour (0 through 23)
            const hour = dateObj.getHours();
    
            // Accumulate the value into the matching array index slot
            hourlyTotals[hour] += linePrice;
        });
    
        // 3. Generate formatting labels for the X-axis (e.g., "00:00", "01:00" ... "23:00")
        const xLabels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
        
        // Clean up rounding errors on our array map items
        const yValues = hourlyTotals.map(val => Number(val.toFixed(2)));
    
        // 4. Configure the Plotly data dataset
        const data = [{
            x: xLabels,
            y: yValues,
            type: 'bar',
            marker: {
                color: '#1f77b4', // Clean corporate dark blue bar theme
                line: { width: 1, color: '#15527d' }
            },
            hovertemplate: '<b>Time Block: %{x}</b><br>Total Revenue: €%{y:.2f}<extra></extra>'
        }];
    
        // 5. Define chart layout rules
        const layout = {
            title: {
                text: 'Total Revenue Breakdown by Hour of Day',
                font: { size: 16 }
            },
            xaxis: {
                title: 'Hour of Day (24-Hour Clock)',
                tickmode: 'array',
                tickvals: xLabels,
                tickangle: -45 // Tilts text labels slightly so they don't crowd each other
            },
            yaxis: {
        title: 'Total Sales (€)',
        tickformat: ',.2f',   // 1. Keep this strictly numeric (e.g. 1,250.00)
        tickprefix: '€'       // 2. Safely prepend the Euro currency sign here
    },
            margin: { l: 60, r: 30, b: 70, t: 50 }
        };
    
        // 6. Generate the visualizer canvas frame
        Plotly.newPlot('hourlyBarChart', data, layout, { responsive: true });
    }
    
})
