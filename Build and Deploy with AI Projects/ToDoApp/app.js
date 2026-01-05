// ========================
// Sticky Todo - Plain JS
// ========================

const STORAGE_KEY_TODOS = "sticky_todos_v1";
const STORAGE_KEY_THEME = "sticky_theme_v1";

// Elements
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");

const statsText = document.getElementById("statsText");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

const filterAllBtn = document.getElementById("filterAllBtn");
const filterActiveBtn = document.getElementById("filterActiveBtn");
const filterCompletedBtn = document.getElementById("filterCompletedBtn");

const themeToggleBtn = document.getElementById("themeToggleBtn");

// State
let todos = loadTodos();
let currentFilter = "all"; // all | active | completed
let selectedTodoId = null;

// ---------- Storage ----------
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TODOS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
}

function loadTheme() {
  const theme = localStorage.getItem(STORAGE_KEY_THEME);
  return theme === "dark" ? "dark" : "light";
}

function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

// ---------- Helpers ----------
function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
  saveTheme(theme);
}

function getFilteredTodos() {
  if (currentFilter === "active") return todos.filter(t => !t.completed);
  if (currentFilter === "completed") return todos.filter(t => t.completed);
  return todos;
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;

  statsText.textContent =
    total === 0 ? "0 tasks" : `${total} task${total > 1 ? "s" : ""} (${completed} completed)`;

  emptyState.style.display = total === 0 ? "block" : "none";

  // Disable clear completed if none
  clearCompletedBtn.disabled = completed === 0;
  clearCompletedBtn.style.opacity = completed === 0 ? ".55" : "1";
}

function setActiveFilterButton(filter) {
  document.querySelectorAll(".filterBtn").forEach(btn => btn.classList.remove("is-active"));
  if (filter === "all") filterAllBtn.classList.add("is-active");
  if (filter === "active") filterActiveBtn.classList.add("is-active");
  if (filter === "completed") filterCompletedBtn.classList.add("is-active");
}

function pickTiltByIndex(index) {
  // subtle rotations for sticky note feel
  const tilts = [-2, -1, 1, 2, -1.5, 1.5];
  return tilts[index % tilts.length];
}

function selectTodo(id) {
  selectedTodoId = id;
  render();
}

function clearSelectionIfMissing() {
  if (selectedTodoId && !todos.some(t => t.id === selectedTodoId)) {
    selectedTodoId = null;
  }
}

// ---------- Render ----------
function render() {
  clearSelectionIfMissing();

  const list = getFilteredTodos();
  todoList.innerHTML = "";

  list.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = `todoItem ${todo.completed ? "is-completed" : ""} ${todo.id === selectedTodoId ? "is-selected" : ""}`;
    li.style.setProperty("--tilt", `${pickTiltByIndex(index)}deg`);
    li.dataset.id = todo.id;
    li.tabIndex = 0; // makes it focusable

    // Click to select
    li.addEventListener("click", (e) => {
      // If user clicked checkbox or delete button, don't treat as select only
      const target = e.target;
      if (target && (target.classList.contains("todoCheckbox") || target.classList.contains("todoDeleteBtn"))) {
        return;
      }
      selectTodo(todo.id);
    });

    // Keyboard selection (Enter selects)
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter") selectTodo(todo.id);
    });

    const topRow = document.createElement("div");
    topRow.className = "todoTopRow";

    const text = document.createElement("p");
    text.className = "todoText";
    text.textContent = todo.text;

    topRow.appendChild(text);

    const metaRow = document.createElement("div");
    metaRow.className = "todoMetaRow";

    const leftControls = document.createElement("div");
    leftControls.className = "todoLeftControls";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todoCheckbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const badge = document.createElement("span");
    badge.className = "todoBadge";
    badge.textContent = todo.completed ? "Completed" : "Active";

    leftControls.appendChild(checkbox);
    leftControls.appendChild(badge);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "todoDeleteBtn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    metaRow.appendChild(leftControls);
    metaRow.appendChild(deleteBtn);

    li.appendChild(topRow);
    li.appendChild(metaRow);

    todoList.appendChild(li);
  });

  updateStats();
  setActiveFilterButton(currentFilter);
}

// ---------- Actions ----------
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: makeId(),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
  });

  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  if (selectedTodoId === id) selectedTodoId = null;
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  if (selectedTodoId && !todos.some(t => t.id === selectedTodoId)) selectedTodoId = null;
  saveTodos();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  selectedTodoId = null; // reset selection when filtering
  render();
}

// ---------- Events ----------
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

// Filter buttons
filterAllBtn.addEventListener("click", () => setFilter("all"));
filterActiveBtn.addEventListener("click", () => setFilter("active"));
filterCompletedBtn.addEventListener("click", () => setFilter("completed"));

// Clear completed
clearCompletedBtn.addEventListener("click", clearCompleted);

// Global keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Delete removes selected task
  if (e.key === "Delete") {
    if (selectedTodoId) deleteTodo(selectedTodoId);
  }

  // Escape clears selection
  if (e.key === "Escape") {
    selectedTodoId = null;
    render();
  }
});

// Dark mode toggle
themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  setTheme(current === "dark" ? "light" : "dark");
});

// ---------- Init ----------
setTheme(loadTheme());
render();
