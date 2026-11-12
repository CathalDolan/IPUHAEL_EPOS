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

			// window.parseISOString = d3.utcParse("%Y-%m-%d %H:%M:%S.%L%Z");
			const parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S.%L%Z");

			// Pre-process raw data fields cleanly for Crossfilter
			loadedData.forEach((d) => {
				// Parse into a standard Date object
				const dateObj = parseDate(d.order_date.substring(0, 29)) || new Date(d.order_date);
				
				// FIX: Extract the primitive epoch millisecond number for Crossfilter sorting!
				d.timestampObj = dateObj; // Keep the object handy for d3 scale utilities if needed
				d.timestampEpoch = dateObj.getTime(); // This raw number safely prevents sorting recursion loops
				
				// Standardize metrics safely
				d.quantity = +d.quantity || 0;
				d.price_unit = +d.price_unit || 0;
				d.price_line_total = +d.price_line_total || 0;
				d.discount_calculated = (d.quantity * d.price_unit) - d.price_line_total;
			});
			
			renderDashboardWithData(loadedData);
		})
		.catch((error) => {
			console.error(
				"Critical Failure: Unable to fetch JSON file:",
				error
			);
		});
}); // 👈 Close the DOMContentLoaded block here

var ndx;
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

// 1. Declare your locale settings array
const euroLocale = d3.formatLocale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["€", ""] // This swaps the default dollar character with Euros globally
});

// Create a fast formatting helper to keep code clean
const formatEuro = euroLocale.format("$,.2f");

