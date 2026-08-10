import { useMemo, useState } from "react";
import type { Product } from "@shared/schema";

type BudgetOption = {
  id: string;
  budget: number;
  pieces: number;
  sambal: string;
  image: string;
  comparison: string;
  highlight?: string;
};

type Props = {
  options: BudgetOption[];
  onBuyNow: (product: Product) => void;
  onAddToCart: (product: Product) => void;
};

const rupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;

export default function BudgetTahuCard({ options, onBuyNow, onAddToCart }: Props) {
  const [budgetInput, setBudgetInput] = useState("25000");
  const budget = Math.min(1000000, Math.max(0, Number(budgetInput.replace(/\D/g, "")) || 0));
  const custom = useMemo(() => {
    if (!budget) return { pieces: 0, sambal: "Belum ada bonus sambal", comparison: "-" };
    const exact = options.find((item) => item.budget === budget);
    if (exact) return exact;
    const pieces = budget <= 10000
      ? Math.max(1, Math.floor(budget / 2500))
      : budget <= 18000
        ? Math.max(1, Math.floor(budget / 2250))
        : Math.max(1, Math.floor(budget / 2000));
    const sambal = pieces <= 4
      ? "1 cup 25 ml"
      : `${pieces >= 25 ? 3 + Math.ceil((pieces - 25) / 9) : pieces >= 18 ? 2 : 1} cup 35 ml`;
    const large = Math.floor(pieces / 18);
    const medium = Math.floor((pieces % 18) / 8);
    const rest = pieces % 8;
    const comparison = large > 0
      ? `${large} Large${medium ? ` + ${medium} Medium` : ""}${rest ? ` + ${rest} pcs` : ""}`
      : medium > 0
        ? `${medium} Medium${rest ? ` + ${rest} pcs` : ""}`
        : pieces >= 4 ? "Small Pack" : "Porsi mini";
    return { pieces, sambal, comparison };
  }, [budget, options]);
  const customProduct: Product = {
    id: `budget-custom-${budget}`,
    name: `Paket Budget ${rupiah(budget)}`,
    size: `${custom.pieces} pcs`, pieces: custom.pieces, price: budget,
    image: options[0]?.image ?? "", description: `${custom.pieces} pcs tahu crispy + ${custom.sambal}`, type: "tofu",
  };
  return (
    <section className="mb-16 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-700">Beli sesuai dompet</span>
          <h3 className="mt-3 text-2xl font-black md:text-3xl">Mau keluar budget berapa?</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Pilih nominal, kami hitungkan jumlah tahu dan bonus sambalnya. Makin besar paketnya, harga per pcs makin hemat.</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-3 text-xs text-gray-600 shadow-sm">HPP final tergantung modal tahu, minyak, tepung, gas, dan kemasan.</div>
      </div>
      <div className="mb-6 grid gap-4 rounded-2xl border border-orange-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block text-sm font-bold text-gray-700">Masukkan budget
          <div className="mt-2 flex items-center rounded-xl border-2 border-orange-300 bg-orange-50 px-3 focus-within:border-orange-500">
            <span className="font-bold text-orange-700">Rp</span>
            <input inputMode="numeric" value={Number(budgetInput || 0).toLocaleString("id-ID")} onChange={(e) => setBudgetInput(e.target.value.replace(/\D/g, ""))} className="w-full bg-transparent p-3 text-lg font-bold outline-none" aria-label="Budget pembelian tahu" />
          </div>
        </label>
        <div className="rounded-xl bg-orange-100 p-4 text-sm text-orange-950"><strong className="text-2xl text-orange-700">{custom.pieces} pcs</strong><br />{custom.sambal}<br /><span className="text-xs">Setara {custom.comparison}</span></div>
        <div className="flex gap-2 md:col-span-2"><button disabled={!budget} onClick={() => onBuyNow(customProduct)} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Beli Sekarang</button><button disabled={!budget} onClick={() => onAddToCart(customProduct)} className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700 disabled:opacity-40">+ Keranjang</button></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((option) => {
          const product: Product = {
            id: option.id,
            name: `Paket Budget ${rupiah(option.budget)}`,
            size: `${option.pieces} pcs`,
            pieces: option.pieces,
            price: option.budget,
            image: option.image,
            description: `${option.pieces} pcs tahu crispy + ${option.sambal}`,
            type: "tofu",
          };
          return (
            <article key={option.id} className="flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <img src={option.image} alt={product.name} className="h-36 w-full object-cover" />
              <div className="flex flex-1 flex-col p-4">
                {option.highlight && <span className="mb-2 w-fit rounded-full bg-red-100 px-2 py-1 text-[10px] font-black uppercase text-red-700">{option.highlight}</span>}
                <h4 className="text-lg font-black">{rupiah(option.budget)}</h4>
                <p className="mt-1 text-2xl font-black text-orange-600">{option.pieces} pcs</p>
                <p className="mt-1 text-xs text-gray-500">{rupiah(Math.round(option.budget / option.pieces))}/pcs · {option.sambal}</p>
                <p className="mt-2 rounded-lg bg-orange-50 p-2 text-xs font-medium text-orange-900">Setara {option.comparison}</p>
                <div className="mt-auto flex gap-2 pt-4">
                  <button onClick={() => onBuyNow(product)} className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-bold text-white hover:bg-orange-600">Beli Sekarang</button>
                  <button onClick={() => onAddToCart(product)} className="rounded-lg border border-orange-200 px-3 py-2 text-orange-700" aria-label={`Tambah ${product.name} ke keranjang`}>+</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
