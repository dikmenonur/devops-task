import React, { useState, useEffect, useCallback } from "react";
import { api } from "./api";

// ── Inline styles (CSS dosyasına gerek yok, build daha temiz) ──
const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 16px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: 540,
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    padding: "28px 32px",
  },
  h1: { margin: 0, fontSize: 26, fontWeight: 700 },
  subtitle: { margin: "6px 0 0", opacity: 0.85, fontSize: 14 },
  body: { padding: "24px 32px" },
  form: { display: "flex", gap: 10, marginBottom: 24 },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "2px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 15,
    outline: "none",
    transition: "border-color .2s",
  },
  addBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  empty: {
    textAlign: "center",
    color: "#a0aec0",
    padding: "32px 0",
    fontSize: 15,
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 10,
    marginBottom: 8,
    background: "#f7fafc",
    transition: "background .15s",
  },
  checkbox: { width: 18, height: 18, cursor: "pointer", accentColor: "#667eea" },
  todoText: (done) => ({
    flex: 1,
    fontSize: 15,
    color: done ? "#a0aec0" : "#2d3748",
    textDecoration: done ? "line-through" : "none",
    transition: "all .2s",
  }),
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#fc8181",
    fontSize: 18,
    lineHeight: 1,
    padding: "2px 6px",
    borderRadius: 6,
  },
  footer: {
    borderTop: "1px solid #e2e8f0",
    padding: "14px 32px",
    fontSize: 13,
    color: "#a0aec0",
    display: "flex",
    justifyContent: "space-between",
  },
  error: {
    background: "#fff5f5",
    border: "1px solid #fc8181",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#c53030",
    marginBottom: 16,
    fontSize: 14,
  },
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTodos = useCallback(async () => {
    try {
      const data = await api.getTodos();
      setTodos(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError("API'ye bağlanılamadı. Backend çalışıyor mu?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const todo = await api.addTodo(input.trim());
      setTodos((prev) => [todo, ...prev]);
      setInput("");
      setError(null);
    } catch {
      setError("Todo eklenemedi.");
    }
  };

  const handleToggle = async (todo) => {
    try {
      const updated = await api.toggleTodo(todo.id, !todo.completed);
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {
      setError("Güncelleme başarısız.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Silme başarısız.");
    }
  };

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <h1 style={S.h1}>📝 Todo App</h1>
          <p style={S.subtitle}>
            React · Node.js · PostgreSQL · Docker · AWS
          </p>
        </div>

        {/* Body */}
        <div style={S.body}>
          {/* Hata mesajı */}
          {error && <div style={S.error}>⚠️ {error}</div>}

          {/* Yeni todo formu */}
          <form style={S.form} onSubmit={handleAdd}>
            <input
              style={S.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Yeni görev ekle..."
              maxLength={255}
            />
            <button style={S.addBtn} type="submit">
              + Ekle
            </button>
          </form>

          {/* Liste */}
          {loading ? (
            <div style={S.empty}>⏳ Yükleniyor...</div>
          ) : todos.length === 0 ? (
            <div style={S.empty}>
              Henüz görev yok. İlkini ekle! 🎉
            </div>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} style={S.todoItem}>
                <input
                  type="checkbox"
                  style={S.checkbox}
                  checked={todo.completed}
                  onChange={() => handleToggle(todo)}
                />
                <span style={S.todoText(todo.completed)}>{todo.title}</span>
                <button
                  style={S.deleteBtn}
                  onClick={() => handleDelete(todo.id)}
                  title="Sil"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={S.footer}>
          <span>{remaining} görev kaldı</span>
          <span>{todos.filter((t) => t.completed).length} tamamlandı</span>
        </div>
      </div>
    </div>
  );
}
