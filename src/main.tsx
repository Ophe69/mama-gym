// Types simples
type Task = { id: string; label: string; done: boolean }

class Store {
  get<T>(key: string, fallback: T): T {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback
    } catch {
      return fallback
    }
  }
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

const $ = <T extends HTMLElement>(sel: string) => {
  const el = document.querySelector(sel)
  if (!el) throw new Error(`Élément non trouvé: ${sel}`)
  return el as T
}

// Compteur
const store = new Store()
const countEl = $("#count") as HTMLElement
let count: number = store.get<number>("count", 0)

function renderCount() {
  countEl.textContent = String(count)
  store.set("count", count)
}

$("#incr").addEventListener("click", () => {
  count++
  renderCount()
})
$("#decr").addEventListener("click", () => {
  count = Math.max(0, count - 1)
  renderCount()
})
$("#reset").addEventListener("click", () => {
  count = 0
  renderCount()
})
renderCount()

// Tâches
const taskInput = $("#taskInput") as HTMLInputElement
const taskList = $("#taskList") as HTMLUListElement
let tasks: Task[] = store.get<Task[]>("tasks", [])

const uid = () => Math.random().toString(36).slice(2, 9)

function saveTasks() {
  store.set("tasks", tasks)
  renderTasks()
}

function renderTasks() {
  taskList.innerHTML = ""
  if (tasks.length === 0) {
    const li = document.createElement("li")
    li.innerHTML = `<span class="muted">Aucune tâche pour le moment.</span>`
    taskList.appendChild(li)
    return
  }
  for (const t of tasks) {
    const li = document.createElement("li")

    const left = document.createElement("div")
    left.style.display = "flex"
    left.style.gap = "8px"
    left.style.alignItems = "center"

    const cb = document.createElement("input")
    cb.type = "checkbox"
    cb.checked = t.done
    cb.addEventListener("change", () => {
      t.done = cb.checked
      saveTasks()
    })

    const label = document.createElement("span")
    label.textContent = t.label
    label.style.textDecoration = t.done ? "line-through" : "none"
    label.style.opacity = t.done ? ".6" : "1"

    left.appendChild(cb)
    left.appendChild(label)

    const del = document.createElement("button")
    del.className = "btn danger"
    del.textContent = "Supprimer"
    del.addEventListener("click", () => {
      tasks = tasks.filter((x) => x.id !== t.id)
      saveTasks()
    })

    li.appendChild(left)
    li.appendChild(del)
    taskList.appendChild(li)
  }
}

function addTask() {
  const val = taskInput.value.trim()
  if (!val) return
  tasks.unshift({ id: uid(), label: val, done: false })
  taskInput.value = ""
  saveTasks()
  taskInput.focus()
}

$("#addTask").addEventListener("click", addTask)
taskInput.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") addTask()
})
renderTasks()

// Thème
const THEME_KEY = "pref-theme"
const prefersDark = matchMedia?.("(prefers-color-scheme: dark)").matches ?? true

function applyTheme(mode: "dark" | "light" | "system") {
  const isDark = mode === "dark" || (mode === "system" && prefersDark)
  const root = document.documentElement.style
  root.setProperty("--bg", isDark ? "#0f172a" : "#f8fafc")
  root.setProperty("--card", isDark ? "#111827" : "#ffffff")
  root.setProperty("--text", isDark ? "#e5e7eb" : "#0f172a")
  root.setProperty("--muted", isDark ? "#6b7280" : "#475569")
}

let theme: "dark" | "light" | "system" = store.get(THEME_KEY, "dark")
applyTheme(theme)
$("#toggleTheme").addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark"
  store.set(THEME_KEY, theme)
  applyTheme(theme)
})
