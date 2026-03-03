// ------------------------
// タスク定義
// ------------------------
const addInput = document.getElementById("add-input")
const todoList = document.getElementById("todo-list")

let tasks = JSON.parse(localStorage.getItem("tasks")) ?? []

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

function renderTasks() {
    todoList.innerHTML = ""
    tasks.forEach(task => {
        const li = document.createElement("li")
        li.className = "task-item"
        if (task.done) li.classList.add("task-item--done")
        // ✓ボックス
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.className = "task-checkbox"
        checkbox.checked = task.done
        checkbox.addEventListener("change", () => {
            task.done = checkbox.checked
            li.classList.toggle("task-item--done", checkbox.checked)
            saveTasks()
        })
        // テキスト
        const span = document.createElement("span")
        span.textContent = task.task
        span.className = "task-text"
        // 削除ボタン
        const button = document.createElement("button")
        button.textContent = "×"
        button.className = "task-delete"
        button.addEventListener("click", () => {
            tasks = tasks.filter(t => t.idx !== task.idx)
            saveTasks()
            renderTasks()
        })
        li.appendChild(checkbox)
        li.appendChild(span)
        li.appendChild(button)
        todoList.appendChild(li)
    })
}

addInput.addEventListener("keydown", (e) => {
    if (!addInput.value) return
    if (e.key === "Enter") {
        tasks.push({ idx: Date.now().toString(), task: addInput.value, done: false })
        saveTasks()
        renderTasks()
        addInput.value = ""
    }
})

renderTasks()