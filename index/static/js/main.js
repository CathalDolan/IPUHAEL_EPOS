console.log("JS is Working")

const host = window.location.host;
var url = '';
if(host.includes("heroku")) {
    console.log("HEROKU")
    url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/"
}
else {
    console.log("GITPOD")
    url = "https://8000-cathaldolan-ipuhaelepos-ttnjevm7y7g.ws-eu117.gitpod.io/";
}

//SET TIME & DATE: Fn to set time and date.
window.onload = function () {
    // sessionStorage.removeItem("kitchen_display");
    console.log(sessionStorage)
    let kitchen_display = sessionStorage.getItem("kitchen_display");
    $(".gifts_row").addClass('hide')
    if(kitchen_display == "True") {
        // $('.bar_kitchen').text("Bar Products");
        $('[data-kitchen_product=True]').parent().removeClass('hide');
        $('[data-kitchen_product=False]').parent().addClass('hide');
        $('.kitchen_products').addClass('selected')
    }
    else {
        // $('.bar_kitchen').text("Kitchen Products");
        $('[data-bar_product=True]').parent().removeClass('hide');
        $('[data-bar_product=False]').parent().addClass('hide');
        $('.bar_products').addClass('selected')
    }
    setInterval(function () {
        let date = new Date();
        let day = date.getDay();
        let displayDate = date.toLocaleDateString();
        let displayTime = date.toLocaleTimeString();
        switch (date.getDay()) {
            case 0:
              day = "Sun";
              break;
            case 1:
              day = "Mon";
              break;
            case 2:
               day = "Tues";
              break;
            case 3:
              day = "Wed";
              break;
            case 4:
              day = "Thur";
              break;
            case 5:
              day = "Fri";
              break;
            case 6:
              day = "Sat";
        }
        switch (date.getMonth()) {
            case 0:
                month = "Jan";
                break;
            case 1:
                month = "Feb";
                break;
            case 2:
                month = "Mar";
                break;
            case 3:
                month = "Apr";
                break;
            case 4:
                month = "May";
                break;
            case 5:
                month = "Jun";
                break;
            case 6:
                month = "Jul";
                break;
            case 7:
                month = "Aug";
                break;
            case 8:
                month = "Sep";
                break;
            case 9:
                month = "Oct";
                break;
            case 10:
                month = "Nov";
                break;
            case 11:
                month = "Dec";
                break;
        }

        document.getElementById('time_and_date').innerHTML = day + ", " + month + " " + date.getDate() + ", " + date.getHours() + ":" + (date.getMinutes()<10 ? 
        "0" + date.getMinutes() : date.getMinutes());
    }, 1000); // 1000 milliseconds = 1 second

    // Calls message toasts
    $('.toast').toast('show');
}

// FULL SCREEN MODE: Pair of function to expand and collapse page to full screen
var elem = document.documentElement;

function openFullscreen() {
    // var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
    }
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
    }
}

$('#open_drink_modal').on('shown.bs.modal', function () {
    console.log("open drink modal triggered");
    $('input[name="quantity"]').val(1);
    $('input[name="drink-name"]').val('');
    $('input[name="price"]').val(null);
    $('input[name="pfand"]').prop('checked',true);
    $('.field-error').text('');
    console.log($('#open_drink_modal').find('[name=price'));
    $('#open_drink_modal').find('[name=price').focus();
})

let Buttons = document.querySelectorAll('.product_button'); // Used anywhere?
let ALL_PRODUCTS = [];
let Product_Details = {}; // Used anywhere?
let Product_Size = "";

// All are used in the Grand Totals section
let Grand_Total = {};
let Pfand_Buttons_Total = 0; // This is the amount due as a credit against the order when a pfand button for number of glasses is selected.
let Total_Products_Qty = 0;
let Line_Totals_Total = 0;
let Pfand_Total = 0;
let Amount_Tendered = 0.00;
let Total_Due = 0;
let Change_Due;
let Payment_Method;
var DISCOUNTS = [];
var NEW_BASKET = []
var VOUCHERS = [];
var GLASSES_RETURNED = 0;
var STAFF_ID = '';

$(document).ready(function() {
    $('.drinks_row').find('.product_button').removeClass('enabled').addClass('disabled');
    $('.drinks_row').find(`[data-price_03!=None]`).addClass('enabled').removeClass('disabled');
    $('.drinks_row').find(`[data-price_default!=None]`).addClass('enabled').removeClass('disabled');
    $('.food_row').find('.product_button').removeClass('enabled').addClass('disabled');
    $('.food_row').find(`[data-price_regular!=None]`).addClass('enabled').removeClass('disabled');
    $('.food_row').find(`[data-price_default!=None]`).addClass('enabled').removeClass('disabled');
})

