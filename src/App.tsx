import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Boxes, ShoppingBag, Coins, Sparkles, Cpu, Users, Settings, Menu, X, ArrowUpRight
} from "lucide-react";

// Types
import { Product, Order, StockHistory, Transaction, Karyawan } from "./types";

// Initial Datasets
import { 
  INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STOCK_HISTORY, INITIAL_TRANSACTIONS, INITIAL_KARYAWAN 
} from "./initialData";

// Components
import DashboardView from "./components/DashboardView";
import KatalogView from "./components/KatalogView";
import PesananView from "./components/PesananView";
import KeuanganView from "./components/KeuanganView";
import AIAssistantView from "./components/AIAssistantView";
import SmartScanView from "./components/SmartScanView";
import MarketplaceWAView from "./components/MarketplaceWAView";
import KaryawanGudangView from "./components/KaryawanGudangView";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Core Central Application States (with localStorage persistence)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("jassinta_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("jassinta_orders");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  const [stockHistory, setStockHistory] = useState<StockHistory[]>(() => {
    const saved = localStorage.getItem("jassinta_stock");
    return saved ? JSON.parse(saved) : INITIAL_STOCK_HISTORY;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("jassinta_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>(() => {
    const saved = localStorage.getItem("jassinta_karyawan");
    return saved ? JSON.parse(saved) : INITIAL_KARYAWAN;
  });

  // Sync to Local Storage
  useEffect(() => { localStorage.setItem("jassinta_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("jassinta_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("jassinta_stock", JSON.stringify(stockHistory)); }, [stockHistory]);
  useEffect(() => { localStorage.setItem("jassinta_transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("jassinta_karyawan", JSON.stringify(karyawanList)); }, [karyawanList]);

  const menuItems = [
    { id: "dashboard", label: "Pusat Komando (Dashboard)", icon: LayoutDashboard },
    { id: "katalog-stok", label: "Katalog & Stok Gudang", icon: Boxes },
    { id: "transaksi-pesanan", label: "Transaksi & Pesanan", icon: ShoppingBag },
    { id: "keuangan", label: "Keuangan & Buku Kas", icon: Coins },
    { id: "ai-assistant", label: "AI Assistant (Advisor & CS Bot)", icon: Sparkles },
    { id: "smart-scan", label: "Smart Scan & AI OCR", icon: Cpu },
    { id: "marketplace-wa", label: "Marketplace & WhatsApp WA", icon: Settings },
    { id: "karyawan-gudang", label: "Karyawan & Gudang Digital", icon: Users },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView 
            products={products} 
            orders={orders} 
            transactions={transactions} 
            setActiveTab={setActiveTab} 
          />
        );
      case "katalog-stok":
        return (
          <KatalogView 
            products={products} 
            setProducts={setProducts} 
            stockHistory={stockHistory} 
            setStockHistory={setStockHistory} 
          />
        );
      case "transaksi-pesanan":
        return (
          <PesananView 
            orders={orders} 
            setOrders={setOrders} 
            products={products}
            setProducts={setProducts}
            setStockHistory={setStockHistory}
            transactions={transactions}
            setTransactions={setTransactions}
          />
        );
      case "keuangan":
        return (
          <KeuanganView 
            transactions={transactions} 
            setTransactions={setTransactions} 
          />
        );
      case "ai-assistant":
        return (
          <AIAssistantView 
            products={products} 
            orders={orders} 
            transactions={transactions} 
          />
        );
      case "smart-scan":
        return (
          <SmartScanView 
            products={products} 
            setProducts={setProducts} 
            setStockHistory={setStockHistory}
            transactions={transactions}
            setTransactions={setTransactions}
          />
        );
      case "marketplace-wa":
        return (
          <MarketplaceWAView 
            products={products} 
            setProducts={setProducts} 
            orders={orders} 
            setOrders={setOrders} 
            transactions={transactions} 
            setTransactions={setTransactions} 
            setStockHistory={setStockHistory}
          />
        );
      case "karyawan-gudang":
        return (
          <KaryawanGudangView 
            karyawanList={karyawanList} 
            setKaryawanList={setKaryawanList} 
            products={products}
            orders={orders} 
          />
        );
      default:
        return <p className="text-sm italic text-slate-450 text-center py-10">Layanan tidak ditemukan.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800 antialiased selection:bg-pink-100 selection:text-pink-900">
      
      {/* Mobile Top Header bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 bg-slate-900 text-white z-40 p-4 border-b border-pink-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="font-extrabold text-[15px] tracking-wide text-pink-100 uppercase">Jassinta Atelier</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg text-pink-200 transition-colors cursor-pointer"
        >
          {sidebarOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
        </button>
      </div>

      {/* Sidebar navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-slate-900 text-white border-r border-pink-950/20 w-72 p-6 z-40 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Title branding */}
          <div className="flex items-center justify-between border-b border-pink-950/40 pb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-pulse">🌸</span>
              <div>
                <h1 className="font-extrabold text-[15px] tracking-wider text-pink-100 uppercase">Jassinta Atelier</h1>
                <p className="text-[10px] text-pink-300 font-medium">Sistem ERP + AI v3.0</p>
              </div>
            </div>
            
            {/* Close button inside mobile menu drawer */}
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-1.5 hover:bg-slate-800 text-pink-300 rounded-lg cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    // Automatically collapse sidebar on mobile
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                    isActive 
                      ? "bg-pink-600 text-white shadow-md font-bold text-center" 
                      : "text-slate-350 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white" : "text-pink-400"}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Brand signature credit line to protect workspace aesthetics */}
        <div className="pt-4 border-t border-pink-950/30 text-[10px] text-pink-300/40 font-mono tracking-wide">
          <p>© 2026 JASSINTA ATELIER ERP</p>
          <p className="mt-1">PANDUAN EDISI LENGKAP v2.0</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 pt-[68px] lg:pt-0 min-h-screen flex flex-col justify-between">
        <div className="p-6 md:p-8 max-w-[1360px] mx-auto w-full space-y-6">
          {renderActiveView()}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white p-5 text-center text-xs text-slate-400 font-medium">
          Dibuat berdasarkan Dokumen Perencanaan Bisnis &bull; Edisi Mei 2026 &bull; Jassinta Atelier + AI Assistant
        </footer>
      </main>

    </div>
  );
}
