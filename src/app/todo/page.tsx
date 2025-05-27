"use client";

import { useEffect, useState } from "react";

type Todo = {
  id: number;
  title: string;
};

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Backend API URL
  const API = "/api/todos";

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      const response = await fetch(API);
      const data = await response.json();
      setTodos(data);
      setIsLoading(false);
    };

    fetchTodos();
  }, []);

  const handleAddTodo = async () => {
    if (!newTodoTitle) return;

    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTodoTitle }),
    });

    const newTodo = await response.json();
    setTodos((prev) => [...prev, newTodo]);
    setNewTodoTitle("");
  };

  const handleDeleteTodo = async (id: number) => {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-4">Todo List</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What do you need to do?"
        />
        <button
          onClick={handleAddTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200"
        >
          Add Todo
        </button>
      </div>
      {isLoading ? (
        <p className="text-center text-gray-500">Loading todos...</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md"
            >
              <span className="font-medium">{todo.title}</span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      <nav className="flex justify-between items-center mb-8 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
        <div className="font-extrabold text-xl text-white tracking-wide drop-shadow">
          📝 TodoApp
        </div>
        <div className="flex gap-4">
          <a
            href="/"
            className="text-white font-semibold px-3 py-1 rounded hover:bg-white/20 transition-colors duration-200"
          >
            Home
          </a>
          <a
            href="/todo"
            className="text-white font-semibold px-3 py-1 rounded hover:bg-white/20 transition-colors duration-200"
          >
            Todo List
          </a>
        </div>
      </nav>
    </div>
  );
}
