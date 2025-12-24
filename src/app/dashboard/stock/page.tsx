/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { stockApi } from "@/lib/api";
import { Package, TrendingUp, TrendingDown, Edit } from "lucide-react";
import { format } from "date-fns";

export default function StockPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 50 };
      if (typeFilter) params.type = typeFilter;

      const response = await stockApi.getLogs(params);
      setLogs(response.data.logs);
    } catch (error) {
      console.error("Failed to load stock logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (type: string) => {
    setTypeFilter(type);
    setTimeout(() => loadLogs(), 0);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "OUT":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case "ADJUSTMENT":
        return <Edit className="h-5 w-5 text-blue-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "IN":
        return "bg-green-100 text-green-700";
      case "OUT":
        return "bg-red-100 text-red-700";
      case "ADJUSTMENT":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Movement</h1>
        <p className="text-gray-600 mt-1">Track all inventory changes</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              !typeFilter
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange("IN")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              typeFilter === "IN"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Stock In
          </button>
          <button
            onClick={() => handleFilterChange("OUT")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              typeFilter === "OUT"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Stock Out
          </button>
          <button
            onClick={() => handleFilterChange("ADJUSTMENT")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              typeFilter === "ADJUSTMENT"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Adjustments
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Before
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                After
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(log.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">
                    {log.product.name}
                  </p>
                  <p className="text-xs text-gray-500">{log.product.sku}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(log.type)}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(
                        log.type
                      )}`}
                    >
                      {log.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`font-medium ${
                      log.quantity > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {log.quantity > 0 ? "+" : ""}
                    {log.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {log.previousQty}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {log.newQty}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {log.reason}
                  {log.notes && (
                    <p className="text-xs text-gray-500 mt-1">{log.notes}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {log.user.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No stock movements found</p>
          </div>
        )}
      </div>
    </div>
  );
}
