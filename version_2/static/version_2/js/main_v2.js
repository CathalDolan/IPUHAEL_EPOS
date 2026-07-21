console.log("main_2v.js")
const host = window.location.host;
var url = "";
if (host.includes("heroku")) {
    console.log("HEROKU");
    url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/version_2/";
} else {
    console.log("GITPOD");
    url = "http://127.0.0.1:8000/version_2/";
}

window.onload = function () {
    // Run this on your main layout page
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.cookie = "django_timezone=" + tz + "; path=/; max-age=31536000; SameSite=Lax";
    
    sessionStorage.setItem("staff", "");
    let till_display = sessionStorage.getItem("till_display");
    if (till_display == null) {
        till_display = "bar";
    }
    $("[data-bar_product]").parent().addClass("omit");
    $("[data-kitchen_product]").parent().addClass("omit");
    $("[data-gift_product]").parent().addClass("omit");
    
    $(`[data-${till_display}_product=True]`).parent().removeClass("omit");
    $(`#${till_display}-products`).addClass('selected');

    
    $('.drinks-measurement-row').hide()
    $('.food-measurement-row').hide()
    $('.gift-measurement-row').hide()

    if(till_display == "bar") {
        $('.drinks-measurement-row').show()
    }
    if(till_display == "kitchen") {
        $('.food-measurement-row').show()
    }
    // let products = $('.col-2:not(.omit)').children('.product-button')
    // products.each(function(index, elem) {
    //     if($(elem).attr('data-category') == "drink") {
    //         $('.drinks-measurement-row').show()
    //     }
    //     if($(elem).attr('data-category') == "food") {
    //         $('.food-measurement-row').show()
    //     }
    //     if($(elem).attr('data-category') == "gift") {
    //         $('.gift-measurement-row').show()
    //     }
    // })
    // Calls message toasts
    $(".toast").toast("show");
}

function getOrdinal(n) {
    let ord = 'th';
  
    if (n % 10 == 1 && n % 100 != 11)
    {
      ord = 'st';
    }
    else if (n % 10 == 2 && n % 100 != 12)
    {
      ord = 'nd';
    }
    else if (n % 10 == 3 && n % 100 != 13)
    {
      ord = 'rd';
    }
  
    return ord;
}

setInterval(function () {
    const now = new Date();
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    $('#day').text(days[now.getDay()]);
    $('#date').text(now.getDate() + getOrdinal(now.getDate()));
    $('#month').text(months[now.getMonth()]);
    $('#year').text(now.getFullYear())
    $('#hours').text(now.getHours() < 10 ? "0" + now.getHours() : now.getHours());
    $('#minutes').text(now.getMinutes() < 10 ? "0" + now.getMinutes()
    : now.getMinutes());
    $('#seconds').text(now.getSeconds() < 10 ? "0" + now.getSeconds()
    : now.getSeconds())
}, 1000)

$('#open_drink_modal').on('hidden.bs.modal', function () {
    $('input[name="drink-name"]').val("")
    $('input[name="price"]').val()
    $('input[name="pfand"]').val($('input[name="pfand"]').is(':checked'))
});


$('.magnify-icon-wrapper').on("click", function() {
    $('.basket').toggleClass('magnify')
    $('.mask').toggle()
    if($(this).children('.x').css('display') == "none") {
        $(this).children('.x').css('display', 'flex')
    }
    else {
        $(this).children('.x').css('display', 'none')
    }
    $(this).children('.fa-magnifying-glass').toggle()
})

// GLOBAL VARS----------------------------
var STAFF_ID = "";
var LATEST_PRODUCT_SELECTED = {};
var LATEST_PRODUCT = {};
var ALL_PRODUCTS = [];
var NEW_BASKET = [];
var DISCOUNTS = [];
var VOUCHERS = [];
var GLASSES_RETURNED = 0;
var GLASSES_OUT = 0;
// var PFAND = $('#pfand').attr('data-value');
var NO_PFAND = false;
var PFAND = 2.5;
var PFAND_TOTAL = 0;
var BASKET_TOTAL = 0;
var TOTAL_DUE = 0;
var CHANGE_DUE = 0;
var PRODUCTS_QTY = 0;
var PAYMENT_METHOD = "";
var PAYMENT_REASON = "";
var ALLOW_CHECKOUT = true;
var Grand_Total = {};

$(document).on("click", ".drinks-measure-button:not(.disabled)", function() {
    if($.isEmptyObject(LATEST_PRODUCT)) {
        return
    }
    else if(LATEST_PRODUCT.category == "drink") {
        $('.drinks-measure-button').removeClass('selected');
        $(this).addClass("selected");
        let size = $(this).attr("data-size");
        LATEST_PRODUCT.size = size;
        LATEST_PRODUCT.price = Number(LATEST_PRODUCT_SELECTED[`${size}`])
        LATEST_PRODUCT.line_total = LATEST_PRODUCT.qty * LATEST_PRODUCT.price;
        
        LATEST_PRODUCT_SELECTED.changed_size = true;
    }
    console.log("LATEST_PRODUCT_SELECTED = ", LATEST_PRODUCT_SELECTED)
    applySpecials()
    
})

$(document).on("click", ".modal-measure-button", function() {
    $(".modal-measure-button").removeClass("selected");
    $(this).addClass("selected")
})

$(document).on("click", ".food-measure-button:not(.disabled)", function() {
    if($.isEmptyObject(LATEST_PRODUCT)) {
        return
    }
    else if(LATEST_PRODUCT.category == "food") {
        $('.food-measure-button').removeClass('selected');
        $(this).addClass("selected");
        let size = $(this).attr("data-size");
        LATEST_PRODUCT.size = size;
        LATEST_PRODUCT.price = Number(LATEST_PRODUCT_SELECTED[`${size}`])
        LATEST_PRODUCT.line_total = LATEST_PRODUCT.qty * LATEST_PRODUCT.price
        LATEST_PRODUCT_SELECTED.changed_size = true;
    }
    applySpecials()
})

$(document).on("click", ".gift-measure-button:not(.disabled)", function() {
    if($.isEmptyObject(LATEST_PRODUCT)) {
        return
    }
    else if(LATEST_PRODUCT.category == "gift") {
        $('.gift-measure-button').removeClass('selected');
        $(this).addClass("selected");
        let size = $(this).attr("data-size");
        LATEST_PRODUCT.size = size;
        LATEST_PRODUCT.price = Number(LATEST_PRODUCT_SELECTED[`${size}`])
        LATEST_PRODUCT.line_total = LATEST_PRODUCT.qty * LATEST_PRODUCT.price
        LATEST_PRODUCT_SELECTED.changed_size = true;
    }
    applySpecials()
})

