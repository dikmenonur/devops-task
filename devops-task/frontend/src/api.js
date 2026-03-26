// API base URL — production'da /api prefix'i Nginx proxy'liyor
const BASE = process.env.REACT_APP_API_URL || "/api";

export const api = {
  getTodos: () =>
    fetch(`${BASE}/todos`).then((r) => r.json()),

  addTodo: (title) =>
    fetch(`${BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((r) => r.json()),

  toggleTodo: (id, completed) =>
    fetch(`${BASE}/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    }).then((r) => r.json()),

  deleteTodo: (id) =>
    fetch(`${BASE}/todos/${id}`, { method: "DELETE" }),
};
