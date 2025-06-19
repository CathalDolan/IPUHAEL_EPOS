console.log("Calendar.js")
const host = window.location.host;
var url = '';
if(host.includes("heroku")) {
    console.log("HEROKU")
    url = "https://ipuhael-epos-8b5f0c382be3.herokuapp.com/past_orders"
}
else {
    console.log("GITPOD")
    url = "https://8000-cathaldolan-ipuhaelepos-ttnjevm7y7g.ws-eu120.gitpod.io/past_orders";
}
const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = currentDate;
let staffId = 0;
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function renderCalendar(month, year) {
  calendarDates.innerHTML = '';
  monthYear.textContent = `${months[month]} ${year}`;

  // Get the first day of the month
  const firstDay = new Date(year, month, 1).getDay();

  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create blanks for days of the week before the first day
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    calendarDates.appendChild(blank);
  }

   // Get today's date
  const today = new Date();

  // Populate the days
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.textContent = i;
    // Highlight today's date
    if (
      i === today.getDate() &&
      year === today.getFullYear() &&
      month === today.getMonth()
    ) {
      day.classList.add('current-date');
    }
    // Highlight selected date
     if (
      i === selectedDate.getDate() &&
      year === selectedDate.getFullYear() &&
      month === selectedDate.getMonth()
    ) {
      day.classList.add('selected-date');
    } 
    day.classList.add('calendar-date')
    calendarDates.appendChild(day);
  }

}

renderCalendar(currentMonth, currentYear);

prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  selectedDate.setMonth(currentMonth);
  selectedDate.setFullYear(currentYear);
  $('#calendar-header').text(months[currentMonth])
  $('#calendar-body').text(selectedDate.getDate());
  $('#calendar-footer').text(dayOfWeek[selectedDate.getDay()])
  renderCalendar(currentMonth, currentYear);
  getOrders();
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  selectedDate.setMonth(currentMonth);
  selectedDate.setFullYear(currentYear);
  $('#calendar-header').text(months[currentMonth])
  $('#calendar-body').text(selectedDate.getDate());
  $('#calendar-footer').text(dayOfWeek[selectedDate.getDay()])
  renderCalendar(currentMonth, currentYear);
  getOrders();
});

$('#prevDayBtn').click(() => {
  console.log("prevDayBtn clicked");
  selectedDate.setDate(selectedDate.getDate() - 1)
  currentMonth = selectedDate.getMonth()
  currentYear = selectedDate.getFullYear()
  $('#calendar-header').text(months[currentMonth])
  $('#calendar-body').text(selectedDate.getDate());
  $('#calendar-footer').text(dayOfWeek[selectedDate.getDay()])
  renderCalendar(currentMonth, currentYear);
  getOrders();
})

$('#nextDayBtn').click(() => {
  console.log("nextDayBtn clicked");
  selectedDate.setDate(selectedDate.getDate() + 1)
  currentMonth = selectedDate.getMonth()
  currentYear = selectedDate.getFullYear()
  $('#calendar-header').text(months[currentMonth])
  $('#calendar-body').text(selectedDate.getDate());
  $('#calendar-footer').text(dayOfWeek[selectedDate.getDay()])
  renderCalendar(currentMonth, currentYear);
  getOrders();
})

$('.calendar-dates').on('click', '.calendar-date', (e) => {
  if (e.target.textContent !== '') {
    console.log("e.target.textContent =", e.target.textContent)
    $('.calendar-dates').children('div').removeClass('selected-date')
    $(e.target).addClass('selected-date')
    var dayOfWeek = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    selectedDate = new Date(`${currentYear}-${currentMonth+1}-${e.target.textContent}`)
    $('#calendar-header').text(`${months[currentMonth]}`)
    $('#calendar-body').text(e.target.textContent)
    $('#calendar-footer').text(dayOfWeek[selectedDate.getDay()])
    $('.calendar').hide(500) 
    getOrders(); 
  }
});

$('#datepicker').click(() => {
    $('.calendar').toggle(500)
    $('.staff-list-container').hide(500)
})

$('#staff-picker').click(() => {
  $('.staff-list-container').toggle(500);
  $('.calendar').hide(500);
})

$('.staff-list-body').on('click','.staff-list-item', function() {
  $(this).toggleClass('selected-staff').siblings().removeClass('selected-staff')
  var staff_name = $(this).text();
  staffId = $(this).attr('data-staffId')
  $('#staff-footer').text(staff_name)
  $('.staff-list-container').hide(500);
  getOrders()
})

