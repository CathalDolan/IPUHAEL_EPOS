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
        console.log("this = ", this.parentNode.classList)
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
        console.log("find = ",  $(this).parents('.items').find("[name='all']"))
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
        var selected_products = $('#product').find("input:checked").map(function () {
            return this.name;
        });
        var selected_sizes = $('#size').find("input:checked").map(function () {
            return this.name;
        });

        console.log("selected_sizes = ", Object.values(selected_sizes))

        let data_filtered = DATA.filter(item => 
            (Date.parse(item.order_date_li) >= `${Date.parse(from_date)}`) 
            && (Date.parse(item.order_date_li) <= `${Date.parse(to_date)}`) 
            && Object.values(selected_staff).includes(item.staff_member__name)
            && Object.values(selected_categories).includes(item.category)
            && Object.values(selected_products).includes(item.name)
            && Object.values(selected_sizes).includes(item.size)
        );
        console.log("data_filtered = ", data_filtered)

        var groups = [];
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
        groups.sort((a,b) => a.name.localeCompare(b.name));
        console.log("groups = ", groups);
        $('.table_body').empty();
        groups.forEach(item => {
            $('.table_body').append(
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