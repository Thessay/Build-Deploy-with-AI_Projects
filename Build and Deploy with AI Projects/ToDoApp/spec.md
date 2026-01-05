
## `todoapp/spec.md`

```md
# Sticky Todo App – Technical Specification

## Overview
A minimal, modern todo list app with sticky-note style cards, filtering, keyboard shortcuts, and persistent storage.

---

## Features
- Add, complete, and delete tasks
- Persistent storage via localStorage
- Filters: All / Active / Completed
- Clear completed tasks
- Sticky-note visual style
- Light / Dark mode toggle
- Responsive layout

---

## UI Components
- Header (title + theme toggle)
- Todo input form
- Filter buttons
- Todo grid (sticky cards)
- Footer with keyboard hints

---

## External APIs
- None (client-side only)

---

## Key JavaScript Functions
- `addTodo(text)`
- `toggleTodo(id)`
- `deleteTodo(id)`
- `clearCompleted()`
- `setFilter(filter)`
- `render()`
- `saveTodos()`
- `loadTodos()`

---

## Loading States
- Initial load from localStorage
- Empty-state UI when no tasks exist

---

## Error Handling
- Safe JSON parsing from localStorage
- Prevent empty task submissions
- Disable actions when no tasks available

---

## Keyboard Shortcuts
- `Enter` → Add task
- `Delete` → Remove selected task
- `Escape` → Clear selection
