/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { productsApi, categoriesApi, stockApi } from "@/lib/api";
import { Product } from "@/types";
import {
  Plus,
  Search,
  Edit,
  Package,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsApi.getAll({ isActive: true }),
        categoriesApi.getAll(),
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error("Failed to load products:", error);
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
    const matchesLowStock =
      !showLowStock || product.quantity <= product.reorderLevel;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleRestock = (product: Product) => {
    setSelectedProduct(product);
    setShowRestockModal(true);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your inventory</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                !selectedCategory
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Categories
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

            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                showLowStock
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Low Stock Only
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cost Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Selling Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {product.sku}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    {product.category.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(Number(product.costPrice))}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(Number(product.sellingPrice))}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        product.quantity <= product.reorderLevel
                          ? "text-orange-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.quantity}
                    </span>
                    {product.quantity <= product.reorderLevel && (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleRestock(product)}
                    className="text-green-600 hover:text-green-700"
                    title="Restock"
                  >
                    <Package className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          categories={categories}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            loadData();
          }}
        />
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedProduct && (
        <RestockModal
          product={selectedProduct}
          onClose={() => {
            setShowRestockModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowRestockModal(false);
            setSelectedProduct(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Create Product Modal Component
function CreateProductModal({
  categories,
  onClose,
  onSuccess,
}: {
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    costPrice: "",
    sellingPrice: "",
    quantity: "",
    reorderLevel: "5",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await productsApi.create({
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        quantity: Number(formData.quantity),
        reorderLevel: Number(formData.reorderLevel),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Product
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Level *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Product Modal Component
function EditProductModal({
  product,
  categories,
  onClose,
  onSuccess,
}: {
  product: Product;
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || "",
    categoryId: product.category.id,
    costPrice: product.costPrice,
    sellingPrice: product.sellingPrice,
    reorderLevel: product.reorderLevel.toString(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await productsApi.update(product.id, {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        reorderLevel: Number(formData.reorderLevel),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Product
            </h2>
            <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Level *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                Current Stock:{" "}
                <span className="font-medium">{product.quantity} units</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Use the Restock button to add more inventory
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Restock Modal Component
function RestockModal({
  product,
  onClose,
  onSuccess,
}: {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState(product.costPrice);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await stockApi.restock({
        productId: product.id,
        quantity: Number(quantity),
        costPrice: Number(costPrice),
        notes: notes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to restock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const newTotal = product.quantity + Number(quantity || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Restock Product
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            <p className="text-sm text-gray-600 mt-2">
              Current Stock:{" "}
              <span className="font-medium">{product.quantity} units</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Add *
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Price (₦)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave unchanged to use current cost price
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., New shipment from supplier"
            />
          </div>

          {quantity && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                New Total: <span className="font-bold">{newTotal} units</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Restocking..." : "Restock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
