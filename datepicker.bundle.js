(function (global) {
    // Constructor function for the Datepicker
    function Datepicker(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container element not found');
            return;
        }
        this.currentDate = new Date();
        this.selectedStartDate = null;
        this.selectedEndDate = null;

        // Initialize the Datepicker
        this.init();
    }

    // Initialize method
    Datepicker.prototype.init = function () {
        // Load CSS dynamically
        this.loadCSS();

        // Create Datepicker HTML structure
        this.createDatepickerHTML();

        // Add Event Listeners
        this.addEventListeners();

        // Render the Calendar
        this.renderCalendar(this.currentDate);
    };

    // Method to load CSS dynamically
    Datepicker.prototype.loadCSS = function () {
        const css = `
            .date-picker { background-color: #252525; color: #ffffff; width: 400px; padding: 20px; border-radius: 8px; box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.4); font-family: Arial, sans-serif; margin: auto; }
            .date-picker-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
            .date-picker-header input[type="text"] { padding: 10px; background-color: #1e1e1e; color: #fff; border: none; border-radius: 4px; outline: none; width: 130px; text-align: center; transition: background-color 0.3s ease; }
            .month-navigation { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
            .nav-button { background-color: #237de2; color: #ffffff; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 16px; transition: background-color 0.3s ease; margin: 0 10px; }
            .days-header { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 10px; font-weight: bold; color: #cfcfcf; }
            .calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
            .calendar-day { background-color: #1e1e1e; border: none; padding: 10px; border-radius: 4px; color: #ffffff; cursor: pointer; transition: background-color 0.3s ease; }
            .calendar-day:hover { background-color: #333; }
            .end-date-toggle { display: flex; align-items: center; margin: 20px 0; }
            .switch { position: relative; display: inline-block; width: 50px; height: 24px; margin-right: 10px; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: 0.4s; border-radius: 34px; }
            .footer-controls { text-align: center; margin-top: 20px; }
            .clear-button { background-color: #e23838; color: #ffffff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; transition: background-color 0.3s ease; }
        `;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    };

    // Method to create HTML structure for the Datepicker
    Datepicker.prototype.createDatepickerHTML = function () {
        // Datepicker HTML structure
        this.container.innerHTML = `
            <div class="date-picker">
                <div class="date-picker-header">
                    <input type="text" id="startDate" placeholder="Select start date">
                    <input type="text" id="endDate" placeholder="Select end date" style="display: none;">
                </div>
                <div class="month-navigation">
                    <button id="prevMonth" class="nav-button">&lt;</button>
                    <h2 id="currentMonth"></h2>
                    <button id="nextMonth" class="nav-button">&gt;</button>
                </div>
                <div class="days-header">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div class="calendar" id="calendarDays"></div>
                <div class="end-date-toggle">
                    <label class="switch">
                        <input type="checkbox" id="endDateToggle">
                        <span class="slider round"></span>
                    </label>
                    <label for="endDateToggle">Set End Date</label>
                </div>
                <div class="footer-controls">
                    <button id="clearButton" class="clear-button">Clear</button>
                </div>
            </div>
        `;
        // Store elements for later use
        this.currentMonthElement = this.container.querySelector('#currentMonth');
        this.calendarDaysElement = this.container.querySelector('#calendarDays');
        this.prevMonthButton = this.container.querySelector('#prevMonth');
        this.nextMonthButton = this.container.querySelector('#nextMonth');
        this.startDateInput = this.container.querySelector('#startDate');
        this.endDateInput = this.container.querySelector('#endDate');
        this.endDateToggle = this.container.querySelector('#endDateToggle');
        this.clearButton = this.container.querySelector('#clearButton');
    };

    // Method to add event listeners
    Datepicker.prototype.addEventListeners = function () {
        this.prevMonthButton.addEventListener("click", () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar(this.currentDate);
        });

        this.nextMonthButton.addEventListener("click", () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar(this.currentDate);
        });

        this.clearButton.addEventListener("click", () => {
            this.selectedStartDate = null;
            this.selectedEndDate = null;
            this.updateInputs();
            this.renderCalendar(this.currentDate);
        });

        this.endDateToggle.addEventListener("change", () => {
            if (this.endDateToggle.checked) {
                this.endDateInput.style.display = "inline-block";
            } else {
                this.endDateInput.style.display = "none";
                this.selectedEndDate = null;
                this.updateInputs();
            }
        });
    };

    // Method to render the calendar
    Datepicker.prototype.renderCalendar = function (date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        this.currentMonthElement.textContent = date.toLocaleString("default", { month: "long", year: "numeric" });

        this.calendarDaysElement.innerHTML = "";

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.classList.add("empty-day");
            this.calendarDaysElement.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayButton = document.createElement("button");
            dayButton.textContent = day;
            dayButton.classList.add("calendar-day");
            const currentDate = new Date(year, month, day);

            dayButton.addEventListener("click", () => this.handleDateSelection(currentDate));

            this.calendarDaysElement.appendChild(dayButton);
        }
    };

    // Method to handle date selection
    Datepicker.prototype.handleDateSelection = function (date) {
        if (this.endDateToggle.checked) {
            if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
                this.selectedStartDate = date;
                this.selectedEndDate = null;
            } else if (this.selectedStartDate && !this.selectedEndDate) {
                this.selectedEndDate = date;
                if (this.selectedEndDate < this.selectedStartDate) {
                    [this.selectedStartDate, this.selectedEndDate] = [this.selectedEndDate, this.selectedStartDate];
                }
            }
        } else {
            this.selectedStartDate = date;
            this.selectedEndDate = null;
        }
        this.updateInputs();
        this.renderCalendar(this.currentDate);
    };

    // Method to update input fields
    Datepicker.prototype.updateInputs = function () {
        this.startDateInput.value = this.selectedStartDate ? this.formatDate(this.selectedStartDate) : "";
        this.endDateInput.value = this.selectedEndDate ? this.formatDate(this.selectedEndDate) : "";
    };

    // Method to format the date
    Datepicker.prototype.formatDate = function (date) {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    // Expose Datepicker to the global object
    global.Datepicker = Datepicker;

})(window);

// Usage: You only need to include this JS file and then call:
// new Datepicker('containerId');
