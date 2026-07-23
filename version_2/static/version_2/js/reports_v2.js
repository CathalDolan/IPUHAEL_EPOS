// Open reports_v2.js and wrap your very first code lines like this:
document.addEventListener("DOMContentLoaded", () => {
	console.log("reports_v2.js loaded successfully");

	const scriptElement = document.getElementById("reports-script");
	if (!scriptElement) {
		console.error("Critical: Could not find script element placeholder");
		return;
	}
	const jsonFileUrl = scriptElement.dataset.jsonUrl;

	console.log("Targeting JSON endpoint location:", jsonFileUrl);

	fetch(jsonFileUrl)
	.then((response) => {
		if (!response.ok)
			throw new Error(`Network failure. Status: ${response.status}`);
		return response.json();
	})
	.then((loadedData) => {
		console.log(
			"JSON file successfully imported! Record count:",
			loadedData.length
		);

		window.parseISOString = d3.utcParse("%Y-%m-%d %H:%M:%S.%L%Z");

		// Pre-process raw data fields cleanly for Crossfilter
		loadedData.forEach(d => {
			d.order_date = d.order_date ? new Date(d.order_date) : null;
			d.price_line_total = cleanPrice(d);
		});
		prepopulateDatePickers(loadedData);
		initDatePickerListeners(loadedData);
		renderDashboardWithData(loadedData);
		console.log(loadedData)
	})
	.catch((error) => {
		console.error(
			"Critical Failure: Unable to fetch JSON file:",
			error
		);
	});
}); // 👈 Close the DOMContentLoaded block here

// Global chart handles accessible to all app modules
var hourlyChart, categoryChart, dataCountWidget, sunburstChart;
var ndx, dateDimension;

/**
 * Universal safe currency parser
 */
function cleanPrice(item) {
	return (
		parseFloat(
			String(item.price_line_total || "0")
				.replace(/[^0-9.,]/g, "")
				.replace(",", ".")
		) || 0
	);
}

/**
 * Fallback calculation engine when price_line_total is zero (Complimentary/Waste)
 */
function calculateEffectivePrice(v) {
	let price = cleanPrice(v);
	if (price === 0) {
		const quantity = parseInt(v.quantity, 10) || 0;
		const unitPrice =
			parseFloat(
				String(v.price_unit || "0")
					.replace(/[^0-9.,]/g, "")
					.replace(",", ".")
			) || 0;
		price = quantity * unitPrice;
	}
	return price;
}

/**
 * Pre-populates HTML date inputs with dataset boundary limits
 */
