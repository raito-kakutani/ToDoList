import { createCalendar } from "./calendar.js"

async function checkAuth() {
    const { data: { session } } = await window.supabaseClient.auth.getSession()
    if (!session) {
        window.location.href = "login.html"
        return false
    }
    return true
}

document.getElementById("logout-btn").addEventListener("click", async () => {
    await window.supabaseClient.auth.signOut()
    window.location.href = "login.html"
})

const addInput = document.getElementById("add-input")
const todoList = document.getElementById("todo-list")
const calendarContainer = document.getElementById("calendar")

function formatLocalDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

const today = formatLocalDate(new Date())
const tomorrowDate = new Date()
tomorrowDate.setDate(tomorrowDate.getDate() + 1)
const tomorrow = formatLocalDate(tomorrowDate)

let tasks = []
let currentMode = "today"
let selectedDate = null
let calendarApi = null

const tabButtons = document.querySelectorAll(".tab-btn")

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(button => button.classList.remove("active"))
        btn.classList.add("active")
        selectedDate = null

        if (calendarApi) {
            calendarApi.setSelectedDate(null)
        }

        currentMode = btn.dataset.tab
        fetchTasks()
    })
})

async function fetchTasks() {
    let query = window.supabaseClient.from("todos").select("*")

    if (selectedDate) {
        query = query.eq("scheduled_date", selectedDate)
    } else if (currentMode === "today") {
        query = query.eq("scheduled_date", today)
    } else if (currentMode === "tomorrow") {
        query = query.eq("scheduled_date", tomorrow)
    } else if (currentMode === "important") {
        query = query.eq("type", "important")
    } else if (currentMode === "normal") {
        query = query.eq("type", "normal")
    }

    const { data, error } = await query
    if (error) {
        console.error("タスク取得エラー:", error.message)
        return
    }

    tasks = data
    renderTasks()
}

async function saveTasks(task, action) {
    if (action === "delete") {
        const { error } = await window.supabaseClient.from("todos").delete().eq("id", task.id)
        if (error) console.error("削除エラー:", error.message)
        return
    }

    const { error } = await window.supabaseClient
        .from("todos")
        .update({ done: task.done })
        .eq("id", task.id)

    if (error) console.error("更新エラー:", error.message)
}

function renderTasks() {
    todoList.innerHTML = ""

    tasks.forEach(task => {
        const li = document.createElement("li")
        li.className = "task-item"
        if (task.done) li.classList.add("task-item--done")

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.className = "task-checkbox"
        checkbox.checked = task.done
        checkbox.addEventListener("change", () => {
            task.done = checkbox.checked
            li.classList.toggle("task-item--done", checkbox.checked)
            saveTasks(task)
        })

        const span = document.createElement("span")
        span.textContent = task.task
        span.className = "task-text"

        const button = document.createElement("button")
        button.type = "button"
        button.textContent = "削除"
        button.className = "task-delete"
        button.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id)
            saveTasks(task, "delete")
            renderTasks()
        })

        li.appendChild(checkbox)
        li.appendChild(span)
        li.appendChild(button)
        todoList.appendChild(li)
    })
}

addInput.addEventListener("keydown", async event => {
    if (!addInput.value) return
    if (event.key !== "Enter") return

    const { data: { user } } = await window.supabaseClient.auth.getUser()

    const newTask = {
        user_id: user.id,
        task: addInput.value,
        done: false,
        type: null,
        scheduled_date: null
    }

    if (selectedDate) {
        newTask.scheduled_date = selectedDate
    } else if (currentMode === "today") {
        newTask.scheduled_date = today
    } else if (currentMode === "tomorrow") {
        newTask.scheduled_date = tomorrow
    } else if (currentMode === "important") {
        newTask.type = "important"
    } else if (currentMode === "normal") {
        newTask.type = "normal"
    }

    const { data, error } = await window.supabaseClient.from("todos").insert(newTask).select()
    if (error) {
        console.error("タスク追加エラー:", error.message)
        return
    }

    tasks.push(data[0])
    renderTasks()
    addInput.value = ""
})

async function init() {
    const isLoggedIn = await checkAuth()
    if (!isLoggedIn) return

    calendarApi = createCalendar({
        container: calendarContainer,
        selectedDate,
        onSelectDate: async date => {
            selectedDate = date
            await fetchTasks()
        }
    })

    document.querySelector('.tab-btn[data-tab="today"]').classList.add("active")
    await fetchTasks()
}

init()
