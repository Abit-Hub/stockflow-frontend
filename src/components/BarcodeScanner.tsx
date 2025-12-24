/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, Keyboard } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState("");
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);

  async function loadCameras() {
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
    } catch (err) {
      console.error("Failed to get cameras:", err);
      setMode("manual");
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // call loadCameras asynchronously to avoid triggering synchronous setState in the effect body
    (async () => {
      await loadCameras();
    })();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode("barcode-scanner");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore errors during scanning
        }
      );

      setIsScanning(true);
      setError("");
    } catch (err: any) {
      setError("Failed to start camera. Please use manual entry.");
      setMode("manual");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualEntry.trim()) {
      onScan(manualEntry.trim());
      setManualEntry("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Scan Barcode</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                stopScanning();
                setMode("camera");
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${
                mode === "camera"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              disabled={cameras.length === 0}
            >
              <Camera className="h-5 w-5" />
              Camera
            </button>
            <button
              onClick={() => {
                stopScanning();
                setMode("manual");
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${
                mode === "manual"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Keyboard className="h-5 w-5" />
              Manual
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Camera Mode */}
          {mode === "camera" && (
            <div className="space-y-4">
              <div
                id="barcode-scanner"
                className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden"
              />

              {!isScanning && (
                <button
                  onClick={startScanning}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Start Camera
                </button>
              )}

              {isScanning && (
                <button
                  onClick={stopScanning}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Stop Camera
                </button>
              )}

              <p className="text-sm text-gray-500 text-center">
                Position barcode within the frame
              </p>
            </div>
          )}

          {/* Manual Mode */}
          {mode === "manual" && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Barcode or SKU
                </label>
                <input
                  type="text"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  placeholder="Scan or type barcode..."
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>

              <button
                type="submit"
                disabled={!manualEntry.trim()}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                Search
              </button>

              <p className="text-sm text-gray-500 text-center">
                You can also use a barcode scanner device
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