$('.product-selection-button').click(function() {
    let product_type = $(this).attr("data-products");
    $('.product-selection-button').removeClass('selected');
    $(this).addClass('selected');
    sessionStorage.setItem("till_display", $(this).attr('data-products'));
    $("[data-bar_product]").parent().addClass("omit");
    $("[data-kitchen_product]").parent().addClass("omit");
    $("[data-gift_product]").parent().addClass("omit");
    $(`[data-${product_type}_product=True]`).parent().removeClass('omit');

    $('.drinks-measurement-row').hide()
    $('.food-measurement-row').hide()
    $('.gift-measurement-row').hide()

    if(product_type == "bar") {
        $('.drinks-measurement-row').show()
    }
    if(product_type == "kitchen") {
        $('.food-measurement-row').show()
    }
    // if(product_type == "bar") {
    //     $('.drinks-measurement-row').show()
    // }
    console.log("product_type = ", product_type)
    // let products = $('.col-2:not(.omit)').children('.product-button')
    // products.each(function(index, elem) {
    //     if($(elem).attr('data-category') == "drink") {
    //         $('.drinks-measurement-row').show()
    //     }
    //     if($(elem).attr('data-category') == "food") {
    //         $('.food-measurement-row').show()
    //     }
    //     if($(elem).attr('data-category') == "gift") {
    //         $('.gift-measurement-row').show()
    //     }
    // })

})

$('.pfand-button.activate').click(function() {
    $('.pfand-button').removeClass('selected');
    $(".pfand-button[data-value='5+']").text(`5+`);
    if($(this).attr('data-value') == 'no-pfand') {
        NO_PFAND = true;
        $(this).addClass('selected');
    }
    else {
        if($(this).attr('data-value') != 'reset') {
            $(this).addClass('selected');
            GLASSES_RETURNED = Number($(this).attr("data-value"));
        }
        else {
            GLASSES_RETURNED = 0;
            NO_PFAND = false;
        }
    }
        
    if (Number($(this).attr("data-value")) > 4) {
        $(".pfand-button[data-value='5+']").addClass("selected").text(`${$(this).attr("data-value")} (5+)`);
    }
    basketGrandTotals()
})


$('.staff-member').click(function() {
    var name = $(this).attr("data-name");
    STAFF_ID = $(this).attr('data-id');
    
    sessionStorage.setItem("staff", $(this).attr('data-id'));
    $('.staff-table').hide();
    $('.mask').delay(250).hide(0);
    $('.basket').show();
    $('.basket-content').show();
    $('#staff-user').text(name);
})

$('#daily-takings').on('click', function(event) {
    event.preventDefault();
    const staffId = sessionStorage.getItem("staff");
    window.location.href = $(this).attr('href') + '?staff=' + encodeURIComponent(staffId);
});

$('.active-indicator').click(() => {
    $('.nav').toggle(250)
})

// Increment basket
$(document).on("click", ".increment", function() {
    console.log("ALL_PRODUCTS = ", ALL_PRODUCTS)
    console.log("$(this).data() = ", $(this).attr('data-product_id'))
    if($(this).parent().hasClass('latest-product')) {
        // GLASSES_RETURNED += 1;
        LATEST_PRODUCT.qty += 1;
        LATEST_PRODUCT.line_total = LATEST_PRODUCT.price * LATEST_PRODUCT.qty;
        // if(LATEST_PRODUCT.discount_applied == "Pfand Shot") {
        //     $('.pfand-button').removeClass('selected')
        //     $(".pfand-button[data-value='5+']").text(`5+`);
        //     $(`.pfand-button[data-value=${GLASSES_RETURNED}]`).addClass('selected')
        //     if (GLASSES_RETURNED > 4) {
        //         $(".pfand-button[data-value='5+']").addClass("selected").text(`${GLASSES_RETURNED} (5+)`);
        //     }
        // }
    }

    else {
        let product_index = ALL_PRODUCTS.findIndex(
            (item) =>
                item.product_id == `${$(this).attr('data-product_id')}` && item.size == `${$(this).attr('data-size')}`,
        );
        
        console.log("product_index = ", product_index)
        ALL_PRODUCTS[product_index].qty += 1;
        ALL_PRODUCTS[product_index].line_total = ALL_PRODUCTS[product_index].price * ALL_PRODUCTS[product_index].qty;
        // if(ALL_PRODUCTS[product_index].discount_applied == "Pfand Shot") {
        //     GLASSES_RETURNED += 1;
        //     $('.pfand-button').removeClass('selected')
        //     $(".pfand-button[data-value='5+']").text(`5+`);
        //     $(`.pfand-button[data-value=${GLASSES_RETURNED}]`).addClass('selected')
        //     if (GLASSES_RETURNED > 4) {
        //         $(".pfand-button[data-value='5+']").addClass("selected").text(`${GLASSES_RETURNED} (5+)`);
        //     }
        // }
    }
    applySpecials()
})

// Decrement basket
$(document).on("click", ".decrement", function() {
    if($(this).parent().hasClass('latest-product')) {
        if(LATEST_PRODUCT.qty > 1) {
            LATEST_PRODUCT.qty -= 1;
            LATEST_PRODUCT.line_total = LATEST_PRODUCT.price * LATEST_PRODUCT.qty;
        }
    }

    else {
        let product_index = ALL_PRODUCTS.findIndex(
        (item) =>
            Number(item.product_id) == `${Number($(this).attr('data-product_id'))}` && item.size == `${$(this).attr('data-size')}`,
        );
        if (ALL_PRODUCTS[product_index].qty > 1) {
            ALL_PRODUCTS[product_index].qty -= 1;
            ALL_PRODUCTS[product_index].line_total =
            ALL_PRODUCTS[product_index].price * ALL_PRODUCTS[product_index].qty;
        }
    }
    
    applySpecials()
})

// Remove item from basket
$(document).on("click", ".remove-product", function() {
    if($(this).parent().hasClass('latest-product')) {
        // if($(this).attr("data-discount_applied") == "Pfand Shot") {
        //     GLASSES_RETURNED -= Number($(this).attr("data-qty"));
        //     $('.pfand-button').removeClass('selected')
        //     $('.product-button').removeClass('disabled')
        //     $(".pfand-button[data-value='5+']").text(`5+`);
        //     $(`.pfand-button[data-value=${GLASSES_RETURNED}]`).addClass('selected')
        //     if (GLASSES_RETURNED > 4) {
        //         $(".pfand-button[data-value='5+']").addClass("selected").text(`${GLASSES_RETURNED} (5+)`);
        //     }
        // }
        
        LATEST_PRODUCT = {}
        LATEST_PRODUCT_SELECTED = {}
        
    }
    else {
        let product_index = ALL_PRODUCTS.findIndex(
            (item) =>
                item.product_id == `${$(this).attr('data-product_id')}` && item.size == `${$(this).attr('data-size')}`,
        );
        // if(ALL_PRODUCTS[product_index].discount_applied == "Pfand Shot") {
        //     GLASSES_RETURNED -= ALL_PRODUCTS[product_index].qty;
        //     $('.pfand-button').removeClass('selected')
        //     $('.product-button').removeClass('disabled')
        //     $(".pfand-button[data-value='5+']").text(`5+`);
        //     $(`.pfand-button[data-value=${GLASSES_RETURNED}]`).addClass('selected')
        //     if (GLASSES_RETURNED > 4) {
        //         $(".pfand-button[data-value='5+']").addClass("selected").text(`${GLASSES_RETURNED} (5+)`);
        //     }
        // }
        ALL_PRODUCTS.splice(product_index, 1);
    }
    
    applySpecials()
})