$('.staff-name').click(function() {
    STAFF_ID = $(this).attr('data-member_id');
    console.log("STAFF_ID = ", STAFF_ID);
    console.log("STAFF_NAME = ", $(this).text());
    $('.staff-user').text($(this).text())
    $('#staff_modal').modal('hide')
})

$('#staff_modal').on('hidden.bs.modal', function (e) {
    // console.log("modal hidden");
    if(STAFF_ID == '') {
        var staff_modal = new bootstrap.Modal(document.getElementById('staff_modal'), {})
        staff_modal.show()
    }
})

$('.bar_products').click(function() {
    console.log("BAR")
    $('[data-bar_product=True]').parent().removeClass('hide');
    $('[data-bar_product=False]').parent().addClass('hide');
    $('.gifts_row').addClass('hide');
    $('.product_selection').removeClass('selected')
    $(this).addClass('selected')
    sessionStorage.setItem("kitchen_display", "False");
    // if($(this).text() == "Bar Products") {
    //     $('.bar_kitchen').text("Kitchen Products");
    //     $('[data-bar_product=True]').parent().removeClass('hide');
    //     $('[data-bar_product=False]').parent().addClass('hide');
    //     sessionStorage.setItem("kitchen_display", "False");
    // }
    // else {
    //     $('.bar_kitchen').text("Bar Products");
    //     $('[data-kitchen_product=True]').parent().removeClass('hide');
    //     $('[data-kitchen_product=False]').parent().addClass('hide');
    //     sessionStorage.setItem("kitchen_display", "True");
    // }
})
$('.kitchen_products').click(function() {
    console.log("KITCHEN")
    $('[data-kitchen_product=True]').parent().removeClass('hide');
    $('[data-kitchen_product=False]').parent().addClass('hide');
    $('.gifts_row').addClass('hide');
    $('.product_selection').removeClass('selected')
    $(this).addClass('selected')
    sessionStorage.setItem("kitchen_display", "True");
})
$('.gift_products').click(function() {
    console.log("GIFTS")
    $('.drinks_row').children().addClass('hide');
    $('.food_row').children().addClass('hide');
    $('.gifts_row').removeClass('hide');
    $('.product_selection').removeClass('selected')
    $(this).addClass('selected')
})

// Select product size - Needed in Phase 2
$('.drink.measure_button').click(function () {
    // Extracts the sizes for each product when button is clicked
    let size = $(this).attr("data-price");
    $('.drink.measure_button').removeClass('selected');
    $(`.drink.measure_button[data-price=${size}]`).addClass('selected');
    $('.drinks_row').find('.product_button').removeClass('enabled').addClass('disabled');
    $('.drinks_row').find(`[data-${size}!=None]`).addClass('enabled').removeClass('disabled');
    $('.drinks_row').find(`[data-price_default!=None]`).addClass('enabled').removeClass('disabled');
});

$('.add_gift_button').click(function() {
    let product_name = $(this).attr('data-name');
    let abbr_name = $(this).attr('data-abbr_name');
    let product_price = Number($(this).attr('data-price_default'));
    let product_category = $(this).attr('data-category');
    let pfand_payable = $(this).attr('data-pfand');
    let product = ALL_PRODUCTS.filter(item => (item.name == `${product_name}`));
    let product_index = ALL_PRODUCTS.findIndex(item => (item.name == `${product_name}`))
    if (product.length > 0) {
        ALL_PRODUCTS[product_index].qty += 1;
        ALL_PRODUCTS[product_index].line_total = ALL_PRODUCTS[product_index].price * ALL_PRODUCTS[product_index].qty;
    } else {
        product = {
            "category": product_category,
            "name": product_name,
            "abbr_name": abbr_name,
            "size": 'Default',
            "qty": 1,
            "price": product_price,
            "line_total": product_price,
            "pfand_payable": pfand_payable,
            'discount_applied': ''
        }
        ALL_PRODUCTS.push(product);
        console.log("ALL_PRODUCTS = ", ALL_PRODUCTS)
    }
    apply_specials();
})