function prepopulateDatePickers(orderData) {
	if (!orderData || orderData.length === 0) return;

	let minDate = null;
	let maxDate = null;

	orderData.forEach((item) => {
		const rawDate = item.order_date;
		if (!rawDate) return;

		const currentParsed = new Date(rawDate);
		if (isNaN(currentParsed.getTime())) return;

		// 🚀 FIX 1: Mutate the item so Crossfilter gets the true Date Object!
    	item.order_date = currentParsed;

		if (!minDate || currentParsed < minDate) minDate = currentParsed;
		if (!maxDate || currentParsed > maxDate) maxDate = currentParsed;
	});

	function formatToDateInputString(dateObject) {
		if (!dateObject) return "";
		const year = dateObject.getFullYear();
		const month = String(dateObject.getMonth() + 1).padStart(2, "0");
		const day = String(dateObject.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	if (minDate && maxDate) {
		const fromInput = document.getElementById("date-from");
		const toInput = document.getElementById("date-to");

		if (fromInput && toInput) {
			fromInput.value = formatToDateInputString(minDate);
			toInput.value = formatToDateInputString(maxDate);
		}
	}
}

/**
 * Initializes date picker inputs using native Crossfilter range controls
 */
function initDatePickerListeners(orderData) {
	const fromInput = document.getElementById("date-from");
	const toInput = document.getElementById("date-to");
	const clearButton = document.getElementById("clear-date-filter");

	function processAndFilterData() {
		const fromVal = fromInput.value;
		const toVal = toInput.value;

		if (!fromVal || !toVal) return;

		const fromDate = new Date(fromVal);
		fromDate.setHours(0, 0, 0, 0);

		const toDate = new Date(toVal);
		toDate.setHours(23, 59, 59, 999);

		if (fromDate <= toDate) {
			console.log(
				`Filtering crossfilter data layer between: ${fromVal} and ${toVal}`
			);
			dateDimension.filterRange([fromDate, toDate]);
			dc.redrawAll();
		}
	}

	fromInput.addEventListener("change", processAndFilterData);
	toInput.addEventListener("change", processAndFilterData);

	clearButton.addEventListener("click", function () {
		console.log(
			"Resetting calendar ranges cleanly via crossfilter engine."
		);
		prepopulateDatePickers(orderData);
		dateDimension.filterAll();
		dc.redrawAll();
	});
}

/**
 * Main dashboard setup and orchestration pipeline
 */
function renderDashboardWithData(orderData) {
	// Instantiate Chart Elements
	hourlyChart = new dc.BarChart("#dc-hourly-chart");
	categoryChart = new dc.BarChart("#dc-category-chart");
	sunburstChart = new dc.SunburstChart("#dc-sunburst-chart");
	dataCountWidget = new dc.DataCount("#dc-data-count");
	console.log(
		"Rendering dashboard instance with active rows:",
		orderData.length
	);

	ndx = crossfilter(orderData);

	// 1. Setup Crossfilter Dimensions for our custom HTML dropdown menus
    const filterCategoryDimension = ndx.dimension(d => String(d.category || "Other").trim());
    const filterPaymentDimension = ndx.dimension(d => String(d.payment_method || "Other").trim());
	// 🚀 ADDED: Event Dimension matching your 'event_name' JSON key
    const filterEventDimension = ndx.dimension(d => String(d.event_name || "No Event").trim());

	const allRecordsDimension = ndx.dimension((d) => d);

	// Setup Dimensions
	const continuousHourDimension = ndx.dimension((currentItem) => {
		const rawIsoDate = currentItem.order_date;
		if (!rawIsoDate) return new Date(Date.UTC(1970, 0, 1));

		const dateObj = new Date(rawIsoDate);
		if (isNaN(dateObj.getTime())) return new Date(Date.UTC(1970, 0, 1));

		return new Date(
			Date.UTC(
				dateObj.getUTCFullYear(),
				dateObj.getUTCMonth(),
				dateObj.getUTCDate(),
				dateObj.getUTCHours()
			)
		);
	});

	const categoryDimension = ndx.dimension((currentItem) => {
		// 🚀 FIX 2A: Use category_name instead of category
    	return String(currentItem.category || "Other").toLowerCase().trim();
	});

	const multiTierProductDimension = ndx.dimension((d) => {
		const categoryName = String(d.category  || "Other")
			.toLowerCase()
			.trim();
		const productName = String(d.name || "Unknown Product").trim();
		const productSize = String(d.size || "Standard").trim();
		return [categoryName, productName, productSize];
	});

	// 2. Custom Group Reducer tracking all 6 requested fields per category
    const matrixCategoryGroup = categoryDimension.group().reduce(
        // Add Record Function
        (p, v) => {
			// console.log("v.category = ", v.category)
			const cat = v.category.toLowerCase().trim();
			const unitPrice = v.price_unit
            const qty = +v.quantity || 0;
            const lineTotal = +v.price_line_total || 0;
            const discountStr = String(v.discount || "").toLowerCase().trim();
            const method = String(v.payment_method || "").toLowerCase().trim();
            const reason = String(v.payment_reason || "").toLowerCase().trim();
			// console.log("cat = ", cat, discountStr)

            p.items_sold += qty;

            if (method.includes("waste") || reason.includes("waste") || discountStr.includes("waste")) {
                p.waste += unitPrice * qty;
            } else if (method.includes("complimentary") || reason.includes("complimentary") || discountStr.includes("comp")) {
                p.complimentary += unitPrice * qty;
            } else if (discountStr !== "" && discountStr !== "none") {
                p.discounted += ((unitPrice * qty) - lineTotal);
                if (method.includes("cash")) p.cash += lineTotal;
                if (method.includes("card")) p.card += lineTotal;
            } else {
                if (method.includes("cash")) p.cash += lineTotal;
                if (method.includes("card")) p.card += lineTotal;
            }
			// console.log("p = ", p)
            return p;
        },
        // Remove Record Function
        (p, v) => {
			const unitPrice = v.price_unit
            const qty = +v.quantity || 0;
            const lineTotal = +v.price_line_total || 0;
            const discountStr = String(v.discount || "").toLowerCase().trim();
            const method = String(v.payment_method || "").toLowerCase().trim();
            const reason = String(v.payment_reason || "").toLowerCase().trim();

            p.items_sold -= qty;

            if (method.includes("waste") || reason.includes("waste") || discountStr.includes("waste")) {
                p.waste -= unitPrice * qty;
            } else if (method.includes("complimentary") || reason.includes("complimentary") || discountStr.includes("comp")) {
                p.complimentary -= unitPrice * qty;
            } else if (discountStr !== "" && discountStr !== "none") {
                p.discounted -= ((unitPrice * qty) - lineTotal);
                if (method.includes("cash")) p.cash -= lineTotal;
                if (method.includes("card")) p.card -= lineTotal;
            } else {
                if (method.includes("cash")) p.cash -= lineTotal;
                if (method.includes("card")) p.card -= lineTotal;
            }
            return p;
        },
        // Init Object Function
        () => ({ items_sold: 0, cash: 0, card: 0, discounted: 0, waste: 0, complimentary: 0 })
    );

	// 🚀 STEP 1: Define the safe string-delimiter dimension right above the group
    const tableProductSizeDimension = ndx.dimension(d => {
        const pId   = String(d.product_id || "0").trim();
        const pName = String(d.name || "Unknown Product").trim();
        const pSize = String(d.size || "Standard").trim();
        return `${pId}:::${pName}:::${pSize}`;
    });

	// 2. Custom Group Reducer tracking all fields per product/size variation
    const matrixSizeGroup = multiTierProductDimension.group().reduce(
        (p, v) => {
			// console.log("1st p = ", p, v)
            const qty = +v.quantity || 0;
			const unitPrice = v.price_unit
            const lineTotal = +v.price_line_total || 0;
            const discountStr = String(v.discount || "").toLowerCase().trim();
            const method = String(v.payment_method || "").toLowerCase().trim();
            const reason = String(v.payment_reason || "").toLowerCase().trim();

            p.items_sold += qty;
            if (method.includes("waste") || reason.includes("waste") || discountStr.includes("waste")) {
                p.waste += (qty * unitPrice);
            } else if (method.includes("complimentary") || reason.includes("complimentary") || discountStr.includes("comp")) {
                p.complimentary += (qty * unitPrice);
            } else {
                if (discountStr !== "" && discountStr !== "none") p.discounted += ((qty * unitPrice) - lineTotal);
                if (method.includes("cash")) p.cash += lineTotal;
                if (method.includes("card")) p.card += lineTotal;
            }
            return p;
        },
        (p, v) => {
			// console.log("2nd p")
            const qty = +v.quantity || 0;
			const unitPrice = v.price_unit
            const lineTotal = +v.price_line_total || 0;
            const discountStr = String(v.discount || "").toLowerCase().trim();
            const method = String(v.payment_method || "").toLowerCase().trim();
            const reason = String(v.payment_reason || "").toLowerCase().trim();

            p.items_sold -= qty;
            if (method.includes("waste") || reason.includes("waste") || discountStr.includes("waste")) {
                p.waste -= (qty * unitPrice);
            } else if (method.includes("complimentary") || reason.includes("complimentary") || discountStr.includes("comp")) {
                p.complimentary -= (qty * unitPrice);
            } else {
                if (discountStr !== "" && discountStr !== "none") p.discounted -= ((qty * unitPrice) - lineTotal);
                if (method.includes("cash")) p.cash -= lineTotal;
                if (method.includes("card")) p.card -= lineTotal;
            }
            return p;
        },
        () => ({ items_sold: 0, cash: 0, card: 0, discounted: 0, waste: 0, complimentary: 0 })
    );
	// Setup Groups & Reducers
	const revenueByMultiTierGroup = multiTierProductDimension.group().reduceSum(calculateEffectivePrice);
	const rawHourlyGroup = continuousHourDimension.group().reduceSum(calculateEffectivePrice);

	const categoryRevenueGroup = categoryDimension.group().reduce(
		function (p, v) {
			let price = calculateEffectivePrice(v);
			const method = String(v.payment_method || "")
				.toLowerCase()
				.trim();
			const reason = String(v.payment_reason || "")
				.toLowerCase()
				.trim();
			// 🚀 FIX 3: Apply this matching fix to BOTH your custom add() and remove() reductions:
			const discount = String(v.line_discount || "")
				.toLowerCase()
				.trim();

			p.all += price;
			if (method.includes("cash")) p.cash += price;
			else if (method.includes("card") || method.includes("credit"))
				p.card += price;
			else if (
				method.includes("waste") ||
				reason.includes("waste") ||
				discount.includes("waste")
			)
				p.waste += price;
			else if (
				method.includes("comp") ||
				method.includes("free") ||
				reason.includes("comp") ||
				discount.includes("comp")
			)
				p.complimentary += price;
			return p;
		},
		function (p, v) {
			let price = calculateEffectivePrice(v);
			const method = String(v.payment_method || "")
				.toLowerCase()
				.trim();
			const reason = String(v.payment_reason || "")
				.toLowerCase()
				.trim();
			const discount = String(v.discount || "")
				.toLowerCase()
				.trim();

			p.all -= price;
			if (method.includes("cash")) p.cash -= price;
			else if (method.includes("card") || method.includes("credit"))
				p.card -= price;
			else if (
				method.includes("waste") ||
				reason.includes("waste") ||
				discount.includes("waste")
			)
				p.waste -= price;
			else if (
				method.includes("comp") ||
				method.includes("free") ||
				reason.includes("comp") ||
				discount.includes("comp")
			)
				p.complimentary -= price;
			return p;
		},
		function () {
			return { all: 0, cash: 0, card: 0, waste: 0, complimentary: 0 };
		}
	);

	const groupAllRevenue = allRecordsDimension.groupAll().reduce(
		(p, v) => {
			p.total += calculateEffectivePrice(v);
			return p;
		},
		(p, v) => {
			p.total -= calculateEffectivePrice(v);
			return p;
		},
		() => ({ total: 0 })
	);

	const filledHourlyGroup = {
		all: function () {
			const currentFilteredData = rawHourlyGroup.all();
			if (currentFilteredData.length === 0) return [];

			const minDate = new Date(d3.min(currentFilteredData, (d) => d.key));
			const maxDate = new Date(d3.max(currentFilteredData, (d) => d.key));

			const lookup = new Map(
				currentFilteredData.map((d) => [d.key.getTime(), d.value])
			);
			const fullTimeline = [];

			let currentCursor = new Date(
				Date.UTC(
					minDate.getUTCFullYear(),
					minDate.getUTCMonth(),
					minDate.getUTCDate(),
					minDate.getUTCHours()
				)
			);

			while (currentCursor <= maxDate) {
				const timeKey = currentCursor.getTime();
				fullTimeline.push({
					key: new Date(currentCursor),
					value: lookup.has(timeKey) ? lookup.get(timeKey) : 0,
				});
				currentCursor.setUTCHours(currentCursor.getUTCHours() + 1);
			}
			return fullTimeline;
		},
	};

    // 2. 🚀 UPDATED: Extract unique keys from your true dataset (orderData)
    const uniqueCategories = [...new Set(orderData.map(d => String(d.category || "Other").trim()))].sort();
    const uniquePayments = [...new Set(orderData.map(d => String(d.payment_method || "Other").trim()))].sort();
	// 🚀 ADDED: Extract unique event names
    const uniqueEvents = [...new Set(orderData.map(d => String(d.event_name || "No Event").trim()))].sort();


    // 3. Render Category Dropdown Options
    const catList = document.getElementById("category-filter-list");
    if (catList) {
        catList.innerHTML = uniqueCategories.map(cat => `
            <li class="form-check mb-1">
                <input class="form-check-input category-chk" type="checkbox" value="${cat}" id="chk-cat-${cat}" checked>
                <label class="form-check-label small text-capitalize" for="chk-cat-${cat}">${cat}</label>
            </li>
        `).join('');
    }

    // 4. Render Payment Dropdown Options
    const payList = document.getElementById("payment-filter-list");
    if (payList) {
        payList.innerHTML = uniquePayments.map(pay => `
            <li class="form-check mb-1">
                <input class="form-check-input payment-chk" type="checkbox" value="${pay}" id="chk-pay-${pay}" checked>
                <label class="form-check-label small" for="chk-pay-${pay}">${pay}</label>
            </li>
        `).join('');
    }
	// 🚀 5. ADDED: Render Event Dropdown Options
    const evtList = document.getElementById("event-filter-list");
    if (evtList) {
        evtList.innerHTML = uniqueEvents.map(evt => `
            <li class="form-check mb-1">
                <input class="form-check-input event-chk" type="checkbox" value="${evt}" id="chk-evt-${evt}" checked>
                <label class="form-check-label small" for="chk-evt-${evt}">${evt}</label>
            </li>
        `).join('');
    }

    // 5. Function to update Crossfilter when boxes are toggled
    function applyDropdownFilters() {
		console.log("applyDropdownFilters()")
        const activeCategories = Array.from(document.querySelectorAll('.category-chk:checked')).map(el => String(el.value).toLowerCase().trim());

        if (activeCategories.length === uniqueCategories.length) {
            filterCategoryDimension.filterAll();
        } else {
            // filterCategoryDimension.filterFunction(d => activeCategories.includes(d));
			// Evaluates string matches uniformly
            filterCategoryDimension.filterFunction(d => activeCategories.includes(String(d).toLowerCase().trim()));
        }

        const activePayments = Array.from(document.querySelectorAll('.payment-chk:checked')).map(el => String(el.value).toLowerCase().trim());
        if (activePayments.length === uniquePayments.length) {
            filterPaymentDimension.filterAll();
        } else {
            filterPaymentDimension.filterFunction(d => activePayments.includes(String(d).toLowerCase().trim()));
        }
		// 🚀 ADDED: Collect and evaluate checked event values
        const activeEvents = Array.from(document.querySelectorAll('.event-chk:checked')).map(el => String(el.value).toLowerCase().trim());
        if (activeEvents.length === uniqueEvents.length) {
            filterEventDimension.filterAll();
        } else {
            filterEventDimension.filterFunction(d => activeEvents.includes(String(d).toLowerCase().trim()));
        }

        dc.redrawAll();
		// 🚀 FORCED TABLE MATRIX RECALCULATION: Trigger updates directly from the checkbox event click
        renderFinancialMatrixTable();
        renderProductSizeMatrixTable();
    }

    // 6. Bind change events to all dynamically built checkbox targets
    document.querySelectorAll('.category-chk, .payment-chk, .event-chk').forEach(chk => {
        chk.addEventListener('change', applyDropdownFilters);
    });

	dateDimension = ndx.dimension((d) => {
		if (!d.order_date) return new Date(1970, 0, 1);
		const parsed = new Date(d.order_date);
		return isNaN(parsed.getTime()) ? new Date(1970, 0, 1) : parsed;
	});


    // 3. Render Matrix Rows dynamically whenever Crossfilter updates
    function renderFinancialMatrixTable() {
		console.log("renderFinancialMatrixTable()")
        const tableBody = document.getElementById("financial-matrix-body");
        if (!tableBody) return;

        // Fetch active calculated group items sorted alphabetically by category name
        const rowsData = matrixCategoryGroup.all();
		console.log("rowsData = ", rowsData)

        // Format currency helper
        const fmt = val => `€${Number(val).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // 🚀 INITIALIZE SUMMARY TOTAL TRACKERS
        let grandTotalItems = 0;
        let grandTotalCash = 0;
        let grandTotalCard = 0;
        let grandTotalDiscounted = 0;
        let grandTotalWaste = 0;
        let grandTotalComplimentary = 0;

        // Build individual rows and accumulate totals
        const rowsHtml = rowsData.map(row => {
            const cat = row.key;
            const data = row.value;

            // Don't render empty rows to keep the performance grid clean
            // if (data.items_sold === 0 && data.cash === 0 && data.card === 0 && data.waste === 0 && data.complimentary === 0) {
            //     return '';
            // }

            // 🚀 ACCUMULATE EACH COLUMN FOR THE FOOTER SUMMARY
            grandTotalItems += data.items_sold;
            grandTotalCash += data.cash;
            grandTotalCard += data.card;
            grandTotalDiscounted += data.discounted;
            grandTotalWaste += data.waste;
            grandTotalComplimentary += data.complimentary;

            return `
                <tr>
                    <td class="text-start fw-bold text-capitalize">${cat}</td>
                    <td class="text-center font-monospace">${data.items_sold.toLocaleString("en-IE")}</td>
                    <td class="text-center text-success font-monospace">${fmt(data.cash)}</td>
                    <td class="text-center text-success font-monospace">${fmt(data.card)}</td>
                    <td class="text-center font-monospace text-muted">${fmt(data.discounted)}</td>
                    <td class="text-center font-monospace text-danger">${fmt(data.waste)}</td>
                    <td class="text-center font-monospace text-info">${fmt(data.complimentary)}</td>
                </tr>
            `;
        }).join('');

        // Inject calculated category data into body container element
        tableBody.innerHTML = rowsHtml;

        // 🚀 DYNAMIC FOOTER RENDERING: Append or update the Summary Row
        const tableElement = document.getElementById("financial-matrix-table");
        if (tableElement) {
            // Check if a tfoot element already exists to prevent duplicate adding
            let tableFoot = tableElement.querySelector("tfoot");
            if (!tableFoot) {
                tableFoot = document.createElement("tfoot");
                tableElement.appendChild(tableFoot);
            }

            // Inject the calculated totals into the table footer layout grid
            tableFoot.innerHTML = `
                <tr class="table-secondary fw-bold">
                    <td class="text-start text-uppercase">Total Summary</td>
                    <td class="text-center font-monospace">${grandTotalItems.toLocaleString("en-IE")}</td>
                    <td class="text-center text-success font-monospace">${fmt(grandTotalCash)}</td>
                    <td class="text-center text-success font-monospace">${fmt(grandTotalCard)}</td>
                    <td class="text-center font-monospace">${fmt(grandTotalDiscounted)}</td>
                    <td class="text-center font-monospace text-danger">${fmt(grandTotalWaste)}</td>
                    <td class="text-center font-monospace text-info">${fmt(grandTotalComplimentary)}</td>
                </tr>
            `;
        }
    }

    // 3. Render Product Size Rows dynamically whenever Crossfilter updates
    function renderProductSizeMatrixTable() {
        const tableBody = document.getElementById("size-matrix-body");
        if (!tableBody) return;

        const rowsData = matrixSizeGroup.all();
		console.log("rowsData = ", rowsData)
		// 🚀 THE FIX: Sort the rows by total revenue (Cash + Card) descending
        rowsData.sort((a, b) => {
            const revenueA = (a.value.cash || 0) + (a.value.card || 0);
            const revenueB = (b.value.cash || 0) + (b.value.card || 0);
            return revenueB - revenueA; // Highest revenue first
        });

        const fmt = val => `€${Number(val).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        let totalItems = 0, totalCash = 0, totalCard = 0, totalDiscounted = 0, totalWaste = 0, totalComplimentary = 0;

        const rowsHtml = rowsData.map(row => {
            const data = row.value;

            // Hide variations with absolutely zero records active
            if (data.items_sold === 0 && data.cash === 0 && data.card === 0 && data.waste === 0 && data.complimentary === 0) {
                return '';
            }

            // 🚀 THE PERMANENT FIX: Read from the Array Key directly instead of using split()!
            // row.key is an array path: [category, product_name, product_size]
            const isArrayKey = Array.isArray(row.key);
            const productName = isArrayKey ? row.key[1] : row.key;
            const productSize = isArrayKey ? row.key[2] : "Standard";

            totalItems += data.items_sold;
            totalCash += data.cash;
            totalCard += data.card;
            totalDiscounted += data.discounted;
            totalWaste += data.waste;
            totalComplimentary += data.complimentary;

            return `
                <tr>
                    <td class="text-start fw-bold">${productName}</td>
                    <td class="text-center text-muted small text-capitalize">${productSize}</td>
                    <td class="text-center font-monospace">${data.items_sold.toLocaleString("en-IE")}</td>
                    <td class="text-center font-monospace">${fmt(data.cash)}</td>
                    <td class="text-center font-monospace">${fmt(data.card)}</td>
                    <td class="text-center font-monospace text-muted">${fmt(data.discounted)}</td>
                    <td class="text-center font-monospace text-danger">${fmt(data.waste)}</td>
                    <td class="text-center font-monospace text-info">${fmt(data.complimentary)}</td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = rowsHtml;

        // Append or update the Summary Row at the bottom of the table
        const tableElement = document.getElementById("size-matrix-table");
        if (tableElement) {
            let tableFoot = tableElement.querySelector("tfoot");
            if (!tableFoot) {
                tableFoot = document.createElement("tfoot");
                tableElement.appendChild(tableFoot);
            }
            tableFoot.innerHTML = `
                <tr class="table-secondary fw-bold sticky-bottom">
                    <td class="text-start text-uppercase" colspan="2">Total Summary</td>
                    <td class="text-center font-monospace">${totalItems.toLocaleString("en-IE")}</td>
                    <td class="text-center font-monospace">${fmt(totalCash)}</td>
                    <td class="text-center font-monospace">${fmt(totalCard)}</td>
                    <td class="text-center font-monospace">${fmt(totalDiscounted)}</td>
                    <td class="text-center font-monospace text-danger">${fmt(totalWaste)}</td>
                    <td class="text-center font-monospace text-info">${fmt(totalComplimentary)}</td>
                </tr>
            `;
        }
    }

    // 1. Configure 3-Tier Sunburst Chart (Keep your standard settings)
    sunburstChart
        .width(null) 
        .height(380)
        .dimension(multiTierProductDimension)
        .group(revenueByMultiTierGroup)
        .transitionDuration(400)
        .controlsUseVisibility(true)
        .innerRadius(30)
        .title((d) => {
            const labelPath = Array.isArray(d.key) ? d.key.join(" ➔ ") : d.key;
            return `text: €${d3.format(",.2f")(d.value)}`;
        })
        .ordinalColors(['#636efa', '#EF553B', '#ff9f1c', '#00cc96', '#ab63fa', '#19d3f3']);
    
    // 2. 🚀 THE NEW FIX: Let dc.js handle the visual rolling naturally, 
    // and intercept the filter event to update Crossfilter safely!
    sunburstChart.on('filtered', function(chart, filter) {
        if (!filter) {
            multiTierProductDimension.filterAll();
            return;
        }
    
        // Intercept the click path node (e.g. ["Drink", "Guinness"])
        multiTierProductDimension.filterFunction(function(recordArray) {
            if (!recordArray) return false;
            
            if (Array.isArray(filter)) {
                return filter.every((val, i) => recordArray[i] === val);
            }
            return recordArray[0] === filter;
        });
        
        // Trigger a global redraw for the OTHER charts on the dashboard
        dc.redrawAll();
    });
    

	// Configure Hourly Timeline
	hourlyChart
		.width(null)
		.height(350)
		.dimension(continuousHourDimension)
		.group(filledHourlyGroup)
		.transitionDuration(400)
		.x(d3.scaleUtc())
		.elasticX(true)
		.elasticY(true)
		.controlsUseVisibility(true)
		.xUnits(d3.timeHours)
		.centerBar(false)
		.barPadding(0.1)
		.xAxisLabel("Timeline Sequence (Hourly Blocks)")
		.margins({ top: 20, right: 30, bottom: 65, left: 60 });

	hourlyChart.on("renderlet.rotateLabels", function (chart) {
		chart
			.selectAll("g.x text")
			.style("text-anchor", "end")
			.attr("transform", "translate(-10, 2) rotate(-45)");
	});

	hourlyChart.xAxis().tickFormat(d3.timeFormat("%d %b %H:%M"));
	hourlyChart.yAxis().tickFormat((val) => `€${d3.format(",.2f")(val)}`);

	// Configure Category Breakdown Side-By-Side Chart
	const initialTotals = categoryRevenueGroup.all();
	const maxCategoryValue = d3.max(initialTotals, (d) => d.value.all) || 100;
	const lockedMaxLimit = maxCategoryValue * 1.15;

	categoryChart
		.width(null)
		.height(380)
		.dimension(categoryDimension)
		.group(categoryRevenueGroup, "All", (d) =>
			Number((d && d.value && d.value.all ? d.value.all : 0).toFixed(2))
		)
		.transitionDuration(400)
		.x(d3.scaleBand())
		.xUnits(dc.units.ordinal)
		.elasticY(false)
		.y(d3.scaleLinear().domain([0, lockedMaxLimit]))
		.controlsUseVisibility(true)
		.xAxisLabel("Categories Broken Down by Method")
		.margins({ top: 35, right: 20, bottom: 45, left: 60 })
		.ordinalColors(["#333333", "#636efa", "#EF553B", "#ff9f1c", "#00cc96"]);

	categoryChart.stack(categoryRevenueGroup, "Cash", (d) =>
		Number((d && d.value && d.value.cash ? d.value.cash : 0).toFixed(2))
	);
	categoryChart.stack(categoryRevenueGroup, "Credit Card", (d) =>
		Number((d && d.value && d.value.card ? d.value.card : 0).toFixed(2))
	);
	categoryChart.stack(categoryRevenueGroup, "Waste", (d) =>
		Number((d && d.value && d.value.waste ? d.value.waste : 0).toFixed(2))
	);
	categoryChart.stack(categoryRevenueGroup, "Complimentary", (d) =>
		Number(
			(d && d.value && d.value.complimentary
				? d.value.complimentary
				: 0
			).toFixed(2)
		)
	);

	categoryChart.on("preRender.sideBySide", function (chart) {
		chart.centerBar(false);
	});

	categoryChart.on("renderlet.sideBySide", function (chart) {
		const numStacks = 5;
		const stacks = chart.selectAll("g.stack");
		const totalBandWidth = chart.x().bandwidth();
		const barWidth = (totalBandWidth / numStacks) * 0.88;
		const spacing = (totalBandWidth / numStacks) * 0.12;
		const yScale = chart.y();
		const chartHeight = chart.effectiveHeight();

		stacks.each(function (d, stackIndex) {
			const currentStack = d3.select(this);

			currentStack
				.selectAll("rect.bar")
				.attr("width", barWidth)
				.attr("transform", function (barData) {
					const currentXTranslation =
						(barWidth + spacing) * stackIndex;
					return `translate(${currentXTranslation}, 0)`;
				})
				.attr("y", function (barData) {
					const trueValue =
						barData.data.value[
							Object.keys(barData.data.value)[stackIndex]
						];
					return yScale(trueValue);
				})
				.attr("height", function (barData) {
					const trueValue =
						barData.data.value[
							Object.keys(barData.data.value)[stackIndex]
						];
					return chartHeight - yScale(trueValue);
				});

			currentStack.selectAll("text.bar-label").remove();

			currentStack.selectAll("rect.bar").each(function (barData) {
				const targetKey = Object.keys(barData.data.value)[stackIndex];
				const trueVal = barData.data.value[targetKey];
				if (trueVal === 0) return;

				const currentBar = d3.select(this);
				const rawX =
					parseFloat(currentBar.attr("x")) +
					(barWidth + spacing) * stackIndex;
				const labelX = rawX + barWidth / 2;
				const labelY = yScale(trueVal) - 6;

				currentStack
					.append("text")
					.attr("class", "bar-label")
					.attr("x", labelX)
					.attr("y", labelY)
					.attr("text-anchor", "middle")
					.style("font-size", "9px")
					.style("font-weight", "bold")
					.style("fill", "#444")
					.text(`€${d3.format(",.2f")(trueVal)}`);
			});
		});
	});

	categoryChart.yAxis().tickFormat((val) => `€${d3.format(",.2f")(val)}`);
	categoryChart.legend(
		new dc.Legend().x(65).y(10).itemHeight(11).gap(8).horizontal(true)
	);

	// Configure Record Tracker Widget
	// Configure Record Tracker Widget with your exact original terms restored
	dataCountWidget.crossfilter(ndx).groupAll(ndx.groupAll()).html({
		some: "<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records | <a href='javascript:dc.filterAll(); dc.redrawAll();'>Reset All Filters</a>",
		all: "All records selected. Total records: <strong>%total-count</strong>",
	});

	// Custom Live Currency Counter Event Listener (Keeps working perfectly)
	hourlyChart.on("renderlet.revenueCounter", function () {
		const activeSummary = groupAllRevenue.value();
		const counterElement = document.getElementById("dc-revenue-counter");
		if (counterElement) {
			counterElement.textContent = `€${activeSummary.total.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
		}
	});

	// 2. Safely attach rendering callbacks to all active charts registered on the page
    // This loops over your loaded visual widgets and ensures that clicking any chart slice updates your tables.
    dc.chartRegistry.list().forEach(function (dashboardChart) {
        dashboardChart.on("filtered.tables", function () {
            renderFinancialMatrixTable();
            renderProductSizeMatrixTable();
        });
    });

    // Initial load runs to draw the spreadsheet data grids on startup
    renderFinancialMatrixTable();
    renderProductSizeMatrixTable();
	dc.renderAll();
	resizeCharts();
}

/** Handle dynamic structural sizing calculations */
function resizeCharts() {
	const hourlyContainer = document.getElementById("dc-hourly-chart");
	const categoryContainer = document.getElementById("dc-category-chart");
	const sunburstContainer = document.getElementById("dc-sunburst-chart");

	if (hourlyContainer && categoryContainer && hourlyChart && categoryChart) {
		const hourlyWidth = hourlyContainer.parentElement.clientWidth - 30;
		const categoryWidth = categoryContainer.parentElement.clientWidth - 30;

		hourlyChart.width(hourlyWidth).rescale();
		categoryChart.width(categoryWidth).rescale();

		if (sunburstContainer && sunburstChart) {
			const sunburstWidth =
				sunburstContainer.parentElement.clientWidth - 30;
			sunburstChart.width(sunburstWidth);
		}

		// 🚀 FIX 5: Use renderAll instead of redrawAll inside the resize wrapper
    	dc.renderAll();
	}
}

window.addEventListener("resize", resizeCharts);
