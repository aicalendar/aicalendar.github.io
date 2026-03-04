const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// SHARED: build one month's <table>
function buildMonthTable(year, month, clickable = false) {
    const table = document.createElement('table');

    const thead = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.innerText = day;
        thead.appendChild(th);
    });
    table.appendChild(thead);

    // Calculate the dates
    const firstDayIndex  = new Date(year, month, 1).getDay();
    const daysInMonth    = new Date(year, month + 1, 0).getDate();
    const prevMonthDays  = new Date(year, month, 0).getDate();

    let date = 1, nextMonthDate = 1;
    let row  = document.createElement('tr');

    // Loop for all the cages (42 cells)
    for (let i = 0; i < 42; i++) {
        const cell = document.createElement('td');

        // CASE 1: Days of the previous month
        if (i < firstDayIndex) {
            cell.innerText = prevMonthDays - (firstDayIndex - 1 - i);
            cell.className = "other-month";
        } 
        // CASE 2: Days of the current month
        else if (date <= daysInMonth) {
            const d = date;
            cell.innerText = date;
            cell.className = 'day-cell';
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => {
                window.location.href = `day.html?year=${year}&month=${month}&day=${d}`;
            });
            date++;
        } 
        // CASE 3: Days of the next month
        else {
            cell.innerText = nextMonthDate;
            cell.className = "other-month";
            nextMonthDate++;
        }
        row.appendChild(cell);

        // Every 7 days change the line
        if ((i + 1) % 7 === 0) {
            table.appendChild(row);
            row = document.createElement('tr');
        }
    }

    return table;
}

//YEAR VIEW (index.html)
function generateYearView() {
    const yearInput = document.getElementById('yearInput');
    const container = document.getElementById('calendarGrid');

    function render(year) {
        container.innerHTML = "";
        yearInput.value = year;

        for (let month = 0; month < 12; month++) {
            // Creation of the wrapper
            const monthDiv = document.createElement('div');
            monthDiv.className = 'month-wrapper';

            const title = document.createElement('h3');
            title.className = 'month-title';
            title.innerText = months[month];

            monthDiv.appendChild(title);
            // Table creation
            const table = buildMonthTable(year, month);
            table.style.cursor = 'pointer';
            table.addEventListener('click', () => {
                window.location.href = `month.html?year=${year}&month=${month}`;
            });
            monthDiv.appendChild(table);
            container.appendChild(monthDiv);
        }
    }

    // Initial render
    render(parseInt(yearInput.value));

    // It's for the typing of the year
    yearInput.addEventListener('change', () => {
        const y = parseInt(yearInput.value);
        if (y > 0) render(y);
    });

     // Buttons
    document.getElementById('prevYear').addEventListener('click', () => {
        render(parseInt(yearInput.value) - 1);
    });

    document.getElementById('nextYear').addEventListener('click', () => {
        render(parseInt(yearInput.value) + 1);
    });
}

// SINGLE MONTH VIEW (month.html)
function generateSingleMonth() {
    const params = new URLSearchParams(window.location.search);
    let year  = parseInt(params.get('year'))  || new Date().getFullYear();
    let month = parseInt(params.get('month')) || 0;

    document.getElementById('monthTitle').innerText = `${months[month]} ${year}`;

    const container = document.getElementById('singleMonth');
    container.appendChild(buildMonthTable(year, month, true)); // day click enabled
}

// SINGLE DAY VIEW (day.html)
function generateDayView() {
    const params = new URLSearchParams(window.location.search);
    const year  = parseInt(params.get('year'))  || new Date().getFullYear();
    const month = parseInt(params.get('month')) ?? 0;
    const day   = parseInt(params.get('day'))   || 1;

    const date = new Date(year, month, day);
    const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][date.getDay()];

    document.getElementById('dayTitle').innerText =
        `${dayName}, ${months[month]} ${day} ${year}`;
}

generateDayView = function() {
    const params = new URLSearchParams(window.location.search);
    const year  = parseInt(params.get('year'))  || new Date().getFullYear();
    const month = parseInt(params.get('month')) ?? 0;
    const day   = parseInt(params.get('day'))   || 1;

    const date = new Date(year, month, day);
    const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][date.getDay()];

    document.getElementById('dayTitle').innerText =
        `${dayName}, ${months[month]} ${day}, ${year}`;

    // Build 24-hour grid
    const grid = document.getElementById('hourGrid');
    const table = document.createElement('table');
    table.className = 'hour-table';

    for (let h = 0; h < 24; h++) {
        const row = document.createElement('tr');

        const timeCell = document.createElement('td');
        timeCell.className = 'hour-label';
        timeCell.innerText = String(h).padStart(2, '0') + ':00';

        const noteCell = document.createElement('td');
        noteCell.className = 'hour-note';

        row.appendChild(timeCell);
        row.appendChild(noteCell);
        table.appendChild(row);
    }

    grid.appendChild(table);
}