$(document).on("click", ".remove-special", function() {
    let special = $(this).attr('data-special');
    let voucher_index = VOUCHERS.findIndex(
        (item) => item == $(this).attr("data-special"),
    ); // Find this attribute in the VOUCHERS array
    
    VOUCHERS.splice(voucher_index, 1); // Remove this voucher from the VOUCHERS array
    applySpecials()
})

// Function to enter an open drink
$(".open-drink-submit").click(() => {
    let product_size = $(".drink.modal-measure-button.selected").attr("data-size");
    let product_qty = Number($('input[name="quantity"]').val());
    let product_name = $('input[name="drink-name"]').val();
    let category = $('input[name="category"]').val();
    let subcategory = $('input[name="subcategory"]').val();
    let abbr_name = $('input[name="drink-name"]').val();
    let product_price = Number($('input[name="price"]').val());
    let pfand_payable = $('input[name="pfand"]').prop("checked");
    if (product_qty == "") {
        $('input[name="quantity"]').next("p").text("Required");
        return;
    } else {
        $('input[name="quantity"]').next("p").text("");
    }
    if (product_name == "") {
        $('input[name="drink-name"]').next("p").text("Required");
        return;
    } else {
        $('input[name="drink-name"]').next("p").text("");
    }
    if (product_price == "") {
        $('input[name="price"]').next("p").text("Required");
        return;
    } else {
        $('input[name="price"]').next("p").text("");
    }
    if (pfand_payable) {
        pfand_payable = "True";
    }
    let line_total = product_qty * product_price;

    LATEST_PRODUCT = {
        category: category,
        subcategory: subcategory,
        name: product_name,
        abbr_name: product_name,
        size: product_size,
        qty: product_qty,
        price: product_price,
        line_total: line_total,
        pfand_payable: pfand_payable,
        discount_applied: "",
    };
    $("#open_drink_modal").modal("hide");
    applySpecials();
});

// function getFoodDrinkItems(el) {
//     console.log("el = ", el)
//     // const food_item_count = NEW_BASKET.filter(obj => obj.category === 'food' && obj.subcategory != 'extra_serving' && obj.subcategory != 'snack').length;
//     const results = NEW_BASKET.reduce((acc, item) => {
//         // Rule 1: Count items where subcategory is 'non_alcoholic'
//         if (item.subcategory === 'non_alcoholic') {
//           acc.nonAlcoholicCount++;
//         }
      
//         // Rule 2: Count food items, excluding 'extra_serving' and 'snack' subcategories
//         if (
//           item.category === 'food' && 
//           item.subcategory !== 'extra_serving' && 
//           item.subcategory !== 'snack'
//         ) {
//           acc.filteredFoodCount++;
//         }
      
//         return acc;
//     }, { nonAlcoholicCount: 0, filteredFoodCount: 0 });
      
//       // 2. Add 1 to represent the incoming drink being added right now
//     const totalDrinksWithNewOne = results.nonAlcoholicCount + 1;
    
//     console.log(`Current Food Quota: ${results.filteredFoodCount}, Total Drinks (including new one): ${totalDrinksWithNewOne}`);
    
//     // 3. If the total drinks fit within the food item quota, apply the discount
//     if (totalDrinksWithNewOne <= results.filteredFoodCount) {
//         return 2.50;
//     } else {
//         return 4.00;
//     }
// }
// function updateAllBasketPrices() {
//     // 1. Get the current total of valid food matches
//     const validFoodCount = NEW_BASKET.filter(item => 
//         item.category === 'food' && 
//         item.subcategory !== 'extra_serving' && 
//         item.subcategory !== 'snack'
//     ).length;

//     let discountedDrinksApplied = 0;

//     // 2. Loop through your actual basket structure
//     NEW_BASKET.forEach(item => {
//         // Look specifically for your 'non_alcoholic' subcategory
//         if (item.subcategory === 'non_alcoholic') {
//             if (discountedDrinksApplied < validFoodCount) {
//                 item.price = 2.50; // Discount applied!
//                 discountedDrinksApplied++;
//             } else {
//                 item.price = 4.00; // Standard price
//             }
//         }
//         else if(item.discount_applied != 'Pfand Shot' && item.discount_applied != "5 Shot Special") {
//             item.discount_applied = "";
//         }
//         item.line_total = item.price * item.qty;
//     });

//     console.log("Basket prices synchronized successfully.");
// }