function getOrders() {
  fetch(`${url}?` + new URLSearchParams({
    day: selectedDate.getDate(),
    month: selectedDate.getMonth(),
    year: selectedDate.getFullYear(),
    staffId: staffId
  }).toString())
  .then(response => response.json())
  .then(data => {
    console.log("data = ", data)
    orders = data.orders;
    $('.content').empty();
    $('.no-entries').empty();
    var transaction_id = '';
    var rowcolors = ['row2', 'row1'];
    var transaction_counter = 0;
    if(orders.length<1) {
      $('.no-entries').append(
        `<h4 class="">No Entries Found For ${dayOfWeek[selectedDate.getDay()]}, ${formatOrdinals(selectedDate.getDate())} ${months[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}</h4>`
      )
    }
    for(let i=0;i<orders.length;i++) {
      const jsonData = `{"timeStamp":"${orders[i]['order_date_li']}"}`;
      const parsedData = JSON.parse(jsonData);
      const dateObject = new Date(parsedData.timeStamp);
      var day = dateObject.getDay()
      var date = dateObject.getDate()
      var month = dateObject.getMonth()
      var year = dateObject.getFullYear()
      var hours = dateObject.getHours()
      var minutes = dateObject.getMinutes()
      if(orders[i]['grand_totals_id'] != transaction_id) {
        transaction_counter++;
        $('table').append(
          `<tr class="content ${rowcolors[transaction_counter%2]}">
              <td class="no-border-bottom left-align">${dayOfWeek[day].slice(0, 3)} ${date}/${month+1}/${String(year).substr(2)}</td>
              <td class="no-border-bottom left-align">${hours}:${minutes<10?0:''}${minutes}</td>
              <td class="no-border-bottom">${orders[i]['staff_member_id__name']}</td>
              <td class="no-border-bottom">${orders[i]['grand_totals_id__pfand_total'] }</td>
              <td class="no-border-bottom">${orders[i]['grand_totals_id__drinks_food_total'] }</td>
              <td class="no-border-bottom">${orders[i]['grand_totals_id__total_due'] }</td>
              <td class="no-border-bottom">${orders[i]['grand_totals_id__tendered_amount'] }</td>
              <td class="no-border-bottom">${orders[i]['grand_totals_id__change_due'] }</td>
              <td class="no-border-bottom">${orders[i]['grand_totals_id__payment_method'] }</td>
              <td class="no-border-bottom">${orders[i]['grand_totals_id__payment_reason'] }</td>
              <td class="no-border-bottom">${orders[i]['discount'] }</td>
              <td class="no-border-bottom">${orders[i]['grand_totals_id__number_of_products'] }</td>
              <td class="no-border-bottom">${orders[i]['name'] }</td>
              <td class="left-align">${orders[i]['quantity'] }</td>
              <td class="left-align">${orders[i]['size'] }</td>
              <td>${orders[i]['price_unit'] }</td>
              <td class="no-border-bottom" class="no-border-bottom">${orders[i]['grand_totals_id']}</td>
          </tr>`
        )
        transaction_id = orders[i]['grand_totals_id'];
      }
      else {
        $('table').append(
          `<tr class="content ${rowcolors[transaction_counter%2]}">
              <td class="no-border-top no-border-bottom left-align"></td>
              <td class="no-border-top no-border-bottom left-align"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-top no-border-bottom"></td>
              <td class="no-border-bottom">${orders[i]['name'] }</td>
              <td class="left-align">${orders[i]['quantity'] }</td>
              <td class="left-align">${orders[i]['size'] }</td>
              <td>${orders[i]['price_unit'] }</td>
              <td class="no-border-top no-border-bottom"></td>
          </tr>`
        )
        transaction_id = orders[i]['grand_totals_id'];
      }
      
    }

    var staff_list = data.staff_list;
    $('.staff-list-body').empty();
    staff_list.forEach((item, index) => {
      if(item['staffId'] == staffId) {
        $('.staff-list-body').append(`<p class="staff-list-item selected-staff" data-staffId=${item['staffId']}>${item['name']}</p>`)
      }
      else {
        $('.staff-list-body').append(`<p class="staff-list-item" data-staffId=${item['staffId']}>${item['name']}</p>`)
      }
      
    })
  })
  .catch(err => console.error(err));   
}

const pr = new Intl.PluralRules("en-US", { type: "ordinal" });

const suffixes = new Map([
  ["one", "st"],
  ["two", "nd"],
  ["few", "rd"],
  ["other", "th"],
]);
const formatOrdinals = (n) => {
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
};