// PRODUCT BUTTONS
$('.drink.product_button').click(function () {
    let product_size = $('.drink.measure_button.selected').attr('data-price');
    console.log("product_size = ", product_size)
    let abbrv_size = product_size.split("_")[1]; // Required when allocating variable sizs to products - Phase 2
    let product_name = $(this).attr('data-name');
    let abbr_name = $(this).attr('data-abbr_name');
    let product_price = $(this).attr('data-' + product_size);
    if(product_price == 'None') {
        product_price = Number($(this).attr('data-price_default'));
        abbrv_size = 'Default';
    }
    else {
        product_price = Number(product_price)
    }   

    let product_category = $(this).attr('data-category');
    let pfand_payable = $(this).attr('data-pfand');
    if(abbrv_size == "btle" || abbrv_size == "dash") {
        pfand_payable = "False";
    }
    let product = ALL_PRODUCTS.filter(item => (item.name == `${product_name}`) && (item.size == `${abbrv_size}`)); 
    let product_index = ALL_PRODUCTS.findIndex(item => (item.name == `${product_name}`) && (item.size == `${abbrv_size}`)); 

    if (product.length > 0) {
        ALL_PRODUCTS[product_index].qty += 1;
        ALL_PRODUCTS[product_index].line_total = ALL_PRODUCTS[product_index].price * ALL_PRODUCTS[product_index].qty;
    } else {
        product = {
            "category": product_category,
            "name": product_name,
            "abbr_name": abbr_name,
            "size": abbrv_size,
            "qty": 1,
            "price": product_price,
            "line_total": product_price,
            "pfand_payable": pfand_payable,
            'discount_applied': ''
        }
        ALL_PRODUCTS.push(product);

    }
    apply_specials();
});

$('.food.measure_button').click(function() {
    // Extracts the sizes for each product when button is clicked
    let size = $(this).attr("data-price");
    $('.food.measure_button').removeClass('selected')
    $(this).addClass('selected');
    console.log("size = ", size);
    $('.food_row').find('.product_button').removeClass('enabled').addClass('disabled');
    $('.food_row').find(`[data-${size}!=None]`).addClass('enabled').removeClass('disabled');
    $('.food_row').find(`[data-price_default!=None]`).addClass('enabled').removeClass('disabled');
})

$('.food.product_button').click(function() {
    console.log("FOOD BUTTON");
    let product_size = $('.food.measure_button.selected').attr('data-price');
    console.log("product_size = ", product_size)
    let abbrv_size = product_size.split("_")[1]; // Required when allocating variable sizs to products - Phase 2
    console.log("abbrv_size = ", abbrv_size)
    console.log("product_size = ", product_size)
    let product_name = $(this).attr('data-name');
    let abbr_name = $(this).attr('data-abbr_name');
    let product_price = $(this).attr('data-' + product_size);
    console.log("product_price = ", product_price)
    if(product_price == 'None') {
        product_price = Number($(this).attr('data-price_default'));
        abbrv_size = '';
    }
    else {
        product_price = Number(product_price)
    }
    console.log("product_price = ", product_price)

    let product_category = $(this).attr('data-category');
    let pfand_payable = $(this).attr('data-pfand');
    
    let product = ALL_PRODUCTS.filter(item => (item.name == `${product_name}`) && (item.size == `${abbrv_size}`)); //${product_name} ${abbrv_size[1]}. Required when allocating variable sizs to products - Phase 2
    console.log("product = ", product)
    let product_index = ALL_PRODUCTS.findIndex(item => (item.name == `${product_name}`) && (item.size == `${abbrv_size}`)); // ${product_name} ${abbrv_size[1]}. Required when allocating variable sizs to products - Phase 2

    if (product.length > 0) {
        ALL_PRODUCTS[product_index].qty += 1;
        ALL_PRODUCTS[product_index].line_total = ALL_PRODUCTS[product_index].price * ALL_PRODUCTS[product_index].qty;
    } else {
        product = {
            "category": product_category,
            "name": product_name,
            "abbr_name": abbr_name,
            "size": abbrv_size,
            "qty": 1,
            "price": product_price,
            "line_total": product_price,
            "pfand_payable": pfand_payable,
            'discount_applied': ''
        }
        ALL_PRODUCTS.push(product);

    }
    apply_specials();



})

// INCREMENT a product line in the basket
$(document).on('click', '.add_button', function () {
    console.log("Increment FN Fires");
    let product_name = $(this).parent().siblings(':first').children().text();
    let product_size = $(this).parent().siblings(':nth-child(2)').children().text().toLowerCase();
    console.log("product_name = ", product_name)
    let product = ALL_PRODUCTS.filter(item => (item.abbr_name == `${product_name}`) && (item.size == `${product_size}`));
    let product_index = ALL_PRODUCTS.findIndex(item => (item.abbr_name == `${product_name}`) && (item.size == `${product_size}`));

    if (product.length > 0) {

        ALL_PRODUCTS[product_index].qty += 1;
        ALL_PRODUCTS[product_index].line_total = ALL_PRODUCTS[product_index].price * ALL_PRODUCTS[product_index].qty;

    }
    apply_specials();
})

