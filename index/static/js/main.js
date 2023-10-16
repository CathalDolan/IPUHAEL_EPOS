console.log("JS is Working")

let buttons = document.querySelectorAll('.product_button');
let products = "";
let product_names = [];
let product_details = {};

// Fn to put product name once only into the basket
// and to add the unit price to the basket
// for (let i=0; i < buttons.length; i++) {
//     buttons[i].addEventListener('click', (element) => {
        
//         products = buttons[i].innerHTML;
//         // var price = products
//         console.log((element));

//         // Allows a product name to be displayed only once.
//         if(product_names.includes(products)){
//             console.log("Product and price is already in basket");
//         }else{
//             const product_row = document.createElement('p');
//                 product_row.classList.add('product_row');
//                 product_row.innerHTML = products;

//                 let product_row_div = document.getElementById("product_row_div");
//                 product_row_div.appendChild(product_row);

//             // Puts the product unit price into basket
//             const per_unit_row = document.createElement('p');
//             per_unit_row.classList.add('per_unit_row');
//             per_unit_row.setAttribute('id', products + 'per_unit_row');
//             per_unit_row.innerHTML = "Hello"; // Needs to be unit price
//             let per_unit_row_div = document.getElementById("per_unit_row_div");
//             per_unit_row_div.appendChild(per_unit_row);
//         }
//         product_names.push(products);
//     })
// }

// var counter = 0;
// $('.product_button').click( function(){

//     product_names.product_name = $(this).attr('name');
//     product_name = product_names.product_name
//     product_names.id = $(this).attr('id');
//     id1 = product_names.id;
//     product_names.price_03 = $(this).attr('data-price_03');
//     product_names.price_04 = $(this).attr('data-price_04');
//     product_names.price_pint = $(this).attr('data-price_pint');
//     product_names.price_330 = $(this).attr('data-price_330');
//     product_names.qty = 0;

//     counter++;
//     console.log("counter", counter);
//     product_names.qty = counter;

//     window.localStorage.setItem(product_name, JSON.stringify(product_names));
//     var meta1 = JSON.parse(window.localStorage.getItem(product_name));
//     console.log("meta1 Product Name", meta1.product_name);
//     console.log("meta1 Product Qty", meta1.qty);

//     console.log("Product Details", product_names);
//     }
// )

// Counts the number of times each button is clicked.
$('.product_button').each( function(){

    var counter = 0;
    $( this ).click( function(){

        // Extracting data from the product
        product_details.product_name = $(this).attr('name');
        let product_name = product_details.product_name
        product_details.id = $(this).attr('id');
        let id = product_details.id;
        product_details.price_03 = $(this).attr('data-price_03');
        let price_03 = product_details.price_03
        product_details.price_04 = $(this).attr('data-price_04');
        let price_04 = product_details.price_04
        product_details.price_pint = $(this).attr('data-price_pint');
        let price_pint = product_details.price_pint
        product_details.price_330 = $(this).attr('data-price_330');
        let price_330 = product_details.price_330

        // Creates a variable that increments with each click
        counter++;
        product_details.qty = counter;
        let product_qty = product_details.qty;

        // Fn to see if a name is already in the Product Names array
        if(product_names.includes(product_name)){
            console.log(product_name + " is there");

            // Updates the product quantity each time the order button is clicked
            let new_qty = document.getElementById(product_name + "_qty");
            new_qty.innerHTML = product_qty;

            // Call the Fn to calculate line total
            lineTotalCalculation(price_03, product_qty);

        } else {
            console.log (product_name + " is not there");

            // Injects the name of the product into the basket
            let product_row = document.createElement('p');
            product_row.classList.add('product_row');
            product_row.innerHTML = product_name;
            let product_row_div = document.getElementById("product_row_div");
            product_row_div.appendChild(product_row);

            // Injects the initial qty of 1 into the quantity row for a specific product
            let qty_row = document.createElement('p');
            qty_row.classList.add('qty_row');
            qty_row.setAttribute('id', product_name + "_qty");
            qty_row.innerHTML = counter;
            let qty_row_div = document.getElementById("qty_row_div");
            qty_row_div.appendChild(qty_row);

            // Injects the product unit price into the basket
            let per_unit_row = document.createElement('p');
            per_unit_row.classList.add('per_unit_row');
            per_unit_row.setAttribute('id', product_name + "_unit");
            per_unit_row.innerHTML = price_03;
            let per_unit_row_div = document.getElementById("per_unit_row_div");
            per_unit_row_div.appendChild(per_unit_row);

            // Call the Fn to calculate line total
            lineTotalCalculation(price_03, counter);
        }

        // Fn to calculate the line total for a product and inject that amount into the column
        function lineTotalCalculation(price, qty) {
            let initital_line_total = (price * qty);
            let line_total = initital_line_total.toFixed(2);
            console.log("Total Line Price", line_total);

            let num = 5.56789;
            let n = num.toFixed(2);

            // Fn to see if a name is already in the Product Names array
            if(product_names.includes(product_name)){

                // Updates the product quantity each time the order button is clicked
                let new_total = document.getElementById(product_name + "_line_total");
                new_total.innerHTML = line_total;

            } else {
                let line_total_row = document.createElement('p');
                line_total_row.classList.add('line_total_row');
                line_total_row.setAttribute('id', product_name + "_line_total");
                line_total_row.innerHTML = line_total;
                let line_total_row_div = document.getElementById("line_total_row_div");
                line_total_row_div.appendChild(line_total_row);
            }
        }

        product_names.push(product_name);
        console.log("Product Names ", product_names);
       
    });
});


// https://www.youtube.com/watch?v=PoTGs38DR9E&t=56s
