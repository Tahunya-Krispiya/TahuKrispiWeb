import { useState, useEffect, useCallback } from "react";

/* ============================================
   TAHU KRISPI - CATATAN PENJUALAN
   Calculator-style sales recorder with PWA support
   ============================================ */

// --- Types ---
interface Sale {
  id: string;
  type: "cowok" | "cewek";
  qty: number;
  timestamp: number;
}

const STORAGE_KEY = "tahu_krispi_sales";

// --- Utilities ---
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function loadSales(): Sale[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSales(sales: Sale[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function CatatPenjualan() {
  const [currentType, setCurrentType] = useState<"cowok" | "cewek">("cowok");
  const [displayInput, setDisplayInput] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editType, setEditType] = useState<"cowok" | "cewek">("cowok");
  const [editQty, setEditQty] = useState("");

  // Load on mount
  useEffect(() => {
    setSales(loadSales());
  }, []);

  // Save whenever sales change
  useEffect(() => {
    if (sales.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveSales(sales);
    }
  }, [sales]);

  // Toast timer
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editModal) return;
      if (e.key >= "0" && e.key <= "9") {
        setDisplayInput((p) => (p.length >= 4 ? p : p + e.key));
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setDisplayInput((p) => p.slice(0, -1));
      } else if (e.key === "Escape") {
        setDisplayInput("");
      } else if (e.key === "Enter") {
        e.preventDefault();
        doRecord();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editModal, displayInput, currentType]);

  // --- Actions ---
  const pressNum = useCallback((n: number) => {
    setDisplayInput((p) => (p.length >= 4 ? p : p + String(n)));
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);

  const doRecord = useCallback(() => {
    const qty = parseInt(displayInput);
    if (!qty || qty <= 0) return;
    const sale: Sale = {
      id: generateId(),
      type: currentType,
      qty,
      timestamp: Date.now(),
    };
    setSales((prev) => [sale, ...prev]);
    setDisplayInput("");
    setToast(`✅ Tercatat: ${qty} biji (${currentType === "cowok" ? "👦 Cowok" : "👧 Cewek"})`);
  }, [displayInput, currentType]);

  const quickAdd = useCallback(
    (amount: number) => {
      const sale: Sale = {
        id: generateId(),
        type: currentType,
        qty: amount,
        timestamp: Date.now(),
      };
      setSales((prev) => [sale, ...prev]);
      setDisplayInput("");
      setToast(`✅ Tercatat: ${amount} biji (${currentType === "cowok" ? "👦 Cowok" : "👧 Cewek"})`);
      if (navigator.vibrate) navigator.vibrate(10);
    },
    [currentType]
  );

  const deleteSale = useCallback((id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
    setToast("🗑️ Catatan dihapus");
  }, []);

  const openEdit = useCallback((sale: Sale) => {
    setEditId(sale.id);
    setEditType(sale.type);
    setEditQty(String(sale.qty));
    setEditModal(true);
  }, []);

  const saveEdit = useCallback(() => {
    const qty = parseInt(editQty);
    if (!qty || qty <= 0) {
      setToast("⚠️ Jumlah harus lebih dari 0");
      return;
    }
    setSales((prev) =>
      prev.map((s) => (s.id === editId ? { ...s, type: editType, qty } : s))
    );
    setEditModal(false);
    setToast("✏️ Catatan berhasil diubah");
  }, [editId, editType, editQty]);

  const clearAll = useCallback(() => {
    if (sales.length === 0) return;
    if (confirm("Hapus semua catatan hari ini?")) {
      setSales([]);
      setToast("🗑️ Semua catatan dihapus");
    }
  }, [sales.length]);

  // --- Computed ---
  const todaySales = sales.filter((s) => isToday(s.timestamp));
  const olderSales = sales.filter((s) => !isToday(s.timestamp));
  const totalCowok = todaySales.filter((s) => s.type === "cowok").reduce((a, s) => a + s.qty, 0);
  const totalCewek = todaySales.filter((s) => s.type === "cewek").reduce((a, s) => a + s.qty, 0);
  const totalAll = totalCowok + totalCewek;
  const displayVal = displayInput || "0";
  const canRecord = displayInput !== "" && parseInt(displayInput) > 0;

  return (
    <>
      <style>{cssStyles}</style>
      <div className="catat-app">
        {/* Header */}
        <header className="catat-header">
          <h1>🧈 Tahu Krispi</h1>
          <p>Catatan Penjualan</p>
        </header>

        {/* Type Selector */}
        <div className="catat-type-selector">
          <button
            className={`catat-type-btn ${currentType === "cowok" ? "active cowok" : ""}`}
            onClick={() => setCurrentType("cowok")}
          >
            <span className="catat-type-icon">👦</span>
            <span className="catat-type-label">COWOK</span>
          </button>
          <button
            className={`catat-type-btn ${currentType === "cewek" ? "active cewek" : ""}`}
            onClick={() => setCurrentType("cewek")}
          >
            <span className="catat-type-icon">👧</span>
            <span className="catat-type-label">CEWEK</span>
          </button>
        </div>

        {/* Display */}
        <div className="catat-display">
          <span className={`catat-badge ${currentType}`}>
            {currentType === "cowok" ? "Cowok" : "Cewek"}
          </span>
          <span className="catat-display-value">{displayVal}</span>
          <span className="catat-display-unit">biji</span>
        </div>

        {/* Quick Buttons */}
        <div className="catat-quick-buttons">
          {[4, 8, 12, 16, 20, 24].map((n) => (
            <button key={n} className="catat-quick-btn" onClick={() => quickAdd(n)}>
              {n}
            </button>
          ))}
        </div>

        {/* Numpad */}
        <div className="catat-numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} className="catat-num-btn" onClick={() => pressNum(n)}>
              {n}
            </button>
          ))}
          <button className="catat-num-btn btn-clear" onClick={() => setDisplayInput("")}>
            C
          </button>
          <button className="catat-num-btn" onClick={() => pressNum(0)}>
            0
          </button>
          <button
            className="catat-num-btn btn-backspace"
            onClick={() => setDisplayInput((p) => p.slice(0, -1))}
          >
            ⌫
          </button>
        </div>

        {/* Record Button */}
        <button className="catat-record-btn" disabled={!canRecord} onClick={doRecord}>
          ✅ CATAT
        </button>

        {/* Summary */}
        <div className="catat-summary">
          <div className="catat-summary-card cowok">
            <span className="catat-summary-icon">👦</span>
            <div>
              <span className="catat-summary-label">COWOK</span>
              <span className="catat-summary-value cowok">{totalCowok}</span>
            </div>
          </div>
          <div className="catat-summary-card cewek">
            <span className="catat-summary-icon">👧</span>
            <div>
              <span className="catat-summary-label">CEWEK</span>
              <span className="catat-summary-value cewek">{totalCewek}</span>
            </div>
          </div>
          <div className="catat-summary-card total">
            <span className="catat-summary-icon">📦</span>
            <div>
              <span className="catat-summary-label">TOTAL</span>
              <span className="catat-summary-value total">{totalAll}</span>
            </div>
          </div>
          <div className="catat-summary-card transaksi">
            <span className="catat-summary-icon">🧾</span>
            <div>
              <span className="catat-summary-label">TRANSAKSI</span>
              <span className="catat-summary-value transaksi">{todaySales.length}</span>
            </div>
          </div>
        </div>

        {/* Log */}
        <div className="catat-log-section">
          <div className="catat-log-header">
            <h2>📋 Riwayat Penjualan</h2>
            <button className="catat-clear-all-btn" onClick={clearAll}>
              🗑️ Hapus Semua
            </button>
          </div>

          <div className="catat-log-list">
            {todaySales.length === 0 && olderSales.length === 0 && (
              <div className="catat-log-empty">
                <span>📝</span>
                <p>Belum ada catatan hari ini</p>
              </div>
            )}

            {todaySales.map((sale) => (
              <LogEntry key={sale.id} sale={sale} onEdit={openEdit} onDelete={deleteSale} />
            ))}

            {olderSales.length > 0 && (
              <>
                <div className="catat-log-divider">── Hari Sebelumnya ──</div>
                {olderSales.map((sale) => (
                  <LogEntry
                    key={sale.id}
                    sale={sale}
                    onEdit={openEdit}
                    onDelete={deleteSale}
                    showDate
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editModal && (
          <div className="catat-modal-overlay" onClick={() => setEditModal(false)}>
            <div className="catat-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>✏️ Edit Catatan</h3>
              <div className="catat-modal-field">
                <label>Jenis:</label>
                <div className="catat-modal-type-btns">
                  <button
                    className={`catat-modal-type-btn ${editType === "cowok" ? "active cowok" : ""}`}
                    onClick={() => setEditType("cowok")}
                  >
                    👦 Cowok
                  </button>
                  <button
                    className={`catat-modal-type-btn ${editType === "cewek" ? "active cewek" : ""}`}
                    onClick={() => setEditType("cewek")}
                  >
                    👧 Cewek
                  </button>
                </div>
              </div>
              <div className="catat-modal-field">
                <label>Jumlah:</label>
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="catat-modal-actions">
                <button className="catat-modal-btn cancel" onClick={() => setEditModal(false)}>
                  Batal
                </button>
                <button className="catat-modal-btn save" onClick={saveEdit}>
                  💾 Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        <div className={`catat-toast ${toast ? "show" : ""}`}>{toast}</div>
      </div>
    </>
  );
}

/* ============================================
   LOG ENTRY SUB-COMPONENT
   ============================================ */
function LogEntry({
  sale,
  onEdit,
  onDelete,
  showDate = false,
}: {
  sale: Sale;
  onEdit: (s: Sale) => void;
  onDelete: (id: string) => void;
  showDate?: boolean;
}) {
  const icon = sale.type === "cowok" ? "👦" : "👧";
  const time = formatTime(sale.timestamp);
  const date = showDate ? formatDate(sale.timestamp) + " " : "";

  return (
    <div className="catat-log-entry">
      <span className="catat-log-icon">{icon}</span>
      <div className="catat-log-info">
        <span className={`catat-log-qty ${sale.type}`}>{sale.qty} biji</span>
        <div className="catat-log-meta">
          <span className={`catat-log-type-badge ${sale.type}`}>{sale.type}</span>
          <span className="catat-log-time">
            {date}
            {time}
          </span>
        </div>
      </div>
      <div className="catat-log-actions">
        <button className="catat-log-action-btn edit" onClick={() => onEdit(sale)}>
          ✏️
        </button>
        <button className="catat-log-action-btn delete" onClick={() => onDelete(sale.id)}>
          🗑️
        </button>
      </div>
    </div>
  );
}

/* ============================================
   SCOPED CSS (CSS-in-JS)
   ============================================ */
const cssStyles = `
/* === Catat App — fully scoped to avoid Tailwind conflicts === */
.catat-app {
  font-family: 'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 12px 40px;
  background: #0f0f1a;
  min-height: 100dvh;
  color: #e8e8f0;
  -webkit-font-smoothing: antialiased;
}

.catat-app *, .catat-app *::before, .catat-app *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

/* Header */
.catat-header {
  text-align: center;
  padding: 16px 0 8px;
}
.catat-header h1 {
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f5a623, #ffcc02);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.catat-header p {
  font-size: 0.8rem;
  color: #6b6b85;
  font-weight: 500;
  margin-top: 2px;
}

/* Type selector */
.catat-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 12px 0;
}
.catat-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  border: 2px solid #16213e;
  border-radius: 16px;
  background: #16213e;
  color: #9e9eb8;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.catat-type-icon { font-size: 1.8rem; }
.catat-type-label { letter-spacing: 0.08em; }
.catat-type-btn:active { transform: scale(0.96); }
.catat-type-btn.active.cowok {
  border-color: #4fc3f7;
  background: linear-gradient(135deg, rgba(79,195,247,0.15), rgba(79,195,247,0.05));
  color: #4fc3f7;
  box-shadow: 0 0 20px rgba(79,195,247,0.2);
}
.catat-type-btn.active.cewek {
  border-color: #f48fb1;
  background: linear-gradient(135deg, rgba(244,143,177,0.15), rgba(244,143,177,0.05));
  color: #f48fb1;
  box-shadow: 0 0 20px rgba(244,143,177,0.2);
}

/* Display */
.catat-display {
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-height: 64px;
  margin: 10px 0;
}
.catat-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: auto;
}
.catat-badge.cowok { background: rgba(79,195,247,0.15); color: #4fc3f7; }
.catat-badge.cewek { background: rgba(244,143,177,0.15); color: #f48fb1; }
.catat-display-value {
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1;
}
.catat-display-unit {
  font-size: 0.75rem;
  color: #6b6b85;
  font-weight: 500;
  align-self: flex-end;
  padding-bottom: 4px;
}

/* Quick buttons */
.catat-quick-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin: 10px 0;
}
.catat-quick-btn {
  padding: 10px 4px;
  border: 1px solid rgba(245,166,35,0.2);
  border-radius: 12px;
  background: rgba(245,166,35,0.08);
  color: #f5a623;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.catat-quick-btn:active {
  transform: scale(0.92);
  background: rgba(245,166,35,0.2);
}

/* Numpad */
.catat-numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 10px 0;
}
.catat-num-btn {
  padding: 18px 8px;
  border: none;
  border-radius: 16px;
  background: #16213e;
  color: #e8e8f0;
  font-family: inherit;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.catat-num-btn:active { transform: scale(0.93); background: #1c2a4a; }
.catat-num-btn.btn-clear { background: rgba(239,83,80,0.12); color: #ef5350; }
.catat-num-btn.btn-clear:active { background: rgba(239,83,80,0.25); }
.catat-num-btn.btn-backspace { background: rgba(255,255,255,0.06); color: #9e9eb8; }
.catat-num-btn.btn-backspace:active { background: rgba(255,255,255,0.12); }

/* Record button */
.catat-record-btn {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #43a047, #66bb6a);
  color: white;
  font-family: inherit;
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 4px 20px rgba(102,187,106,0.3);
  letter-spacing: 0.03em;
  margin: 10px 0;
}
.catat-record-btn:active { transform: scale(0.97); }
.catat-record-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* Summary */
.catat-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: 16px 0;
}
.catat-summary-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: #16213e;
  border: 1px solid rgba(255,255,255,0.04);
}
.catat-summary-icon { font-size: 1.4rem; }
.catat-summary-label {
  font-size: 0.6rem;
  color: #6b6b85;
  letter-spacing: 0.06em;
  font-weight: 600;
  display: block;
}
.catat-summary-value {
  font-size: 1.3rem;
  font-weight: 800;
  display: block;
}
.catat-summary-value.cowok { color: #4fc3f7; }
.catat-summary-value.cewek { color: #f48fb1; }
.catat-summary-value.total { color: #f5a623; }
.catat-summary-value.transaksi { color: #66bb6a; }

/* Log */
.catat-log-section { margin-top: 16px; }
.catat-log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.catat-log-header h2 { font-size: 1rem; font-weight: 700; }
.catat-clear-all-btn {
  padding: 6px 12px;
  border: 1px solid rgba(239,83,80,0.2);
  border-radius: 8px;
  background: rgba(239,83,80,0.08);
  color: #ef5350;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
}
.catat-log-list { display: flex; flex-direction: column; gap: 6px; }
.catat-log-empty {
  text-align: center;
  padding: 40px 20px;
  color: #6b6b85;
}
.catat-log-empty span { font-size: 2.5rem; display: block; margin-bottom: 10px; }
.catat-log-empty p { font-size: 0.85rem; }

/* Log entry */
.catat-log-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #16213e;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.04);
  animation: catat-slideIn 0.25s ease;
}
@keyframes catat-slideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.catat-log-icon { font-size: 1.3rem; flex-shrink: 0; }
.catat-log-info { flex: 1; min-width: 0; }
.catat-log-qty { font-size: 1.1rem; font-weight: 800; }
.catat-log-qty.cowok { color: #4fc3f7; }
.catat-log-qty.cewek { color: #f48fb1; }
.catat-log-meta { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.catat-log-type-badge {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 4px;
}
.catat-log-type-badge.cowok { background: rgba(79,195,247,0.12); color: #4fc3f7; }
.catat-log-type-badge.cewek { background: rgba(244,143,177,0.12); color: #f48fb1; }
.catat-log-time { font-size: 0.65rem; color: #6b6b85; font-weight: 500; }
.catat-log-actions { display: flex; gap: 4px; flex-shrink: 0; }
.catat-log-action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  color: #9e9eb8;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.catat-log-action-btn:active { transform: scale(0.9); }
.catat-log-divider {
  text-align: center;
  padding: 8px;
  font-size: 0.7rem;
  color: #6b6b85;
  font-weight: 600;
}

/* Modal */
.catat-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: catat-fadeIn 0.2s ease;
}
@keyframes catat-fadeIn { from { opacity: 0; } to { opacity: 1; } }
.catat-modal-content {
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 360px;
  animation: catat-modalSlide 0.25s ease;
}
@keyframes catat-modalSlide {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.catat-modal-content h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; }
.catat-modal-field { margin-bottom: 16px; }
.catat-modal-field label {
  display: block;
  font-size: 0.75rem;
  color: #9e9eb8;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.catat-modal-type-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.catat-modal-type-btn {
  padding: 10px;
  border: 2px solid #16213e;
  border-radius: 12px;
  background: #16213e;
  color: #9e9eb8;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.catat-modal-type-btn.active.cowok {
  border-color: #4fc3f7;
  background: rgba(79,195,247,0.12);
  color: #4fc3f7;
}
.catat-modal-type-btn.active.cewek {
  border-color: #f48fb1;
  background: rgba(244,143,177,0.12);
  color: #f48fb1;
}
.catat-modal-field input[type="number"] {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  background: #16213e;
  color: #e8e8f0;
  font-family: inherit;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  outline: none;
}
.catat-modal-field input[type="number"]:focus { border-color: #f5a623; }
.catat-modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
.catat-modal-btn {
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.catat-modal-btn.cancel { background: #16213e; color: #9e9eb8; }
.catat-modal-btn.save { background: linear-gradient(135deg, #43a047, #66bb6a); color: white; }
.catat-modal-btn:active { transform: scale(0.96); }

/* Toast */
.catat-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  padding: 12px 24px;
  border-radius: 12px;
  background: #16213e;
  color: #e8e8f0;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.08);
  z-index: 2000;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  white-space: nowrap;
}
.catat-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Desktop hover */
@media (hover: hover) {
  .catat-num-btn:hover { background: #1c2a4a; }
  .catat-quick-btn:hover { background: rgba(245,166,35,0.15); }
  .catat-record-btn:hover:not(:disabled) { box-shadow: 0 6px 24px rgba(102,187,106,0.4); }
  .catat-type-btn:hover { background: #1c2a4a; }
}
`;
