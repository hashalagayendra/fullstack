"use client";

import {
  Calendar,
  ChevronDown,
  GripVertical,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEstimates,
  EstimateStatus,
  EstimateType,
} from "../context/EstimatesContext";
import { DUMMY_DATA } from "../page";

const INITIAL_ITEMS = [
  { id: 1, name: "HP Laptop", description: "RTX 2050", price: 450.0 },
  { id: 2, name: "Pen", description: "Blue Pen", price: 10.0 },
];

interface SelectedItem {
  id: number;
  itemId: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

function NewEstimateForm() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    email: string;
    phone: string;
  } | null>(null);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
  });

  const [customers, setCustomers] = useState([
    { id: 1, name: "Person", email: "", phone: "" },
    {
      id: 2,
      name: "Shenali Hirushika",
      email: "shenu123@gmail.com",
      phone: "0722640409",
    },
    { id: 3, name: "Yomal Thushara", email: "", phone: "" },
  ]);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const handleCreateCustomer = () => {
    if (!newCustomer.name) return;
    const fullName = newCustomer.firstName
      ? `${newCustomer.firstName} ${newCustomer.lastName}`.trim()
      : newCustomer.name;
    const created = {
      id: Date.now(),
      name: fullName,
      email: newCustomer.email,
      phone: newCustomer.phone,
    };
    setCustomers([created, ...customers]);
    setSelectedCustomer(created);
    setShowCreateCustomerModal(false);
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
    });
  };

  // Form state for new item
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
  });

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectItem = (item: (typeof INITIAL_ITEMS)[0]) => {
    const newSelected: SelectedItem = {
      id: Date.now(),
      itemId: item.id,
      name: item.name,
      description: item.description,
      quantity: 1,
      price: item.price,
    };
    setSelectedItems([...selectedItems, newSelected]);
    setShowItemDropdown(false);
    setSearchQuery("");
  };

  const updateLineItem = (
    id: number,
    field: keyof SelectedItem,
    value: any,
  ) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeLineItem = (id: number) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const handleCreateItem = () => {
    if (!newItem.name) return;

    const itemToAdd = {
      id: Date.now(),
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price) || 0,
    };

    setItems([itemToAdd, ...items]);
    setShowCreateModal(false);
    setNewItem({ name: "", description: "", price: "" }); // Reset form
  };

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const { addEstimate, updateEstimate, estimates } = useEstimates();

  // Edit mode: load existing estimate from context or dummy data
  const editId = searchParams.get("edit");
  let existingEstimate = editId
    ? estimates.find((e) => String(e.id) === editId || e.number === editId)
    : null;

  if (!existingEstimate && editId) {
    const dummy = DUMMY_DATA.find((d) => d.number === editId);
    if (dummy) {
      existingEstimate = {
        id: Date.now(), // Create a new ID since we'll insert to context on save
        number: dummy.number,
        date: dummy.date,
        customer: dummy.customer,
        amount: dummy.amount,
        status: dummy.status as EstimateStatus,
        type: dummy.type as EstimateType,
      };
    }
  }

  // Pre-populate form when editing
  useEffect(() => {
    if (existingEstimate?.customerObj) {
      setSelectedCustomer(existingEstimate.customerObj);
    } else if (existingEstimate?.customer) {
      const match = customers.find(
        (c) => c.name === existingEstimate!.customer,
      );
      if (match) setSelectedCustomer(match);
    }

    if (existingEstimate?.items && existingEstimate.items.length > 0) {
      setSelectedItems(
        existingEstimate.items.map((it) => ({
          id: it.id,
          itemId: it.id,
          name: it.name,
          description: it.description,
          quantity: it.quantity,
          price: it.price,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const [errors, setErrors] = useState<{ customer?: string; items?: string }>(
    {},
  );

  const handleSave = () => {
    const newErrors: { customer?: string; items?: string } = {};

    if (!selectedCustomer) {
      newErrors.customer = "Please select a customer before saving.";
    }
    if (selectedItems.length === 0) {
      newErrors.items = "Please add at least one item to the estimate.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const itemsToStore = selectedItems.map((it) => ({
      id: it.id,
      name: it.name,
      description: it.description,
      price: it.price,
      quantity: it.quantity,
    }));

    const isExistingInContext =
      existingEstimate && estimates.some((e) => e.id === existingEstimate.id);

    if (existingEstimate && isExistingInContext) {
      // Edit mode (already in context) — update in place
      updateEstimate(existingEstimate.id, {
        customer: selectedCustomer!.name,
        amount: `$${subtotal.toFixed(2)}`,
        customerObj: selectedCustomer!,
        items: itemsToStore,
        status: existingEstimate.status,
      });
    } else if (existingEstimate && !isExistingInContext) {
      // Edit mode (from dummy) — promote to context
      addEstimate({
        ...existingEstimate,
        customer: selectedCustomer!.name,
        amount: `$${subtotal.toFixed(2)}`,
        customerObj: selectedCustomer!,
        items: itemsToStore,
      });
    } else {
      // New estimate
      addEstimate({
        id: Date.now(),
        number: String(Math.floor(40000 + Math.random() * 9999)),
        date: new Date().toISOString().split("T")[0],
        customer: selectedCustomer!.name,
        amount: `$${subtotal.toFixed(2)}`,
        status: "Draft" as const,
        type: "draft" as const,
        customerObj: selectedCustomer!,
        items: itemsToStore,
      });
    }
    router.push("/");
  };

  return (
    <main className="flex-1 overflow-auto bg-[#f8f9fa] p-8 px-10">
      <div className="mx-auto max-w-[1000px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-[32px] font-bold text-[#0f1f4b]">
            {existingEstimate
              ? `Edit estimate #${existingEstimate.number}`
              : "New estimate"}
          </h1>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-blue-600 bg-white px-6 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
              Preview
            </button>
            <div className="flex divide-x divide-blue-500 rounded-full bg-blue-600 shadow-md overflow-hidden">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
              >
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
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm min-h-[600px] pb-20 relative">
          <div className="p-12 pb-6">
            <div className="flex items-start justify-between gap-12">
              {/* Left side: Add customer */}
              <div className="w-[380px] relative">
                {selectedCustomer ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-1">
                    <p className="text-xs text-gray-500">Bill to</p>
                    <p className="text-sm font-bold text-[#0f1f4b]">
                      {selectedCustomer.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedCustomer.name}
                    </p>
                    {selectedCustomer.phone && (
                      <p className="text-sm text-gray-600 pt-1">
                        {selectedCustomer.phone}
                      </p>
                    )}
                    {selectedCustomer.email && (
                      <p className="text-sm text-gray-600">
                        {selectedCustomer.email}
                      </p>
                    )}
                    <div className="flex flex-col gap-0.5 pt-1">
                      <button
                        onClick={() => setSelectedCustomer(null)}
                        className="text-left text-sm font-bold text-blue-600 hover:underline"
                      >
                        Choose a different customer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setShowCustomerDropdown(true);
                      setErrors((e) => ({ ...e, customer: undefined }));
                    }}
                    className={`group flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed bg-[#fbfcff] transition-all hover:border-blue-400 hover:bg-blue-50 ${
                      errors.customer ? "border-red-400" : "border-gray-200"
                    }`}
                  >
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
                )}

                {/* Customer validation error */}
                {errors.customer && (
                  <p className="mt-2 text-sm font-medium text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.customer}
                  </p>
                )}

                {/* Customer Dropdown */}
                {showCustomerDropdown && (
                  <div className="absolute left-0 top-0 z-20 w-full overflow-hidden rounded-xl border border-blue-400 bg-white shadow-xl ring-4 ring-blue-50">
                    {/* Search */}
                    <div className="p-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Type a customer name"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          onBlur={() =>
                            setTimeout(
                              () => setShowCustomerDropdown(false),
                              200,
                            )
                          }
                          className="w-full rounded-lg border border-blue-500 bg-white py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Customer List */}
                    <div className="max-h-[240px] overflow-auto">
                      {filteredCustomers.map((customer, idx) => (
                        <div
                          key={customer.id}
                          className={`px-4 py-3 cursor-pointer text-sm font-bold text-[#0f1f4b] hover:bg-blue-50 transition-colors ${
                            idx === 0 ? "bg-blue-50" : ""
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedCustomer(customer);
                            setShowCustomerDropdown(false);
                            setCustomerSearch("");
                          }}
                        >
                          {customer.name}
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 p-3">
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setShowCustomerDropdown(false);
                          setShowCreateCustomerModal(true);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-600">
                          <Plus
                            className="h-3 w-3 text-blue-600"
                            strokeWidth={4}
                          />
                        </div>
                        Create a new customer
                      </button>
                    </div>
                  </div>
                )}
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
          </div>

          {/* Items Section */}
          <div className="mt-8 border-t border-gray-100">
            {/* Add Item Button / Dropdown - at the top */}
            <div className="relative px-12 py-6 border-b border-gray-100">
              {!showItemDropdown ? (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setShowItemDropdown(true);
                      setErrors((e) => ({ ...e, items: undefined }));
                    }}
                    className="flex items-center gap-2 group w-fit"
                  >
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
                  {errors.items && (
                    <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.items}
                    </p>
                  )}
                </div>
              ) : (
                <div className="absolute left-10 top-4 z-10 w-[600px] overflow-hidden rounded-xl border border-blue-400 bg-white shadow-xl ring-4 ring-blue-50">
                  {/* Search Bar */}
                  <div className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Type an item name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowItemDropdown(false);
                          }, 200);
                        }}
                        className="w-full rounded-lg border border-blue-500 bg-white py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="max-h-[450px] overflow-auto">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex cursor-pointer items-center justify-between border-b border-gray-50 px-6 py-3 transition-colors hover:bg-blue-50"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectItem(item);
                        }}
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.description}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 bg-white p-3">
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input onBlur from firing immediately
                        setShowCreateModal(true);
                        setShowItemDropdown(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" strokeWidth={3} />
                      Create new product or service
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Items List */}
            <div className="flex flex-col divide-y divide-gray-100">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start px-6 py-6 hover:bg-gray-50/50 relative"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <button className="mt-2 text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-5 w-5" />
                    </button>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-[#0f1f4b] mb-2">
                            {item.name}
                          </p>
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none min-h-[40px] resize-none"
                          />
                        </div>

                        <div className="w-[80px]">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "quantity",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-900 focus:outline-none"
                          />
                        </div>

                        <div className="w-[120px]">
                          <input
                            type="text"
                            value={item.price.toFixed(2)}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "price",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-right text-sm font-medium text-gray-900 focus:outline-none"
                          />
                        </div>

                        <div className="w-[100px] text-right pt-2">
                          <span className="text-sm font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="mt-2 text-blue-500 hover:text-blue-600 p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 px-12 py-10">
              <div className="flex flex-col items-end gap-6 ml-auto max-w-[400px]">
                {/* Subtotal */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium text-gray-600">
                    Subtotal
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between w-full mt-2">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <span>$</span>
                    <span>{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes / Terms Section */}
      <div className="mx-auto max-w-[1000px] mt-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <p className="text-sm font-bold text-gray-800 mb-2">Notes / Terms</p>
          <textarea
            placeholder="Enter notes or terms of service that are visible to your customer"
            className="w-full min-h-[100px] text-sm text-blue-400 italic placeholder:text-blue-400 placeholder:italic bg-transparent focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="mx-auto max-w-[1000px] mt-6 mb-10 flex items-center justify-end gap-3">
        <button className="rounded-full border border-blue-600 bg-white px-6 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
          Preview
        </button>
        <div className="flex divide-x divide-blue-500 rounded-full bg-blue-600 shadow-md overflow-hidden">
          <button
            onClick={handleSave}
            className="px-8 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          >
            Save and continue
          </button>
          <button className="px-3 py-2.5 text-white hover:bg-blue-700 transition-colors">
            <ChevronDown className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="w-full max-w-[500px] overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-[20px] font-bold text-[#0f1f4b]">
                Create new product or service
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#0f1f4b]">
                  Item name<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Name of the product or service"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#0f1f4b]">
                  Description
                </label>
                <textarea
                  className="w-full min-h-[100px] rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Enter your text here"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#0f1f4b]">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]">
                    $
                  </span>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#d1d5db] bg-white py-3 pl-8 pr-4 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#0f1f4b]">
                  Income account<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-[#d1d5db] bg-white px-4 py-3 pr-10 text-[14px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer">
                    <option>Sales</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white p-6 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full border border-blue-600 px-7 py-2 text-[14px] font-bold text-blue-600 hover:bg-blue-50 transition-colors bg-white shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                disabled={!newItem.name}
                className="rounded-full bg-blue-600 px-9 py-2 text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {showCreateCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-[20px] font-bold text-[#0f1f4b]">
                New customer
              </h2>
              <button
                onClick={() => setShowCreateCustomerModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Customer name */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#0f1f4b]">
                  Customer<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Business or Person"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#0f1f4b]">
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#0f1f4b]">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#0f1f4b]">
                  Contact
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={newCustomer.firstName}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        firstName: e.target.value,
                      })
                    }
                    className="flex-1 rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={newCustomer.lastName}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        lastName: e.target.value,
                      })
                    }
                    className="flex-1 rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <button
                onClick={() => setShowCreateCustomerModal(false)}
                className="rounded-full border border-blue-600 px-7 py-2 text-[14px] font-bold text-blue-600 hover:bg-blue-50 transition-colors bg-white shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustomer.name}
                className="rounded-full bg-blue-600 px-9 py-2 text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function NewEstimatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading…
        </div>
      }
    >
      <NewEstimateForm />
    </Suspense>
  );
}
