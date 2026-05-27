console.log("eod_takings.js")
document.addEventListener("DOMContentLoaded", function () {
    const cashMatrix = document.getElementById("cash-matrix");
    const receiptsPanel = document.getElementById("receipts-panel");
    const grandTotalDisplay = document.getElementById("grand-total");
    
    // Locate the parent form element to handle submission blocks
    const formElement = cashMatrix.closest("form");

    // Force small input adjustments globally to optimize for 1280x800 size views
    document.querySelectorAll('input, select').forEach(el => {
        if (!el.classList.contains('btn')) el.classList.add('form-control-sm');
    });

    // --- SEQUENTIAL VERTICAL COLUMNS NAVIGATION ENGINE (TAB & ENTER) ---
    cashMatrix.addEventListener("keydown", function (event) {
        if (event.key !== "Tab" && event.key !== "Enter") return;

        const currentInput = event.target;
        if (currentInput.tagName !== "INPUT" && currentInput.tagName !== "TEXTAREA") return;

        // Skip metadata fields at the very top of the page
        if (currentInput.closest(".summary")) return;

        event.preventDefault();

        const currentColumn = currentInput.closest(".col-md-4") || currentInput.closest("#receipts-panel");
        if (!currentColumn) return;

        const allColumns = Array.from(cashMatrix.querySelectorAll(".col-md-4"));

        allColumns.push(receiptsPanel); // Add the receipts panel to the end of the navigation chain


        const currentColumnIndex = allColumns.indexOf(currentColumn);
        const isValueField = currentInput.name.endsWith('_value');
        
        let queryTarget = isValueField ? "input[name$='_value']" : "input:not([name$='_value'])";



        if (currentColumn.id === "receipts-panel") {
            queryTarget = "input, textarea"; // Targets the bottom horizontal row fields
            } 
        else if (!currentColumn.querySelector("input[name$='_value']")) {
            queryTarget = "input";
        }

        const verticalInputs = Array.from(currentColumn.querySelectorAll(queryTarget));
        const currentIndex = verticalInputs.indexOf(currentInput);

        if (event.shiftKey) {
            if (currentIndex > 0) {
                verticalInputs[currentIndex - 1].focus();
            } else if (currentColumnIndex > 0) {
                const prevColumn = allColumns[currentColumnIndex - 1];
                let prevQuery = isValueField ? "input[name$='_value']" : "input:not([name$='_value'])";



                if (prevColumn.id !== "receipts-panel" && !prevColumn.querySelector("input[name$='_value']")) prevQuery = "input";
                if (prevColumn.id === "receipts-panel") prevQuery = "input, textarea";


                const prevInputs = prevColumn.querySelectorAll(prevQuery);
                if (prevInputs.length > 0) {
                    prevInputs[prevInputs.length - 1].focus();
                }
            }
        } else {
            if (currentIndex < verticalInputs.length - 1) {
                verticalInputs[currentIndex + 1].focus();
            } else if (currentColumnIndex < allColumns.length - 1) {
                const nextColumn = allColumns[currentColumnIndex + 1];
                let nextQuery = isValueField ? "input[name$='_value']" : "input:not([name$='_value'])";
                if (nextColumn.id !== "receipts-panel" && !nextColumn.querySelector("input[name$='_value']")) nextQuery = "input";
                if (nextColumn.id === "receipts-panel") nextQuery = "input, textarea";
                
                const nextInputs = nextColumn.querySelectorAll(nextQuery);
                if (nextInputs.length > 0) {
                    nextInputs[0].focus();
                }
            }
        }
    });

    // --- CALCULATION AND BACKGROUND COLOR VALIDATION ---
    function calculateRowAndTotal(event) {
        const changedInput = event.target;
        const row = changedInput.closest("[data-multiplier]");
        if (!row) return;

        const multiplier = parseFloat(row.getAttribute("data-multiplier"));
        const countInput = row.querySelector("input[name$='_cent'], input[name$='_euro']");
        const valueInput = row.querySelector("input[name$='_value']");

        if (changedInput === countInput) {
            const count = parseInt(countInput.value) || 0;
            valueInput.value = (count * multiplier).toFixed(2);
            valueInput.style.backgroundColor = ""; 
            valueInput.removeAttribute("data-invalid-amount");
        } else if (changedInput === valueInput) {
            const value = parseFloat(valueInput.value) || 0;
            
            const remainder = value % multiplier;
            const isInvalid = remainder > 0.005 && Math.abs(remainder - multiplier) > 0.005;

            if (isInvalid && value > 0) {
                valueInput.style.backgroundColor = "#ffcccc"; 
                valueInput.setAttribute("data-invalid-amount", "true");
                countInput.value = Math.floor(value / multiplier); 
            } else {
                valueInput.style.backgroundColor = ""; 
                valueInput.removeAttribute("data-invalid-amount");
                countInput.value = Math.round(value / multiplier);
            }
        }

        updateGrandTotal();
    }

    function updateGrandTotal() {
        let runningSum = 0;
        cashMatrix.querySelectorAll("input[name$='_value']").forEach(valInput => {
            if (!valInput.hasAttribute("data-invalid-amount")) {
                runningSum += parseFloat(valInput.value) || 0;
            }
        });
        grandTotalDisplay.textContent = `€${runningSum.toFixed(2)}`;
    }

    // --- DECISIVE SUBMIT BLOCKER ENGINE ---
    if (formElement) {
        formElement.addEventListener("submit", function (event) {
            // Find any inputs marked as mathematically invalid
            const invalidFields = cashMatrix.querySelectorAll("[data-invalid-amount]");

            if (invalidFields.length > 0) {
                // 1. Prevent Django from handling submission [1]
                event.preventDefault();

                // 2. Flash an alert on screen to notify the staff member
                alert("Cannot submit: One or more fields have invalid figures (highlighted in red). Please correct them first.");

                // 3. Drive focus directly to the first broken input field to fix it quickly
                invalidFields[0].focus();
            }
        });
    }

    // Auto-select field text on focus so users don't have to manually delete '0'
    cashMatrix.addEventListener("focusin", function(event) {
        if (event.target.tagName === "INPUT" && event.target.type === "number") {
            event.target.select();
        }
    });

    cashMatrix.addEventListener("input", calculateRowAndTotal);
    updateGrandTotal();
});