$(".product-button").click(function() {
    
    console.log("$(this).attr('data-subcategory') = ", $(this).attr('data-subcategory'))
    if($(this).hasClass('disabled')) {
        return;
    }
    else if ($(this).attr("data-name") == "Chaser/Mix Special") {
        let check_draught = ALL_PRODUCTS.find(
            (item) => item.subcategory == `draught`,
        );
        if (check_draught == undefined) {
            $(".message-container").empty().append(`
                <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header toast-warning">
                        <strong class="me-auto">Oops!! </strong>Please add a draught drink first.
                        <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>`);
            $(".toast").toast("show");
            return;
        }
    }
    else if($(this).attr('data-name') == 'Pfand Shot') {
        $('.product-button').addClass('disabled');
        $('.open_drink').addClass('disabled');
        $('[data-name="Tullamore Original"]').removeClass('disabled');
        $('[data-name="Tullamore Honey"]').removeClass('disabled');
        $('[data-name="Tullamore Cafe Honey"]').removeClass('disabled');
        $('[data-name="Baileys"]').removeClass('disabled');
        $('.drinks-measure-button').removeClass('selected').addClass('disabled')
        $('.drinks-measure-button[data-size=single]').addClass('selected').removeClass('disabled')
        $(this).removeClass('disabled');

        if(LATEST_PRODUCT.discount_applied == "Pfand Shot") {
            LATEST_PRODUCT.qty += 1;
            LATEST_PRODUCT.line_total = LATEST_PRODUCT.qty * PFAND
        }
        else {
            if(!$.isEmptyObject(LATEST_PRODUCT)) {
                ALL_PRODUCTS.push(LATEST_PRODUCT)
            }
            LATEST_PRODUCT = {
                name: "",
                abbr_name: "",
                category: "",
                subcategory: "",
                subsubcategory: "",
                size: "single",
                qty: 1,
                price: PFAND,
                line_total: PFAND,
                pfand_payable: $(this).attr('data-pfand'),
                discount_applied: "Pfand Shot"
            }
        }
    }

    else if(LATEST_PRODUCT.discount_applied == "Pfand Shot") {
        LATEST_PRODUCT.product_id = $(this).attr('data-product_id')
        LATEST_PRODUCT.name = $(this).attr('data-name');
        LATEST_PRODUCT.abbr_name = $(this).attr('data-abbr_name');
        LATEST_PRODUCT.category = $(this).attr('data-category');
        LATEST_PRODUCT.subcategory = $(this).attr('data-subcategory');
        LATEST_PRODUCT.subsubcategory = $(this).attr('data-subsubcategory');
        // LATEST_PRODUCT.pfand_payable = $(this).attr('data-pfand');
        $('.product-button').removeClass('disabled')
        ALL_PRODUCTS.push(LATEST_PRODUCT)
        LATEST_PRODUCT = {}
    }

    else if($(this).attr('data-name') == "5 Shot Special") {
        $('.product-button').addClass('disabled');
        $('.open_drink').addClass('disabled');
        $('[data-subsubcategory=shots]').removeClass('disabled');
        $('.drinks-measure-button').removeClass('selected').addClass('disabled')
        $('.drinks-measure-button[data-size=single]').addClass('selected').removeClass('disabled')
        $(this).removeClass('disabled');

        if(LATEST_PRODUCT.discount_applied == "5 Shot Special") {
            LATEST_PRODUCT.qty += 1;
            LATEST_PRODUCT.line_total = LATEST_PRODUCT.qty * LATEST_PRODUCT.price
        }
        else {
            if(!$.isEmptyObject(LATEST_PRODUCT)) {
                ALL_PRODUCTS.push(LATEST_PRODUCT)
            }
            LATEST_PRODUCT = {
                name: "",
                abbr_name: "",
                category: $(this).attr('data-category'),
                subcategory: $(this).attr('data-subcategory'),
                subsubcategory: $(this).attr('data-subsubcategory'),
                size: $(this).attr('data-default_size'),
                qty: 1,
                price: Number($(this).attr(`data-${$(this).attr('data-default_size')}`)),
                line_total: $(this).attr(`data-${$(this).attr('data-default_size')}`),
                pfand_payable: $(this).attr('data-pfand'),
                discount_applied: "5 Shot Special"
            }

        }
    }
    else if(LATEST_PRODUCT.discount_applied == "5 Shot Special") {
        LATEST_PRODUCT.product_id = $(this).attr('data-product_id')
        LATEST_PRODUCT.name = $(this).attr('data-name');
        LATEST_PRODUCT.abbr_name = $(this).attr('data-abbr_name');
        LATEST_PRODUCT.category = $(this).attr('data-category');
        LATEST_PRODUCT.subcategory = $(this).attr('data-subcategory');
        LATEST_PRODUCT.subsubcategory = $(this).attr('data-subsubcategory');
        // LATEST_PRODUCT.pfand_payable = $(this).attr('data-pfand');
        $('.product-button').removeClass('disabled')
        ALL_PRODUCTS.push(LATEST_PRODUCT)
        LATEST_PRODUCT = {}
    }
    else {
        if($(this).data() == LATEST_PRODUCT_SELECTED && LATEST_PRODUCT_SELECTED.changed_size != true) {
            LATEST_PRODUCT.qty += 1;
            LATEST_PRODUCT.line_total = LATEST_PRODUCT.qty * LATEST_PRODUCT.price;
        }
        else {
            if(!$.isEmptyObject(LATEST_PRODUCT)) {
                let basket_product = ALL_PRODUCTS.filter(
                    (item) =>
                        item.product_id == `${LATEST_PRODUCT.product_id}` && item.size == `${LATEST_PRODUCT.size}`,
                );
                let basket_product_index = ALL_PRODUCTS.findIndex(
                    (item) =>
                        item.product_id == `${LATEST_PRODUCT.product_id}` && item.size == `${LATEST_PRODUCT.size}`,
                );
                if (basket_product.length > 0) {
                    ALL_PRODUCTS[basket_product_index].qty += LATEST_PRODUCT.qty;
                    ALL_PRODUCTS[basket_product_index].line_total =
                        ALL_PRODUCTS[basket_product_index].price * ALL_PRODUCTS[basket_product_index].qty;
                }
                else {
                    // LATEST_PRODUCT.discount_applied = "";
                    ALL_PRODUCTS.push(LATEST_PRODUCT);
                }
            }
            
            LATEST_PRODUCT_SELECTED = $(this).data();
            console.log("LATEST_PRODUCT_SELECTED = ", LATEST_PRODUCT_SELECTED)
            LATEST_PRODUCT_SELECTED.changed_size = false;
            $('.drinks-measure-button').removeClass('disabled selected')
            $('.food-measure-button').removeClass('disabled selected')
            $('.gift-measure-button').removeClass('disabled selected')
            if(LATEST_PRODUCT_SELECTED.subcategory == 'non_alcoholic' && sessionStorage.getItem("till_display") == 'kitchen') {
                $('.drinks-measure-button').addClass('disabled')
                $('.food-measure-button').addClass('disabled')
            }
            else {
                $.each(LATEST_PRODUCT_SELECTED, function(k, v) {
                    // console.log(k,':',v)
                    if(v == "None") {
                        $(`.drinks-measure-button[data-size=${k}]`).addClass('disabled')
                        $(`.food-measure-button[data-size=${k}]`).addClass('disabled')
                        $(`.gift-measure-button[data-size=${k}]`).addClass('disabled')
                    }
                    if(k == "default_size") {
                        $(`.drinks-measure-button[data-size=${v}]`).addClass('selected')
                        $(`.food-measure-button[data-size=${v}]`).addClass('selected')
                        $(`.gift-measure-button[data-size=${v}]`).addClass('selected')
                    }
                });
            }
            
            let default_size = `${LATEST_PRODUCT_SELECTED.default_size}`
            let default_price = LATEST_PRODUCT_SELECTED[default_size];
            let pfand_payable = $(this).attr("data-pfand")
            
            if(LATEST_PRODUCT_SELECTED.subcategory == "spirits_and_liquers" && sessionStorage.getItem("till_display") == 'gift') {
                default_size = 'bottle';
                default_price = LATEST_PRODUCT_SELECTED['bottle'];;
                pfand_payable = "False";
                LATEST_PRODUCT_SELECTED.changed_size = true;
            }
            LATEST_PRODUCT = {
                product_id: $(this).attr('data-product_id'),
                name: $(this).attr("data-name"),
                abbr_name: $(this).attr("data-abbr_name"),
                category: $(this).attr("data-category"),
                subcategory: $(this).attr("data-subcategory"),
                subsubcategory: $(this).attr("data-subsubcategory"),
                size: default_size,
                qty: 1,
                price: Number(default_price),
                line_total: Number(default_price),
                pfand_payable: pfand_payable,
                discount_applied: $(this).attr("data-name") == "5 Shots Special" ? "5 Shots Special" : ""
            }
        }
    }
    applySpecials()
    
})

