console.log("JS is Working")

//Fn to set time and date.
window.onload = function() {
    setInterval(function(){
        let date = new Date();
        let day = date.getDay();
        let displayDate = date.toLocaleDateString();
        let displayTime = date.toLocaleTimeString();

        if(day == 1){
            day = "Monday";
        } else if (day == 2){
            day = "Tuesday";
        } else if (day == 3){
            day = "Wednesday";
        } else if (day == 4){
            day = "Thursday";
        } else if (day == 5){
            day = "Friday";
        } else if (day == 6){
            day = "Saturday";
        } else if (day == 7){
            day = "Sunday";
        }

        document.getElementById('time_and_date').innerHTML = day + " " + displayDate + " " + displayTime;
    }, 1000); // 1000 milliseconds = 1 second

    // Calls message toasts
    $('.toast').toast('show');
}


let buttons = document.querySelectorAll('.product_button');
let all_products = [];
let product_details = {};
let product_size = "";

// All are used in the Grand Totals section
let grand_total = {};
let pfand_buttons_total = 0;
let total_products_qty;
let line_totals_total;
let pfand_total;
let amount_tendered;
let total_due;
let change_due;
let payment_method;
var specials_applied = [];
var discount_product = {}

// Select product size - Needed in Phase 2
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

// Product Button
$('.product_button').click( function(){
    let abbrv_size = product_size.split("_"); // Required when allocating variable sizs to products - Phase 2
    let product_name = $(this).attr('data-name');
    let product_price = $(this).attr('data-price_default');
    let product_category = $(this).attr('data-category');
    let product = all_products.filter(item => item.name == `${product_name}`); //${product_name} ${abbrv_size[1]}. Required when allocating variable sizs to products - Phase 2
    let product_index = all_products.findIndex(item => item.name == `${product_name}`); // ${product_name} ${abbrv_size[1]}. Required when allocating variable sizs to products - Phase 2

    if(product.length > 0){
        all_products[product_index].qty +=1;
        all_products[product_index].line_total = Number(all_products[product_index].price * all_products[product_index].qty).toFixed(2);
    } else {
        product = {
            "category": product_category,
            "name": product_name,
            "qty": 1,
            "price": product_price,
            "line_total": product_price
        }
        all_products.push(product);
    }
    update_basket();
});

// Increment a product line in the basket
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

// Decrement a product line in the basket
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

// Delete a product line from the basket
$(document).on('click', '.delete_button', function(){
    console.log("Delete Function Fires", this);
    if($(this).attr('data-special') == 'two_for_one') {
        console.log("YES DATA SPECIAL");
        let index = all_products.findIndex(obj => {
            console.log("obj.name = ", obj.name)
            return obj.name == discount_product['name'];
        });
        console.log(index); 
        all_products[index].qty += 1; 
        all_products[index].line_total = (all_products[index].qty * all_products[index].price).toFixed(2)
        specials_applied = [];
        discount_product = {};
    }

    else {
        let product_name = $(this).parent().siblings(':first').children().text();
        let product_index = all_products.findIndex(item => item.name == product_name);
        console.log("product_index", product_index);
        if(all_products[product_index].name == discount_product.name) {
            discount_product = {}
            specials_applied = []
        }
        all_products.splice(product_index, 1);
    }
    update_basket();
})