// DECREMENT a product line in the basket
$(document).on('click', '.subtract_button', function () {
    console.log("Decrement FN Fires");
    let product_name = $(this).parent().siblings(':first').children().text(); 
    let product_size = $(this).parent().siblings(':nth-child(2)').children().text().toLowerCase();
    let product = ALL_PRODUCTS.filter(item => (item.abbr_name == `${product_name}`) && (item.size == `${product_size}`));
    let product_index = ALL_PRODUCTS.findIndex(item => (item.abbr_name == `${product_name}`) && (item.size == `${product_size}`));

    // Initial If Statement used to prevent decrementor going below 0
    if (ALL_PRODUCTS[product_index].qty < 2) {

        console.log("Nothing ever happens");

    } else if (product.length > 0) {
        ALL_PRODUCTS[product_index].qty -= 1;
        ALL_PRODUCTS[product_index].line_total = ALL_PRODUCTS[product_index].price * ALL_PRODUCTS[product_index].qty;

    }
    apply_specials();
})

// DELETE a product line from the basket
$(document).on('click', '.delete_button', function () {
    console.log("Delete Function Fires", this);
    // If the product row has a data-special attribute not equal to undefined means that this row is a voucher
    if ($(this).attr('data-special') != undefined) {
        let voucher_index = VOUCHERS.findIndex(item => item == $(this).attr('data-special')); // Find this attribute in the VOUCHERS array
        VOUCHERS.splice(voucher_index, 1); // Remove this voucher from the VOUCHERS array
        let discounts_index = DISCOUNTS.findIndex(item => item.discount_applied == $(this).attr('data-special')); // Also find it in the DISCOUNTS array
        DISCOUNTS.splice(discounts_index, 1); // Splice this discount item from the discounts array
    } else { // Else this is a product row so remove this product from the ALL_PRODUCTS array
        let product_name = $(this).parent().siblings(':first').children().text();
        let product_size = $(this).parent().siblings(':nth-child(2)').children().text().toLowerCase();
        let product_index = ALL_PRODUCTS.findIndex(item => (item.abbr_name == `${product_name}`) && (item.size == `${product_size}`));
        ALL_PRODUCTS.splice(product_index, 1);
    }
    apply_specials();
})

// Function to enter an open drink
$('.open-drink-submit').click(() => {
    console.log("open drink submit");
    let product_size = $('.drink.measure_button.selected').attr('data-price');
    let abbrv_size = product_size.split("_")[1]; 
    let product_qty = Number($('input[name="quantity"]').val());
    let product_name = $('input[name="drink-name"]').val();
    let abbr_name = $('input[name="drink-name"]').val();
    let product_price = Number($('input[name="price"]').val());
    let pfand_payable = $('input[name="pfand"]').prop("checked");
    if(product_qty == '') {
        $('input[name="quantity"]').next('p').text("Required");
        return;
    }
    else {
        $('input[name="quantity"]').next('p').text("");
    }
    if(product_name == '') {
        $('input[name="drink-name"]').next('p').text("Required");
        return;
    }
    else {
        $('input[name="drink-name"]').next('p').text("");
    }
    if(product_price == '') {
        $('input[name="price"]').next('p').text("Required");
        return;
    }
    else {
        $('input[name="price"]').next('p').text("");
    }
    if(pfand_payable) {
        pfand_payable = "True"
    }
    let line_total = product_qty * product_price;

    product = {
        "category": "Open drink",
        "name": product_name,
        "abbr_name": abbr_name,
        "size": abbrv_size,
        "qty": product_qty,
        "price": product_price,
        "line_total": line_total,
        "pfand_payable": pfand_payable,
        'discount_applied': ''
    }
    $('#open_drink_modal').modal('hide');
    ALL_PRODUCTS.push(product);
    apply_specials();
});

// Function run when a specials option is selected from the modal
$(document).on('click', '.specials_option', function () {
    let special = $(this).attr('data-special');
    // If the VOUCHERS array does not include this special value, then add it to the VOUCHERS array
    if (!VOUCHERS.includes(special)) {
        VOUCHERS.push(special);
        apply_specials();
    } else { // If the VOUCHERS array already contains the special then display a message toast
        $(".message-container").empty().append(`
            <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="arrow-up arrow-warning"></div>
                <div class="toast-header bg-warning text-dark">
                    <strong class="me-auto text-light">Oops</strong>A '${special}' voucher is already in use.
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`)
        $('.toast').toast('show');
        return
    }
})