$(document).on("click", ".specials_option", function () {
    let special = $(this).attr("data-special");
    // If the VOUCHERS array does not include this special value, then add it to the VOUCHERS array
    if (!VOUCHERS.includes(special)) {
        VOUCHERS.push(special);
        applySpecials();
    } else {
        // If the VOUCHERS array already contains the special then display a message toast
        $(".message-container").empty().append(`
            <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="arrow-up arrow-warning"></div>
                <div class="toast-header bg-warning text-dark">
                    <strong class="me-auto text-light">Oops</strong>A '${special}' voucher is already in use.
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`);
        $(".toast").toast("show");
        return;
    }
});



function applySpecials() {
    NEW_BASKET = JSON.parse(JSON.stringify(ALL_PRODUCTS));//https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/
    if(!$.isEmptyObject(LATEST_PRODUCT)) {
        NEW_BASKET.push(LATEST_PRODUCT)
    }
    
    console.log("NEW_BASKET = ", NEW_BASKET);
    // NEW_BASKET.forEach(item => {
    //     item.line_total = item.price * item.qty;
    //     if(item.discount_applied != 'Pfand Shot' && item.discount_applied != "5 Shot Special") {
    //         item.discount_applied = "";
    //     }
    // })
    const validFoodCount = NEW_BASKET.filter(item => 
        item.category === 'food'
    ).length;
    console.log("validFoodCount = ", validFoodCount);
    let discountedDrinksApplied = 0;

    // 2. Loop through your actual basket structure
    NEW_BASKET.forEach(item => {
        // Look specifically for your 'non_alcoholic' subcategory
        if (item.subcategory === 'non_alcoholic' && sessionStorage.getItem("till_display") == 'kitchen') {
            item.pfand_payable = "False";
            if (validFoodCount > 0) {
                item.discount_applied = "Food Special"
                item.price = 2.50; // Discount applied!
                discountedDrinksApplied++;
            } else {
                item.price = 4.00; // Standard price
                item.discount_applied = ""
            }
        }
        else if(item.discount_applied != 'Pfand Shot' && item.discount_applied != "5 Shot Special") {
            item.discount_applied = "";
            if(item.size == "bottle") {
                item.pfand_payable = "False";
            }
        }

        item.line_total = item.price * item.qty;
    });
    
    console.log("NEW_BASKET = ", NEW_BASKET);
    console.log("Basket prices synchronized successfully.");
    
    DISCOUNTS = []; // Reset the discounts applied
    if (VOUCHERS.includes("Student Discount")) {
        let discount_item = {}; // Reset the discounted item
        let total_discount = 0;
        // let status = "invalid";
        $.each(NEW_BASKET, function (index, item) {
            if (item.category == "food" && item.discount_applied == "") {
                if (item.price >= 6) {
                    item.discount_applied = "Student Discount";
                    item.line_total = (item.price * item.qty) - 1;
                    total_discount = 1;
                    discount_item = {
                        product: item.name,
                        size: "",
                        qty: "",
                        total_discount: total_discount,
                        special: "Student Discount",
                        status: "valid",
                    }
                    return false;
                }
                
            }
        });

        if($.isEmptyObject(discount_item)) {
            discount_item = {
                product: "",
                size: "",
                qty: "",
                total_discount: "",
                special: "Student Discount",
                status: "invalid",
            }
        }
        
        DISCOUNTS.push(discount_item);
    }
    if (VOUCHERS.includes("OAP Discount")) {
        let discount_item = {}; // Reset the discounted item
        let total_discount = 0;
        // let status = "invalid";
        $.each(NEW_BASKET, function (index, item) {
            if (item.category == "food" && item.discount_applied == "") {
                if (item.price >= 6) {
                    item.discount_applied = "OAP Discount";
                    item.line_total = (item.price * item.qty) - 1;
                    total_discount = 1;
                    discount_item = {
                        product: item.name,
                        size: "",
                        qty: "",
                        total_discount: total_discount,
                        special: "OAP Discount",
                        status: "valid",
                    }
                    return false;
                }
                
            }
        });

        if($.isEmptyObject(discount_item)) {
            discount_item = {
                product: "",
                size: "",
                qty: "",
                total_discount: "",
                special: "OAP Discount",
                status: "invalid",
            }
        }
        
        DISCOUNTS.push(discount_item);
    }
    // First check is if the 10 for 11 special is in the VOUCHERS array
    if (VOUCHERS.includes("10 for 11")) {
        console.log("YES 10 for 11")
        let discount_item = {}; // Reset the discounted item
        $.each(NEW_BASKET, function (index, item) {
            // Iterate through the NEW_BASKET array
            if (item.subcategory == "draught" && item.discount_applied == "") {
                // If there's a draught
                discount_item = {
                    // Create the discounted item with discounted prices applied
                    product: item.name,
                    size: item.size,
                    qty: 1,
                    total_discount: item.price,
                    special: "10 for 11",
                    status: "valid",
                };
                DISCOUNTS.push(discount_item); // Push this item to the DISCOUNTS array
                item.line_total = item.price * (item.qty - 1);
                item.discount_applied = "10 for 11"
                return false;
            }
        });
        // If no item can be found for this special, create an invalid special item and push to DISCOUNTS array
        if ($.isEmptyObject(discount_item)) {
            discount_item = {
                product: "",
                size: "",
                qty: "",
                total_discount: "",
                special: "10 for 11",
                status: "invalid",
            };
            DISCOUNTS.push(discount_item);
        }
    }

    // The next check is to apply the 2 for 1 special
    // TWO FOR ONE SPECIAL
    var single_items = [];
    if (VOUCHERS.includes("2 for 1")) {
        var double_item = false;
        let price = 0;
        let discount_item = {}; // Reset the discounted item
        $.each(NEW_BASKET, function (index, item) {
            if (item.category == "drink" && item.discount_applied == "")
                if (item.qty > 1) {
                    double_item = true;
                    if (Number(item.price) > price) {
                        price = item.price;
                        discount_item = {
                            product: item.name,
                            size: item.size,
                            qty: 1,
                            total_discount: item.price,
                            special: "2 for 1",
                            status: "valid",
                        };
                        single_items = [discount_item, discount_item];
                    }
                } else {
                    if (double_item == false) {
                        discount_item = {
                            product: item.name,
                            size: item.size,
                            qty: 1,
                            total_discount: item.price,
                            special: "2 for 1",
                            status: "valid",
                        };
                        single_items.push(discount_item);
                    }
                }
        });
        single_items.sort((a, b) => {
            return a.total_discount - b.total_discount;
        });
        single_items = single_items.slice(-2);
        if (single_items.length > 1) {
            discount_item = single_items[0];
        } else {
            discount_item = {
                special: "2 for 1",
                product: "",
                size: "",
                qty: "",
                status: "invalid",
                total_discount: "",
            };
        }

        index = NEW_BASKET.findIndex((obj) => {
            return (
                obj.name == discount_item.product && obj.size == discount_item.size
            );
        });
        if (index != -1) {
            NEW_BASKET[index].line_total = NEW_BASKET[index].price * (NEW_BASKET[index].qty - 1);
            NEW_BASKET[index].discount_applied = "2 for 1";
        }
        DISCOUNTS.push(discount_item);
    }

    //4 x 0.3 for €20 special
    // if (VOUCHERS.includes("4 x 0.3 for €20")) {
    //     console.log("4 x 0.3 for €20");
    //     discount_item = {};
    //     var items_indexed = [];
    //     var applicable_items = 0;
    //     //Iterate to see if there are enough 03's in the basket and save the item indexes of items that apply
    //     $.each(NEW_BASKET, function (index, item) {
    //         console.log(item);
    //         if (item.size == "03" && item.subcategory == "draught" && item.discount_applied == "") {
    //             for (let i = 0; i < item.qty; i++) {
    //                 items_indexed.push(index);
    //                 applicable_items++;
    //                 if (applicable_items > 3) {
    //                     var total_discount = -20;
    //                     for (let i = 0; i < items_indexed.length; i++) {
    //                         // console.log("NEW_BASKET[i] = ", NEW_BASKET[items_indexed[i]],);
    //                         NEW_BASKET[items_indexed[i]].line_total -= 0.5;
    //                         NEW_BASKET[items_indexed[i]].discount_applied = "4 x 0.3 for €20"
    //                         total_discount += NEW_BASKET[items_indexed[i]].price;
    //                     }
    //                     discount_item = {
    //                         product: item.name,
    //                         size: "03",
    //                         qty: 4,
    //                         total_discount: total_discount,
    //                         special: "4 x 0.3 for €20",
    //                         status: "valid",
    //                     };
    //                     DISCOUNTS.push(discount_item);
    //                     console.log("items_indexed = ", items_indexed);

    //                     return false;
    //                 }
    //             }
    //         }
    //     });

    //     if ($.isEmptyObject(discount_item)) {
    //         discount_item = {
    //             product: "",
    //             size: "",
    //             qty: "",
    //             total_discount: "",
    //             special: "4 x 0.3 for €20",
    //             status: "invalid",
    //         };
    //         DISCOUNTS.push(discount_item);
    //     }
    // }

    // // FIFTY % OFF SPECIAL
    if (VOUCHERS.includes("20% Off - Customer")) {
        let discount_item = {}; // Reset the discounted item
        var applicable_balance = 0;
        var total_discount = 0;
        $.each(NEW_BASKET, function (index, item) {
            if(item.discount_applied == "") {
                applicable_balance += (item.price * item.qty);
            }
            
        });
        
        // I changed (applicable_balance > 50) to (applicable_balance > 0) on 17/1/2025
        if (applicable_balance > 0) {
            $.each(NEW_BASKET, function (index, item) {
                if(item.discount_applied == "") {
                    total_discount += ((item.price * item.qty) * 0.2);
                    item.line_total = (item.price * item.qty) * 0.8;
                    item.discount_applied = "20% Off - Customer";
                }
                
            });
            discount_item = {
                product: "Various",
                size: "",
                qty: "",
                total_discount: total_discount,
                special: "20% Off - Customer",
                status: "valid",
            };
        } else {
            discount_item = {
                product: "",
                size: "",
                qty: "",
                total_discount: "",
                special: "20% Off - Customer",
                status: "invalid",
            };
        }
        DISCOUNTS.push(discount_item);
    }

    if (VOUCHERS.includes("20% Off - Austeller")) {
        let discount_item = {}; // Reset the discounted item
        var applicable_balance = 0;
        var total_discount = 0;
        $.each(NEW_BASKET, function (index, item) {
            if(item.discount_applied == "") {
                applicable_balance += (item.price * item.qty);
            }
            
        });
        
        // I changed (applicable_balance > 50) to (applicable_balance > 0) on 17/1/2025
        if (applicable_balance > 0) {
            $.each(NEW_BASKET, function (index, item) {
                if(item.discount_applied == "") {
                    total_discount += ((item.price * item.qty) * 0.2);
                    item.line_total = (item.price * item.qty) * 0.8;
                    item.discount_applied = "20% Off - Austeller";
                }
                
            });
            discount_item = {
                product: "Various",
                size: "",
                qty: "",
                total_discount: total_discount,
                special: "20% Off - Austeller",
                status: "valid",
            };
        } else {
            discount_item = {
                product: "",
                size: "",
                qty: "",
                total_discount: "",
                special: "20% Off - Austeller",
                status: "invalid",
            };
        }
        DISCOUNTS.push(discount_item);
    }
    
    if (VOUCHERS.includes("city voucher")) {
        voucher_value = 5.00;
        $.each(NEW_BASKET, function (index, item) {
            if(item.discount_applied == "" && voucher_value > 0) {
                if(item.line_total >= voucher_value) {
                    item.line_total -= voucher_value;
                    voucher_value = 0;
                    item.discount_applied = "City Voucher";
                }
                else {
                    voucher_value -= item.line_total;
                    item.line_total = 0;
                    item.discount_applied = "City Voucher";
                }
            }    
        });
        discount_item = {
            product: "Various",
            size: "",
            qty: "",
            total_discount: 5 - voucher_value,
            special: "City Voucher",
            status: "valid",
        };
        DISCOUNTS.push(discount_item);
    }
    update_basket();
}

