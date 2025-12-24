/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import Receipt from "./Receipt";
import { X, Printer, Download } from "lucide-react";

interface PrintReceiptModalProps {
  sale: any;
  onClose: () => void;
}

export default function PrintReceiptModal({
  sale,
  onClose,
}: PrintReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${sale.invoiceNumber}`,
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    try {
      // Use html2canvas to rasterize the receipt to an image, then add that
      // image to jsPDF. This avoids heavy synchronous DOM-to-PDF conversions
      // that can freeze the UI in some environments.
      const { default: html2canvas } = await import("html2canvas");

      const element = receiptRef.current as HTMLElement;

      // Standard robust approach: clone the receipt DOM, inline computed
      // styles on the clone, attach the clone off-screen, then capture the
      // clone with html2canvas. This avoids depending on build-time CSS
      // output (lab() vs rgb) and gives html2canvas fully resolved inline
      // styles to work with.
      const clone = element.cloneNode(true) as HTMLElement;

      const copyComputedStyles = (source: HTMLElement, target: HTMLElement) => {
        const style = window.getComputedStyle(
          source as HTMLElement
        ) as CSSStyleDeclaration;

        // Curated list of properties that matter for visual fidelity of a
        // receipt. Copying a focused set is faster and avoids read-only
        // properties that may throw when set.
        const propsToCopy = [
          "color",
          "background-color",
          "background",
          "border",
          "border-color",
          "border-radius",
          "box-shadow",
          "font-family",
          "font-size",
          "font-weight",
          "line-height",
          "text-align",
          "text-decoration",
          "padding",
          "margin",
          "display",
          "width",
          "height",
          "max-width",
          "min-width",
          "max-height",
          "min-height",
          "overflow",
          "white-space",
          "word-break",
          "opacity",
          "transform",
          "gap",
          "align-items",
          "justify-content",
        ];

        for (const prop of propsToCopy) {
          try {
            const val = style.getPropertyValue(prop);
            const prio = style.getPropertyPriority(prop);
            if (val) target.style.setProperty(prop, val, prio);
          } catch {
            // ignore properties that can't be set
          }
        }
      };

      // Walk the tree and copy computed styles from the original to the clone
      const walkAndInline = (srcRoot: HTMLElement, dstRoot: HTMLElement) => {
        const srcNodes = srcRoot.querySelectorAll(
          "*"
        ) as NodeListOf<HTMLElement>;
        const dstNodes = dstRoot.querySelectorAll(
          "*"
        ) as NodeListOf<HTMLElement>;

        copyComputedStyles(srcRoot, dstRoot);

        for (let i = 0; i < srcNodes.length; i++) {
          const s = srcNodes[i] as HTMLElement;
          const d = dstNodes[i] as HTMLElement;
          if (!d) continue;
          copyComputedStyles(s, d);
        }
      };

      // Attach clone off-screen so it can be rendered but not visible.
      const offscreen = document.createElement("div");
      offscreen.style.position = "fixed";
      offscreen.style.left = "-9999px";
      offscreen.style.top = "0";
      offscreen.style.width = element.offsetWidth + "px";
      offscreen.style.height = "auto";
      offscreen.style.overflow = "hidden";
      offscreen.appendChild(clone);
      document.body.appendChild(offscreen);

      try {
        walkAndInline(element, clone);

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");

        // Calculate PDF size in mm for an 80mm wide thermal receipt
        const pdf = new jsPDF({ unit: "mm", format: [80, 200] });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = 70; // leave some margin
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 5, 5, pdfWidth, pdfHeight);
        pdf.save(`Receipt-${sale.invoiceNumber}.pdf`);
      } finally {
        // cleanup
        offscreen.remove();
      }
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert(
        "Failed to generate PDF: " + (err as any)?.message || "Unknown error"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-6 bg-gray-50">
          {/* Attach the ref to a wrapper DOM element to ensure a real node is provided to react-to-print */}
          <div className="bg-white shadow-lg" ref={receiptRef}>
            <Receipt sale={sale} />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => {
              if (!sale) {
                alert("No sale data available to print.");
                return;
              }

              if (!receiptRef.current) {
                // defensive: ensure content exists before calling print
                // use a tiny delay to allow the DOM to finish painting in edge cases
                setTimeout(() => {
                  if (!receiptRef.current) {
                    alert("Receipt is not ready for printing yet.");
                    return;
                  }

                  try {
                    // Pass the content callback directly to the returned print
                    // function as an optional param — this avoids races where
                    // the internally-stored content callback may not have
                    // a valid ref at invocation time.
                    handlePrint(() => receiptRef.current);
                  } catch (err: any) {
                    console.error("Print failed:", err);
                    alert("Print failed: " + (err?.message || "Unknown error"));
                  }
                }, 50);

                return;
              }

              try {
                handlePrint(() => receiptRef.current);
              } catch (err: any) {
                console.error("Print failed:", err);
                alert("Print failed: " + (err?.message || "Unknown error"));
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Printer className="h-5 w-5" />
            Print Receipt
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium ${
              isDownloading
                ? "bg-green-400 text-white cursor-wait"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <Download className="h-5 w-5" />
            {isDownloading ? "Preparing PDF..." : "Download PDF"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
