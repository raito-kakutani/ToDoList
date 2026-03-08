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

const today = new Date().toISOString().split('T')[0]//"2026-03-07T03:34:56.000Z".split('T') ["2026-03-07", "03:34:56.000Z"]  ← 2つの要素の配列になる

let tasks = []

//保存処理
async function saveTasks(id,done) {
    const { error } = await supabaseClient.from('todos').update({ done: done }).eq('id', id)

    if (error) {
        console.error(error.message)
        return
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

// タスク追加欄の追加処理
addInput.addEventListener("keydown", async (e) => {
    console.log('テスト')
    if (!addInput.value) return
    if (e.key === "Enter") {
        const { data: { user } } = await supabaseClient.auth.getUser()
        //insert処理
        const { error } = await supabaseClient.from('todos').insert({
            user_id: user.id,
            task: addInput.value,
            done: false,
            type: null,
            scheduled_date: today
            })
        if (error){
            console.error("タスク追加ができませんでした。")
        }
        renderTasks()
        addInput.value = ""
    }
})

async function init() {
    const isLoggedIn = await checkAuth()
    if (!isLoggedIn) return

    // 今日のタスクをSupabaseから取得
    const { data, error } = await supabaseClient.from('todos').select('*').eq('scheduled_date', today)
    if (error) {
        console.error('タスク取得エラー:', error.message)
        return
    }
    tasks = data
    console.log('タスク取得', tasks)

    renderTasks()
}

init()