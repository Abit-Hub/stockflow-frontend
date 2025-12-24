/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { forwardRef } from "react";
import { format } from "date-fns";
import Barcode from "react-barcode";

interface ReceiptProps {
  sale: any;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ sale }, ref) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
  };

  return (
    <div ref={ref} className="bg-white p-8 max-w-sm mx-auto font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">STOCKFLOW</h1>
        <p className="text-xs">Inventory Management System</p>
        <p className="text-xs">Phone: +234-XXX-XXXX-XXX</p>
        <p className="text-xs">Email: info@stockflow.com</p>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

      {/* Invoice Info */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between">
          <span className="font-bold">INVOICE:</span>
          <span>{sale.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">DATE:</span>
          <span>{formatDate(sale.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">CASHIER:</span>
          <span>{sale.cashier.name}</span>
        </div>
        {sale.customerName && (
          <div className="flex justify-between">
            <span className="font-bold">CUSTOMER:</span>
            <span>{sale.customerName}</span>
          </div>
        )}
        {sale.customerPhone && (
          <div className="flex justify-between">
            <span className="font-bold">PHONE:</span>
            <span>{sale.customerPhone}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

      {/* Items */}
      <div className="mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-left pb-2">ITEM</th>
              <th className="text-center pb-2">QTY</th>
              <th className="text-right pb-2">PRICE</th>
              <th className="text-right pb-2">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2">
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-gray-600 text-xs">
                      {item.product.sku}
                    </div>
                  </div>
                </td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">
                  {formatCurrency(Number(item.unitPrice))}
                </td>
                <td className="text-right py-2 font-medium">
                  {formatCurrency(Number(item.subtotal))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

      {/* Totals */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>SUBTOTAL:</span>
          <span>{formatCurrency(Number(sale.subtotal))}</span>
        </div>

        {Number(sale.discount) > 0 && (
          <div className="flex justify-between text-sm">
            <span>DISCOUNT:</span>
            <span>-{formatCurrency(Number(sale.discount))}</span>
          </div>
        )}

        <div className="flex justify-between text-lg font-bold border-t-2 border-gray-400 pt-2">
          <span>TOTAL:</span>
          <span>{formatCurrency(Number(sale.total))}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>PAYMENT METHOD:</span>
          <span className="font-medium">{sale.paymentMethod}</span>
        </div>
      </div>

      {/* Barcode */}
      <div className="flex justify-center my-6">
        <Barcode
          value={sale.invoiceNumber}
          width={1.5}
          height={40}
          fontSize={12}
          background="#ffffff"
          lineColor="#000000"
        />
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-6 space-y-1">
        <p className="font-bold">THANK YOU FOR YOUR BUSINESS!</p>
        <p>Goods sold are not returnable</p>
        <p>Please keep this receipt for your records</p>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

      <div className="text-center text-xs text-gray-600">
        <p>Powered by Abit</p>
        <p>www.abithub.tech</p>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";

export default Receipt;
