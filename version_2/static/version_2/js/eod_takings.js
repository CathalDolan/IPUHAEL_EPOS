console.log("eod_takings.js")
document.addEventListener("DOMContentLoaded", function () {
    const cashMatrix = document.getElementById("cash-matrix");
    const receiptsPanel = document.getElementById("receipts-panel");
    const grandTotalDisplay = document.getElementById("grand-total");
    
    const formElement = cashMatrix.closest("form");
    const submitButton = formElement.querySelector(".submit-button");

    document.querySelectorAll('input, select, textarea').forEach(el => {
        if (!el.classList.contains('submit-button')) el.classList.add('form-control-sm');
    });

    // --- DECISIVE SEQUENCE NAVIGATION ENGINE ---
    formElement.addEventListener("keydown", function (event) {
        if (event.key !== "Tab" && event.key !== "Enter") return;

        const currentInput = event.target;
        
        // Let natural form submission happen if the user actively presses Enter ON the button
        if (currentInput === submitButton && event.key === "Enter" && !event.shiftKey) {
            return; 
        }

        if (currentInput.tagName !== "INPUT" && currentInput.tagName !== "TEXTAREA" && currentInput !== submitButton) return;
        if (currentInput.closest(".summary")) return;

        event.preventDefault();

        // 1. Map out the structural order of the layout columns
        const structuralColumns = Array.from(cashMatrix.querySelectorAll(".col-md-4")); 
        if (receiptsPanel) structuralColumns.push(receiptsPanel);
        if (submitButton) structuralColumns.push(submitButton);

        // 2. Identify where the focused element currently lives
        let activeContainer = currentInput.closest(".col-md-4") || currentInput.closest("#receipts-panel");
        if (currentInput === submitButton) {
            activeContainer = submitButton;
        }

        const activeContainerIndex = structuralColumns.indexOf(activeContainer);
        if (activeContainerIndex === -1) return;

        // 3. Gather targeting lanes based on entry column type
        const isValueField = currentInput.name && currentInput.name.endsWith('_value');
        
        // FIX: Ensure 'textarea' is included alongside input lanes
        let queryTarget = isValueField ? "input[name$='_value']" : "input:not([name$='_value']), textarea";

        if (activeContainer.id === "receipts-panel") {
            queryTarget = "input, textarea"; 
        } else if (activeContainer === submitButton) {
            queryTarget = ".submit-button";
        } else if (!activeContainer.querySelector("input[name$='_value']")) {
            queryTarget = "input";
        }

        const internalInputs = Array.from(activeContainer.querySelectorAll ? activeContainer.querySelectorAll(queryTarget) : [activeContainer]);
        const currentInternalIndex = internalInputs.indexOf(currentInput);

        if (event.shiftKey) {
            // --- BACKWARD ---
            if (currentInternalIndex > 0) {
                internalInputs[currentInternalIndex - 1].focus();
            } else if (activeContainerIndex > 0) {
                const targetContainer = structuralColumns[activeContainerIndex - 1];
                
                // FIX: Support textareas when navigating backwards into the receipts panel
                let prevQuery = isValueField ? "input[name$='_value']" : "input:not([name$='_value']), textarea";

                if (targetContainer.id === "receipts-panel") prevQuery = "input, textarea";
                else if (targetContainer === submitButton) prevQuery = ".submit-button";
                else if (!targetContainer.querySelector("input[name$='_value']")) prevQuery = "input";

                const prevInputs = Array.from(targetContainer.querySelectorAll ? targetContainer.querySelectorAll(prevQuery) : [targetContainer]);
                if (prevInputs.length > 0) {
                    prevInputs[prevInputs.length - 1].focus();
                }
            }
        } else {
            // --- FORWARD ---
            if (currentInternalIndex < internalInputs.length - 1) {
                internalInputs[currentInternalIndex + 1].focus();
            } else if (activeContainerIndex < structuralColumns.length - 1) {
                const targetContainer = structuralColumns[activeContainerIndex + 1];
                
                // FIX: Support textareas when navigating forward into the receipts panel
                let nextQuery = isValueField ? "input[name$='_value']" : "input:not([name$='_value']), textarea";
                
                if (targetContainer.id === "receipts-panel") nextQuery = "input, textarea";
                else if (targetContainer === submitButton) nextQuery = ".submit-button";
                else if (!targetContainer.querySelector("input[name$='_value']")) nextQuery = "input";
                
                const nextInputs = Array.from(targetContainer.querySelectorAll ? targetContainer.querySelectorAll(nextQuery) : [targetContainer]);
                if (nextInputs.length > 0) {
                    nextInputs[0].focus(); 
                }
            } else {
                // Wrap around to top-left if on the submit button
                const firstColumn = structuralColumns[0];
                const firstColumnInputs = Array.from(firstColumn.querySelectorAll(isValueField ? "input[name$='_value']" : "input:not([name$='_value'])"));
                if (firstColumnInputs.length > 0) {
                    firstColumnInputs[0].focus();
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
            const invalidFields = cashMatrix.querySelectorAll("[data-invalid-amount]");
            console.log(new FormData(document.querySelector('form')))
            if (invalidFields.length > 0) {
                event.preventDefault();
                alert("Cannot submit: One or more fields have invalid figures (highlighted in red). Please correct them first.");
                invalidFields[0].focus();
            }
        });
    }

    // Auto-select text on focus
    formElement.addEventListener("focusin", function(event) {
        if ((event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") && event.target.type !== "file") {
            event.target.select();
        }
    });

    cashMatrix.addEventListener("input", calculateRowAndTotal);
    updateGrandTotal();
    
    // --- DYNAMIC MULTI-RECEIPT FORMSET CLONER ENGINE ---
    // const addReceiptBtn = document.getElementById("add-receipt-btn");
    // const receiptsContainer = document.getElementById("receipts-container");
    // const totalFormsManagement = document.getElementById("id_form-TOTAL_FORMS");

    // if (addReceiptBtn && receiptsContainer && totalFormsManagement) {
    //     addReceiptBtn.addEventListener("click", function () {
    //         const currentRows = receiptsContainer.querySelectorAll(".receipts-form-row");
    //         const currentFormCount = currentRows.length;
            
    //         const cloneRow = currentRows[currentFormCount - 1].cloneNode(true);
            
    //         // FIX: This string replace safely targets BOTH the name="" AND id="" fields 
    //         // for the inputs, shifting form-0-image cleanly to form-1-image
    //         const formRegex = new RegExp(`form-${currentFormCount - 1}-`, 'g');
    //         cloneRow.innerHTML = cloneRow.innerHTML.replace(formRegex, `form-${currentFormCount}-`);
            
    //         cloneRow.querySelectorAll("input, textarea").forEach(input => {
    //             if (input.type === "hidden") {
    //                 input.value = ""; 
    //             } else if (input.type === "number") {
    //                 input.value = "0.00";
    //             } else if (input.type === "file") {
    //                 // CRITICAL FIX: Wiping out the file .value property on the clone row 
    //                 // breaks browser caching loops and prepares it to stream fresh bits
    //                 input.value = ""; 
    //             } else {
    //                 input.value = "";
    //             }
                
    //             if (input.closest(".image-upload-zone")) {
    //                 input.closest(".image-upload-zone").style.backgroundColor = "";
    //                 input.closest(".image-upload-zone").style.borderColor = "";
    //             }
    //         });

    //         const clonedFeedbackText = cloneRow.querySelector(".upload-feedback-text");
    //         if (clonedFeedbackText) {
    //             clonedFeedbackText.innerHTML = "";
    //             clonedFeedbackText.className = "upload-feedback-text small fw-bold mt-1 d-none";
    //         }

    //         receiptsContainer.appendChild(cloneRow);
    //         totalFormsManagement.value = currentFormCount + 1;
    //         receiptsContainer.scrollTop = receiptsContainer.scrollHeight;
    //     });
    // }
    // --- DYNAMIC MULTI-RECEIPT FORMSET ENGINE (ADD & REMOVE ROWS) ---
    const addReceiptBtn = document.getElementById("add-receipt-btn");
    const receiptsContainer = document.getElementById("receipts-container");
    const totalFormsManagement = document.getElementById("id_form-TOTAL_FORMS");

    // 1. ADD ROW UTILITY
    if (addReceiptBtn && receiptsContainer && totalFormsManagement) {
        addReceiptBtn.addEventListener("click", function () {
            const currentRows = receiptsContainer.querySelectorAll(".receipts-form-row");
            const currentFormCount = currentRows.length;
            
            const cloneRow = currentRows[currentFormCount - 1].cloneNode(true);
            
            const formRegex = new RegExp(`form-${currentFormCount - 1}-`, 'g');
            cloneRow.innerHTML = cloneRow.innerHTML.replace(formRegex, `form-${currentFormCount}-`);
            
            cloneRow.querySelectorAll("input, textarea").forEach(input => {
                if (input.type === "hidden") {
                    input.value = ""; 
                } else if (input.type === "number") {
                    input.value = "0.00";
                } else {
                    input.value = "";
                }
                
                if (input.closest(".image-upload-zone")) {
                    input.closest(".image-upload-zone").style.backgroundColor = "";
                    input.closest(".image-upload-zone").style.borderColor = "";
                }
            });

            const clonedFeedbackText = cloneRow.querySelector(".upload-feedback-text");
            if (clonedFeedbackText) {
                clonedFeedbackText.innerHTML = "";
                clonedFeedbackText.className = "upload-feedback-text small fw-bold mt-1 d-none";
            }

            receiptsContainer.appendChild(cloneRow);
            totalFormsManagement.value = currentFormCount + 1;
            receiptsContainer.scrollTop = receiptsContainer.scrollHeight;
        });
    }

    // 2. FIXED DELEGATED REMOVE ROW UTILITY
    if (receiptsContainer && totalFormsManagement) {
        receiptsContainer.addEventListener("click", function (event) {
            // Check if the clicked element is our remove button or its icon child
            const targetButton = event.target.closest(".remove-receipt-btn");
            if (!targetButton) return;

            const allRows = receiptsContainer.querySelectorAll(".receipts-form-row");
            
            // SAFEGUARD: Ensure users cannot delete the absolute last remaining row 
            // (Django formsets require at least 1 structure row present to prevent crashes)
            if (allRows.length <= 1) {
                alert("Cannot remove. You must maintain at least one receipt entry row.");
                return;
            }

            // Identify the explicit targeted row node block and extract it from the DOM
            const targetRow = targetButton.closest(".receipts-form-row");
            if (targetRow) {
                targetRow.remove();
                
                // 3. RE-INDEXING LOOP ROUTINE
                // Re-calculates and fixes string IDs sequentially to guarantee Django compliance
                const freshRows = receiptsContainer.querySelectorAll(".receipts-form-row");
                totalFormsManagement.value = freshRows.length; // Sync management counter total

                freshRows.forEach((row, newIndex) => {
                    // Update all dynamic parameters (names, ids, labels) to reflect the new sequential order
                    row.querySelectorAll("input, textarea, label").forEach(element => {
                        // Clean matching attributes
                        ['name', 'id', 'for'].forEach(attr => {
                            if (element.hasAttribute(attr)) {
                                const currentAttrVal = element.getAttribute(attr);
                                // Swaps old mismatched structural index digits with the clean 'newIndex' step
                                const updatedAttrVal = currentAttrVal.replace(/form-\d+-/, `form-${newIndex}-`);
                                element.setAttribute(attr, updatedAttrVal);
                            }
                        });
                    });
                });
            }
        });
    }



    // --- FIXED MULTI-ROW FILE UPLOAD CONFIRMATION FEEDBACK ENGINE ---
    if (receiptsContainer) {
        // Listen to any changes happening inside the receipts container block
        receiptsContainer.addEventListener("change", function (event) {
            const targetInput = event.target;
            
            // Check if the element that changed is a file upload input
            if (targetInput.tagName === "INPUT" && targetInput.type === "file") {
                // Find the specific container and feedback text area for THIS row
                const row = targetInput.closest(".receipts-form-row");
                if (!row) return;

                const uploadZone = row.querySelector(".image-upload-zone");
                let uploadFeedback = row.querySelector(".upload-feedback-text");

                // If our template doesn't have an error container, create a feedback element dynamically
                if (!uploadFeedback) {
                    uploadFeedback = document.createElement("div");
                    uploadFeedback.className = "upload-feedback-text small fw-bold mt-1";
                    targetInput.closest(".col-md-3").appendChild(uploadFeedback);
                }

                if (targetInput.files && targetInput.files.length > 0) {
                    const file = targetInput.files[0];
                    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    
                    // 1. Highlight the current upload element row box in light green
                    if (uploadZone) {
                        uploadZone.style.backgroundColor = "#e2f0d9";
                        uploadZone.style.borderColor = "#70ad47";
                    }
                    
                    // 2. Output localized information matching the specific selected file row
                    uploadFeedback.className = "upload-feedback-text small fw-bold mt-1 text-success";
                    uploadFeedback.innerHTML = `✓ Image Loaded: ${file.name.substring(0, 15)}... (${fileSizeMB} MB)`;
                    uploadFeedback.classList.remove("d-none");
                } else {
                    // Clear the styling rules if the file attachment gets removed
                    if (uploadZone) {
                        uploadZone.style.backgroundColor = "";
                        uploadZone.style.borderColor = "";
                    }
                    uploadFeedback.classList.add("d-none");
                    uploadFeedback.innerHTML = "";
                }
            }
        });
    }

    // --- GLOBAL RESET CONTROLLER ENGINE ---
    const globalResetBtn = document.getElementById("global-reset-btn");

    if (globalResetBtn) {
        globalResetBtn.addEventListener("click", function () {
            // 1. Double-check with the user to prevent accidental data loss
            const confirmWipe = confirm("Are you sure you want to clear the entire form? This will reset all cash counts, voucher quantities, and validation fields to zero.");
            if (!confirmWipe) return; // Cancel out immediately if they tap 'No' or 'Cancel'

            // 2. Loop through and clear every single dynamic field inside the cash matrix (Columns 1, 2, and 3)
            cashMatrix.querySelectorAll("input").forEach(input => {
                if (input.type === "number" || input.type === "text") {
                    // Reset denomination counts and voucher values to baseline numbers
                    const isValueField = input.name.endsWith('_value');
                    input.value = isValueField ? "0.00" : "0";
                    
                    // Clear out any lingering red validation background highlight parameters
                    input.style.backgroundColor = "";
                    input.removeAttribute("data-invalid-amount");
                }
            });

            // 3. Optional: Loop through and clear out your bottom horizontal receipts panel fields
            if (receiptsPanel) {
                receiptsPanel.querySelectorAll("input, textarea").forEach(input => {
                    if (input.type === "number") {
                        input.value = "0.00";
                    } else if (input.type !== "hidden" && input.type !== "file") {
                        input.value = "";
                    }
                    
                    // Reset green receipt image upload backgrounds if active
                    const uploadZone = input.closest(".image-upload-zone");
                    if (uploadZone) {
                        uploadZone.style.backgroundColor = "";
                        uploadZone.style.borderColor = "";
                    }
                });

                // Clear dynamic file upload text tags if present
                const uploadFeedback = receiptsPanel.querySelector(".upload-feedback-text");
                if (uploadFeedback) {
                    uploadFeedback.innerHTML = "";
                    uploadFeedback.classList.add("d-none");
                }
            }

            // 4. Force a full math sweep to update the header scoreboard back to €0.00
            updateGrandTotal();

            // 5. Automatically focus back to the 1c Count field to start fresh
            const firstCountInput = cashMatrix.querySelector("input");
            if (firstCountInput) firstCountInput.focus();
        });
    }


});
