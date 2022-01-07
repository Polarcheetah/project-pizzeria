import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.targetTableId = '';

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    //console.log('getData params', params);

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.bookings +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsRepeat.join('&'),
    };

    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        //console.log('bookings', bookings);
        //console.log('eventsCurrent', eventsCurrent);
        //console.log('eventsRepeat', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    //console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      //console.log('loop', hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] === 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] === 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ===
        'undefined'
    ) {
      allAvailable = true;
      console.log('allAvailable', allAvailable);
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTables(event) {
    const thisBooking = this;
    //check if clicked element is a table
    if (event.target.classList.contains('table')) {
      //check if target element doesnt contain 'booked' class

      if (!event.target.classList.contains(classNames.booking.tableBooked)) {
        if (
          !event.target.classList.contains(classNames.booking.tableSelected)
        ) {
          //add'selected' class
          event.target.classList.add(classNames.booking.tableSelected);
          thisBooking.targetTableId = event.target.getAttribute('data-table');
        } else {
          //remove'selected' class
          event.target.classList.remove(classNames.booking.tableSelected);
          thisBooking.targetTableId = '';
        }
        //remove 'selected' class from other tables
        for (let table of thisBooking.dom.tables) {
          let tableId = table.getAttribute(settings.booking.tableIdAttribute);

          if (tableId !== thisBooking.targetTableId) {
            table.classList.remove(classNames.booking.tableSelected);
          }
        }
        //if target element contain 'booked' class send alert
      } else {
        window.alert('this table is unavailable');
      }
      //if clicked element is not remove class 'selected' from all tables
    } else {
      for (let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.tableSelected);
        thisBooking.targetTableId = '';
      }
    }
  }

  parseValue(value) {
    if (!isNaN(parseInt(value))) {
      return parseInt(value);
    } else {
      return null;
    }
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;
    //console.log('bookings url:', url);

    const formData = utils.serializeFormToObject(thisBooking.dom.form);
    //console.log('formData', formData);

    const payload = {};

    payload.address = formData.address[0];
    payload.phone = formData.phone[0];
    payload.date = formData.date[0];
    payload.hour = utils.numberToHour(formData.hour);
    payload.table = thisBooking.parseValue(thisBooking.targetTableId);
    payload.duration = parseInt(formData.hours);
    payload.ppl = parseInt(formData.people);
    payload.starters = [];

    for (let option of thisBooking.dom.bookingOptions) {
      if (
        option.tagName === 'INPUT' &&
        option.type === 'checkbox' &&
        option.name === 'starter'
      ) {
        console.log('option value:', option.value);
        if (option.checked && !payload.starters.includes(option)) {
          payload.starters.push(option.value);
        }
        if (!option.checked && payload.starters.includes(option)) {
          const indexOfUnchecked = payload.starters.indexOf(option.value);
          payload.starters.splice(indexOfUnchecked, 1);
        }
      }
    }

    //console.log('payload new', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      })
      .then(function () {
        thisBooking.makeBooked(
          payload.date,
          payload.hour,
          payload.duration,
          payload.table
        );
        console.log('thisBooking.booked:', thisBooking.booked);
      });
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );

    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(
      select.containerOf.tables
    );

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(
      select.booking.form
    );
    thisBooking.dom.bookingOptions = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.checkbox
    );

    console.log('booking options:', thisBooking.dom.bookingOptions);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function (event) {
      thisBooking.initTables(event);
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function (event) {
      thisBooking.initTables(event);
    });
    thisBooking.dom.datePicker.addEventListener('updated', function (event) {
      thisBooking.initTables(event);
    });
    thisBooking.dom.hourPicker.addEventListener('updated', function (event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.tablesWrapper.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
}

export default Booking;