function removeVowels(str) {
    if(str.length > 4) {
        // str.replace(/[aeiouAEIOU]/g, '');
        // str.replace(/[aeiouAEIOU]/g, '');
        return str.replace(/[_]/g, ' ');
    }
    else {
        return str;
    }
    
}

function update_basket() {
    console.log("update_basket()")
    $('.basket').find('tbody').empty();
    if(!$.isEmptyObject(LATEST_PRODUCT)) {
        $('.basket').find('tbody').prepend(
            `<tr class="latest-product">
                <td><span data-discount="${LATEST_PRODUCT.discount_applied != "" ? true : false}">${LATEST_PRODUCT.discount_applied}</span><span>${LATEST_PRODUCT.abbr_name}</span></td>
                <td>${removeVowels(LATEST_PRODUCT.size)}</td>
                <td>${LATEST_PRODUCT.qty}</td>
                <td>${LATEST_PRODUCT.price.toFixed(2)}</td>
                <td>${LATEST_PRODUCT.line_total.toFixed(2)}</td>
                <td class="increment" data-product_id="${LATEST_PRODUCT.product_id}" data-name="${LATEST_PRODUCT.name}" data-size="${LATEST_PRODUCT.size}"><i class="fas fa-plus"></i></td>
                <td class="decrement" data-product_id="${LATEST_PRODUCT.product_id}" data-name="${LATEST_PRODUCT.name}" data-size="${LATEST_PRODUCT.size}"><i class="fas fa-minus"></i></td>
                <td class="remove-product" data-product_id="${LATEST_PRODUCT.product_id}" data-name="${LATEST_PRODUCT.name}" data-size="${LATEST_PRODUCT.size}" data-qty="${LATEST_PRODUCT.qty}" data-discount_applied="${LATEST_PRODUCT.discount_applied}"><i class="fas fa-trash-alt"></i></td>
            </tr>`
        )
    }
    
    NEW_BASKET.reverse()
    $.each(NEW_BASKET, function(i) {
        if(i == 0 && !$.isEmptyObject(LATEST_PRODUCT)) {
            return;
        }
        else {
            $('.basket').find('tbody').append(
                `<tr>
                    <td><span data-discount="${this.discount_applied != "" ? true : false}">${this.discount_applied}</span><span>${this.abbr_name}</span></td>
                    <td>${removeVowels(this.size)}</td>
                    <td>${this.qty}</td>
                    <td>${this.price.toFixed(2)}</td>
                    <td>${this.line_total.toFixed(2)}</td>
                    <td class="increment" data-product_id="${this.product_id}" data-name="${this.name}" data-size="${this.size}"><i class="fas fa-plus"></i></td>
                    <td class="decrement" data-product_id="${this.product_id}" data-name="${this.name}" data-size="${this.size}"><i class="fas fa-minus"></i></td>
                    <td class="remove-product" data-product_id="${this.product_id}" data-name="${this.name}" data-size="${this.size}" data-qty="${LATEST_PRODUCT.qty}" data-discount_applied="${LATEST_PRODUCT.discount_applied}"><i class="fas fa-trash-alt"></i></td>
                </tr>`
            )
        }
        
    })

    if (DISCOUNTS.length != 0) {
        $('.discounts').show()
        $('.discounts').find('tbody').empty();
        $(DISCOUNTS).each(function (index, item) {
            $(".discounts").find('tbody').prepend(
                `<tr>
                    <td>${item["product"]}</td>
                    <td>${item["size"]}</td>
                    <td>${item["qty"]}</td>
                    <td>${item["total_discount"] == "" ? "" : item["total_discount"].toFixed(2)}</td>
                    <td>${item["special"]}</td>
                    <td data-status=${item.status}>${item.status}</td>
                    <td class="remove-special" data-special="${item.special}"><i class="fas fa-trash-alt"></i></td>
                </tr>
                `
            );
        });
    }
    else {
        $('.discounts').hide();
    }
    basketGrandTotals();
}

