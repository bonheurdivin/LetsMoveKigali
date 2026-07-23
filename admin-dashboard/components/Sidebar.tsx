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
    <aside className="w-56 min-h-screen bg-green-800 border-r border-green-900 flex flex-col">
      <div className="p-5 border-b border-green-700">
        <h2 className="font-bold text-white">Let'sMove Kigali</h2>
        <p className="text-xs text-green-200">Admin Portal</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                active ? "bg-white text-green-800" : "text-green-100 hover:bg-green-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-200 hover:bg-red-900/30"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}