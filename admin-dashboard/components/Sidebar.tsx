"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Buses", href: "/buses" },
  { label: "Routes", href: "/routes" },
  { label: "Drivers", href: "/drivers" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show sidebar on the login page
  if (pathname === "/login" || pathname === "/") return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-bold text-green-700">Let'sMove Kigali</h2>
        <p className="text-xs text-gray-400">Admin Portal</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                active ? "bg-green-700 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}