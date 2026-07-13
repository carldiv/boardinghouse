"use client";

import Image from "next/image";

interface GcashQrCardProps {
  qrImageUrl: string;
}

export default function GcashQrCard({ qrImageUrl }: GcashQrCardProps) {
  async function handleDownload() {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "gcash-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR:", err);
      window.open(qrImageUrl, "_blank");
    }
  }

  return (
    <div className="card">
      <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
        Scan QR Code
      </h2>

      <div className="mx-auto mb-4 w-fit rounded-xl bg-white p-4">
        <Image
          src={qrImageUrl}
          alt="GCash QR Code"
          width={190}
          height={190}
          className="block object-contain"
          style={{ width: 190, height: 190 }}
        />
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="btn btn-ghost w-full"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Download QR
      </button>
    </div>
  );
}
