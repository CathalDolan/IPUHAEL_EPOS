console.log("JS is Working")

let baskets = document.querySelectorAll('.product_button');
let products = "";

for (let i=0; i < baskets.length; i++) {
    baskets[i].addEventListener('click', () => {
        products = baskets[i].innerHTML;
        basketQuantity();
    })
}

function basketQuantity(){
    let productNumbers = localStorage.getItem('basketQuantity');
    productNumbers = parseInt(productNumbers);

    if(productNumbers) {
        localStorage.setItem('basketQuantity', productNumbers + 1);
    } else {
        localStorage.setItem('basketQuantity', 1);
    }

    
}

// https://www.youtube.com/watch?v=PoTGs38DR9E&t=56s