// Function used to reapply the specials when the order basket is changed
function apply_specials() {
    // console.log("VOUCHERS = ", VOUCHERS);
    // Clone the ALL_PRODUCTS array to a new array called NEW_BASKET in order to manipulate the values without distorting the ALL_PRODUCTS array
    NEW_BASKET = JSON.parse(JSON.stringify(ALL_PRODUCTS)); //https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/
    DISCOUNTS = []; // Reset the discounts applied 
    var discount_item = {}; // Reset the discounted item
    if(VOUCHERS.includes('oap-students')) {
        console.log("oap-students = ", VOUCHERS);
        let total_discount = 0;
        $.each(NEW_BASKET, function(index, item) {
            if(item.category == 'food') {
                if(item.price >= 6) {
                    item.discount_applied = 'oap-students';
                    item.line_total -= 1;
                    total_discount += 1;
                }
            }
        })
        discount_item = { // Create the discounted item with discounted prices applied
            'category': 'food',
            'name': 'Applied',
            'pfand_payable': '',
            'price': '',
            'qty': '',
            'unit_discount': '',
            'line_total': '',
            'total_discount': total_discount,
            'discount_applied': 'OAP/Student',
            'status': 'Appied',
            'details': 'Food €'
        }
        DISCOUNTS.push(discount_item) 

    }
    // First check is if the 10 for 11 special is in the VOUCHERS array
    if (VOUCHERS.includes('10 for 11')) {
        $.each(NEW_BASKET, function (index, item) { // Iterate through the NEW_BASKET array
            if (item.category == 'draught') { // If there's a draught
                discount_item = { // Create the discounted item with discounted prices applied
                    'category': item.category,
                    'name': item.name,
                    'pfand_payable': item.pfand_payable,
                    'price': 0,
                    'qty': 1,
                    'size': item.size,
                    'unit_discount': 0,
                    'line_total': 0,
                    'total_discount': item.price,
                    'discount_applied': '10 for 11',
                    'status': 'Appied',
                    'details': item.name
                }
                DISCOUNTS.push(discount_item) // Push this item to the DISCOUNTS array
                item.line_total = item.price * (item.qty - 1);

                return false; // Functionality complete so exit the if and for loop
            }
        })
        // If no item can be found for this special, create an invalid special item and push to DISCOUNTS array
        if ($.isEmptyObject(discount_item)) {
            discount_item = {
                'name': 'Invalid',
                'qty': 0,
                'unit_discount': 0,
                'total_discount': 0,
                'discount_applied': '10 for 11',
                'status': 'Invalid',
                'details': ''
            }
            DISCOUNTS.push(discount_item);
        }

    }

    // The 2nd check is to apply the 2 for 1 special
    // TWO FOR ONE SPECIAL

    var single_items = [];
    if (VOUCHERS.includes('2 for 1')) {
        var double_item = false;
        let price = 0;
        discount_item = {};
        $.each(NEW_BASKET, function (index, item) {
            console.log("item.category = ", item.category)
            if(item.category != "gifts")
                if (item.qty > 1) {
                    double_item = true;
                    if ((Number(item.price) > price)) {
                        price = item.price;
                        discount_item = {
                            'category': item.category,
                            'name': item.name,
                            'pfand_payable': item.pfand_payable,
                            'price': item.price,
                            'qty': 1,
                            'size': item.size,
                            'unit_discount': 0,
                            'line_total': 0,
                            'total_discount': item.price,
                            'discount_applied': '2 for 1',
                            'status': 'Applied',
                            'details': item.name
                        }
                        single_items = [discount_item, discount_item];
                    }
                } else {
                    if (double_item == false) {
                        discount_item = {
                            'category': item.category,
                            'name': item.name,
                            'pfand_payable': item.pfand_payable,
                            'price': item.price,
                            'qty': 1,
                            'size': item.size,
                            'unit_discount': 0,
                            'line_total': 0,
                            'total_discount': item.price,
                            'discount_applied': '2 for 1',
                            'status': 'Applied',
                            'details': item.name
                        }
                        single_items.push(discount_item);
                    }
                }

        })

        single_items.sort((a, b) => {
            return a.price - b.price;
        })
        single_items = single_items.slice(-2)
        if (single_items.length > 1) {
            discount_item = single_items[0]
            console.log(" = ", )
        } else {
            discount_item = {
                'name': 'Invalid',
                'qty': 0,
                'unit_discount': 0,
                'total_discount': 0,
                'discount_applied': '2 for 1',
                'status': 'Invalid',
                'details': ''
            }
        }

        index = NEW_BASKET.findIndex(obj => {
            console.log("obj.name = ", obj.name)
            return (obj.name == discount_item.name && obj.size == discount_item.size);
        })
        console.log("index = ", index)
        if (index != -1) {
            // NEW_BASKET[index].name += '*'
            // NEW_BASKET[index].qty += -1; 
            NEW_BASKET[index].line_total = NEW_BASKET[index].price * (NEW_BASKET[index].qty - 1);
            NEW_BASKET[index].qty = NEW_BASKET[index].qty - 1;
        }
        DISCOUNTS.push(discount_item);
    }

    // // FIFTY % OFF SPECIAL
    if (VOUCHERS.includes('20% off')) {
        var applicable_balance = 0;
        var total_discount = 0;
        $.each(NEW_BASKET, function (index, item) {
            applicable_balance += item.line_total;
            console.log("applicable_balance = ", applicable_balance)
        })
        if (single_items.length > 1) {
            $.each(single_items, function (index, item) {
                applicable_balance -= item.price;
            })
        }
        // I changed (applicable_balance > 50) to (applicable_balance > 0) on 17/1/2025
        if (applicable_balance > 0) {
            $.each(NEW_BASKET, function (index, item) {
                total_discount += item.line_total * .2
                item.price = item.price * .8;
                item.line_total = item.line_total * .8;
                item.discount_applied = '20% off'
                console.log("total_discount = ", total_discount)
            })
            discount_item = {
                'name': 'Applied',
                'qty': 1,
                'unit_discount': 0,
                'total_discount': total_discount,
                'discount_applied': '20% off',
                'status': 'Applied',
                'details': 'Discount - €' + total_discount.toFixed(2)
            }
        } else {
            discount_item = {
                'name': 'Invalid',
                'qty': 0,
                'unit_discount': 0,
                'total_discount': 0,
                'discount_applied': '20% off',
                'status': 'Invalid',
                'details': ''
            }
        }
        DISCOUNTS.push(discount_item)
    }

    // // SIX SHOT SPECIAL
    // if(special == 'six_shot_special') {
    //     console.log('six_shot_special')
    // }
    update_basket()
}

