console.log("JS is Working")

let buttons = document.querySelectorAll('.product_button');
let products = "";
let product_names = [];
let product_details = {};

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
        product_details.price_440 = $(this).attr('data-price_440');
        let price_440 = product_details.price_440
        product_details.price_single = $(this).attr('data-price_single');
        let price_single = product_details.price_single
        product_details.price_double = $(this).attr('data-price_double');
        let price_double = product_details.price_double
        product_details.price_bottle = $(this).attr('data-price_bottle');
        let price_bottle = product_details.price_bottle
        product_details.price_dash = $(this).attr('data-price_dash');
        let price_dash = product_details.price_dash
        product_details.price_regular = $(this).attr('data-price_regular');
        let price_regular = product_details.price_regular
        product_details.price_small = $(this).attr('data-price_small');
        let price_small = product_details.price_small

        // Creates a variable that increments with each click
        counter++;
        product_details.qty = counter;
        let product_qty = product_details.qty;

        // Fn to see if a name is already in the Product Names array
        if(product_names.includes(product_name)){
            console.log(product_name + " is there");

            // Updates the product quantity each time the product button is clicked
            let new_qty = document.getElementById(product_name + "_qty");
            new_qty.innerHTML = product_qty;

            // Call the Fn to calculate line total
            lineTotalCalculation(price_03, product_qty);

            // Call the Fn to calculate grand totals
            basketGrandTotals();

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
            qty_row.setAttribute('value', counter);
            qty_row.innerHTML = counter;
            let qty_row_div = document.getElementById("qty_row_div");
            qty_row_div.appendChild(qty_row);

            // Injects the product unit price into the basket
            let per_unit_row = document.createElement('p');
            per_unit_row.classList.add('per_unit_row');
            per_unit_row.setAttribute('id', product_name + "_unit");
            per_unit_row.innerHTML = "€" + price_03;
            let per_unit_row_div = document.getElementById("per_unit_row_div");
            per_unit_row_div.appendChild(per_unit_row);

            // Call the Fn to calculate line total
            lineTotalCalculation(price_03, counter);

            // Injects the Add symbol onto a product line
            let add_row = document.createElement('button');
            add_row.classList.add('add_button', 'basket_edit_button');
            add_row.setAttribute('id', product_name + "_add");
            // add_row.setAttribute('onclick', 'totalClick(1)');
            add_row.innerHTML = '<i class="fa-solid fa-plus"></i>';
            let add_row_div = document.getElementById("add_row_div");
            add_row_div.appendChild(add_row);

            // Injects the minus symbol onto a product line
            let subtract_row = document.createElement('button');
            subtract_row.classList.add('subtract_button', 'basket_edit_button');
            subtract_row.setAttribute('id', product_name + "_subtract");
            subtract_row.innerHTML = '<i class="fa-solid fa-minus"></i>';
            let subtract_row_div = document.getElementById("subtract_row_div");
            subtract_row_div.appendChild(subtract_row);

            // Injects the delete symbol onto a product line
            let delete_row = document.createElement('button');
            delete_row.classList.add('delete_button', 'basket_edit_button');
            delete_row.setAttribute('id', product_name + "_delete");
            delete_row.innerHTML = '<i class="fa-solid fa-trash"></i>';
            let delete_row_div = document.getElementById("delete_row_div");
            delete_row_div.appendChild(delete_row);

            // Call the Fn to calculate grand totals
            basketGrandTotals();
        }

        // Fn to calculate the line total for a product and inject that amount into the column
        function lineTotalCalculation(price, qty) {
            let initital_line_total = (price * qty);
            let line_total = initital_line_total.toFixed(2);
            console.log("Total Line Price", line_total);

            // Fn to see if a name is already in the Product Names array
            if(product_names.includes(product_name)){

                // Updates the line total each time the product button is clicked
                let new_total = document.getElementById(product_name + "_line_total");
                new_total.innerHTML = line_total;

            } else {

                // Injects initial line total for new product into basket
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

// Fn to increment or decrement the line product quantities
// function totalClick(click){
//     const add_button = document.querySelectorAll('.add_button');
//     console.log("add button", add_button);
// }

// const divs = document.querySelectorAll('.add_button');
// divs.forEach(el => el.addEventListener('click', event => {
//   console.log(event.target.getAttribute("class"));
// }));

// const add_button = document.querySelectorAll('.add_button');
// add_button.forEach(box => {
//   box.addEventListener('click', function handleClick(event) {
//     console.log('box clicked', event);
//     box.setAttribute('style', 'background-color: yellow;');
//   });
// });

let filterMe = document.querySelectorAll(".add_button");
if (filterMe) {
   for(const x of filterMe) {
      x.addEventListener('click', function() {
        console.log('something', this);
      });
   }
}


// Fn to calculate grand totals in basket
function basketGrandTotals(){
    console.log("Grand Total Fn fires");

    // Calculates total number of products in basket
    let qtys = document.getElementsByClassName("qty_row");
    let products_qty = 0;
    for (let i = 0; i < qtys.length; i++) {
        products_qty += parseInt(qtys[i].innerHTML);
        console.log("Total", products_qty);

        // Injects the total number of products on order
        let total_number_of_products = document.getElementById('total_number_of_products');
        total_number_of_products.innerHTML = products_qty;
    }

    // Calculates total value of all products in basket
    let line_totals = document.getElementsByClassName("line_total_row");
    let products_grand_total = 0;
    for (let i = 0; i < qtys.length; i++) {
        products_grand_total += parseFloat(line_totals[i].innerHTML, 2);
        var rounded = products_grand_total.toFixed(2);
        console.log("Total Value", rounded);

        // Injects the total value of all products on order
        let products_total = document.getElementById('products_total');
        products_total.innerHTML = "€" + rounded;
    }

    // Calculates total value of pfand to be paid. Uses qtys
    let pfand_calc = products_qty * 2;
    console.log("Total Products Pfand", pfand_calc);

    // Injects the total number of products on order
    let pfand_total = document.getElementById('pfand_total');
    pfand_total.innerHTML = "€" + pfand_calc.toFixed(2);
    
}

// https://www.youtube.com/watch?v=PoTGs38DR9E&t=56s