// Specials option selected from Specials Modal
$(document).on('click', '.specials_option', function() {
    var special = $(this).attr('data-special');
    // TWO FOR ONE SPECIAL
    if(special == 'two_for_one') {
        console.log('two_for_one');
        if(total_products_qty > 1) {
            discount_product = {'price': 0};
            for(i=0; i<all_products.length; i++) {
                console.log("all_products[i] = ", all_products[i])
                if(all_products[i]['qty'] > 1) {
                    if((Number(all_products[i]['price']) > Number(discount_product['price']))) {
                        // discount_product = all_products[i]
                        discount_product = {
                            'category': all_products[i]['category'],
                            'name': all_products[i]['name'],
                            'qty': 1,
                            'price': 0,
                            'line_total': 0
                        }
                    }
                }
            }
            console.log('discount_product = ', discount_product);
            let index = all_products.findIndex(obj => {
                console.log("obj.name = ", obj.name)
                return obj.name == discount_product['name'];
            });
            console.log(index); 
            all_products[index].qty += -1; 
            all_products[index].line_total = (all_products[index].price * all_products[index].qty).toFixed(2)
            if(!specials_applied.includes('two_for_one')) {
                specials_applied.push(special);
            }
            else {
                console.log("already applied")
            }
            console.log("specials_applied = ", specials_applied)
        }
        else {
            //Add message saying not enough items to apply discount
        }
    }
    // FIFTY % OFF SPECIAL
    if(special == 'fifty_off') {
        if(specials_applied.length < 1) {
            if(line_totals_total > 50) {
                console.log("> 50")
                $.each(all_products, function(index, item) {
                    item.price = item.price/2;
                    item.line_total = item.line_total/2
                })
                discount_product = {
                    'name': special
                }
                specials_applied.push(special)
            }
        }
        else {
            console.log("Voucher in use already = ", specials_applied[0])
            //Add message saying a voucher is already in use
        }
        console.log('fifty_off')
    }

    // TEN FOR ELEVEN SPECIAL
    if(special == 'ten_for_eleven') {
        console.log('ten_for_eleven')
    }

    // SIX SHOT SPECIAL
    if(special == 'six_shot_special') {
        console.log('six_shot_special')
    }
    update_basket()
})

