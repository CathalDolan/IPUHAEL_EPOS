console.log("Calendar.js")

const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

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
    // day.href = "{% url 'past_orders' %}";
    day.textContent = i;
    // Highlight today's date
    if (
      i === today.getDate() &&
      year === today.getFullYear() &&
      month === today.getMonth()
    ) {
      day.classList.add('current-date', 'selected-date');
    }
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
  renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
});

calendarDates.addEventListener('click', (e) => {
  if (e.target.textContent !== '') {
    $('.calendar-dates').children('div').removeClass('selected-date')
    $(e.target).addClass('selected-date')
    // alert(`You clicked on ${e.target.textContent} ${months[currentMonth]} ${currentYear}`);
    console.log("this = ", e.target)

    var dayOfWeek = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var selectedDate = new Date(`${currentYear}-${currentMonth}-${e.target.textContent}`)
    // console.log("getDay(selectedDate) =", selectedDate.getDay())
    $('.datepicker').children('.header').text(months[currentMonth])
    $('.datepicker').children('section').text(e.target.textContent)
    $('.datepicker').children('.footer').text(dayOfWeek[selectedDate.getDay()])
    $('.calendar-body').hide(500)
    
    fetch(`https://8000-cathaldolan-ipuhaelepos-ttnjevm7y7g.ws-eu120.gitpod.io/past_orders?` + new URLSearchParams({
      day: e.target.textContent,
      month: currentMonth,
      year: currentYear,
    }).toString())
    .then(response => response.json())
    .then(data => {
      orders = data.orders;
      $('.content').empty();
      $('.no-entries').empty();
      var transaction_id = '';
      var rowcolors = ['row2', 'row1'];
      var transaction_counter = 0;
      if(orders.length<1) {
        $('.no-entries').append(
          `<h5 class="">No Entries Found</h5>`
        )
      }
      for(let i=0;i<orders.length;i++) {
        console.log("item = ", orders[i])
        const jsonData = `{"timeStamp":"${orders[i]['order_date_li']}"}`;
        const parsedData = JSON.parse(jsonData);
        const dateObject = new Date(parsedData.timeStamp);
        var day = dateObject.getDay()
        var date = dateObject.getDate()
        var month = dateObject.getMonth()
        var year = dateObject.getFullYear()
        var hours = dateObject.getHours()
        var minutes = dateObject.getMinutes()
        console.log(dateObject);  // Sat Mar 01 2025 12:34:56 GMT+0000 (UTC)
        if(orders[i]['grand_totals_id'] != transaction_id) {
          transaction_counter++;
          $('table').append(
            `<tr class="content ${rowcolors[transaction_counter%2]}">
                <td class="no-border-bottom left-align">${dayOfWeek[day].slice(0, 3)} ${date} ${months[month].slice(0, 3)} '${String(year).substr(2)}</td>
                <td class="no-border-bottom left-align">${hours}:${minutes}</td>
                <td class="no-border-bottom">${orders[i]['staff_member_id__name']}</td>
                <td class="no-border-bottom">${orders[i]['grand_totals_id__pfand_total'] }</td>
                <td class="no-border-bottom">${orders[i]['grand_totals_id__drinks_food_total'] }</td>
                <td class="no-border-bottom">${orders[i]['grand_totals_id__total_due'] }</td>
                <td class="no-border-bottom">${orders[i]['grand_totals_id__tendered_amount'] }</td>
                <td class="no-border-bottom">${orders[i]['grand_totals_id__change_due'] }</td>
                <td class="no-border-bottom">${orders[i]['grand_totals_id__payment_method'] }</td>
                <td class="no-border-bottom">${orders[i]['discount'] }</td>
                <td class="no-border-bottom">${orders[i]['grand_totals_id__number_of_products'] }</td>
                <td class="no-border-bottom">${orders[i]['name'] }</td>
                <td class="left-align">${orders[i]['quantity'] }</td>
                <td>${orders[i]['price_unit'] }</td>
                <td class="no-border-bottom" class="no-border-bottom">${orders[i]['grand_totals_id']}</td>
            </tr>`
          )
          
          console.log("tc= ", transaction_counter)
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
                <td class="no-border-bottom">${orders[i]['discount'] }</td>
                <td class="no-border-bottom">${orders[i]['grand_totals_id__number_of_products'] }</td>
                <td class="no-border-bottom">${orders[i]['name'] }</td>
                <td class="left-align">${orders[i]['quantity'] }</td>
                <td>${orders[i]['price_unit'] }</td>
                <td class="no-border-top no-border-bottom"></td>
            </tr>`
          )
          transaction_id = orders[i]['grand_totals_id'];
        }
        
      }
    })
    .catch(err => console.error(err));
    
    }


});

$('.datepicker').click(() => {
    $('.calendar-body').toggle(500)
})