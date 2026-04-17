"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import XpBadge from "@/components/XpBadge";

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setName(localStorage.getItem("name"));
  }, []);

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
      <Link href={role === "admin" ? "/admin/dashboard" : "/dashboard"} className="text-indigo-600 font-bold text-lg">
        JS Learn
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {name && <span className="text-gray-600">Hi, {name}</span>}

        {role === "admin" && (
          <>
            <Link href="/admin/lessons/add" className="text-gray-700 hover:text-indigo-600">Add Lesson</Link>
            <Link href="/admin/lessons/list" className="text-gray-700 hover:text-indigo-600">Manage</Link>
          </>
        )}

        {role && role !== "admin" && (
          <>
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
            <Link href="/roadmap" className="text-gray-700 hover:text-indigo-600">Roadmap</Link>
            <Link href="/tips" className="text-gray-700 hover:text-indigo-600">Pro Tips</Link>
          </>
        )}

        {role && role !== "admin" && <XpBadge />}

        {role ? (
          <button onClick={logout} className="text-red-500 hover:underline">Logout</button>
        ) : (
          <Link href="/login" className="bg-indigo-600 text-white px-4 py-1.5 rounded-md hover:bg-indigo-700">Login</Link>
        )}
      </div>
    </nav>
  );
}
