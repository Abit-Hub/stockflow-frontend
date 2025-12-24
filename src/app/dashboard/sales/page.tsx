/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { salesApi } from "@/lib/api";
import PrintReceiptModal from "@/components/PrintReceiptModal";
import {
  Search,
  Printer,
  Eye,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printSale, setPrintSale] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Summary
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadSales();
    loadSummary();
  }, []);

  const loadSales = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;

      const response = await salesApi.getAll(params);
      setSales(response.data.sales);
    } catch (error) {
      console.error("Failed to load sales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await salesApi.getSummary(params);
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to load summary:", error);
    }
  };

  const handleApplyFilters = () => {
    loadSales();
    loadSummary();
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPaymentMethodFilter("");
    setSearchQuery("");
    setTimeout(() => {
      loadSales();
      loadSummary();
    }, 0);
  };

  const handleViewDetails = async (saleId: string) => {
    try {
      const response = await salesApi.getById(saleId);
      setSelectedSale(response.data.sale);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to load sale details:", error);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.customerName &&
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
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
        <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-600 mt-1">View and manage all transactions</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <p className="text-sm font-medium">Total Sales</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalSales)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm font-medium">Total Profit</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalProfit)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <CreditCard className="h-4 w-4" />
              <p className="text-sm font-medium">Transactions</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalTransactions}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="h-4 w-4" />
              <p className="text-sm font-medium">Avg Transaction</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.averageTransaction)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start date"
              />
            </div>

            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End date"
              />
            </div>

            <div>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Payment Methods</option>
                <option value="CASH">Cash</option>
                <option value="TRANSFER">Transfer</option>
                <option value="POS">POS</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cashier
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">
                    {sale.invoiceNumber}
                  </p>
                  {sale.isVoid && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                      VOID
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(sale.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {sale.customerName || "-"}
                  {sale.customerPhone && (
                    <p className="text-xs text-gray-500">
                      {sale.customerPhone}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {sale.items.length} items
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                    {sale.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(Number(sale.total))}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-green-600">
                  {formatCurrency(Number(sale.totalProfit))}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {sale.cashier.name}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleViewDetails(sale.id)}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No sales found</p>
          </div>
        )}
      </div>

      {/* Sale Details Modal */}
      {showDetailsModal && selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSale(null);
          }}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onPrint={(sale: any) => {
            setPrintSale(sale);
            setShowPrintModal(true);
          }}
        />
      )}

      {showPrintModal && printSale && (
        <PrintReceiptModal
          sale={printSale}
          onClose={() => {
            setShowPrintModal(false);
            setPrintSale(null);
          }}
        />
      )}
    </div>
  );
}

// Sale Details Modal Component
function SaleDetailsModal({
  sale,
  onClose,
  formatCurrency,
  formatDate,
  onPrint,
}: {
  sale: any;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onPrint: (sale: any) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Sale Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">{sale.invoiceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sale Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-medium text-gray-900">
                {formatDate(sale.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cashier</p>
              <p className="font-medium text-gray-900">{sale.cashier.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium text-gray-900">{sale.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                  sale.isVoid
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {sale.isVoid ? "VOID" : "COMPLETED"}
              </span>
            </div>
            {sale.customerName && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-medium text-gray-900">
                    {sale.customerName}
                  </p>
                </div>
                {sale.customerPhone && (
                  <div>
                    <p className="text-sm text-gray-600">Customer Phone</p>
                    <p className="font-medium text-gray-900">
                      {sale.customerPhone}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.product.sku}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {formatCurrency(Number(item.unitPrice))}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(Number(item.subtotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(Number(sale.subtotal))}
              </span>
            </div>
            {Number(sale.discount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Discount ({sale.discountType === "PERCENTAGE" ? "%" : "₦"})
                </span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(Number(sale.discount))}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(Number(sale.total))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Profit</span>
              <span className="font-medium text-green-600">
                {formatCurrency(Number(sale.totalProfit))}
              </span>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                {sale.notes}
              </p>
            </div>
          )}
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onPrint(sale)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer className="h-5 w-5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
