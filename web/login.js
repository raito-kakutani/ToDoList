supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        window.location.href = "index.html"
    }
})

const form = document.getElementById("login-form")
const errorEl = document.getElementById("login-error")

form.addEventListener("submit", async event => {
    event.preventDefault()
    errorEl.textContent = ""

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })

    if (error) {
        errorEl.textContent = "メールアドレスまたはパスワードが正しくありません。"
        return
    }

    window.location.href = "index.html"
})
