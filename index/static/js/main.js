console.log("JS is Working")

let buttons = document.querySelectorAll('.product_button');
let all_products = [];
let product_details = {};
    
$('.product_button').click( function(){

    let product_name = $(this).attr('data-name');
    let product_price = $(this).attr('data-price_04');
    // console.log("Product Name", product_name);
    let product = all_products.filter(item => item.name == product_name);
    let product_index = all_products.findIndex(item => item.name == product_name);
    // console.log("Product Name 2", product);

    if(product.length > 0){ //.length > 0
        console.log("Yes");

        all_products[product_index].qty +=1;
        all_products[product_index].line_total = Number(all_products[product_index].price * all_products[product_index].qty).toFixed(2);
        
        console.log("All Products If Yes", all_products);

    } else {
        console.log("No");

        product = {
            "name": product_name,
            "qty": 1,
            "price": product_price,
            "line_total": product_price
        }

        all_products.push(product);
        console.log("All Products if No", all_products);

    }

    update_basket();
    
});

// Fn to choose product size and corresponding name and price
function updateSize(size, price_code){
    console.log("size, price", size, price_code);
}

//FN to Increment a product line in the basket
$(document).on('click', '.add_button', function(){

    let product_name = $(this).parent().siblings(':first').children().text();
    let product = all_products.filter(item => item.name == product_name);
    let product_index = all_products.findIndex(item => item.name == product_name);

    if(product.length > 0){

        all_products[product_index].qty +=1;
        all_products[product_index].line_total = Number(all_products[product_index].price * all_products[product_index].qty).toFixed(2);
    
    }
    update_basket();
})

//FN to Decrement a product line in the basket
$(document).on('click', '.subtract_button', function(){

    let product_name = $(this).parent().siblings(':first').children().text();
    let product = all_products.filter(item => item.name == product_name);
    let product_index = all_products.findIndex(item => item.name == product_name);
    
    // Initial If Statement used to prevent decrementor going below 0
    if(all_products[product_index].qty < 2){

        console.log("Nothing ever happens");
    
    } else {

        if(product.length > 0){
            all_products[product_index].qty -=1;
            all_products[product_index].line_total = Number(all_products[product_index].price * all_products[product_index].qty).toFixed(2);
        
        }
    }
    update_basket();
})

// FN to Delete a product line from the basket
$(document).on('click', '.delete_button', function(){
    console.log("Delete Function Fires");

    let product_name = $(this).parent().siblings(':first').children().text();
    let product_index = all_products.findIndex(item => item.name == product_name);
    console.log("product_index", product_index);
    all_products.splice(product_index, 1);

    update_basket();
})


function update_basket(){ 

    $('.products_rows_div').empty();
    console.log("LOOP START");

    $.each(all_products, function(){
        console.log("All Products", typeof(this.name));

        $('.products_rows_div').append(
            `<div class="row product_row" id="product_headings_row">
                <div class="col-4" id="product_row_div">
                    <p class="product_row">${this.name}</p>
                </div>
                <div class="col-1" id="qty_row_div">
                    <p class="product_row">${this.qty}</p>
                </div>
                <div class="col" id="per_unit_row_div">
                    <p class="product_row">€${this.price}</p>
                </div>
                <div class="col" id="line_total_row_div">
                    <p class="product_row">€${this.line_total}</p>
                </div>
                <div class="col-1" id="add_row_div">
                    <div class="add_button basket_edit_button">
                        <i class="fa-solid fa-plus"></i>
                    </div>
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
        ); // onclick="totalClick(${this.name})
    });
}

// Fn to calculate grand totals in basket
function basketGrandTotals(){
    console.log("Grand Total Fn fires");

    for (let k in product_details) {
        console.log(k + ' is ' + product_details[k])
        console.log("Totals", k);
    }
    // console.log("Total lines", total_product_value);

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