function basketGrandTotals() {
    console.log("basketGrandTotals()")
    GLASSES_OUT = 0;
    PRODUCTS_QTY = 0;
    PFAND_TOTAL = 0;
    BASKET_TOTAL = 0;
    TOTAL_DUE = 0;
    $(NEW_BASKET).each(function() {
        if(!$.isEmptyObject(this)) {
            BASKET_TOTAL += this.line_total;
            PRODUCTS_QTY += this.qty;
            if (this.pfand_payable == "True") {
                if (this.name == "Whiskey Platter") {
                    GLASSES_OUT += 6;
                    this.pfand = 6 * PFAND;
                } else {
                    GLASSES_OUT += this.qty;
                    this.pfand = PFAND;
                }
            }
            else {
                this.pfand = 0;
            }
            
        }
        
    })
    if(NO_PFAND == true) {
        PFAND_TOTAL = 0;
    }
    else {
        PFAND_TOTAL = (GLASSES_OUT - GLASSES_RETURNED) * PFAND
    }
    console.log("NEW_BASKET = ", NEW_BASKET);
    TOTAL_DUE = BASKET_TOTAL + PFAND_TOTAL;
    $('#drink_food_total').text("€" + BASKET_TOTAL.toFixed(2));
    $('#pfand_total').text("€" + PFAND_TOTAL.toFixed(2));
    $('#total_due').text("€" + TOTAL_DUE.toFixed(2));

    recalculate_change_due()
}

$("#amount_tendered").keyup(function(){
    recalculate_change_due();
});

function recalculate_change_due() {
    Amount_Tendered = parseFloat($("#amount_tendered").val());
    if (isNaN(Amount_Tendered) || Amount_Tendered <= TOTAL_DUE) {
        $("#change_due").text("€");
    } else {
        // Amount_Tendered.select(); // Supposed to highlight all text in the input when it's clicked. Or clear input
        CHANGE_DUE = Amount_Tendered - TOTAL_DUE;
        $("#change_due").text("€" + CHANGE_DUE.toFixed(2));
        PAYMENT_METHOD = "Cash";
    }
}

$(".cash-button:not(.exact-tendered-button)").click(function () {
    note_value = $(this).attr("data-value");
    $("#amount_tendered").val(note_value);
    PAYMENT_METHOD = $(this).attr("data-payment_method");
    // Call recalculate change due function
    recalculate_change_due();  
    checkoutTimer();
});

$('.exact-tendered-button').click(function() {
    $("#amount_tendered").val(TOTAL_DUE.toFixed(2));
    Amount_Tendered = TOTAL_DUE;
    $("#change_due").text("€0");
    PAYMENT_METHOD = "Cash";
    var valid = validate();
    if (valid === true) {
        if(ALLOW_CHECKOUT == true) {
            checkout();
        }
        
    }
})

$('#credit-card-button').click(function() {
    $("#amount_tendered").val(TOTAL_DUE.toFixed(2));
    Amount_Tendered = TOTAL_DUE;
    $("#change_due").text("€0");
    PAYMENT_METHOD = "Credit Card";
    var valid = validate();
    console.log("ALLOW_CHECKOUT = ", ALLOW_CHECKOUT)
    if (valid === true) {
        if(ALLOW_CHECKOUT == true) {
            checkout();
        }
        
    }
})

$(".cancel-button").click(function () {
    resetAll();   
});

function resetAll() {
    ALL_PRODUCTS = [];
    LATEST_PRODUCT = {};
    LATEST_PRODUCT_SELECTED = {};
    VOUCHERS = [];
    DISCOUNTS = [];
    GLASSES_RETURNED = 0;
    PFAND_TOTAL = 0;
    BASKET_TOTAL = 0;
    TOTAL_DUE = 0;
    ALLOW_CHECKOUT = true;
    $(".pfand-button").removeClass("selected");
    $(".basket").find('tbody').empty();
    $(".basket").hide();
    $(".discounts").find('tbody').empty();
    $(".discounts").hide();
    $("#processing-container").empty()
    $('.mask').show();
    $('.staff-table').show();
    $("#pfand_total").text("€");
    $("#drink_food_total").text("€");
    $("#total_due").text("€");
    $("#amount_tendered").val(0);
    $("#change_due").text("€");
    $('#staff-user').text('');
    resetCheckoutTimer();
}

$(".finish-button").click(function () {
    resetCheckoutTimer();
    var valid = validate();
    console.log("valid = ", valid)
    if (valid === true) {
        if(ALLOW_CHECKOUT == true) {
            checkout();
        }
    }
});

// Used for Waste and complimentary transactions
$(".payment_button").click(function () {
    PAYMENT_METHOD = $(this).attr("data-payment_method");
    PAYMENT_REASON = $(this).attr("data-payment_reason");
    checkout();
});

