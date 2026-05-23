import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Filter, Tag, Box, AlertOctagon, History, Edit, Save, X, PlusCircle, Check, QrCode, RefreshCw, Printer
} from "lucide-react";
import QRCode from "react-qr-code";
import { Product, StockHistory } from "../types";

interface KatalogViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  stockHistory: StockHistory[];
  setStockHistory: React.Dispatch<React.SetStateAction<StockHistory[]>>;
}

export default function KatalogView({ products, setProducts, stockHistory, setStockHistory }: KatalogViewProps) {
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [activeCatalogTab, setActiveCatalogTab] = useState<"katalog" | "riwayat">("katalog");
  const [showQrModal, setShowQrModal] = useState<Product | null>(null);
  const [printProducts, setPrintProducts] = useState<Product[] | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<boolean>(false);

  useEffect(() => {
    if (printProducts && printProducts.length > 0) {
      setTimeout(() => {
        window.print();
        setPrintProducts(null);
        setSelectedForPrint([]);
        setSelectionMode(false);
      }, 100);
    }
  }, [printProducts]);

  // Edit stock state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editVariants, setEditVariants] = useState<{ size: "S" | "M" | "L" | "XL"; color: string; stock: number }[]>([]);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "Gamis",
    normalPrice: 199000,
    promoPrice: 159000,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
    rackLocation: "Rak A-01",
    description: "",
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    variantColor: "Plum"
  });

  const categories = ["Semua", "Gamis", "Blouse", "Tunik", "Kulot", "Hijab", "Aksesori", "Cardigan", "Rompi", "Celana", "One Set"];

  // Filter products based on search and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Start Quick Edit Stock Modal
  const startEditing = (p: Product) => {
    setEditingProductId(p.id);
    setEditVariants(JSON.parse(JSON.stringify(p.variants))); // Deep clone
  };

  // Save variant stock
  const handleSaveStock = (productId: string) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    // Check what changed to add to stock history log
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        // Log changes
        p.variants.forEach(v => {
          const edited = editVariants.find(ev => ev.size === v.size && ev.color === v.color);
          if (edited && edited.stock !== v.stock) {
            const difference = edited.stock - v.stock;
            // Create stock history entry
            const logEntry: StockHistory = {
              id: "st-" + Date.now() + Math.random().toString(36).substr(2, 5),
              productSku: p.sku,
              productName: p.name,
              variantSize: v.size,
              variantColor: v.color,
              date: new Date().toISOString(),
              changeQty: difference,
              type: "Opname",
              notes: `Penyesuaian stok manual (sebelumnya: ${v.stock}, sesudah: ${edited.stock})`,
              operator: "Putri Spv (Admin)"
            };
            setStockHistory(prev => [logEntry, ...prev]);
          }
        });

        return {
          ...p,
          variants: editVariants
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    setEditingProductId(null);
  };

  const generateUniqueSKU = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sku = '';
    for (let i = 0; i < 8; i++) {
      sku += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `JSS-${sku}`;
  };

  const handleOpenAddForm = () => {
    if (!showAddForm) {
      setNewProduct(prev => ({
        ...prev,
        sku: generateUniqueSKU()
      }));
    }
    setShowAddForm(!showAddForm);
  };
  
  // Create new product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku || !newProduct.name) {
      alert("Harap isi Kode SKU dan Nama Produk!");
      return;
    }

    const createdProduct: Product = {
      id: "p-" + Date.now(),
      sku: newProduct.sku.toUpperCase(),
      name: newProduct.name,
      category: newProduct.category as any,
      normalPrice: Number(newProduct.normalPrice),
      promoPrice: Number(newProduct.promoPrice),
      imageUrl: newProduct.imageUrl || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
      rackLocation: newProduct.rackLocation || "Rak Standar",
      description: newProduct.description || "Deskripsi produk baru.",
      variants: [
        { size: "S", color: newProduct.variantColor, stock: Number(newProduct.stockS) },
        { size: "M", color: newProduct.variantColor, stock: Number(newProduct.stockM) },
        { size: "L", color: newProduct.variantColor, stock: Number(newProduct.stockL) },
        { size: "XL", color: newProduct.variantColor, stock: Number(newProduct.stockXL) }
      ]
    };

    // Add logging history for each variant
    const historyEntries: StockHistory[] = createdProduct.variants.map((v, i) => ({
      id: "st-add-" + Date.now() + i,
      productSku: createdProduct.sku,
      productName: createdProduct.name,
      variantSize: v.size,
      variantColor: v.color,
      date: new Date().toISOString(),
      changeQty: v.stock,
      type: "Restok",
      notes: "Produk Baru Ditambahkan ke Katalog",
      operator: "Putri Spv (Admin)"
    }));

    setProducts(prev => [createdProduct, ...prev]);
    setStockHistory(prev => [...historyEntries, ...prev]);
    setShowAddForm(false);
    
    // Reset Form
    setNewProduct({
      sku: "",
      name: "",
      category: "Gamis",
      normalPrice: 199000,
      promoPrice: 159000,
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
      rackLocation: "Rak A-01",
      description: "",
      stockS: 10,
      stockM: 10,
      stockL: 10,
      stockXL: 10,
      variantColor: "Plum"
    });
  };

  return (
    <div id="katalog-view" className="space-y-6">
      {/* Sub tabs configuration */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-pink-100 shadow-2xs">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveCatalogTab("katalog")}
            className={`text-xs px-4 py-2 rounded-md font-medium transition-all cursor-pointer flex items-center gap-2 ${activeCatalogTab === "katalog" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            <Box className="h-4 w-4 text-pink-600" />
            Katalog & Inventaris Gudang
          </button>
          <button
            id="stock-history-tab-btn"
            onClick={() => setActiveCatalogTab("riwayat")}
            className={`text-xs px-4 py-2 rounded-md font-medium transition-all cursor-pointer flex items-center gap-2 ${activeCatalogTab === "riwayat" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            <History className="h-4 w-4 text-pink-600" />
            Log Aktivitas & Riwayat Masuk-Keluar
          </button>
        </div>

        <button
          onClick={handleOpenAddForm}
          className="bg-pink-600 hover:bg-pink-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Katalog Baru
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl border border-pink-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Tambah Produk Baru</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-600">SKU UNIK (Barcode):</label>
                <button 
                  type="button" 
                  onClick={() => setNewProduct({ ...newProduct, sku: generateUniqueSKU() })}
                  className="text-[10px] text-pink-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Auto Gen
                </button>
              </div>
              <input
                type="text"
                placeholder="E.g. JSS-XXX"
                value={newProduct.sku}
                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 font-mono"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Produk:</label>
              <input
                type="text"
                placeholder="E.g. Gamis Syari Silk Premium Plum"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori:</label>
              <select
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
              >
                <option value="Gamis">Gamis</option>
                <option value="Blouse">Blouse</option>
                <option value="Tunik">Tunik</option>
                <option value="Kulot">Kulot</option>
                <option value="Hijab">Hijab</option>
                <option value="Aksesori">Aksesori</option>
                <option value="Cardigan">Cardigan</option>
                <option value="Rompi">Rompi</option>
                <option value="Celana">Celana</option>
                <option value="One Set">One Set</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Normal (IDR):</label>
              <input
                type="number"
                value={newProduct.normalPrice}
                onChange={e => setNewProduct({ ...newProduct, normalPrice: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Coret Promo (IDR):</label>
              <input
                type="number"
                value={newProduct.promoPrice}
                onChange={e => setNewProduct({ ...newProduct, promoPrice: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Rak Lokasi Gudang:</label>
              <input
                type="text"
                placeholder="E.g. Rak A-02"
                value={newProduct.rackLocation}
                onChange={e => setNewProduct({ ...newProduct, rackLocation: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi & Keunggulan Bahan:</label>
              <textarea
                placeholder="Jelaskan karakteristik kain, keunggulan jahit, dll..."
                value={newProduct.description}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Produk (.jpg, .jpeg, .png):</label>
              <div className="space-y-2">
                <div className="flex gap-3 items-center">
                  {newProduct.imageUrl && (
                    <div className="relative h-16 w-16 rounded-xl border border-pink-200 overflow-hidden bg-slate-50 shrink-0 shadow-2xs">
                      <img src={newProduct.imageUrl} alt="Pratinjau" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, imageUrl: "" })}
                        className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 shadow-md cursor-pointer transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-pink-200 hover:border-pink-400 bg-pink-50/10 hover:bg-pink-50/25 rounded-2xl p-4 text-center transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 3 * 1024 * 1024) {
                              alert("Ukuran berkas terlalu besar! Maksimal 3MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setNewProduct({ ...newProduct, imageUrl: event.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="text-pink-600 font-bold text-xs flex flex-col items-center justify-center gap-1.5">
                        <PlusCircle className="h-5 w-5 text-pink-500 hover:scale-105 transition-transform" />
                        <span>Pilih Foto dari Perangkat</span>
                        <span className="text-[10px] text-slate-400 font-normal">Format: .jpg, .jpeg, .png (Maksimal 3MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100/50 pt-2">
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">Gunakan URL Web langsung (opsional):</label>
                  <input
                    type="text"
                    value={newProduct.imageUrl}
                    onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    placeholder="Atau tempel tautan foto di sini..."
                    className="w-full text-[11px] p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-700 mb-3">Varian Warna Utama & Alokasi Stok Awal</h4>
            <div className="grid grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Warna:</label>
                <input
                  type="text"
                  placeholder="E.g. Navy Blue"
                  value={newProduct.variantColor}
                  onChange={e => setNewProduct({ ...newProduct, variantColor: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Stok S:</label>
                <input
                  type="number"
                  value={newProduct.stockS}
                  onChange={e => setNewProduct({ ...newProduct, stockS: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Stok M:</label>
                <input
                  type="number"
                  value={newProduct.stockM}
                  onChange={e => setNewProduct({ ...newProduct, stockM: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Stok L:</label>
                <input
                  type="number"
                  value={newProduct.stockL}
                  onChange={e => setNewProduct({ ...newProduct, stockL: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Stok XL:</label>
                <input
                  type="number"
                  value={newProduct.stockXL}
                  onChange={e => setNewProduct({ ...newProduct, stockXL: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="text-xs bg-pink-600 hover:bg-pink-700 text-white font-bold px-5 py-2 rounded-lg cursor-pointer"
            >
              Simpan Katalog
            </button>
          </div>
        </form>
      )}

      {activeCatalogTab === "katalog" ? (
        <>
          {/* Filtering and Search Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-pink-100 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Cari SKU atau nama baju..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Filter tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mr-1">
                <Filter className="h-3.5 w-3.5" /> Filter:
              </span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer transition-colors ${selectedCategory === cat ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Action Bar */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (selectionMode) setSelectedForPrint([]);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors border ${selectionMode ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}
              >
                Pilih Beberapa Produk
              </button>
              {selectionMode && (
                <span className="text-xs text-slate-500 font-medium">
                  {selectedForPrint.length} terpilih
                </span>
              )}
            </div>
            {selectionMode && selectedForPrint.length > 0 && (
              <button
                onClick={() => {
                  const toPrint = products.filter(p => selectedForPrint.includes(p.id));
                  setPrintProducts(toPrint);
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Cetak Label Sekaligus
              </button>
            )}
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const sizesTotal = product.variants.reduce((acc, v) => acc + v.stock, 0);
              const isMinimalStock = product.variants.some(v => v.stock < 5);
              const isEditingThis = editingProductId === product.id;
              const isSelected = selectedForPrint.includes(product.id);

              return (
                <div 
                  key={product.id} 
                  className={`bg-white rounded-2xl border ${isSelected ? 'border-pink-500 ring-2 ring-pink-500/20' : 'border-pink-100'} shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-xs transition-all relative ${selectionMode ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (selectionMode) {
                      if (isSelected) {
                        setSelectedForPrint(prev => prev.filter(id => id !== product.id));
                      } else {
                        setSelectedForPrint(prev => [...prev, product.id]);
                      }
                    }
                  }}
                >
                  {selectionMode && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white/80 border-slate-300'}`}>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  )}
                  {/* Category badging */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {isEditingThis && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center transition-all">
                        <label className="bg-white/95 hover:bg-white text-slate-800 text-[10px] font-extrabold px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-105 transition-all relative">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 3 * 1024 * 1024) {
                                  alert("Ukuran berkas terlalu besar! Maksimal 3MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    const updated = products.map(p => {
                                      if (p.id === product.id) {
                                        return { ...p, imageUrl: event.target.result as string };
                                      }
                                      return p;
                                    });
                                    setProducts(updated);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <span>Ganti Foto (.jpg/.png)</span>
                        </label>
                        <p className="text-[9px] text-pink-200 mt-2 font-medium">Unggah file lokal untuk mengganti gambar katalog</p>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
                        {product.category}
                      </span>
                      <span className="bg-pink-600 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                        {product.rackLocation}
                      </span>
                    </div>

                    {!isEditingThis && isMinimalStock && (
                      <div className="absolute bottom-3 right-3 bg-rose-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                        <AlertOctagon className="h-3 w-3 animate-bounce" />
                        STOK MENIPIS!
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] font-bold text-pink-600 tracking-wider block">
                          {product.sku}
                        </span>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => setPrintProducts([product])}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-1.5 rounded-lg cursor-pointer transition-colors"
                            title="Cetak Label"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => setShowQrModal(product)}
                            className="bg-pink-50 hover:bg-pink-100 text-pink-600 p-1.5 rounded-lg cursor-pointer transition-colors"
                            title="Tampilkan QR Code"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-1 leading-snug">
                        {product.name}
                      </h4>
                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Pricing row */}
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-pink-600 font-extrabold text-[15px]">
                          IDR {product.promoPrice.toLocaleString("id-ID")}
                        </span>
                        <span className="text-slate-400 line-through text-xs font-medium">
                          IDR {product.normalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Variants and Editor Toggle */}
                    <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 mb-2">
                        <span className="text-[11px] font-bold text-slate-600">Alokasi Stok Varian Warna/Ukuran</span>
                        <span className="text-[10px] font-mono font-bold bg-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                          Total: {sizesTotal} pcs
                        </span>
                      </div>

                      {isEditingThis ? (
                        <div className="space-y-2 mt-2">
                          <div className="grid grid-cols-4 gap-1.5">
                            {editVariants.map((v, i) => (
                              <div key={v.size} className="text-center">
                                <span className="text-[9px] font-bold text-slate-500 block mb-0.5 font-mono">{v.size}</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={v.stock}
                                  onChange={e => {
                                    const copied = [...editVariants];
                                    copied[i].stock = Math.max(0, Number(e.target.value));
                                    setEditVariants(copied);
                                  }}
                                  className="w-full text-xs text-center border rounded-md p-1 font-mono focus:border-pink-500 focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-1.5 mt-2.5">
                            <button
                              onClick={() => handleSaveStock(product.id)}
                              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Save className="h-3 w-3" />
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingProductId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 text-center mt-1.5">
                          {product.variants.map(v => (
                            <div key={v.size} className={`p-1.5 rounded-md border ${v.stock < 5 ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-white text-slate-700 border-slate-200"}`}>
                              <span className="text-[9px] font-extrabold font-mono block text-slate-400">{v.size}</span>
                              <span className="text-xs font-mono font-bold block">{v.stock}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isEditingThis && (
                      <div className="pt-2">
                        <button
                          onClick={() => startEditing(product)}
                          className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs transition-colors border border-slate-200/50 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Edit className="h-3.5 w-3.5 text-pink-600" />
                          Update / Opname Stok Varian
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Stock History Log */
        <div className="bg-white p-6 rounded-2xl border border-pink-100 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Log Historis Perubahan Stok</h3>
              <p className="text-xs text-slate-400">Jajak rekam audit keluar-masuk barang pergudangan Jassinta Atelier secara terperinci.</p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Terekam: {stockHistory.length} entri</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-slate-400 text-xs font-semibold border-b border-slate-100 pb-2 bg-slate-50">
                  <th className="p-3 font-medium">Tanggal</th>
                  <th className="p-3 font-medium">SKU</th>
                  <th className="p-3 font-medium">Produk</th>
                  <th className="p-3 font-medium text-center">Varian</th>
                  <th className="p-3 font-medium text-center">Jumlah</th>
                  <th className="p-3 font-medium text-center">Tipe</th>
                  <th className="p-3 font-medium">Keterangan</th>
                  <th className="p-3 font-medium">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {stockHistory.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-[10.5px] text-slate-500">
                      {new Date(log.date).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 font-mono font-bold text-pink-600">{log.productSku}</td>
                    <td className="p-3 font-medium max-w-xs truncate">{log.productName}</td>
                    <td className="p-3 text-center">
                      <span className="p-1 bg-slate-100 rounded-sm font-mono text-[10px] font-bold">
                        {log.variantSize} - {log.variantColor}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold font-mono">
                      <span className={log.changeQty > 0 ? "text-emerald-600" : "text-rose-600"}>
                        {log.changeQty > 0 ? `+${log.changeQty}` : log.changeQty}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.type === "Restok" ? "bg-emerald-100 text-emerald-800" :
                        log.type === "Penjualan" ? "bg-blue-100 text-blue-800" :
                        log.type === "Opname" ? "bg-amber-100 text-amber-800" :
                        "bg-indigo-100 text-indigo-800"
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 select-all max-w-[200px] truncate" title={log.notes}>
                      {log.notes}
                    </td>
                    <td className="p-3 font-medium text-slate-500">{log.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <QrCode className="h-4 w-4 text-pink-600" />
                QR Code Produk
              </h3>
              <button onClick={() => setShowQrModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-white">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm inline-block">
                <QRCode
                  value={showQrModal.sku}
                  size={180}
                  level="H"
                  fgColor="#0f172a" /* slate-900 */
                />
              </div>
              
              <div>
                <h4 className="font-bold text-slate-800">{showQrModal.name}</h4>
                <p className="font-mono text-sm text-pink-600 font-bold tracking-widest mt-1 uppercase">
                  {showQrModal.sku}
                </p>
                <div className="mt-2 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full inline-block">
                  Lokasi: {showQrModal.rackLocation}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => {
                  /* Basic print logic for QR (or alert that it would print) */
                  window.print();
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cetak / Print QR Code
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-3 leading-tight">
                Gunakan scanner barcode atau smartphone untuk memindai kode ini dan menarik data produk di menu kasir/opname.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Container */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-label-container, #print-label-container * {
            visibility: visible;
          }
          #print-label-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            display: block !important;
            background: white;
            z-index: 9999;
          }
          .print-page {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            box-sizing: border-box;
            background: white;
          }
        }
      `}</style>
      
      {printProducts && printProducts.length > 0 && (
        <div id="print-label-container" className="hidden print:block">
          {printProducts.map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="print-page p-8 text-center bg-white">
              <QRCode
                value={product.sku}
                size={160}
                level="H"
                fgColor="#000000"
              />
              <h2 className="mt-6 font-bold text-lg text-slate-900 uppercase tracking-wide">{product.name}</h2>
              <p className="font-mono text-2xl text-slate-900 font-extrabold tracking-widest mt-2">{product.sku}</p>
              <p className="text-sm font-medium text-slate-600 border border-slate-300 px-4 py-1.5 rounded-full mt-4">
                Rak: {product.rackLocation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
