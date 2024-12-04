$('document').ready(function () {
    console.log("reports.js");
    //Get the host name from url and set the fetch url accordingly
    const host = window.location.host;
    var url = '';
    if (host.includes("heroku")) {
        console.log("HEROKU")
        url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/"
    } else {
        console.log("GITPOD")
        url = "https://8000-cathaldolan-ipuhaelepos-ttnjevm7y7g.ws-eu117.gitpod.io/";
    }

    const DATA = JSON.parse(document.getElementById('data').textContent);
    console.log("DATA = ", DATA)

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
        generateCharts()
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



    function generateCharts() {
        console.log("generateCharts")
        // console.log("DATA = ", DATA)
        var from_date = new Date($('#from_date').val());
        var to_date = new Date($('#to_date').val());
        to_date.setDate(to_date.getDate() + 1)

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

        // console.log("selected_drinks = ", selected_drinks)
        // console.log("selected_food = ", selected_food)
        // console.log("selected_gifts = ", selected_gifts)
        // DATA.forEach(item => {
        //     console.log(item.name)
        //     if(Object.values(selected_gifts).includes(item.name)) {
        //         console.log("------------------------")
        //     }
        // })
        let data_filtered = DATA.filter(item => 
            ((Date.parse(item.order_date_li) >= `${Date.parse(from_date)}`) 
            && (Date.parse(item.order_date_li) <= `${Date.parse(to_date)}`) 
            && Object.values(selected_staff).includes(item.staff_member__name)
            && Object.values(selected_categories).includes(item.category)
            && Object.values(selected_sizes).includes(item.size)
            && Object.values(selected_transaction_type).includes(item.payment_method))
            && (Object.values(selected_drinks).includes(item.name)
            || Object.values(selected_food).includes(item.name)
            || Object.values(selected_gifts).includes(item.name))
        );
        console.log("data_filtered = ", data_filtered)

        var groups = [];
        var transactions = [];
        var cashTransactions = {"number": 0, "total": 0};
        var cardTransactions = {"number": 0, "total": 0};
        var wasteTransactions = {"number": 0, "total": 0};
        var compTransactions = {"number": 0, "total": 0};
        var xyValues = [];
        data_filtered.forEach(item => {
            var groupItem = groups.find(x => x.name == item.name && x.size == item.size);
            var groupItemIndex = groups.findIndex(x => x.name == item.name && x.size == item.size);
            // console.log("groupItem = ", groupItem)
            // console.log("groupItemIndex = ", groups[groupItemIndex])
            if(groupItem == undefined) {
                groups.push({
                    // "staff": item.staff_member__name,
                    "name": item.name,
                    "size": item.size,
                    "quantity": Number(item.quantity),
                    "total": Number(item.price_line_total)
                    })
            }
            else {
                groups[groupItemIndex].quantity += Number(item.quantity);
                groups[groupItemIndex].total += Number(item.price_line_total);
            }
            
            var transaction = transactions.find(x => x.id == item.grand_totals);
            var transactionIndex = transactions.findIndex(x => x.id == item.grand_totals);
            var cashIncrement = 0;
            var cashTotalIncrement = 0;
            var cardIncrement = 0;
            var cardTotalIncrement = 0;
            var wasteIncrement = 0;
            var wasteTotalIncrement = 0;
            var compIncrement = 0;
            var compTotalIncrement = 0;
            switch (item.payment_method) {
                case "Cash":
                    cashIncrement = 1;
                    cashTotalIncrement = Number(item.price_line_total);
                  break;
                case "credit_card":
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
            
            // console.log("item.order_date_li = ", item.order_date_li);
            // var dateTime = new Date(item.order_date_li);
            // console.log("dateTime = ",dateTime);
            // var date = new Date(item.order_date_li).toISOString().split('T')[0];
            // var time = item.order_date_li.split('T')[1].slice(0,-5);
            // xyValues.push({
            //     x: date,
            //     y: time
            // })
        })
        // console.log("cashTransactions = ", cashTransactions)
        // console.log("cardTransactions = ", cardTransactions)
        // console.log("wasteTransactions = ", wasteTransactions)
        // console.log("compTransactions = ", compTransactions)
        $('#summary-table').empty()
        $('#summary-table').append(
            `<tr>
                <td>${transactions.length}</td>
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
                    <td>${item.size}</td>
                    <td>${item.quantity}</td>
                    <td>€${item.total}</td>
                </tr>`
            )
        })

    }
})

// console.log("xyValues = ", xyValues)
// const xyValues = [{
//         x: 50,
//         y: 7
//     },
//     {
//         x: 60,
//         y: 8
//     },
//     {
//         x: 70,
//         y: 8
//     },
//     {
//         x: 80,
//         y: 9
//     },
//     {
//         x: 90,
//         y: 9
//     },
//     {
//         x: 100,
//         y: 9
//     },
//     {
//         x: 110,
//         y: 10
//     },
//     {
//         x: 120,
//         y: 11
//     },
//     {
//         x: 130,
//         y: 14
//     },
//     {
//         x: 140,
//         y: 14
//     },
//     {
//         x: 150,
//         y: 15
//     }
// ];

// new Chart("scatter-plot", {
//     type: "scatter",
//     data: {
//         datasets: [{
//             pointRadius: 4,
//             pointBackgroundColor: "rgba(0,0,255,1)",
//             data: xyValues
//         }]
//     },
//     options: {
//         scales: {
//             xAxes: [{
//                 type: 'time',
//                 time: {
//                     unit: 'day'
//                 }
//             }]
//         }
//     }
// })