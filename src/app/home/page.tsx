"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="max-w-md mx-auto py-20 flex flex-col min-h-screen items-center justify-center">
      <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 drop-shadow-lg">
        Welcome to TodoApp
      </h1>
      <p className="mb-8 text-lg text-gray-700 text-center max-w-xs">
        A simple, modern todo list app built with FastAPI &amp; Next.js
      </p>
      <Link
        href="/todo"
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-200"
      >
        Go to Todo List
      </Link>
    </div>
  );
}
