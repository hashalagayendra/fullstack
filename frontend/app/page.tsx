"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEstimates } from "./context/EstimatesContext";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
} from "lucide-react";

const DUMMY_DATA = [
  {
    id: 1,
    status: "Saved",
    date: "2026-02-26",
    number: "45303",
    customer: "Yomal Thushara",
    amount: "$450.00",
    type: "active",
  },
  {
    id: 2,
    status: "Draft",
    date: "2026-02-25",
    number: "45304",
    customer: "Amal Perera",
    amount: "$1,200.00",
    type: "draft",
  },
  {
    id: 3,
    status: "Draft",
    date: "2026-02-24",
    number: "45305",
    customer: "Nimal Silva",
    amount: "$850.00",
    type: "draft",
  },
  {
    id: 4,
    status: "Draft",
    date: "2026-02-23",
    number: "45306",
    customer: "Sunil Kasun",
    amount: "$2,100.00",
    type: "draft",
  },
  {
    id: 5,
    status: "Saved",
    date: "2026-02-22",
    number: "45307",
    customer: "Kamal Pathirana",
    amount: "$320.00",
    type: "active",
  },
];

export default function Home() {
  const { estimates } = useEstimates();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "draft" | "all">(
    "active",
  );

  // Context estimates take priority — exclude dummy entries with the same number
  const contextNumbers = new Set(estimates.map((e) => e.number));
  const dedupedDummy = DUMMY_DATA.filter((d) => !contextNumbers.has(d.number));
  const allData = [...estimates, ...dedupedDummy];

  const filteredData = allData.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  const activeCount = allData.filter((item) => item.type === "active").length;
  const draftCount = allData.filter((item) => item.type === "draft").length;

  return (
    <main className="flex-1 overflow-auto bg-white p-8 px-10">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-[32px] font-bold text-[#0f1f4b]">Estimates</h1>
          <Link
            href="/new"
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_2px_4px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-colors"
          >
            Create estimate
          </Link>
        </div>

        {/* Filters Area */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ebf3ff] text-xs font-bold text-blue-700">
              0
            </span>
            <span>Active filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select className="appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px] text-gray-600">
                <option>All customers</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>

            <div className="relative">
              <select className="appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[160px] text-gray-600">
                <option>All statuses</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>

            <div className="flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="From"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  className="w-[130px] rounded-l border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm placeholder:text-gray-400 text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 z-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative -ml-[1px]">
                <input
                  type="text"
                  placeholder="To"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  className="w-[130px] rounded-r border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm placeholder:text-gray-400 text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 z-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="relative ml-auto">
              <input
                type="text"
                placeholder="Enter estimate #"
                className="w-[200px] rounded border border-gray-300 bg-white py-2 pl-3 pb-2 pr-10 text-sm placeholder:text-gray-400 placeholder:italic focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center border-l border-gray-300 bg-gray-50 w-10 rounded-r">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex justify-center border-b border-gray-200">
          <nav className="-mb-px flex gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 whitespace-nowrap rounded-t-xl px-6 py-2.5 text-[15px] transition-all ${
                activeTab === "active"
                  ? "bg-[#ebf3ff] font-bold text-blue-700 shadow-[inset_0_3px_0_0_#2563eb]"
                  : "font-medium text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-100 border-b-0"
              }`}
            >
              Active{" "}
              <span
                className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-xs border ${
                  activeTab === "active"
                    ? "bg-white text-blue-700 border-blue-200"
                    : "bg-white border-gray-200 text-gray-500"
                }`}
              >
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("draft")}
              className={`flex items-center gap-2 whitespace-nowrap rounded-t-xl px-6 py-2.5 text-[15px] transition-all ${
                activeTab === "draft"
                  ? "bg-[#ebf3ff] font-bold text-blue-700 shadow-[inset_0_3px_0_0_#2563eb]"
                  : "font-medium text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-100 border-b-0"
              }`}
            >
              Draft{" "}
              <span
                className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-xs border ${
                  activeTab === "draft"
                    ? "bg-white text-blue-700 border-blue-200"
                    : "bg-white border-gray-200 text-gray-500"
                }`}
              >
                {draftCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`whitespace-nowrap rounded-t-xl px-6 py-2.5 text-[15px] transition-all ${
                activeTab === "all"
                  ? "bg-[#ebf3ff] font-bold text-blue-700 shadow-[inset_0_3px_0_0_#2563eb]"
                  : "font-medium text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-100 border-b-0"
              }`}
            >
              All
            </button>
          </nav>
        </div>

        {/* Table */}
        <div className="overflow-x-auto pb-4 min-h-[300px]">
          <table className="min-w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="px-4 py-4 font-bold text-[#0f1f4b]">
                  Status
                </th>
                <th scope="col" className="px-4 py-4 font-bold text-[#0f1f4b]">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                    Date <ChevronDown className="h-3 w-3" strokeWidth={3} />
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 font-bold text-[#0f1f4b]">
                  Number
                </th>
                <th scope="col" className="px-4 py-4 font-bold text-[#0f1f4b]">
                  Customer
                </th>
                <th scope="col" className="px-4 py-4 font-bold text-[#0f1f4b]">
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 font-bold text-[#0f1f4b] text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => {
                // context estimates use numeric id, dummy use number string
                const isContextItem = estimates.some((e) => e.id === item.id);
                const detailHref = isContextItem
                  ? `/estimates/${item.id}`
                  : `/estimates/${item.number}`;
                return (
                  <tr
                    key={item.id}
                    onClick={() => router.push(detailHref)}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                          item.status === "Draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "Approved"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-[#e2e8f0] text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-gray-700">{item.date}</td>
                    <td className="px-4 py-5">
                      <span className="font-bold text-blue-600 hover:underline">
                        {item.number}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-gray-700 font-medium">
                      {item.customer}
                    </td>
                    <td className="px-4 py-5 text-gray-700">{item.amount}</td>
                    <td className="px-4 py-5 text-right">
                      <div className="flex items-center justify-end opacity-100">
                        <div className="flex divide-x divide-blue-200 rounded-full border border-blue-600 shadow-sm bg-white overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="px-4 py-1 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Send
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="px-1.5 py-1 text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <ChevronDown
                              className="h-4 w-4"
                              strokeWidth={2.5}
                            />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-500 italic"
                  >
                    No estimates found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-5 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <div className="relative">
              <select className="appearance-none rounded border border-gray-300 bg-white py-1 pl-2 pr-7 focus:border-blue-500 focus:outline-none text-gray-700 font-semibold text-sm">
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            </div>
            <span>per page</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#0f1f4b]">
              1–{filteredData.length} of {filteredData.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-blue-300 bg-white"
                disabled
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-blue-300 bg-white"
                disabled
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat / Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#0f1f4b] text-white shadow-[0_4px_12px_rgba(15,31,75,0.4)] hover:bg-[#1a2b5c] transition-colors">
          <MessageSquare className="h-7 w-7 fill-current" />
        </button>
      </div>
    </main>
  );
}
