console.log("item_bulk_edit.js")

// $('input[type=checkbox]').each((index, element) => {
//     // console.log("element = ", element)
//     if($(element).is(':checked')) {
//         // console.log("YESSS CHECKED")
//         $(element).attr('data-initial', true)
//     }
//     else {
//         $(element).attr('data-initial', false)
//     }
// });


// $('select').each(function() {
//     $(this).data('initial-value', $(this).val())
//     // console.log($(this).data())

//     $('select').on('change', function() {
//         // const $this = $(this);
//         const hasChanged = $(this).val() !== $(this).data('initial-value');

//         // 4. Add or remove the CSS class
//         $(this).toggleClass('changed-input', hasChanged);
//     });
// })


// $('input[type=checkbox]').change(function() {
//     console.log("CHANGED", $(this).is(':checked'), $(this).attr('data-initial'))
//     $('.button').addClass("changed")
//     // $('.button::before').css({"background-color": "orange"})
//     if($(this).is(':checked').toString() != $(this).attr('data-initial')) {
//         console.log("ADDED")
//         $(this).addClass("changed-checkbox")   
//     }
//     else {
//         console.log("REMOVED")
//         $(this).removeClass("changed-checkbox")
//     }
// })


// $("input").keyup(function(){
//     console.log($(this).attr('value'));
//     if($(this).val() != $(this).attr('value')) {
//         $(this).addClass("changed-input");
//     }
//     else {
//         $(this).removeClass("changed-input");
//     }
// });


// $(document).ready(function() {
//     // 1. Target all relevant form fields
//     const $fields = $('select, input, textarea');

//     // 2. Record the initial value/state on page load
//     $fields.each(function() {
//         const $field = $(this);
        
//         if ($field.is(':checkbox, :radio')) {
//             // Store true/false for checked states
//             $field.data('initial-state', $field.prop('checked'));
//         } else {
//             // Store strings for text, textarea, and select
//             $field.data('initial-state', $field.val());
//         }
//     });

//     // 3. Listen for user input and changes
//     // 'input' catches instant typing; 'change' catches dropdowns/checkboxes
//     $fields.on('input change', function() {
//         const $field = $(this);
//         let hasChanged = false;

//         if ($field.is(':checkbox, :radio')) {
//             // Compare current checked state to original checked state
//             hasChanged = $field.prop('checked') !== $field.data('initial-state');
//         } else {
//             // Compare current text/select value to original value
//             hasChanged = $field.val() !== $field.data('initial-state');
//         }

//         // 4. Toggle the indicator class based on change status
//         $field.toggleClass('changed-input', hasChanged);
//     });
// });

$(document).ready(function() {
    const $fields = $('select, input, textarea');

    // 1. Record initial states on page load
    $fields.each(function() {
        const $field = $(this);
        if ($field.is(':checkbox, :radio')) {
            $field.data('initial-state', $field.prop('checked'));
        } else {
            $field.data('initial-state', $field.val() || '');
        }
    });

    // 2. Listen for user input and changes
    $fields.on('input change', function() {
        const $field = $(this);
        let hasChanged = false;

        if ($field.is(':checkbox, :radio')) {
            hasChanged = $field.prop('checked') !== $field.data('initial-state');
        } else {
            hasChanged = ($field.val() || '') !== $field.data('initial-state');
        }

        // 3. Highlight the specific field in red
        $field.toggleClass('field-changed', hasChanged);

        // 4. Find the parent row and highlight it in pink
        // Change 'tr' to '.form-row' or 'div' if you are not using a table structure
        const $parentRow = $field.closest('tr'); 
        
        if (hasChanged) {
            $parentRow.addClass('row-changed');
        } else {
            // Check if any OTHER fields inside this same row are still changed 
            // before completely removing the pink row highlight
            const changesInRow = $parentRow.find('.field-changed').length > 0;
            if (!changesInRow) {
                $parentRow.removeTemplateClass || $parentRow.removeClass('row-changed');
            }
        }
    });
});


