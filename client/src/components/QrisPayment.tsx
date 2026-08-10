import { useState } from "react";
import { Download, Eye, QrCode, X, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const qrisImage = "/images/qris.jpeg";

export default function QrisPayment() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-16 bg-orange-50/60" aria-labelledby="qris-title">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <QrCode className="h-7 w-7" />
            </div>
            <div>
              <h2 id="qris-title" className="text-xl font-bold">Bayar Mudah dengan QRIS</h2>
              <p className="mt-1 text-sm text-muted-foreground">Scan memakai aplikasi bank atau dompet digital apa pun.</p>
              <p className="mt-2 text-xs font-semibold text-orange-700">Merchant: TAHUNYA KRISPIYA</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto mt-5 sm:mt-0">
            <button onClick={() => setIsOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 sm:w-auto">
              <Eye className="h-4 w-4" /> Lihat QRIS
            </button>
            <Link to="/payment" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-orange-600 bg-white px-5 py-3 font-semibold text-orange-600 hover:bg-orange-50 sm:w-auto">
              <CreditCard className="h-4 w-4" /> Form Pembayaran
            </Link>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="QRIS Tahunya Krispi-ya" onClick={() => setIsOpen(false)}>
          <div className="relative max-h-[94vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setIsOpen(false)} className="absolute right-6 top-6 z-10 rounded-full bg-black/70 p-2 text-white" aria-label="Tutup QRIS">
              <X className="h-5 w-5" />
            </button>
            <img src={qrisImage} alt="QRIS Tahunya Krispi-ya" className="w-full rounded-xl" />
            <a href={qrisImage} download="QRIS-Tahunya-Krispiya.jpeg" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700">
              <Download className="h-4 w-4" /> Unduh QRIS
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">Pastikan nama penerima tertulis TAHUNYA KRISPIYA sebelum membayar.</p>
          </div>
        </div>
      )}
    </section>
  );
}
