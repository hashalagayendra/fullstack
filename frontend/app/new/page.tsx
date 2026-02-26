"use client";

import { Calendar, ChevronDown, Plus, UserPlus } from "lucide-react";
import Link from "next/link";

export default function NewEstimate() {
  return (
    <main className="flex-1 overflow-auto bg-[#f8f9fa] p-8 px-10">
      <div className="mx-auto max-w-[1000px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-[32px] font-bold text-[#0f1f4b]">New estimate</h1>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-blue-600 bg-white px-6 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
              Preview
            </button>
            <div className="flex divide-x divide-blue-500 rounded-full bg-blue-600 shadow-md overflow-hidden">
              <button className="px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                Save and continue
              </button>
              <button className="px-3 py-2.5 text-white hover:bg-blue-700 transition-colors">
                <ChevronDown className="h-4 w-4" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Section Header */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-semibold text-gray-700">
            Business address and contact details, title, summary, and logo
          </span>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>

        {/* Main Form Box */}
        <div className="rounded-xl border border-gray-200 bg-white p-12 shadow-sm min-h-[500px]">
          <div className="flex items-start justify-between gap-12">
            {/* Left side: Add customer */}
            <div className="w-[380px]">
              <div className="group flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-[#fbfcff] transition-all hover:border-blue-400 hover:bg-blue-50">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 group-hover:scale-110 transition-transform">
                  <UserPlus className="h-8 w-8 text-blue-500" />
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-white">
                    <Plus className="h-4 w-4" strokeWidth={3} />
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  Add customer
                </span>
              </div>
            </div>

            {/* Right side: Form Fields */}
            <div className="flex flex-1 flex-col gap-6 max-w-[400px]">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-bold text-[#0f1f4b] whitespace-nowrap">
                  Estimate number
                </label>
                <input
                  type="text"
                  defaultValue="45305"
                  className="w-[180px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-right text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-bold text-[#0f1f4b] whitespace-nowrap">
                  Customer ref
                </label>
                <input
                  type="text"
                  className="w-[180px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center justify-between gap-4 w-full">
                  <label className="text-sm font-bold text-[#0f1f4b] whitespace-nowrap">
                    Date
                  </label>
                  <div className="relative w-[180px]">
                    <input
                      type="date"
                      defaultValue="2026-02-26"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center justify-between gap-4 w-full">
                  <label className="text-sm font-bold text-[#0f1f4b] whitespace-nowrap">
                    Valid until
                  </label>
                  <div className="relative w-[180px]">
                    <input
                      type="date"
                      defaultValue="2026-03-28"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-gray-500 mt-1">
                  Within 30 days
                </span>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mt-12 -mx-12">
            <div className="border-t border-gray-100 px-12 py-6">
              <button className="flex items-center gap-2 group">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-600 group-hover:bg-blue-600 transition-colors">
                  <Plus
                    className="h-3 w-3 text-blue-600 group-hover:text-white"
                    strokeWidth={4}
                  />
                </div>
                <span className="text-sm font-bold text-blue-600">
                  Add item
                </span>
              </button>
            </div>

            <div className="border-t border-gray-100 px-12 py-10">
              <div className="flex flex-col items-end gap-6 ml-auto max-w-[400px]">
                {/* Subtotal */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium text-gray-600">
                    Subtotal
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    $0.00
                  </span>
                </div>

                {/* Add Discount */}
                <button className="flex items-center gap-2 group">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-600 group-hover:bg-blue-600 transition-colors">
                    <Plus
                      className="h-3 w-3 text-blue-600 group-hover:text-white"
                      strokeWidth={4}
                    />
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    Add discount
                  </span>
                </button>

                {/* Total */}
                <div className="flex items-center justify-between w-full mt-2">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <select className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer">
                        <option>CAD ($) - Canadian dollar</option>
                        <option>USD ($) - US dollar</option>
                        <option>EUR (€) - Euro</option>
                        <option>GBP (£) - British pound</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-base font-bold text-gray-900">
                      $0.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
