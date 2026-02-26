import { ChevronDown, FileText, HelpCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 px-4 bg-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 w-64 px-2">
        <div className="flex -space-x-1">
          <div className="h-5 w-2 rounded-full bg-blue-600 transform rotate-12"></div>
          <div className="h-5 w-2 rounded-full bg-blue-500 transform rotate-12"></div>
          <div className="h-5 w-2 rounded-full bg-blue-400 transform rotate-12"></div>
        </div>
        <span className="text-2xl font-black tracking-tighter text-[#0f1f4b]">
          wave
        </span>
      </div>

      {/* Right side nav */}
      <div className="flex items-center gap-3">
        <button className="flex h-8 w-8 items-center justify-center rounded bg-[#ebf3ff] text-blue-600 hover:bg-blue-100 ml-1">
          <FileText className="h-4 w-4" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-blue-600 hover:bg-gray-50">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="ml-2 flex items-center gap-2 rounded bg-[#ebf3ff] px-3 py-1.5 text-sm font-semibold text-[#0f1f4b] hover:bg-blue-100">
          <span>Coworking Cube</span>
          <span className="rounded bg-[#fceddb] px-1.5 py-0.5 text-[0.65rem] uppercase font-bold text-[#8c4b00]">
            Starter
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-500 ml-1" />
        </button>
      </div>
    </header>
  );
}
