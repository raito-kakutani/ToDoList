// ------------------------
// 認証チェック
// ------------------------
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) {
        window.location.href = "login.html"
        return false
    }
    return true
}

document.getElementById("logout-btn").addEventListener("click", async () => {
    await supabaseClient.auth.signOut()
    window.location.href = "login.html"
})

// ------------------------
// タスク定義
// ------------------------
const addInput = document.getElementById("add-input")
const todoList = document.getElementById("todo-list")

const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

let tasks = []
let currentMode = 'today'

// ------------------------
// サイドバー切り替え
// ------------------------
const tabButtons = document.querySelectorAll('.tab-btn')

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        currentMode = btn.dataset.tab
        fetchTasks()
    })
})

// ------------------------
// タスク取得
// ------------------------
async function fetchTasks() {
    let query = supabaseClient.from('todos').select('*')

    if (currentMode === 'today') {
        query = query.eq('scheduled_date', today)
    } else if (currentMode === 'tomorrow') {
        query = query.eq('scheduled_date', tomorrow)
    } else if (currentMode === 'important') {
        query = query.eq('type', 'important')
    } else if (currentMode === 'normal') {
        query = query.eq('type', 'normal')
    }

    const { data, error } = await query
    if (error) {
        console.error('タスク取得エラー:', error.message)
        return
    }
    tasks = data
    renderTasks()
}

// ------------------------
// 保存処理(DELETE or UPDATE)
// ------------------------
async function saveTasks(task, action) {
    if (action === 'delete') {
        const { error } = await supabaseClient.from('todos').delete().eq('id', task.id)
        if (error) console.error('削除失敗:', error.message)
    } else {
        const { error } = await supabaseClient.from('todos').update({ done: task.done }).eq('id', task.id)
        if (error) console.error('更新失敗:', error.message)
    }
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
            saveTasks(task)
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
            tasks = tasks.filter(t => t.id !== task.id)
            saveTasks(task, 'delete')
            renderTasks()
        })
        li.appendChild(checkbox)
        li.appendChild(span)
        li.appendChild(button)
        todoList.appendChild(li)
    })
}

// タスク追加処理
addInput.addEventListener("keydown", async (e) => {
    if (!addInput.value) return
    if (e.key === "Enter") {
        const { data: { user } } = await supabaseClient.auth.getUser()

        const newTask = {
            user_id: user.id,
            task: addInput.value,
            done: false,
            type: null,
            scheduled_date: null
        }

        if (currentMode === 'today') {
            newTask.scheduled_date = today
        } else if (currentMode === 'tomorrow') {
            newTask.scheduled_date = tomorrow
        } else if (currentMode === 'important') {
            newTask.type = 'important'
        } else if (currentMode === 'normal') {
            newTask.type = 'normal'
        }

        const { data, error } = await supabaseClient.from('todos').insert(newTask).select()
        if (error) {
            console.error("タスク追加ができませんでした。")
            return
        }
        tasks.push(data[0])
        renderTasks()
        addInput.value = ""
    }
})

async function init() {
    const isLoggedIn = await checkAuth()
    if (!isLoggedIn) return

    // デフォルトで「今日の予定」をアクティブに
    document.querySelector('.tab-btn[data-tab="today"]').classList.add('active')

    await fetchTasks()
}

init()