function validate() {
    // if (ALL_PRODUCTS.length == 0) {
    //     $(".message-container").empty().append(`
    //         <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
    //             <div class="arrow-up arrow-warning"></div>
    //             <div class="toast-header bg-warning text-dark">
    //                 <strong class="me-auto text-light">Oops</strong>There are no items in the order.
    //                 <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    //             </div>
    //         </div>`);
    //     $(".toast").toast("show");
    //     resetCheckoutTimer();
    //     return false;
    // }
    // if (Amount_Tendered == "") {
    //     $("#amount_tendered").addClass("error");
    //     var message_container = $(".message-container");
    //     $(message_container).append(`
    //         <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
    //             <div class="arrow-up arrow-warning"></div>
    //             <div class="toast-header bg-warning text-dark">
    //                 <strong class="me-auto text-light">Oops!</strong>${"Please add a tendered amount"}
    //                 <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    //             </div>
    //         </div>`);
    //     $(".toast").toast("show");
    //     resetCheckoutTimer();
    //     return false;
    // }
    if (Amount_Tendered < TOTAL_DUE) {
        var message_container = $(".message-container");
        $(message_container).empty().append(`
            <div class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="arrow-up arrow-warning"></div>
                <div class="toast-header bg-warning text-dark">
                    <strong class="me-auto text-light">Oops</strong>${"Not Enough Tendered!!!"}
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`);
        $(".toast").toast("show");
        resetCheckoutTimer();
        return false;
    }
    return true;
}

var timer;
var timerPaused = false;
var countdownCounter = 2;

$(".pause-button").click(() => {
    if (timerPaused === true) {
        timerPaused = false;
        $("#countdown").text("||");
        $(".pause-button").text("Resume");
    } else {
        timerPaused = true;
    }
});

function checkoutTimer() {
    const valid = validate();
    $(".pause-button").text("Pause");
    timerPaused = false;
    if (valid === true) {
        countdownCounter = 2;
        clearInterval(timer);
        timer = setInterval(countDown, 100);
        $(".checkout-timer-wrapper").show();
        $("#countdown").text(Math.ceil(countdownCounter).toFixed(0));
    } else {
        clearInterval(timer);
    }
}

function countDown() {
    if (timerPaused === false) {
        let path = $(".fg");
        $(".pause-button").text("Pause");
        countdownCounter -= 0.1;
        path.css("stroke-dashoffset", countdownCounter * 35);
        $("#countdown").text(Math.ceil(countdownCounter).toFixed(0));
        if (countdownCounter < 0) {
            clearInterval(timer);
            checkout();
        }
    } else {
        $(".pause-button").text("Resume");
        $("#countdown").text("||");
    }
}

function resetCheckoutTimer() {
    clearInterval(timer);
    countdownCounter = 2;
    timerPaused = false;
    $(".pause-button").text("Pause");
    $(".checkout-timer-wrapper").hide();
}

function checkout(payment_method, payment_reason) {
    console.log("checkout()")
    ALLOW_CHECKOUT = false;
    if (payment_reason == undefined) {
        payment_reason = "";
    }
    // Functionality to allow a payment be submitted where the total due is 0 because the pfand covered the cost.
    // e.g. where a customer buys 1 Pfand Shot Special, but returns a glass. One cancels the other so amount submitted and amount due is 0
    if (TOTAL_DUE - (GLASSES_RETURNED * PFAND) <= 0) {
        PAYMENT_METHOD = "Pfand Payment"; // This applies where the pfand is sufficient to cover the payment.
        $("#amount_tendered").val(0);
    }

    if (PAYMENT_METHOD == "Complimentary" || PAYMENT_METHOD == "Waste") {
        GLASSES_RETURNED = 0;
        PFAND_TOTAL = 0;
        BASKET_TOTAL = 0;
        Amount_Tendered = 0;
        TOTAL_DUE = 0;
        CHANGE_DUE = 0;
        DISCOUNTS = [];
        $.each(NEW_BASKET, function(index, item) {
            item.line_total = 0;
        })
    }

    let discounts = "";
    if (DISCOUNTS.length > 0) {
        $(DISCOUNTS).each(function () {
            if (this.status != "Invalid" && !(discounts.includes(this.status))) {
                discounts += this.special + " / ";
            }
        });
    }
    if (GLASSES_RETURNED == 'no-pfand') {
        GLASSES_RETURNED = 0;
    }

    Grand_Total.glasses_balance = GLASSES_RETURNED - GLASSES_OUT;
    Grand_Total.Pfand_Buttons_Total = GLASSES_RETURNED*PFAND;
    Grand_Total.Total_Products_Qty = PRODUCTS_QTY;
    Grand_Total.Line_Totals_Total = BASKET_TOTAL;
    Grand_Total.Pfand_Total = PFAND_TOTAL;
    Grand_Total.Amount_Tendered = Amount_Tendered;
    Grand_Total.Total_Due = TOTAL_DUE;
    Grand_Total.Change_Due = CHANGE_DUE;
    Grand_Total.Discounts = discounts;
    Grand_Total.Payment_Method = PAYMENT_METHOD;
    Grand_Total.payment_reason = PAYMENT_REASON;
    Grand_Total.staff_member = STAFF_ID;

    // let sub_amount = Amount_Tendered - Total_Due;
    $('.basket-content').hide();
    $('#processing-container').append(
        `<div class="processor">
            <h4>Processing...</h4>
            <span class='loader'></span>
        </div>`
    );
    fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json" // Good practice to include this
        },
        body: JSON.stringify([
            {NEW_BASKET,},
            {Grand_Total,},
            {DISCOUNTS,},
        ]),
    })
    .then((response) => {
        // 1. Check if the server returned an error status code (e.g., 400, 500)
        if (!response.ok) {
            // Parse the error payload from the server and pass it to the .catch() block
            return response.json().then((errData) => {
                console.log("errData = ", errData)
                throw new Error(errData.error || "Server Exception Occurred");
            });
        }
        return response.json();
    })
    .then((data) => {
        console.log("response.data = ", data);
        if (data.status == "Checkout Complete") {
            // location.reload();
            resetAll();
            $(".message-container").empty().append(
                `<div class="toast custom-toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <!-- <div class="w100 toast-capper bg-success"></div> -->
                <div class="toast-header toast-success">
                    <!-- <img src="..." class="rounded me-2" alt="..."> -->
                    <strong class="me-auto ">Success!</strong>Transaction Complete!
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`
            );
            
            setTimeout(function() {
                $(".message-container").empty()
            }, 2000); // Time in milliseconds
        }
        else {
            // Fixed: safely logged 'data' instead of the undefined 'response' variable
            console.log("Unexpected status response = ", data);
        }
    })
    .catch((error) => {
        console.error("Error:", error)

        $("#processing-container").empty().append(
            `
            <div class="row toast error-toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">${error}</strong>
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
            `
        );
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1),
                );
                break;
            }
        }
    }
    return cookieValue;
}

