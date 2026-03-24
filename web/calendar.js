function formatLocalDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

export function createCalendar({ container, selectedDate, onSelectDate }) {
    let currentMonth = new Date()
    currentMonth.setDate(1)
    let activeDate = selectedDate ?? null

    const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"]

    function render() {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        const startOffset = monthStart.getDay()
        const totalDays = monthEnd.getDate()
        const today = formatLocalDate(new Date())

        container.innerHTML = ""
        container.className = "calendar"

        const header = document.createElement("div")
        header.className = "calendar__header"

        const prevButton = document.createElement("button")
        prevButton.type = "button"
        prevButton.className = "calendar__nav"
        prevButton.textContent = "<"
        prevButton.setAttribute("aria-label", "前の月")
        prevButton.addEventListener("click", () => {
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
            render()
        })

        const title = document.createElement("div")
        title.className = "calendar__title"
        title.textContent = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`

        const nextButton = document.createElement("button")
        nextButton.type = "button"
        nextButton.className = "calendar__nav"
        nextButton.textContent = ">"
        nextButton.setAttribute("aria-label", "次の月")
        nextButton.addEventListener("click", () => {
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
            render()
        })

        header.appendChild(prevButton)
        header.appendChild(title)
        header.appendChild(nextButton)

        const weekdays = document.createElement("div")
        weekdays.className = "calendar__weekdays"
        weekdayLabels.forEach(label => {
            const weekday = document.createElement("div")
            weekday.className = "calendar__weekday"
            weekday.textContent = label
            weekdays.appendChild(weekday)
        })

        const grid = document.createElement("div")
        grid.className = "calendar__grid"

        for (let i = 0; i < startOffset; i += 1) {
            const emptyCell = document.createElement("div")
            emptyCell.className = "calendar__empty"
            grid.appendChild(emptyCell)
        }

        for (let day = 1; day <= totalDays; day += 1) {
            const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const dateValue = formatLocalDate(cellDate)
            const button = document.createElement("button")
            button.type = "button"
            button.className = "calendar__day"
            button.textContent = String(day)

            if (dateValue === today) {
                button.classList.add("calendar__day--today")
            }

            if (dateValue === activeDate) {
                button.classList.add("calendar__day--selected")
            }

            button.addEventListener("click", () => {
                activeDate = dateValue
                onSelectDate(dateValue)
                render()
            })

            grid.appendChild(button)
        }

        container.appendChild(header)
        container.appendChild(weekdays)
        container.appendChild(grid)
    }

    function setSelectedDate(nextSelectedDate) {
        activeDate = nextSelectedDate ?? null

        if (activeDate) {
            const [year, month] = activeDate.split("-").map(Number)
            currentMonth = new Date(year, month - 1, 1)
        }

        render()
    }

    render()

    return {
        setSelectedDate
    }
}
