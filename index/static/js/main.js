console.log("JS is Working")

let url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/";
// let url = "https://8000-cathaldolan-ipuhaelepos-3mipea1rgm3.ws-eu106.gitpod.io/";

//SET TIME & DATE: Fn to set time and date.
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

// FULL SCREEN MODE: Pair of function to expand and collapse page to full screen
var elem = document.documentElement;
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

let Buttons = document.querySelectorAll('.product_button'); // Used anywhere?
let All_Products = [];
let Product_Details = {};  // Used anywhere?
let Product_Size = "";

// All are used in the Grand Totals section
let Grand_Total = {};
let Pfand_Buttons_Total = 0; // This is the amount due as a credit against the order when a pfand button for number of glasses is selected.
let Total_Products_Qty = 0;
let Line_Totals_Total = 0;
let Pfand_Total = 0;
let Amount_Tendered = 0.00;
let Total_Due = 0;
let Change_Due = 0;
let Payment_Method;
var specials_applied = [];
var discount_product = {}

// Select product size - Needed in Phase 2
$('.measure_button').click( function(){

    Product_Size = $(this).attr("data-price");
    console.log("product_size fn1", Product_Size);
    // Extracts the sizes for each product when button is clicked
    let size = $(this).attr("data-price");
    console.log("Sizes", size);
    console.log("type of Sizes", typeof(size));

    let product_buttons = $('.product_buttons_div').find(`[data-${size}]`).addClass('highlight');
    console.log("Product Buttons", product_buttons);

});

// PRODUCT BUTTONS
$('.product_button').click( function(){
    // let abbrv_size = Product_Size.split("_"); // Required when allocating variable sizs to products - Phase 2
    let product_name = $(this).attr('data-name');
    let product_price = Number($(this).attr('data-price_default'));
    let product_category = $(this).attr('data-category');
    let pfand_payable = $(this).attr('data-pfand');
    let product = All_Products.filter(item => item.name == `${product_name}`); //${product_name} ${abbrv_size[1]}. Required when allocating variable sizs to products - Phase 2
    let product_index = All_Products.findIndex(item => item.name == `${product_name}`); // ${product_name} ${abbrv_size[1]}. Required when allocating variable sizs to products - Phase 2

    if(product.length > 0){
        All_Products[product_index].qty +=1;
        All_Products[product_index].line_total = All_Products[product_index].price * All_Products[product_index].qty;
    } else {
        product = {
            "category": product_category,
            "name": product_name,
            "qty": 1,
            "price": product_price,
            "line_total": product_price,
            "pfand_payable": pfand_payable,
        }
        All_Products.push(product);

    }
    update_basket();
});

// INCREMENT a product line in the basket
$(document).on('click', '.add_button', function(){
    console.log("Increment FN Fires");
    let product_name = $(this).parent().siblings(':first').children().text();
    let product = All_Products.filter(item => item.name == product_name);
    let product_index = All_Products.findIndex(item => item.name == product_name);

    if(product.length > 0){

        All_Products[product_index].qty +=1;
        All_Products[product_index].line_total = All_Products[product_index].price * All_Products[product_index].qty;
    
    }
    update_basket();
})

// DECREMENT a product line in the basket
$(document).on('click', '.subtract_button', function(){
    console.log("Decrement FN Fires");
    let product_name = $(this).parent().siblings(':first').children().text();
    let product = All_Products.filter(item => item.name == product_name);
    let product_index = All_Products.findIndex(item => item.name == product_name);
    
    // Initial If Statement used to prevent decrementor going below 0
    if(All_Products[product_index].qty < 2){

        console.log("Nothing ever happens");
    
    } else {

        if(product.length > 0){
            All_Products[product_index].qty -=1;
            All_Products[product_index].line_total = All_Products[product_index].price * All_Products[product_index].qty;
        
        }
    }
    update_basket();
})

// DELETE a product line from the basket
$(document).on('click', '.delete_button', function(){
    console.log("Delete Function Fires", this);
    let product_name = $(this).parent().siblings(':first').children().text();
    let product_index = All_Products.findIndex(item => item.name == product_name);
    console.log("product_index", product_index);
    var products_spliced = All_Products.splice(product_index, 1);
    console.log("products_spliced", products_spliced);
    console.log("All_Products", All_Products);
    Pfand_Total = (Pfand_Total - (products_spliced[0].qty*2));
    update_basket();
})

