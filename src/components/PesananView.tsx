import React, { useState } from "react";
import { 
  Eye, Check, Printer, MapPin, Truck, RotateCcw, XCircle, Search, 
  HelpCircle, User, Phone, Clipboard, ArrowRight, CornerDownRight, PlusCircle
} from "lucide-react";
import { Order, Product, StockHistory, Transaction } from "../types";

interface PesananViewProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setStockHistory: React.Dispatch<React.SetStateAction<StockHistory[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export default function PesananView({ orders, setOrders, products, setProducts, setStockHistory, transactions, setTransactions }: PesananViewProps) {
  const [search, setSearch] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Semua");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Return options
  const [returnRestock, setReturnRestock] = useState<boolean>(true);
  const [returnRefund, setReturnRefund] = useState<boolean>(true);
  
  // Printing slip state
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  // Tracking delivery state
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [showAddOrder, setShowAddOrder] = useState<boolean>(false);
  const [newOfflineOrder, setNewOfflineOrder] = useState({
    customerName: "",
    productSku: "",
    qty: 1,
    paymentMethod: "Debit",
    size: "M"
  });

  const handleKasirSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.sku === newOfflineOrder.productSku);
    if (!product) {
      alert("Produk tidak ditemukan berdasarkan SKU!");
      return;
    }

    const orderTotal = product.promoPrice * newOfflineOrder.qty;
    const newOrderId = `ORD-OFF-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: newOrderId,
      date: new Date().toISOString(),
      customerName: newOfflineOrder.customerName || "Pelanggan Offline",
      customerPhone: "-",
      items: [{
        productSku: product.sku,
        productName: product.name,
        qty: Number(newOfflineOrder.qty),
        price: product.promoPrice,
        size: newOfflineOrder.size as any,
        color: product.variants[0]?.color || "Default"
      }],
      total: orderTotal,
      status: "Selesai", // Offline is completed immediately
      platform: "Offline",
      trackingCode: "Bawa Pulang Secara Langsung",
      shippingAddress: "Kasir Toko (Offline)",
      paymentMethod: newOfflineOrder.paymentMethod as any
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update Stock View
    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          variants: p.variants.map(v => 
            v.size === newOfflineOrder.size ? { ...v, stock: Math.max(0, v.stock - newOfflineOrder.qty) } : v
          )
        };
      }
      return p;
    }));

    // Stock History
    setStockHistory(prev => [{
      id: "STK-" + Date.now(),
      productSku: product.sku,
      productName: product.name,
      variantSize: newOfflineOrder.size as any,
      variantColor: product.variants[0]?.color || "Default",
      date: new Date().toISOString(),
      changeQty: -newOfflineOrder.qty,
      type: "Penjualan",
      notes: `Pesanan Kasir (Offline)`,
      operator: "Kasir (Admin)"
    }, ...prev]);

    // Core functionality requested by user
    if (newOfflineOrder.paymentMethod === "Debit") {
      setTransactions(prev => [{
        id: "TX-DEBIT-" + Date.now(),
        date: new Date().toISOString(),
        type: "Masuk",
        category: "Penjualan",
        amount: orderTotal,
        notes: `Otomatis Masuk M-Banking Owner (Pesanan ${newOrderId}) via Debit Card.`
      }, ...prev]);
      alert(`Pesanan berhasil. Pembayaran Rp ${orderTotal.toLocaleString('id-ID')} otomatis masuk ke M-Banking Owner.`);
    } else {
      setTransactions(prev => [{
        id: "TX-CASH-" + Date.now(),
        date: new Date().toISOString(),
        type: "Masuk",
        category: "Penjualan",
        amount: orderTotal,
        notes: `Kas Tunai (Pesanan ${newOrderId}).`
      }, ...prev]);
      alert("Pesanan 100% Selesai dicatat kas tunai.");
    }

    setShowAddOrder(false);
    setNewOfflineOrder({
      customerName: "",
      productSku: "",
      qty: 1,
      paymentMethod: "Debit",
      size: "M"
    });
  };

  const platforms = ["Semua", "Shopee", "Tokopedia", "WhatsApp", "Offline"];

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = selectedPlatform === "Semua" || o.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  // Confirm payment in 1 click
  const handleConfirmPayment = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Proses" as const
        };
      }
      return o;
    });
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: "Proses" } : null);
    }
  };

  // Change shipment status to "Kirim" with automatic cargo receipt generation
  const handleShipOrder = (orderId: string) => {
    const trackingCode = "JP-TRK-" + Math.floor(100000000 + Math.random() * 900000000);
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Kirim" as const,
          trackingCode: trackingCode
        };
      }
      return o;
    });
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: "Kirim", trackingCode } : null);
    }
  };

  // Complete Order
  const handleCompleteOrder = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Selesai" as const
        };
      }
      return o;
    });
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: "Selesai" } : null);
    }
  };

  // Accept Return / Retur
  const handleAcceptReturn = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          returnStatus: "Disetujui" as const
        };
      }
      return o;
    });

    if (returnRestock) {
      // Add back return item to catalog stock
      targetOrder.items.forEach(item => {
        const targetProd = products.find(p => p.sku === item.productSku);
        if (targetProd) {
          // Find variant
          const updatedProds = products.map(p => {
            if (p.id === targetProd.id) {
              const updatedVariants = p.variants.map(v => {
                if (v.size === item.size && v.color === item.color) {
                  return {
                    ...v,
                    stock: v.stock + item.qty
                  };
                }
                return v;
              });
              return {
                ...p,
                variants: updatedVariants
              };
            }
            return p;
          });
          setProducts(updatedProds);

          // Record to stock logs
          const logEntry: StockHistory = {
            id: "st-retur-" + Date.now() + Math.random().toString(36).substr(2, 5),
            productSku: item.productSku,
            productName: item.productName,
            variantSize: item.size,
            variantColor: item.color,
            date: new Date().toISOString(),
            changeQty: item.qty,
            type: "Retur",
            notes: `Retur disetujui (ORD: ${targetOrder.id}, Alasan: ${targetOrder.returnReason})`,
            operator: "Ahmad Gudang"
          };
          setStockHistory(prev => [logEntry, ...prev]);
        }
      });
    }

    if (returnRefund) {
      // Deduct cash automatically
      const txEntry: Transaction = {
        id: "tx-retur-" + Date.now(),
        date: new Date().toISOString(),
        type: "Keluar",
        category: "Refund",
        amount: targetOrder.total,
        notes: `Refund pengembalian dana retur pesanan ${targetOrder.id}`
      };
      setTransactions(prev => [txEntry, ...prev]);
    }

    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, returnStatus: "Disetujui" } : null);
    }
    
    let alertMsg = "Retur berhasil disetujui.";
    if (returnRestock) alertMsg += " Stok barang dikembalikan ke rak.";
    if (returnRefund) alertMsg += " Dana dikembalikan, kas berkurang.";
    
    alert(alertMsg);
  };

  // Reject Return
  const handleRejectReturn = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          returnStatus: "Ditolak" as const
        };
      }
      return o;
    });
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, returnStatus: "Ditolak" } : null);
    }
  };

  return (
    <div id="pesanan-view" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-pink-100 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Cari ID Pesanan atau nama pembeli..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Platform tag selection */}
        <div className="flex flex-wrap items-center gap-1.5">
          {platforms.map(plat => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${selectedPlatform === plat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List Pipeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-pink-100 shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Daftar Semua Pesanan</h3>
            <button
              onClick={() => setShowAddOrder(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Pesanan Kasir (Offline)
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">Tidak ada transaksi ditemukan.</p>
            ) : (
              filteredOrders.map(order => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedOrder?.id === order.id ? "bg-pink-50/50 border-pink-400 shadow-3xs" : "bg-white border-slate-100 hover:border-pink-200"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 text-sm">{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold ${
                          order.platform === "Shopee" ? "bg-orange-50 text-orange-600" :
                          order.platform === "Tokopedia" ? "bg-emerald-50 text-emerald-600" :
                          order.platform === "WhatsApp" ? "bg-green-50 text-green-600" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {order.platform}
                        </span>
                        {order.returnStatus && order.returnStatus !== "None" && (
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-2 py-0.5 rounded-sm">
                            Klaim Retur
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{order.customerName} &bull; {new Date(order.date).toLocaleDateString("id-ID")}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-xs font-bold font-mono text-slate-800 block">
                        IDR {order.total.toLocaleString("id-ID")}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-block ${
                        order.status === "Selesai" ? "bg-emerald-100 text-emerald-800" :
                        order.status === "Kirim" ? "bg-blue-100 text-blue-800" :
                        order.status === "Proses" ? "bg-amber-100 text-amber-800" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {order.status === "Tunda" ? "Menunggu Konfirmasi" : order.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                    <span className="truncate max-w-[250px]">🛒 {order.items.map(item => `${item.productName} (${item.size})`).join(", ")}</span>
                    <span className="text-pink-600 font-bold flex items-center gap-1">
                      Detail Order &rarr;
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Detail & Operations Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-pink-100 shadow-xs flex flex-col justify-between h-[650px]">
          {selectedOrder ? (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base">Detail Pesanan</h3>
                <p className="text-xs font-mono font-bold text-pink-600 mt-1">{selectedOrder.id}</p>
              </div>

              {/* Customer section */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-500 tracking-wide uppercase text-[10px]">Data Pelanggan</h4>
                <div className="flex gap-2.5 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <User className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-700">{selectedOrder.customerName}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{selectedOrder.customerPhone}</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-[11px] leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-500 tracking-wide uppercase text-[10px]">Daftar Item Belanja ({selectedOrder.items.length})</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={`${item.productSku}-${idx}`} className="flex justify-between items-center bg-pink-50/20 p-2.5 rounded-lg border border-pink-100/40">
                      <div>
                        <p className="font-bold text-slate-800">{item.productName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          SKU: {item.productSku} &bull; Varian: {item.color} ({item.size})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 font-mono">x{item.qty}</p>
                        <p className="text-[10px] text-slate-400 font-mono">@IDR {item.price.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return request section if applicable */}
              {selectedOrder.returnStatus && selectedOrder.returnStatus !== "None" && (
                <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-100 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 text-[11px]">
                    <RotateCcw className="h-4 w-4" />
                    KLAIM PENGEMBALIAN BARANG (RETUR)
                  </div>
                  <p className="text-slate-700 italic text-[11px]">
                    " {selectedOrder.returnReason} "
                  </p>
                  <div className="pt-2 border-t border-rose-100 flex flex-col gap-2">
                    {selectedOrder.returnStatus === "Diajukan" ? (
                      <>
                        <div className="flex flex-col gap-1.5 mb-1 bg-white/50 p-2 rounded border border-rose-100/50">
                          <label className="flex items-center gap-2 text-[10px] text-slate-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={returnRestock} 
                              onChange={(e) => setReturnRestock(e.target.checked)} 
                              className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <strong>Kembalikan Stok:</strong> Otomatis tambah barang kembali ke rak gudang.
                          </label>
                          <label className="flex items-center gap-2 text-[10px] text-slate-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={returnRefund} 
                              onChange={(e) => setReturnRefund(e.target.checked)} 
                              className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                            <strong>Refund Dana:</strong> Otomatis catat pengeluaran kas sebesar IDR {selectedOrder.total.toLocaleString("id-ID")} di Buku Kas.
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptReturn(selectedOrder.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Check className="h-3 w-3" /> Setujui
                          </button>
                          <button
                            onClick={() => handleRejectReturn(selectedOrder.id)}
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <XCircle className="h-3 w-3" /> Tolak
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className={`text-xs font-bold ${selectedOrder.returnStatus === "Disetujui" ? "text-emerald-700" : "text-rose-700"}`}>
                        Status Klaim: {selectedOrder.returnStatus}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Proof Slip */}
              {selectedOrder.status === "Tunda" && selectedOrder.paymentProofUrl && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-600 flex items-center gap-1">
                    <Clipboard className="h-4 w-4 text-pink-600" />
                    Bukti Transfer Pembayaran WA
                  </h4>
                  <img
                    src={selectedOrder.paymentProofUrl}
                    alt="Bukti Transfer"
                    className="w-full h-36 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90"
                    onClick={() => window.open(selectedOrder.paymentProofUrl)}
                  />
                  <button
                    onClick={() => handleConfirmPayment(selectedOrder.id)}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    Konfirmasi Bukti & Setujui
                  </button>
                </div>
              )}

              {/* Operations Action Area */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex gap-2">
                  {selectedOrder.status === "Proses" && (
                    <button
                      onClick={() => handleShipOrder(selectedOrder.id)}
                      className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Truck className="h-4 w-4" />
                      Kirim & Buat Resi Kurir
                    </button>
                  )}
                  {selectedOrder.status === "Kirim" && (
                    <button
                      onClick={() => handleCompleteOrder(selectedOrder.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      Konfirmasi Tiba & Selesai
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPrintingOrder(selectedOrder)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs transition-colors border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="h-4.5 w-4.5 text-pink-600" />
                    Cetak Label
                  </button>

                  <button
                    onClick={() => setTrackingOrder(selectedOrder)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs transition-colors border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Truck className="h-4.5 w-4.5 text-blue-600" />
                    Lacak Paket
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <Clipboard className="h-12 w-12 text-slate-300 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-slate-700">Pilih Pesanan</p>
                <p className="text-[11px] text-slate-400 mt-1">Pilih salah satu nomor pesanan untuk memicu verifikasi transfer, mencetak manifes label, melacak pos kurir J&T, atau menyetujui klaim barang retur.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printing Modal */}
      {printingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 border border-slate-100 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Cetak Label Pengiriman Otomatis</h3>
              <button onClick={() => setPrintingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Simulated thermal shipping label tag */}
            <div className="border border-dashed border-slate-400 p-4 rounded-lg bg-slate-50 font-mono text-[11px] text-slate-800 space-y-3.5">
              <div className="flex justify-between items-center justify-items-center">
                <span className="font-extrabold text-base tracking-widest text-slate-900">J&T REGULAR</span>
                <span className="text-[10px] bg-slate-900 text-white p-1 px-2.5 font-bold">COD: CASHLESS</span>
              </div>

              {/* Realistic Barcode */}
              <div className="border border-slate-300 bg-white py-4 flex flex-col items-center justify-center rounded-sm">
                <div className="w-4/5 h-10 flex border-l border-r border-slate-800">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-full flex-1" 
                      style={{ 
                        background: i % 3 === 0 || i % 7 === 0 || i % 11 === 0 ? "#1e293b" : "transparent"
                      }} 
                    />
                  ))}
                </div>
                <p className="font-bold mt-1 text-[11px] tracking-widest">*{printingOrder.id}*</p>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-300 text-[10px] leading-relaxed">
                <div className="pr-2 space-y-1">
                  <p className="font-extrabold text-slate-500 uppercase text-[9px]">PENGIRIM:</p>
                  <p className="font-bold text-slate-900">Jassinta Atelier</p>
                  <p>Depok, Jawa Barat</p>
                  <p>081122334455</p>
                </div>
                <div className="pl-2 space-y-1">
                  <p className="font-extrabold text-slate-500 uppercase text-[9px]">PENERIMA / RECIPIENT:</p>
                  <p className="font-bold text-slate-900">{printingOrder.customerName}</p>
                  <p className="line-clamp-2">{printingOrder.shippingAddress}</p>
                  <p className="font-bold">{printingOrder.customerPhone}</p>
                </div>
              </div>

              <div className="border-t border-slate-300 pt-3 text-[10px]">
                <p className="font-extrabold uppercase text-[9px] mb-1">Manifes Item Belanja:</p>
                {printingOrder.items.map((item, idx) => (
                  <p key={idx} className="font-semibold leading-relaxed text-slate-700">
                    - {item.productName} [{item.color}/{item.size}] x{item.qty}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setPrintingOrder(null)}
                className="text-xs font-semibold px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  alert("Label Pengiriman berhasil dikirim ke Antrean Printer Thermal Gudang!");
                  setPrintingOrder(null);
                }}
                className="text-xs bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="h-4 w-4" /> Cetak Sekarang (1-Klik)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-slate-100 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Lacak Pengiriman Real-time (J&T Regular)</h3>
              <button onClick={() => setTrackingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">No. Resi Pelacakan:</p>
                <p className="text-sm font-mono font-bold text-pink-600 mt-1">
                  {trackingOrder.trackingCode || "BELUM ADA RESI (PESANAN BARU)"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Estimasi Tiba: 2-3 Hari Kerja</p>
              </div>

              {/* Stepper Tracking timeline */}
              <div className="space-y-4 text-xs font-sans pl-2">
                <div className="relative pl-6">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <div className="absolute left-3 top-4 w-[1px] h-10 bg-slate-200" />
                  <h4 className="font-bold text-slate-800">Paket Diterima Kurir (Dalam Perjalanan)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Manifested Depok DC - Courier J&T Express</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">2026-05-23 09:12 AM</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-300" />
                  <div className="absolute left-3 top-4 w-[1px] h-10 bg-slate-200" />
                  <h4 className="font-bold text-slate-700">Packing Manifes Sukses</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Diserahkan ke tim kurir dari Gudang Utama</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">2026-05-23 08:30 AM</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-300" />
                  <h4 className="font-bold text-slate-700">Pesanan Diproses</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Pembayaran diverifikasi otomatis oleh sistem</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">2026-05-23 08:12 AM</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setTrackingOrder(null)}
                className="text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
{showAddOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col items-center p-6 text-center">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Kasir Offline (Buat Pesanan Baru)</h3>
            <form onSubmit={handleKasirSubmit} className="w-full text-left space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pembeli:</label>
                <input
                  type="text"
                  placeholder="Misal: Bapak Andre"
                  value={newOfflineOrder.customerName}
                  onChange={e => setNewOfflineOrder({ ...newOfflineOrder, customerName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU Barang:</label>
                  <input
                    type="text"
                    placeholder="Misal: GMS-PLM-01"
                    value={newOfflineOrder.productSku}
                    onChange={e => setNewOfflineOrder({ ...newOfflineOrder, productSku: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ukuran:</label>
                  <select
                    value={newOfflineOrder.size}
                    onChange={e => setNewOfflineOrder({ ...newOfflineOrder, size: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kuantitas:</label>
                  <input
                    type="number"
                    min="1"
                    value={newOfflineOrder.qty}
                    onChange={e => setNewOfflineOrder({ ...newOfflineOrder, qty: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Metode Pembayaran:</label>
                  <select
                    value={newOfflineOrder.paymentMethod}
                    onChange={e => setNewOfflineOrder({ ...newOfflineOrder, paymentMethod: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
                  >
                    <option value="Tunai">Tunai Kas Kecil</option>
                    <option value="Debit">Debit (M-Banking Owner)</option>
                  </select>
                </div>
              </div>

              {newOfflineOrder.paymentMethod === "Debit" && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-700 text-xs">
                  <strong>ℹ️ Info:</strong> Setoran transaksi Debit akan otomatis dilacak dan dicatat ke dalam buku kas dan <b>M-Banking Owner</b>.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOrder(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="h-4 w-4" /> Proses Pembayaran & Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
