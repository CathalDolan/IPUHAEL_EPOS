console.log("JS is Working")

let buttons = document.querySelectorAll('.product_button');
let all_products = [];
let product_details = {};
let product_size = "";
let total_prodcts_qty;
let line_totals_total;
let pfand_total;
let amount_tendered;
let total_due;
let change_due;

$('.measure_button').click( function(){

    product_size = $(this).attr("data-price");
    console.log("product_size fn1", product_size);
    // Extracts the sizes for each product when button is clicked
    let size = $(this).attr("data-price");
    console.log("Sizes", size);
    console.log("type of Sizes", typeof(size));

    let product_buttons = $('.product_buttons_div').find(`[data-${size}]`).addClass('highlight');
    console.log("Product Buttons", product_buttons);


});

$('.product_button').click( function(){

    console.log("product_size Fn2", product_size);
    let abbrv_size = product_size.split("_");
    let product_name = $(this).attr('data-name');
    let product_price = $(this).attr('data-' + product_size);
    if (product_price == undefined){
        console.log("undefined");
    }
    // console.log("Product Name", product_name);
    let product = all_products.filter(item => item.name == `${product_name} ${abbrv_size[1]}`);
    let product_index = all_products.findIndex(item => item.name == `${product_name} ${abbrv_size[1]}`);
    console.log("Product Name 2", product);

    if(product.length > 0){
        console.log("Yes");

        all_products[product_index].qty +=1;
        all_products[product_index].line_total = Number(all_products[product_index].price * all_products[product_index].qty).toFixed(2);
        
        console.log("All Products If Yes", all_products);

    } else {
        console.log("No");

        product = {
            "name": product_name + " " + abbrv_size[1],
            "qty": 1,
            "price": product_price,
            "line_total": product_price
        }

        all_products.push(product);
        console.log("All Products if No", all_products);

    }

    update_basket();
    
});

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

// FN to update the cart each time something is added or removed
function update_basket(){ 

    $('.products_rows_div').empty();

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

    basketGrandTotals();
}

// Fn to calculate grand totals in basket
function basketGrandTotals(){
    console.log("Grand Total Fn fires");
    console.log("All Products", all_products);

    total_prodcts_qty = 0;
    line_totals_total = 0;
    $(all_products).each(function(){

        // Calculates total number of products in the basket
        let xyz = this.qty;
        total_prodcts_qty += parseInt(xyz);
        $('#total_number_of_products').text(total_prodcts_qty);

        // Calculates total value of all products in basket
        let zyx = parseFloat(this.line_total);
        line_totals_total += zyx;
        $('#products_total').text("€" + line_totals_total.toFixed(2));

        // Calculates total value of pfand to be paid
        pfand_total = total_prodcts_qty * 2;
        $('#pfand_total').text("€" + pfand_total.toFixed(2));

        // Calculates total amount due
        total_due = pfand_total + line_totals_total;
        $('#total_due').text("€" + total_due.toFixed(2));

        // Amount Tendered
        amount_tendered = total_due;
        $('#amount_tendered').val(total_due.toFixed(2));

        // Change Due
        amount_tendered = document.getElementById('amount_tendered').value;
        change_due = amount_tendered - total_due.toFixed(2);
        $('#change_due').text("€" + change_due.toFixed(2));

    });
}

// Fn to recalculate change due when a user manually enters a tendered amount
$(document).on('keyup', '#amount_tendered', function(){

    amount_tendered = document.getElementById('amount_tendered').value;
    console.log("amount_tendered", amount_tendered);
    change_due = (amount_tendered - total_due);
    console.log("change_due ", change_due);
    $('#change_due').text("€" + change_due.toFixed(2));

})

