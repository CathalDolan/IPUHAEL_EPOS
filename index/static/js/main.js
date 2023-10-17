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
        let product_name = product_details.product_name;
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

        // Fn to see if a name is already in the Product Names dictionary
        if(product_names.includes(product_name)){
            console.log(product_name + " is there");

            // Updates the product quantity each time the product button is clicked
            let new_qty = document.getElementById(product_name + "_qty");
            new_qty.innerHTML = product_qty;

            // Updates the product line total each time the product button is clicked
            let new_line_total = (product_qty * price_03);
            product_details.product_line_total = new_line_total;
            let line_total = document.getElementById(product_name + "_line_total");
            line_total.innerHTML = "€" + new_line_total.toFixed(2);

            // Call the Fn to calculate grand totals
            basketGrandTotals();

            console.log("Product Details ", product_details);

        } else {
            console.log (product_name + " is not there");

            $('.products_rows_div').append(
                `<div class="row product_row" id="product_headings_row">
                    <div class="col-4" id="product_row_div">
                        <p class="product_row">${product_name}</p>
                    </div>
                    <div class="col-1" id="qty_row_div">
                        <p class="product_row" id="${product_name}_qty">${product_qty}</p>
                    </div>
                    <div class="col" id="per_unit_row_div">
                        <p class="product_row">€${price_03}</p>
                    </div>
                    <div class="col" id="line_total_row_div">
                        <p class="product_row" id="${product_name}_line_total">€${price_03}</p>
                    </div>
                    <div class="col-1" id="add_row_div">
                        <button class="add_button basket_edit_button">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <div class="col-1" id="subtract_row_div">
                        <button class="subtract_button basket_edit_button">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                    </div>
                    <div class="col-1" id="delete_row_div">
                        <button class="delete_button basket_edit_button">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>`
            )

            basketGrandTotals();
        }

        product_names.push(product_name);
        console.log("Product Names ", product_names);
       
    });
});

// Fn to choose product size and corresponding name and price
function updateSize(size, price_code){
    console.log("size, price", size, price_code);
}

//FN to increment
$('.add_button').on('click', function(){
    console.log("Stuff");
})

$('.test_div').click(function(){
    console.log("Test Div", this);

})

// function totalClick(){
//     let add_button = document.querySelectorAll('.add_button');
//     console.log($(this));
// }

// const divs = document.querySelectorAll('.add_button');
// divs.forEach(el => el.addEventListener('click', event => {
//   console.log(event.target.getAttribute("class"));
//   console.log("Print me");
// }));

// const add_button = document.querySelectorAll('.add_button');
// add_button.forEach(box => {
//   box.addEventListener('click', function handleClick(event) {
//     console.log('box clicked', event);
//     box.setAttribute('style', 'background-color: yellow;');
//   });
// });

// let filterMe = document.querySelectorAll(".add_button");
// if (filterMe) {
//    for(const x of filterMe) {
//       x.addEventListener('click', function() {
//         console.log('something', this);
//       });
//    }
// }

// Fn to calculate grand totals in basket
function basketGrandTotals(){
    console.log("Grand Total Fn fires");

    // Calculates total number of products in basket
    let qtys = document.getElementsByClassName("qty_row");
    let products_qty = 0;
    for (let i = 0; i < qtys.length; i++) {
        products_qty += parseInt(qtys[i].innerHTML);

        // Injects the total number of products on order
        let total_number_of_products = document.getElementById('total_number_of_products');
        total_number_of_products.innerHTML = products_qty;
    }

    // Calculates total value of all products in basket
    let line_totals = document.getElementsByClassName("line_total_row");
    let products_grand_total = 0;
    for (let i = 0; i < qtys.length; i++) {
        products_grand_total += parseFloat(line_totals[i].innerHTML, 2);
        var products_grand_total_rounded = products_grand_total.toFixed(2);

        // Injects the total value of all products on order
        let products_total = document.getElementById('products_total');
        products_total.innerHTML = "€" + products_grand_total_rounded;
    }

    // Calculates total value of pfand to be paid. Uses qtys
    let pfand_calc = products_qty * 2;
    // Injects the pfand total
    let pfand_total = document.getElementById('pfand_total');
    pfand_total.innerHTML = "€" + pfand_calc.toFixed(2);

    // Calculates total amount due
    let total_due_calc = pfand_calc + Number(products_grand_total_rounded);
    // Injects the pfand total
    let total_amount_due = document.getElementById('total_due');
    total_amount_due.setAttribute('value', total_due_calc.toFixed(2));
    total_amount_due.innerHTML = "€" + total_due_calc.toFixed(2);

    // Calculates the default tendered amount
    document.getElementById("amount_tendered").value = total_due_calc.toFixed(2);
    
    // Calculates amount of change due to the customer
    let amount_tendered = document.getElementById('amount_tendered').value;
    let total_change_calc = amount_tendered - total_due_calc.toFixed(2);
    // Injects the pfand total
    let total_change_due = document.getElementById('change_due');
    total_change_due.innerHTML = "€" + total_change_calc.toFixed(2);
}

// Fn to recalculate change due when a user manually enters a tendered amount
document.getElementById("amount_tendered").addEventListener("keyup", myFunction);
function myFunction() {
    let amount_tendered = document.getElementById("amount_tendered").value;
    let total_due = document.getElementById("total_due").value;
    let total_due_number = Number(total_due);
    console.log("total_due_number Type", typeof(total_due_number));
    console.log("total_due_number ", total_due_number);
    let total_change_calc = (amount_tendered - total_due_number);
    console.log("total_change_calc ", total_change_calc);
    
    // // Injects the pfand total
    // let total_change_due = document.getElementById('change_due');
    // total_change_due.innerHTML = "€" + total_change_calc.toFixed(2);
}
