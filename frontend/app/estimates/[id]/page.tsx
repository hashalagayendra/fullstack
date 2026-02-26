"use client";

import { useParams, useRouter } from "next/navigation";
import { useEstimates } from "../../context/EstimatesContext";
import { useState, useEffect } from "react";
import { fetchEstimate, type EstimateData } from "../../utils/api";
import {
  ChevronDown,
  CheckCircle2,
  Send,
  ThumbsUp,
  FileText,
  Info,
} from "lucide-react";

function timeAgo(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function EstimateDetail() {
  const params = useParams();
  const router = useRouter();
  const { estimates, updateEstimateStatus, refreshEstimates } = useEstimates();

  const id = params.id as string;

  // Try context first
  const contextEstimate = estimates.find(
    (e) => String(e.id) === id || e.number === id,
  );

  // If not in context, fetch from API
  const [apiEstimate, setApiEstimate] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(!contextEstimate);

  useEffect(() => {
    if (contextEstimate) {
      setLoading(false);
      return;
    }
    fetchEstimate(id)
      .then((data) => setApiEstimate(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, contextEstimate]);

  const estimateSource = contextEstimate
    ? {
        id: contextEstimate.id,
        number: contextEstimate.number,
        customer: contextEstimate.customer,
        amount: contextEstimate.amount,
        validUntil: contextEstimate.validUntil ?? "",
        date: contextEstimate.date,
        status: contextEstimate.status,
        items: contextEstimate.items,
        customerObj: contextEstimate.customerObj,
      }
    : apiEstimate
      ? {
          id: apiEstimate.id,
          number: apiEstimate.number,
          customer: apiEstimate.customer,
          amount: apiEstimate.amount,
          validUntil: apiEstimate.valid_until,
          date: apiEstimate.date,
          status: apiEstimate.status,
          items: apiEstimate.items?.map((li) => ({
            id: li.id,
            name: li.name,
            description: li.description,
            price: li.price,
            quantity: li.quantity,
          })),
          customerObj: apiEstimate.customer_obj
            ? {
                id: apiEstimate.customer_obj.id,
                name: apiEstimate.customer_obj.name,
                email: apiEstimate.customer_obj.email,
                phone: apiEstimate.customer_obj.phone,
              }
            : undefined,
        }
      : null;

  const [localStatus, setLocalStatus] = useState<string>(
    estimateSource?.status ?? "Draft",
  );

  // Sync local status when estimate loads
  useEffect(() => {
    if (estimateSource?.status) {
      setLocalStatus(estimateSource.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimateSource?.status]);

  if (loading) {
    return (
      <main className="flex-1 overflow-auto bg-[#f8f9fa] p-8 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading…</p>
      </main>
    );
  }

  if (!estimateSource) {
    return (
      <main className="flex-1 overflow-auto bg-[#f8f9fa] p-8 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Estimate not found.</p>
      </main>
    );
  }

  const estimate = estimateSource;
  const isDraft = localStatus === "Draft";
  const isApproved = localStatus === "Approved";
  const isSent = localStatus === "Sent";

  const setStatus = async (status: string) => {
    setLocalStatus(status);
    try {
      await updateEstimateStatus(String(estimate.id), status);
      await refreshEstimates();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <main className="flex-1 overflow-auto bg-[#f8f9fa] p-8 px-10">
      <div className="mx-auto max-w-[900px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/")}
              className="mb-2 text-sm text-blue-600 hover:underline font-medium"
            >
              ← Back to Estimates
            </button>
            <h1 className="text-[28px] font-bold text-[#0f1f4b]">
              Estimate #{estimate.number}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex divide-x divide-gray-200 rounded-full border border-gray-300 bg-white overflow-hidden shadow-sm">
              <button className="px-5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                More actions
              </button>
              <button className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors">
                <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            <button
              onClick={() => router.push("/new")}
              className="rounded-full border border-blue-600 bg-white px-5 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
            >
              Create another estimate
            </button>
          </div>
        </div>

        {/* Info Bar */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Status</p>
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                  isDraft
                    ? "bg-yellow-100 text-yellow-800"
                    : isApproved
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {localStatus}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Customer</p>
              <p className="text-sm font-bold text-blue-600">
                {estimate.customer}{" "}
                <Info className="inline h-3.5 w-3.5 text-gray-400 mb-0.5" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Estimate total</p>
              <p className="text-xl font-bold text-[#0f1f4b]">
                {estimate.amount}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Valid until</p>
              <p className="text-sm font-bold text-[#0f1f4b]">
                {estimate.validUntil}
              </p>
            </div>
          </div>
        </div>

        {/* Status Banners */}
        {isDraft && (
          <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-3 flex items-center gap-2 text-sm text-yellow-800">
            <span className="text-yellow-500">⚠</span>
            <span>
              <strong>This is a DRAFT estimate.</strong> You can take further
              actions once you approve it.{" "}
              <button className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">
                Learn more <span className="text-xs">↗</span>
              </button>
            </span>
          </div>
        )}
        {isApproved && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 flex items-center gap-2 text-sm text-blue-800">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <span>
              <strong>Draft approved.</strong> You can now send this estimate to
              your customer.
            </span>
          </div>
        )}
        {isSent && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-5 py-3 flex items-center gap-2 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>
              <strong>Estimate sent.</strong> Waiting for the customer to
              accept.
            </span>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Step 1 — Create */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  isDraft
                    ? "border-blue-600 bg-blue-50"
                    : "border-green-500 bg-green-50"
                }`}
              >
                {isDraft ? (
                  <FileText className="h-5 w-5 text-blue-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#0f1f4b]">Create</p>
                <p className="text-sm text-gray-500">
                  Created:{" "}
                  <span className="text-blue-600">
                    {timeAgo(estimate.date)}
                  </span>
                </p>
              </div>
            </div>
            {isDraft && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStatus("Approved")}
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Approve draft
                </button>
                <button
                  onClick={() =>
                    router.push(
                      estimate.id ? `/new?edit=${estimate.id}` : "/new",
                    )
                  }
                  className="rounded-full border border-blue-600 bg-white px-5 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Edit draft
                </button>
              </div>
            )}
          </div>

          <div className="ml-11 w-0.5 h-4 bg-gray-200" />

          {/* Step 2 — Send */}
          <div
            className={`flex items-center justify-between px-6 py-5 border-b border-gray-100 transition-opacity ${
              isDraft ? "opacity-40" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  isSent
                    ? "border-green-500 bg-green-50"
                    : isApproved
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
                }`}
              >
                {isSent ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Send
                    className={`h-5 w-5 ${isApproved ? "text-blue-600" : "text-gray-400"}`}
                  />
                )}
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#0f1f4b]">Send</p>
                <p className="text-sm text-gray-500">
                  Last sent: {isSent ? "just now" : "Never"}
                </p>
              </div>
            </div>
            {isApproved && (
              <div className="flex items-center gap-3">
                {/* outlined */}
                <button
                  onClick={() => setStatus("Sent")}
                  className="rounded-full border border-blue-600 bg-white px-5 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Mark as sent
                </button>
                {/* solid blue */}
                <button
                  onClick={() => setStatus("Sent")}
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Send
                </button>
              </div>
            )}
          </div>

          <div className="ml-11 w-0.5 h-4 bg-gray-200" />

          {/* Step 3 — Accept */}
          <div
            className={`flex items-center justify-between px-6 py-5 border-b border-gray-100 transition-opacity ${
              !isSent ? "opacity-40" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50">
                <ThumbsUp className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#0f1f4b]">Accept</p>
                <p className="text-sm text-gray-500">
                  Waiting for customer response
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Estimate Sheet ── */}
        <div className="mt-6 mb-10 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Sheet Header */}
          <div className="flex items-start justify-between px-10 pt-10 pb-6 border-b border-gray-100">
            {/* Left — company placeholder */}
            <div className="flex flex-col gap-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-black select-none">
                C
              </div>
              <p className="mt-2 text-xs text-gray-400">Your company name</p>
            </div>

            {/* Right — ESTIMATE title */}
            <div className="text-right">
              <p className="text-3xl font-black tracking-widest text-gray-700 uppercase">
                ESTIMATE
              </p>
              <p className="text-sm font-bold text-blue-600 mt-1">
                Coworking Cube
              </p>
              <p className="text-xs text-gray-500">Canada</p>
            </div>
          </div>

          {/* Bill To + Estimate Meta */}
          <div className="flex items-start justify-between px-10 py-6 border-b border-gray-100">
            {/* Bill To */}
            <div className="space-y-0.5">
              <p className="text-xs text-gray-500 mb-1">Bill to</p>
              <p className="text-sm font-bold text-[#0f1f4b]">
                {estimate.customer}
              </p>
              <p className="text-sm text-gray-600">{estimate.customer}</p>
              {estimate.customerObj?.phone && (
                <p className="text-sm text-gray-600 pt-1">
                  {estimate.customerObj.phone}
                </p>
              )}
              {estimate.customerObj?.email && (
                <p className="text-sm text-blue-600">
                  {estimate.customerObj.email}
                </p>
              )}
            </div>

            {/* Estimate Meta */}
            <div className="text-right space-y-1 min-w-[240px]">
              <div className="flex justify-between gap-8">
                <span className="text-sm text-gray-500 font-medium">
                  Estimate Number:
                </span>
                <span className="text-sm font-bold text-[#0f1f4b]">
                  {estimate.number}
                </span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-sm text-gray-500 font-medium">
                  Estimate Date:
                </span>
                <span className="text-sm text-[#0f1f4b]">
                  {new Date(estimate.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-sm text-gray-500 font-medium">
                  Valid Until:
                </span>
                <span className="text-sm text-[#0f1f4b]">
                  {estimate.validUntil}
                </span>
              </div>
              <div className="flex justify-between gap-8 bg-gray-50 px-3 py-1.5 rounded-lg mt-1">
                <span className="text-sm font-bold text-gray-700">
                  Grand Total (CAD):
                </span>
                <span className="text-sm font-bold text-[#0f1f4b]">
                  {estimate.amount}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-10 py-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#2d3748] text-white">
                  <th className="text-left px-4 py-3 font-bold rounded-tl-lg">
                    Items
                  </th>
                  <th className="text-center px-4 py-3 font-bold">Quantity</th>
                  <th className="text-right px-4 py-3 font-bold">Price</th>
                  <th className="text-right px-4 py-3 font-bold rounded-tr-lg">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estimate.items && estimate.items.length > 0 ? (
                  estimate.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <p className="font-bold text-blue-600">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.description}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-700">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-700">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-center text-gray-400 italic"
                    >
                      No items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Grand Total row */}
            <div className="flex justify-end mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-12">
                <span className="text-sm font-bold text-gray-700">
                  Grand Total (CAD):
                </span>
                <span className="text-sm font-bold text-[#0f1f4b]">
                  {estimate.amount}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-10 py-5 flex items-center justify-center gap-2">
            <span className="text-sm text-gray-500">Powered by</span>
            <div className="flex items-center gap-1">
              <svg
                width="20"
                height="20"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 28L20 8L30 28"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 20L20 36L34 20"
                  stroke="#60a5fa"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-base font-black text-[#0f1f4b] tracking-tight">
                wave
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