function renderDashboardWithData(orderData) {
	console.log("renderDashboardWithData")
	ndx = crossfilter(orderData);

	// Dimensions
	const eventDim = ndx.dimension((d) => d.event_name || "Missing Event");
	// Dimension 2: Dedicated strictly to the Event Dropdown Filter
	const eventFilterDim = ndx.dimension((d) => d.event_name || "Missing Event");
	const paymentDim = ndx.dimension((d) => d.payment_method || "Unspecified");
	const staffDim = ndx.dimension((d) => d.staff_member || "Unknown");
	const categoryDim = ndx.dimension((d) => d.category || "Uncategorized");
	const productDim = ndx.dimension((d) => d.name || "Unknown Item");
	// New stable setup:
	// Grouping by rolling hour windows using the fast primitive timestamp integer
	const hourDim = ndx.dimension(d => d3.utcDay(d.timestampObj).getTime());

	const timelineVolumeGroup = hourDim.group().reduceSum(d => d.price_line_total);
	// Isolate Accumulators (The custom reducers preventing dimension clashing)
	function buildMultiMetricReducer() {
		return {
			add: (p, v) => {
				p.qty += v.quantity;
				p.gross += v.price_line_total;
				p.net += v.price_line_total;
				p.discount += v.discount_calculated;
				if (v.payment_method === "Cash") p.cash += v.price_line_total;
				if (v.payment_method === "Credit Card") p.card += v.price_line_total;
				if (v.payment_method === "Complimentary") p.complimentary += (v.quantity * v.price_unit);
				if (v.payment_method === "Waste") p.waste += (v.quantity * v.price_unit);
				return p;
			},
			remove: (p, v) => {
				p.qty -= v.quantity;
				p.gross -= v.price_line_total;
				p.net -= v.price_line_total;
				p.discount -= v.discount_calculated;
				if (v.payment_method === "Cash") p.cash -= v.price_line_total;
				if (v.payment_method === "Credit Card") p.card -= v.price_line_total;
				if (v.payment_method === "Complimentary") p.complimentary -= (v.quantity * v.price_unit);
				if (v.payment_method === "Waste") p.waste -= (v.quantity * v.price_unit);
				return p;
			},
			init: () => ({
				qty: 0,
				gross: 0,
				net: 0,
				discount: 0,
				cash: 0,
				card: 0,
				complimentary: 0,
				waste: 0,
			}),
		};
	}

	const masterGroupAll = ndx
		.groupAll()
		.reduce(
			buildMultiMetricReducer().add,
			buildMultiMetricReducer().remove,
			buildMultiMetricReducer().init
		);
	const eventGroupMetrics = eventDim
		.group()
		.reduce(
			buildMultiMetricReducer().add,
			buildMultiMetricReducer().remove,
			buildMultiMetricReducer().init
		);
	const productGroupMetrics = productDim
		.group()
		.reduce(
			buildMultiMetricReducer().add,
			buildMultiMetricReducer().remove,
			buildMultiMetricReducer().init
		);
		// 1. Create a lightweight wrapper that filters out 0-quantity rows
	const activeEventGroup = {
		all: () => eventGroupMetrics.all().filter((d) => d.value.qty > 0),
		top: (n) => eventGroupMetrics.top(n).filter((d) => d.value.qty > 0),
		bottom: (n) => eventGroupMetrics.top(n).filter((d) => d.value.qty > 0)
	};
	
	// timelineVolumeGroup = hourDim.group().reduceSum((d) => d.quantity);

	// 1. KPI Value Assignments
	new dc.NumberDisplay("#kpi-cash")
		.group(masterGroupAll)
		.valueAccessor((d) => d.cash)
		.formatNumber(euroLocale.format("$,.2f")); 
	new dc.NumberDisplay("#kpi-card")
		.group(masterGroupAll)
		.valueAccessor((d) => d.card)
		.formatNumber(euroLocale.format("$,.2f")); 
	new dc.NumberDisplay("#kpi-discount")
		.group(masterGroupAll)
		.valueAccessor((d) => d.discount)
		.formatNumber(euroLocale.format("$,.2f")); 
	new dc.NumberDisplay("#kpi-complimentary")
		.group(masterGroupAll)
		.valueAccessor((d) => d.complimentary)
		.formatNumber(euroLocale.format("$,.2f")); 
	new dc.NumberDisplay("#kpi-waste")
		.group(masterGroupAll)
		.valueAccessor((d) => d.waste)
		.formatNumber(euroLocale.format("$,.2f")); 
	new dc.NumberDisplay("#kpi-qty")
		.group(masterGroupAll)
		.valueAccessor((d) => d.qty)
		.formatNumber(d3.format(",d"));

	// 2. Dropdowns Setup
	new dc.SelectMenu("#filter-event")
		.dimension(eventFilterDim)
		.group(eventFilterDim.group().reduceCount())
		.title((d) => d.key)
		.promptText("All Events");
	new dc.SelectMenu("#filter-payment")
		.dimension(paymentDim)
		.group(paymentDim.group().reduceCount())
		.title((d) => d.key)
		.promptText("All Payments");
	new dc.SelectMenu("#filter-staff")
		.dimension(staffDim)
		.group(staffDim.group().reduceCount())
		.title((d) => d.key)
		.promptText("All Staff");

	new dc.SelectMenu("#filter-category")
		.dimension(categoryDim)
		.group(categoryDim.group().reduceCount())
		.title((d) => d.key.charAt(0).toUpperCase() + d.key.slice(1).replace(/_/g, " "))
		.controlsUseVisibility(true)
		.promptText("All Categories");
	// 3. Time Series Linear Chart Setup
	// Isolate boundary points as raw timestamps
	const minDateEpoch = hourDim.bottom(1)[0].timestampEpoch;
	const maxDateEpoch = hourDim.top(1)[0].timestampEpoch;

	new dc.BarChart("#chart-timeline")
		.width(
			document.getElementById("chart-timeline").parentElement.offsetWidth - 40
		)
		.height(220)
		.dimension(hourDim)
		.group(timelineVolumeGroup)
		// FIX: Using the raw numeric range limits natively
    	.x(d3.scaleTime().domain([minDateEpoch - 86400000, maxDateEpoch + 86400000])) // +/- 1 day padding
		.xUnits(d3.utcHours)
		.elasticY(true)
		.brushOn(true)
		.yAxisLabel("Income €");

	// 4. Matrix Breakdown Tables
	new dc.DataTable("#table-events")
		.dimension(activeEventGroup)
		.group(() => "Event Aggregates")
		.size(Infinity)
		.columns([
			// FIX: Pull directly from the record row fields instead of d.key lookups!   .formatNumber(euroLocale.format("$,.2f")); 
			(d) => d.key,
			(d) => d.value.qty,
			(d) => formatEuro(d.value.cash || 0),
			(d) => formatEuro(d.value.card || 0),
			(d) => formatEuro(d.value.discount || 0),
			(d) => formatEuro(d.value.complimentary || 0),
			(d) => formatEuro(d.value.waste || 0)
		])
		// FIX: Access the field property name directly from the row record!
		.sortBy((d) => d.value.cash) // Natively sorts rows cleanly
    	.order(d3.descending);

	// 1. Point the product group to its own internal top-down sorting fallback
	productGroupMetrics.bottom = productGroupMetrics.top;
	new dc.DataTable("#table-products")
		.dimension(productGroupMetrics)
		.group(() => "Product Aggregates")
		.data((group) => group.all())
		.size(Infinity)
		.columns([
			// FIX 2: Since we are reading crossfilter GROUPS now, 'd' has a .key and a .value block!
			(d) => d.key,                                   // Unique Product Name
			(d) => d.value.qty,           // Beautifully Formatted Net Sales
			(d) => formatEuro(d.value.cash || 0),           // Combined Cash Volume
			(d) => formatEuro(d.value.card || 0),                             // Total Combined Quantity
			(d) => formatEuro(d.value.discount || 0),
			(d) => formatEuro(d.value.complimentary || 0),          // Beautifully Formatted Gross Sales
			(d) => formatEuro(d.value.waste || 0)             // Combined Card Volume
		])
		// FIX 3: Read your aggregate net values cleanly from the active group block
		.sortBy((d) => d.value.qty)
		.order(d3.descending);
	// Global Execution
	dc.renderAll();
}
