console.log("JS is Working")

let buttons = document.querySelectorAll('.product_button');
let products = "";
let product_names = {};

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

        product_names.product_name = $(this).attr('name');
        product_name = product_names.product_name
        product_names.id = $(this).attr('id');
        id1 = product_names.id;
        product_names.price_03 = $(this).attr('data-price_03');
        product_names.price_04 = $(this).attr('data-price_04');
        product_names.price_pint = $(this).attr('data-price_pint');
        product_names.price_330 = $(this).attr('data-price_330');
        product_names.qty = 0;

        counter++;
        console.log("counter", counter);
        product_names.qty = counter;

        window.localStorage.setItem(product_name, JSON.stringify(product_names));
        var meta1 = JSON.parse(window.localStorage.getItem(product_name));
        console.log("meta1 Product Name", meta1.product_name);
        console.log("meta1 Product Qty", meta1.qty);

        console.log("Product Details", product_names);

        // console.log($(this));
        // Qty and Counter Section
        // counter++;
        const qty_row = document.createElement('p');
        qty_row.classList.add('qty_row');
        qty_row.setAttribute('id', products + '_qty_row');
        qty_row.innerHTML = counter;
        let qty_row_div = document.getElementById("qty_row_div");

        console.log( this.innerText + ' has been clicked ' + counter + ' times' );

        // if(counter == 1){
        //     qty_row_div.appendChild(qty_row);
        //     console.log("Yes");
        // } else {
        //     console.log("Need to increment number");
        // }
    } );
  })


// https://www.youtube.com/watch?v=PoTGs38DR9E&t=56s