// UPDATE BASKET: Update the basket each time something is added or removed
function update_basket() {
    console.log("NEW_BASKET =", NEW_BASKET)
    console.log("DISCOUNTS =", DISCOUNTS)
    $('.products_rows_div').empty();
    $.each(NEW_BASKET, function () {
        $('.products_rows_div').prepend(
            `<div class="row product_row"> 
                <div class="col-3">
                    <p class="product-name">${this.abbr_name}</p>
                </div>
                <div class="col-1" id="size">
                    <p>${this.size == '' ? '': this.size[0].toUpperCase() + this.size.substring(1)}</p>
                </div>
                <div class="col-1" id="qty_row_div">
                    <p class="">${this.qty}</p>
                </div>
                <div class="col" id="per_unit_row_div">
                    <p class="">€${this.price.toFixed(2)}</p>
                </div>
                <div class="col" id="line_total_row_div">
                    <p class="">€${this.line_total.toFixed(2)}</p>
                </div>
                <div class="col-1" id="add_row_div">
                    <div class="add_button basket_edit_button">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                </div>
                <div class="col-1" id="subtract_row_div">
                    <div class="subtract_button basket_edit_button">
                        <i class="fa-solid fa-minus"></i>
                    </div>
                </div>
                <div class="col-1" id="delete_row_div">
                    <div class="delete_button basket_edit_button">
                        <i class="fa-solid fa-trash"></i>
                    </div>
                </div>
            </div>`
        );
    });
    if (DISCOUNTS.length != 0) {
        $(DISCOUNTS).each(function (index, item) {
            // console.log("item = ", item)
            $('.products_rows_div').prepend(
                `<div class="row product_row ${item['name']=='Invalid' ? 'invalid':'valid'}">
                    <div class="col-4">
                        <p class="product_row">${item['discount_applied']}</p>
                    </div>
                    <div class="col-4" id="qty_row_div">
                        <p class="product_row">${item['details']}</p>
                    </div>
                    <div class="col-3" id="add_row_div">
                        <p class="product_row">${item['status']}</p>
                    </div>
                    
                    <div class="col-1" id="delete_row_div">
                        <div class="delete_button basket_edit_button" data-special="${item['discount_applied']}">
                            <i class="fa-solid fa-trash"></i>
                        </div>
                    </div>
                </div>`
            );
        })
    }
    basketGrandTotals();
}

// Function to set the pfand applicable flag
var pfand_applicable = true;
$('#no-pfand').click(function () {
    $('#no-pfand').toggleClass('green');
    if (pfand_applicable == false) {
        pfand_applicable = true;
    } else {
        pfand_applicable = false;
    }
    basketGrandTotals();
})