// Update the basket each time something is added or removed
function update_basket(){ 
    if(total_products_qty > 10){
        let cheapest_price = 100;
        let index_of_cheapest_price;
        $.each(all_products, function(index, item){
            if((item["price"]) < cheapest_price){
                cheapest_price = item["price"];
            }
        });
        line_totals_total -= cheapest_price

        // Message remind to tell customker they got special
    }

    $('.products_rows_div').empty();

    $.each(all_products, function(){
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
    if(Object.keys(discount_product).length != 0) {
        $('.products_rows_div').append(
            `<div class="row product_row" id="product_headings_row">
                <div class="col-4" id="product_row_div">
                    <p class="product_row">${discount_product['name']}</p>
                </div>
                <div class="col-1" id="qty_row_div">
                    <p class="product_row">${discount_product['qty']}</p>
                </div>
                <div class="col" id="per_unit_row_div">
                    <p class="product_row">€0</p>
                </div>
                <div class="col" id="line_total_row_div">
                    <p class="product_row">${specials_applied[0]}</p>
                </div>
                <div class="col-1" id="add_row_div">
                    
                </div>
                <div class="col-1" id="subtract_row_div">
                    
                </div>
                <div class="col-1" id="delete_row_div">
                    <button class="delete_button basket_edit_button" data-special="${specials_applied[0]}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>`
        ); 
    }
    

    basketGrandTotals();
}

// Calculate grand totals in basket
function basketGrandTotals(){

    total_products_qty = 0;
    line_totals_total = 0;
    $(all_products).each(function(){

        // Calculates total number of products in the basket
        let xyz = this.qty;
        total_products_qty += parseInt(xyz);
        $('#total_number_of_products').text(total_products_qty);

        // Calculates total value of all products in basket
        let zyx = parseFloat(this.line_total);
        line_totals_total += zyx;
        $('#products_total').text("€" + line_totals_total.toFixed(2));

        // Calculates total value of pfand to be paid
        pfand_total = total_products_qty * 2;
        let new_pfand_total;
        if(pfand_buttons_total == 0){
            // Calculates pfand due due
            $('#pfand_total').text("€" + pfand_total.toFixed(2));

            // Calculates total amount due
            total_due = pfand_total + line_totals_total;
            $('#total_due').text("€" + total_due.toFixed(2));
        } else {
            // Calculates pfand due due
            new_pfand_total = pfand_total - pfand_buttons_total;
            $('#pfand_total').text("€" + new_pfand_total.toFixed(2));

            // Calculates total amount due
            total_due = new_pfand_total + line_totals_total;
            $('#total_due').text("€" + total_due.toFixed(2));
        }
        
        // Amount Tendered
        amount_tendered = total_due;
        // $('#amount_tendered').val(total_due.toFixed(2));

        // Change Due
        amount_tendered = document.getElementById('amount_tendered').value;
        change_due = amount_tendered - total_due.toFixed(2);
        $('#change_due').text("€" + change_due.toFixed(2));

    });
}

// Recalculate change due when a user manually enters a tendered amount
const element = document.getElementById("amount_tendered");
element.addEventListener("keyup", recalculate_change_due);
function recalculate_change_due(){
    amount_tendered = document.getElementById('amount_tendered').value;
    // amount_tendered.select(); // Supposed to highlight all text in the input when it's clicked. Or clear input
    change_due = (amount_tendered - total_due);
    $('#change_due').text("€" + change_due.toFixed(2));
}

// Put € note values into the Amount Tender input once clicked
$('.€_notes_button').click( function(){

    note_value = $(this).attr("data-value");
    $('#amount_tendered').val(note_value);

    payment_method = $(this).attr("data-payment_method");

    // Call recalculate change due function
    recalculate_change_due()

});

// Populate tendered amount when Credit Card button pressed
const card_button = document.getElementById("credit_card_button");
card_button.addEventListener("click", card_tendered);
function card_tendered(){
    // Amount Tendered
    amount_tendered = total_due;
    $('#amount_tendered').val(total_due.toFixed(2));
    recalculate_change_due();

    payment_method = $(this).attr("data-payment_method");
}

// Allow Users input the number of Pfand items returned
$('.pfand_button').click( function(){

    let pfand_return_value = $(this).attr("data-value");
    let minus_return_value = (pfand_return_value*-2).toFixed(2);
    let plus_return_value = (pfand_return_value*2).toFixed(2);

    pfand_buttons_total = pfand_return_value*2;

    if(pfand_total == undefined){
        $('#pfand_total').text("€" + minus_return_value);
    } else {
        let recalc_pfand_amount = (pfand_total - plus_return_value).toFixed(2);
        $('#pfand_total').text("€" + recalc_pfand_amount);

        // Call recalculate change due function
        basketGrandTotals();
    }
});

// Empty basket once Cancel button is clicked at bottom of Grand Total section
$('.cancel_button').click( function(){
    all_products = [];
    discount_product = {};
    $('.products_rows_div').empty();
    $('#total_number_of_products').text("# Products");
    $('#products_total').text("€");
    $('#pfand_total').text("€");
    $('#total_due').text("€");
    $('#amount_tendered').val(0);
    $('#change_due').text("€");
});

// Fn to submit order to DB when clicking Finish, Unpaid or Waste buttons
// https://testdriven.io/blog/django-ajax-xhr/
$('.payment_button').click( function(){
    console.log("FN Fires");
    let payment_method_alternative = $(this).attr("data-payment_method_alternative")
    let payment_reason = $(this).attr("data-payment_reason")
    if(payment_reason == undefined){
        payment_reason = null;
    }
   
    if(payment_method_alternative == "complimentary" || payment_method_alternative == "waste"){
        pfand_buttons_total = 0;
        line_totals_total = 0;
        pfand_total = 0;
        amount_tendered = 0;
        total_due = 0;
        change_due = 0;
        payment_method = payment_method_alternative;
    } else {
        if($('#amount_tendered').val() == ""){
            $('#amount_tendered').addClass('error');
            alert("Please put in a Tendered Amount");
            return 
        }
    }

    // let url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/";
    let url = "https://8000-cathaldolan-ipuhaelepos-e452p7jqft4.ws-eu106.gitpod.io/";
    grand_total.pfand_buttons_total = pfand_buttons_total;
    grand_total.total_products_qty = total_products_qty;
    grand_total.line_totals_total = line_totals_total;
    grand_total.pfand_total = pfand_total;
    grand_total.amount_tendered = amount_tendered;
    grand_total.total_due = total_due;
    grand_total.change_due = change_due;
    grand_total.payment_method = payment_method;
    grand_total.payment_reason = payment_reason;
    // getCookie("csrftoken");
    fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify([{all_products},{grand_total}])
    })
    .then(response => response.json())
    .then(data => {
        if(data.status == "Checkout Complete"){
            location.reload();
        }
    });
});
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