// UPDATE BASKET: Update the basket each time something is added or removed
function update_basket(){ 
    
    if(Total_Products_Qty > 10){
        let cheapest_price = 100;
        let index_of_cheapest_price;
        $.each(All_Products, function(index, item){
            if((item["price"]) < cheapest_price){
                cheapest_price = item["price"];
            }
        });
        Line_Totals_Total -= cheapest_price

        // Message remind to tell customker they got special
    }

    $('.products_rows_div').empty();

    $.each(All_Products, function(){
        $('.products_rows_div').append(
            `<div class="row product_row" id="product_headings_row"> 
                <div class="col-4" id="product_row_div">
                    <p class="product_row">${this.name}</p>
                </div>
                <div class="col-1" id="qty_row_div">
                    <p class="product_row">${this.qty}</p>
                </div>
                <div class="col" id="per_unit_row_div">
                    <p class="product_row">€${this.price.toFixed(2)}</p>
                </div>
                <div class="col" id="line_total_row_div">
                    <p class="product_row">€${this.line_total.toFixed(2)}</p>
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
            `<div class="row product_row specials_row" id="product_headings_row">
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

// GRAND TOTALS CALCULATION: Calculate grand totals in basket
function basketGrandTotals(){

    Total_Products_Qty = 0;
    Line_Totals_Total = 0;
    let fn_pfand_total = 0;
    console.log("All Products Basket Grand Totals FN", All_Products);
    $(All_Products).each(function(){
        
        // Calculates total number of products in the basket
        let this_quantity = this.qty;
        Total_Products_Qty += this_quantity;
        console.log("Total_Products_Qty", Total_Products_Qty);
        
        // Calculates total value of all products in basket
        let this_line_total = this.line_total;
        console.log("this_line_total", this_line_total);
        Line_Totals_Total += this_line_total;
        console.log("Line_Totals_Total pre fixed", Line_Totals_Total);

        // Calculates Pfand Amount Due
        if(this.pfand_payable == "true"){
            fn_pfand_total += (this.qty * 2);
        } 

        Pfand_Total = fn_pfand_total;

    });
    $('#total_number_of_products').text(Total_Products_Qty);
    $('#products_total').text("€" + Line_Totals_Total.toFixed(2));

    // Calculates the amount of pfand to be displayed using a combination of the if statement above and the Pfand butoon function
    let new_pfand_total = 0;
    new_pfand_total = Pfand_Total - Pfand_Buttons_Total;
    $('#pfand_total').text("€" + new_pfand_total.toFixed(2));
    // Pfand_Buttons_Total = 0; // Prevents the pfand amount for returned glasses from being retained when the Cancel button is used.
    Pfand_Total = new_pfand_total; // This is here so that we can record when payment is made purely with a pfand as per the PAYMENT BUTTONS Fn

    Total_Due = new_pfand_total + Line_Totals_Total;
    var new_total_due = Total_Due.toFixed(2);
    Total_Due = parseFloat(new_total_due);
    console.log("Total due to fixed", Total_Due);
    $('#total_due').text("€" + Total_Due.toFixed(2)); 

    Amount_Tendered = Total_Due;
    console.log("TOTAL DUE", Total_Due);
    Amount_Tendered = parseFloat($('#amount_tendered').val());
    console.log("Amount_Tendered", Amount_Tendered);
    Change_Due = Amount_Tendered - Total_Due;
    $('#change_due').text("€" + Change_Due.toFixed(2));
}

// TENDERED AMOUNT INPUT & RECALCULATE CHANGE: Recalculate change due when a user manually enters a tendered amount
const element = document.getElementById("amount_tendered");
element.addEventListener("keyup", recalculate_change_due);
function recalculate_change_due(){
    Amount_Tendered = parseFloat($('#amount_tendered').val());
    console.log("TENDERED AMOUNT", Amount_Tendered);
    // Amount_Tendered.select(); // Supposed to highlight all text in the input when it's clicked. Or clear input
    Change_Due = (Amount_Tendered - Total_Due);

    console.log("RECALCULATE CHANGE FN: Amount Tendered", Amount_Tendered);
    console.log("RECALCULATE CHANGE FN: Total Due", Total_Due);
    console.log("RECALCULATE CHANGE FN: Change Due", Change_Due);

    $('#change_due').text("€" + Change_Due.toFixed(2));
    Payment_Method = "Cash";
}

// NOTES BUTTONS: Put € note values into the Amount Tender input once a note image has been clicked
$('.€_notes_button').click( function(){

    note_value = $(this).attr("data-value");
    $('#amount_tendered').val(note_value);

    Payment_Method = $(this).attr("data-payment_method");

    // Call recalculate change due function
    recalculate_change_due()

});

// CREDIT CARD BUTTON: Populate tendered amount when Credit Card button pressed
// const card_button = document.getElementById("credit_card_button");
// card_button.addEventListener("click", card_tendered);
// function card_tendered(){
$('#credit_card_button').click( function(){
    // Amount Tendered
    Amount_Tendered = Total_Due;
    $('#amount_tendered').val(Total_Due.toFixed(2));
    recalculate_change_due();

    Payment_Method = $(this).attr("data-payment_method");
});

// PFAND BUTTONS: Allow Users input the number of Pfand items returned
$('.pfand_button').click( function(){

    let pfand_return_value = $(this).attr("data-value");
    let minus_return_value = (pfand_return_value*-2).toFixed(2);
    let plus_return_value = (pfand_return_value*2).toFixed(2);

    Pfand_Buttons_Total = pfand_return_value*2;

    console.log("Pfand Payable pfand fn", Pfand_Total);

    if(Pfand_Total == undefined){
        $('#pfand_total').text("€" + minus_return_value);
    } else {
        // let recalc_pfand_amount = (pfand_payable - plus_return_value).toFixed(2);
        // $('#pfand_total').text("€" + recalc_pfand_amount);

        // Call recalculate change due function
        basketGrandTotals();
    }
    // basketGrandTotals();
});

// CANCEL BUTTON: Empty basket once Cancel button is clicked at bottom of Grand Total section
$('.cancel_button').click( function(){
    All_Products = [];
    discount_product = {};
    $('.products_rows_div').empty();
    $('#total_number_of_products').text("# Products");
    $('#products_total').text("€");
    $('#pfand_total').text("€");
    Pfand_Total = 0; // Makes Pfand amount 0
    Pfand_Buttons_Total = 0;
    $('#total_due').text("€");
    Total_Due = 0;
    $('#amount_tendered').val(0);
    $('#change_due').text("€");
});

// PAYMENT BUTTONS: Fn to submit order to DB when clicking Finish, Unpaid or Waste buttons
// https://testdriven.io/blog/django-ajax-xhr/
$('.payment_button').click( function(){
    let payment_method_alternative = $(this).attr("data-payment_method_alternative")
    let payment_reason = $(this).attr("data-payment_reason")
    if(payment_reason == undefined){
        payment_reason = null;
    }
    console.log("payment_method_alternative", payment_method_alternative);

    // Functionality to allow a payment be submitted where the total due is 0 because the pfand covered the cost.
    // e.g. where a customer buys 1 Pfand Shot Special, but returns a glass. One cancels the other so amount submitted and amount due is 0
    console.log("FINISH BTN Pfand_Total", Pfand_Total);
    console.log("FINISH BTN Line_Totals_Total", Line_Totals_Total);
    if((Line_Totals_Total * -1) >= Pfand_Total){
        Payment_Method = "Pfand Payment" // This applies where the pfand is sufficient to cover the payment.
        $('#amount_tendered').val(0);
    };

    if(payment_method_alternative == "Complimentary" || payment_method_alternative == "Waste"){
        Pfand_Buttons_Total = 0;
        Line_Totals_Total = 0;
        Pfand_Total = 0;
        Amount_Tendered = 0;
        Total_Due = 0;
        Change_Due = 0;
        Payment_Method = payment_method_alternative;
    } else {
        if($('#amount_tendered').val() == ""){
            $('#amount_tendered').addClass('error');
            var message_container = $(".message-container");
            $(message_container).append(`
                <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="arrow-up arrow-warning"></div>
                    <div class="toast-header bg-warning text-dark">
                        <strong class="me-auto text-light">Oops!</strong>${ "Please add a tendered amount" }
                        <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>`)
            $('.toast').toast('show');
            return 
        }
    }

    Grand_Total.Pfand_Buttons_Total = Pfand_Buttons_Total;
    Grand_Total.Total_Products_Qty = Total_Products_Qty;
    Grand_Total.Line_Totals_Total = Line_Totals_Total;
    Grand_Total.Pfand_Total = Pfand_Total;
    Grand_Total.Amount_Tendered = Amount_Tendered;
    Grand_Total.Total_Due = Total_Due;
    Grand_Total.Change_Due = Change_Due;
    Grand_Total.Payment_Method = Payment_Method;
    Grand_Total.payment_reason = payment_reason;

    console.log("PAYMENT BUTTONS FN: Amount Tendered", Amount_Tendered);
    console.log("PAYMENT BUTTONS FN: Total Due", Total_Due);
    let sub_amount = Amount_Tendered - Total_Due;
    console.log("PAYMENT BUTTONS FN: Sub Amount", sub_amount);

    if(Amount_Tendered < Total_Due){
        var message_container = $(".message-container");
        console.log("message_container", message_container);
        $(message_container).append(`
            <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="arrow-up arrow-warning"></div>
                <div class="toast-header bg-warning text-dark">
                    <strong class="me-auto text-light">Oops</strong>${ "Not Enough Tendered!!!" }
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`)
        $('.toast').toast('show');
    } else {
        console.log("All Products", All_Products);
        console.log("Grand Total", Grand_Total);
        fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify([{All_Products},{Grand_Total}])
        })
        .then(response => response.json())
        .then(data => {
            if(data.status == "Checkout Complete"){
                location.reload();
            }
        });
    }
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