// GRAND TOTALS CALCULATION: Calculate grand totals in basket
function basketGrandTotals() {
    Total_Products_Qty = 0;
    Line_Totals_Total = 0;
    Pfand_Total = 0;
    // console.log("All Products Basket Grand Totals FN", ALL_PRODUCTS);
    $(ALL_PRODUCTS).each(function () {
        // Calculates total number of products in the basket
        let this_quantity = this.qty;
        Total_Products_Qty += this_quantity;
        // console.log("Total_Products_Qty", Total_Products_Qty);

        // Calculates total value of all products in basket
        // let this_line_total = this.line_total;
        // console.log("this_line_total", this_line_total);
        // Line_Totals_Total += this_line_total;
        // console.log("Line_Totals_Total pre fixed", Line_Totals_Total);

        // Calculates Pfand Amount Due
        // console.log("pfand_applicable = ", pfand_applicable)
        if (this.pfand_payable == "True" && pfand_applicable == true) {
            if(this.name == "Whiskey Platter") {
                Pfand_Total += (this.qty * 2.5 * 6)
            }
            else {
                Pfand_Total += (this.qty * 2.5);
            }
            
        }
    });

    // console.log("GLASSES_RETURNED = ", GLASSES_RETURNED)
    if (GLASSES_RETURNED == 'no-pfand') {
        Pfand_Total = 0;
    } else {
        // console.log("ELSE")
        Pfand_Total = Pfand_Total - (Number(GLASSES_RETURNED) * 2.5);
    }

    console.log("Pfand_Total = ", Pfand_Total);
    $(NEW_BASKET).each(function () {
        // console.log("THIS = ", this);
        Line_Totals_Total += this.line_total;
    })

    $('#total_number_of_products').text(Total_Products_Qty);
    $('#food_grand_total').text("€" + Line_Totals_Total.toFixed(2));
    $('#pfand_total').text("€" + Pfand_Total.toFixed(2));

    Total_Due = Pfand_Total + Line_Totals_Total;
    var new_total_due = Total_Due.toFixed(2);
    Total_Due = parseFloat(new_total_due);
    // console.log("Total due to fixed", Total_Due);
    $('#total_due').text("€" + Total_Due.toFixed(2));

    // Amount_Tendered = Total_Due;
    // Amount_Tendered = parseFloat($('#amount_tendered').val());
    // console.log("Amount_Tendered = ", Amount_Tendered)
    if(Amount_Tendered >= Total_Due) {
        console.log("YES >");
        Change_Due = Amount_Tendered - Total_Due;
        $('#change_due').text("€" + Change_Due.toFixed(2));
    }
    else {
        $('#change_due').text("€");
    }
    // recalculate_change_due()
    
}

// TENDERED AMOUNT INPUT & RECALCULATE CHANGE: Recalculate change due when a user manually enters a tendered amount
const element = document.getElementById("amount_tendered");
element.addEventListener("keyup", recalculate_change_due);

function recalculate_change_due() {
    Amount_Tendered = parseFloat($('#amount_tendered').val());
    if(isNaN(Amount_Tendered)) {
        console.log("isNaN");
        $('#change_due').text("€");
    }
    else {
        console.log("TENDERED AMOUNT", Amount_Tendered);
        // Amount_Tendered.select(); // Supposed to highlight all text in the input when it's clicked. Or clear input
        Change_Due = (Amount_Tendered - Total_Due);
        $('#change_due').text("€" + Change_Due.toFixed(2));
        Payment_Method = "Cash";
    }
}

// NOTES BUTTONS: Put € note values into the Amount Tender input once a note image has been clicked
$('.€_notes_button').click(function () {
    note_value = $(this).attr("data-value");
    $('#amount_tendered').val(note_value);
    Payment_Method = $(this).attr("data-payment_method");
    // Call recalculate change due function
    recalculate_change_due()

});

$('.exact_tendered').click(function () {
    Amount_Tendered = Total_Due;
    $('#amount_tendered').val(Total_Due.toFixed(2));
    Change_Due = (Amount_Tendered - Total_Due);
    $('#change_due').text("€" + Change_Due.toFixed(2));
    Payment_Method = "Cash";
})

// CREDIT CARD BUTTON: Populate tendered amount when Credit Card button pressed
$('#credit_card_button').click(function () {
    // Amount Tendered
    Amount_Tendered = Total_Due;
    $('#amount_tendered').val(Total_Due.toFixed(2));
    recalculate_change_due();

    Payment_Method = $(this).attr("data-payment_method");
});

