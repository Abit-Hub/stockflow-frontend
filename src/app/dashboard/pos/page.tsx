/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { productsApi, categoriesApi, salesApi } from "@/lib/api";
import { Product } from "@/types";
import BarcodeScanner from "@/components/BarcodeScanner";
import PrintReceiptModal from "@/components/PrintReceiptModal";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle,
  Scan,
  Printer,
} from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Checkout form
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"AMOUNT" | "PERCENTAGE">(
    "AMOUNT"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TRANSFER" | "POS"
  >("CASH");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsApi.getAll({ isActive: true }),
        categoriesApi.getAll(),
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      // Increase quantity
      if (existingItem.quantity < product.quantity) {
        setCart(
          cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        alert(`Only ${product.quantity} units available in stock`);
      }
    } else {
      // Add new item
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowBarcodeScanner(false);

    try {
      const response = await productsApi.searchByBarcode(barcode);
      addToCart(response.data.product);
    } catch (error) {
      alert("Product not found");
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find((item) => item.product.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.product.quantity) {
      alert(`Only ${item.product.quantity} units available`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerName("");
    setCustomerPhone("");
  };

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.product.sellingPrice) * item.quantity,
    0
  );

  const discountAmount =
    discountType === "PERCENTAGE" ? (subtotal * discount) / 100 : discount;

  const total = subtotal - discountAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (total <= 0) {
      alert("Total must be greater than 0");
      return;
    }

    setIsProcessing(true);

    try {
      const saleData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        discount: discountAmount,
        discountType,
        paymentMethod,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      };

      const response = await salesApi.create(saleData);

      // Success!
      setLastSale(response.data.sale);
      setShowSuccess(true);
      clearCart();

      // Reload products to update stock
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to complete sale");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Success Modal */}
      {showSuccess && lastSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sale Completed Successfully!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Invoice: {lastSale.invoiceNumber}
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(Number(lastSale.total))}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Profit: {formatCurrency(Number(lastSale.totalProfit))}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setShowPrintModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Printer className="h-5 w-5" />
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  New Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {showPrintModal && lastSale && (
        <PrintReceiptModal
          sale={lastSale}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      <div className="flex gap-6 h-full">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-gray-600 mt-1">
              Search and add products to cart
            </p>
          </div>

          {/* Search, Barcode and Filter */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowBarcodeScanner(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Scan className="h-5 w-5" />
              Scan Barcode
            </button>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  !selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.quantity === 0}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <div className="mb-2">
                    <p className="font-medium text-gray-900 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(Number(product.sellingPrice))}
                      </p>
                      <p
                        className={`text-xs ${
                          product.quantity <= product.reorderLevel
                            ? "text-orange-600 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        Stock: {product.quantity}
                      </p>
                    </div>
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-96 bg-white border border-gray-200 rounded-lg flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Cart</h2>
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
                {cart.length} items
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.product.sku}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatCurrency(Number(item.product.sellingPrice))}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.product.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <span className="ml-auto font-medium text-gray-900">
                      {formatCurrency(
                        Number(item.product.sellingPrice) * item.quantity
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Section */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Customer Info */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Customer name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="tel"
                  placeholder="Customer phone (optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Discount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="AMOUNT">₦</option>
                    <option value="PERCENTAGE">%</option>
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["CASH", "TRANSFER", "POS"].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        paymentMethod === method
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Complete Sale"}
              </button>

              <button
                onClick={clearCart}
                disabled={isProcessing}
                className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barcode Scanner */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </div>
  );
}
