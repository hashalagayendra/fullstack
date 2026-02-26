"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 flex-col border-r border-gray-200 bg-[#fbfcff] px-2 py-4 hidden md:flex shrink-0">
      <button className="mb-6 flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
          <Plus className="h-4 w-4" strokeWidth={3} />
        </div>
        Create new
      </button>

      <div className="font-bold text-gray-500 text-xs tracking-wider mb-2 px-4 uppercase mt-4">
        Nav Menu
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <Link
          href="/"
          className={`rounded-r-full px-4 py-2.5 text-sm font-bold flex items-center gap-2 relative cursor-pointer w-[95%] transition-colors ${
            isActive("/")
              ? "bg-[#ebf3ff] text-[#0f1f4b]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {isActive("/") && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          )}
          <FileText
            className={`h-4 w-4 ${isActive("/") ? "text-blue-600" : "text-gray-400"}`}
          />
          Estimates
        </Link>
      </nav>
    </aside>
  );
}