// PFAND BUTTONS: Allow Users input the number of Pfand items returned
$('.pfand_button.activate').click(function () {
    GLASSES_RETURNED = $(this).attr("data-value");
    console.log("GLASSES_RETURNED = ", GLASSES_RETURNED, typeof (GLASSES_RETURNED));
    $('.pfand_modal_button').removeClass('green');
    $('.pfand_button').removeClass('green');
    $(this).addClass('green');
    if (Number(GLASSES_RETURNED) > 4) {
        console.log("YES > 4")
        $(".pfand_button[data-value='5+']").addClass('green');
    }
    if (GLASSES_RETURNED == '0') {
        pfand_applicable = true;
        setTimeout(function () {
            $('.pfand_button').removeClass("green");
        }, 1000);
    }
    
    basketGrandTotals();
});

// CANCEL BUTTON: Empty basket once Cancel button is clicked at bottom of Grand Total section
$('.cancel_button').click(function () {
    ALL_PRODUCTS = [];
    VOUCHERS = [];
    DISCOUNTS = [];
    GLASSES_RETURNED = 0;
    pfand_applicable = true;
    $('.pfand_button').removeClass('green')
    $('.products_rows_div').empty();
    $('#total_number_of_products').text("# Products");
    $('#food_grand_total').text("€");
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
$('.payment_button').click(function () {
    if (ALL_PRODUCTS.length == 0) {
        $(".message-container").empty().append(`
            <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="arrow-up arrow-warning"></div>
                <div class="toast-header bg-warning text-dark">
                    <strong class="me-auto text-light">Oops</strong>There are no items in the order.
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`)
        $('.toast').toast('show');
        return
    }
    let payment_method_alternative = $(this).attr("data-payment_method_alternative")
    let payment_reason = $(this).attr("data-payment_reason")
    if (payment_reason == undefined) {
        payment_reason = null;
    }
    // console.log("payment_method_alternative", payment_method_alternative);

    // Functionality to allow a payment be submitted where the total due is 0 because the pfand covered the cost.
    // e.g. where a customer buys 1 Pfand Shot Special, but returns a glass. One cancels the other so amount submitted and amount due is 0
    if ((Line_Totals_Total * -1) >= Pfand_Total) {
        Payment_Method = "Pfand Payment" // This applies where the pfand is sufficient to cover the payment.
        $('#amount_tendered').val(0);
    };

    if (payment_method_alternative == "Complimentary" || payment_method_alternative == "Waste") {
        Pfand_Buttons_Total = 0;
        Line_Totals_Total = 0;
        Pfand_Total = 0;
        Amount_Tendered = 0;
        Total_Due = 0;
        Change_Due = 0;
        Payment_Method = payment_method_alternative;
    } else {
        if ($('#amount_tendered').val() == "") {
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
    let discounts = '';
    if (DISCOUNTS.length > 0) {
        
        $(DISCOUNTS).each(function () {
            if (this.name != 'Invalid') {
                console.log("DISCOUNT = ", this.discount_applied)
                discounts += this.discount_applied + ', ';
            }

        })
    }
    Grand_Total.Pfand_Buttons_Total = Pfand_Total;
    Grand_Total.Total_Products_Qty = Total_Products_Qty;
    Grand_Total.Line_Totals_Total = Line_Totals_Total;
    Grand_Total.Pfand_Total = Pfand_Total;
    Grand_Total.Amount_Tendered = Amount_Tendered;
    Grand_Total.Total_Due = Total_Due;
    Grand_Total.Change_Due = Change_Due;
    Grand_Total.Discounts = discounts;
    Grand_Total.Payment_Method = Payment_Method;
    Grand_Total.payment_reason = payment_reason;
    Grand_Total.staff_member = STAFF_ID;

    let sub_amount = Amount_Tendered - Total_Due;
    // console.log("PAYMENT BUTTONS FN: Sub Amount", sub_amount);

    if (Amount_Tendered < Total_Due) {
        var message_container = $(".message-container");
        $(message_container).empty().append(`
            <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="arrow-up arrow-warning"></div>
                <div class="toast-header bg-warning text-dark">
                    <strong class="me-auto text-light">Oops</strong>${ "Not Enough Tendered!!!" }
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`)
        $('.toast').toast('show');
    } else {
        console.log("NEW_BASKET", NEW_BASKET);
        console.log("Grand Total", Grand_Total);
        console.log("DISCOUNTS = ", DISCOUNTS)
        fetch(url, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify([{
                    NEW_BASKET
                }, {
                    Grand_Total
                }, {
                    DISCOUNTS
                }])
            })
            .then(response => response.json())
            .then(data => {
                console.log("response.data = ", data)
                if (data.status == "Checkout Complete") {
                    location.reload();
                }
            });
    }
});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        console.log("cookies = ", cookies)
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