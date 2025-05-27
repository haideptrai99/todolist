"use client";

import { useEffect, useState } from "react";

type Todo = {
  id: number;
  title: string;
};

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null); // For confirm dialog
  const [page, setPage] = useState(1);
  const [alert, setAlert] = useState("");
  const [inputAnim, setInputAnim] = useState(false);
  const [deleteAnimId, setDeleteAnimId] = useState<number | null>(null);
  const [showMoreAnim, setShowMoreAnim] = useState(false);
  const PAGE_SIZE = 3;

  // Backend API URL
  const API = "/api/todos";

  // Fetch todos
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then(setTodos);
  }, []);

  // Add todo
  const addTodo = async () => {
    if (!input.trim()) {
      setAlert("Please enter a todo.");
      return;
    }
    setAlert("");
    setInputAnim(true);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: input }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setInput("");
    setTimeout(() => setInputAnim(false), 600);
  };

  // Delete todo with confirm
  const deleteTodo = async (id: number) => {
    setConfirmId(id);
  };

  const confirmDelete = async () => {
    if (confirmId === null) return;
    setDeleteAnimId(confirmId);
    setTimeout(async () => {
      await fetch(`${API}/${confirmId}`, { method: "DELETE" });
      setTodos(todos.filter((t) => t.id !== confirmId));
      setDeleteAnimId(null);
      setConfirmId(null);
    }, 500);
  };

  const cancelDelete = () => setConfirmId(null);

  // Start editing
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  // Save edit
  const saveEdit = async () => {
    if (editingId === null || !editingTitle.trim()) return;
    const res = await fetch(`${API}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === editingId ? updated : t)));
    setEditingId(null);
    setEditingTitle("");
  };

  // Auto clear alert when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (alert) setAlert("");
  };

  // Pagination logic
  const pagedTodos = todos.slice(0, page * PAGE_SIZE);
  const hasMore = todos.length > pagedTodos.length;

  // Show more animation
  const handleShowMore = () => {
    setShowMoreAnim(true);
    setTimeout(() => {
      setPage(page + 1);
      setShowMoreAnim(false);
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto py-10 flex flex-col min-h-screen">
      {/* Cool Top Menu */}
      <nav className="flex justify-between items-center mb-8 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
        <div className="font-extrabold text-xl text-white tracking-wide drop-shadow">
          📝 TodoApp
        </div>
        <div className="flex gap-4">
          <a
            href="#"
            className="text-white font-semibold px-3 py-1 rounded hover:bg-white/20 transition-colors duration-200"
          >
            Home
          </a>
          <a
            href="#"
            className="text-white font-semibold px-3 py-1 rounded hover:bg-white/20 transition-colors duration-200"
          >
            TodoList
          </a>
        </div>
      </nav>
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Todo List</h1>
        <div className="flex gap-2 mb-4">
          <input
            className={`border rounded px-2 py-1 flex-1 transition-all duration-500 ${
              inputAnim ? "ring-2 ring-blue-400 scale-105 shadow-lg" : ""
            }`}
            value={input}
            onChange={handleInputChange}
            placeholder="Add a todo..."
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
          />
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded"
            onClick={addTodo}
          >
            Add
          </button>
        </div>
        {alert && <div className="mb-4 text-red-500 text-sm">{alert}</div>}
        <ul className="space-y-2">
          {pagedTodos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center gap-2 transition-all duration-500 ${
                deleteAnimId === todo.id
                  ? "opacity-0 scale-90 blur-sm"
                  : "opacity-100 scale-100"
              }`}
            >
              {editingId === todo.id ? (
                <>
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                  />
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={saveEdit}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 px-2 py-1 rounded"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{todo.title}</span>
                  <button
                    className="bg-yellow-400 px-2 py-1 rounded"
                    onClick={() => startEdit(todo)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        {hasMore && (
          <button
            className={`mt-4 bg-blue-200 px-4 py-1 rounded w-full transition-all duration-500 ${
              showMoreAnim ? "animate-pulse scale-105" : ""
            }`}
            onClick={handleShowMore}
            disabled={showMoreAnim}
          >
            {showMoreAnim ? "Loading..." : "Show more"}
          </button>
        )}
        {/* Confirm Delete Dialog */}
        {confirmId !== null && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-2xl flex flex-col items-center pointer-events-auto border border-gray-200 min-w-[260px] max-w-xs">
              <p className="mb-4 text-center text-lg font-semibold text-gray-800">
                Are you sure you want to delete this todo?
              </p>
              <div className="flex gap-4">
                <button
                  className="bg-red-500 text-white px-4 py-1 rounded shadow hover:bg-red-600 transition"
                  onClick={confirmDelete}
                >
                  Yes
                </button>
                <button
                  className="bg-gray-300 px-4 py-1 rounded shadow hover:bg-gray-400 transition"
                  onClick={cancelDelete}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className="mt-8 text-center text-white text-sm border-t pt-4 bg-gradient-to-r from-purple-500 to-blue-500 shadow-inner rounded-t-xl">
        <div className="flex flex-col items-center gap-1">
          <span className="font-semibold tracking-wide">
            &copy; {new Date().getFullYear()} haideptrai
          </span>
          <span className="text-xs opacity-80">
            Simple Todo App with FastAPI &amp; Next.js
          </span>
        </div>
      </footer>
    </div>
  );
}
