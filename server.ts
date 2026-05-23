import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// Helper to check if a valid Gemini API Key is present
function isGeminiKeyValid(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!key && key !== "" && !key.includes("MY_GEMINI_API_KEY");
}

// Global timestamp for tracking rate limiting / quota exhaustion
let rateLimitActiveUntil = 0;

function isQuotaExceededActive(): boolean {
  if (rateLimitActiveUntil > 0 && Date.now() < rateLimitActiveUntil) {
    return true;
  }
  return false;
}

function handleGeminiError(err: any): boolean {
  const errMsg = err?.message || err?.toString() || "";
  const isQuotaError = errMsg.toLowerCase().includes("rate limit") || 
                       errMsg.toLowerCase().includes("quota") || 
                       errMsg.toLowerCase().includes("429") || 
                       errMsg.toLowerCase().includes("exhausted") ||
                       err?.status === 429 || 
                       err?.code === 429;
  
  if (isQuotaError) {
    rateLimitActiveUntil = Date.now() + 15 * 60 * 1000; // 15 mins bypass
    console.log(`[Jassinta-Bot] Info: Kuota harian terlampaui (429). Mengaktifkan mode asisten offline.`);
  } else {
    console.log(`[Jassinta-Bot] Info: Gangguan koneksi sistem. Mengaktifkan asisten offline.`);
  }
  return isQuotaError;
}

// Lazy initializer for Gemini SDK
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY")) {
      throw new Error("GEMINI_API_KEY belum dikonfigurasi. Harap atur di menu Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Helper to generate a conversational mock response when key is missing or quota is exceeded
function generateMockChatbotResponse(message: string, isRateLimited: boolean = false): string {
  const lower = message.toLowerCase();
  let responseText = "";

  if (lower.includes("gamis") || lower.includes("plum") || lower.includes("dress")) {
    responseText = "Halo Kak! ✨ Untuk Produk **Gamis Syari Silk Premium Plum** kami ready ya Kak. Bahannya silk premium yang jatuh, adem banget, dan kelihatan mewah pol! 😍\n\nDetail ukuran:\n• S (Sisa 12)\n• M (Sisa 18)\n• L (Sisa 8)\n• XL (Sisa 3)\n\nHarganya lagi promo dari Rp 389.000 jadi **Rp 329.000** aja! Mau dikirim ukuran apa nih Kak? Biar dibantu keep sekarang sebelum kehabisan 💖";
  } else if (lower.includes("lacak") || lower.includes("pesanan") || lower.includes("ord-")) {
    responseText = "Tentu Kak! Biar Jassinta-Bot bantu cek ya. 🔍\n\nBerdasarkan data sistem kami, **Pesanan ORD-1002 (Siti Masitoh)** saat ini berstatus **[Tunda / Menunggu Konfirmasi]**. Kami sedang memverifikasi bukti transfer pembayaran yang diunggah Kak Siti.\n\nSetelah divalidasi oleh tim keuangan, pesanan akan langsung dipacking oleh tim gudang dan dikirim hari ini juga menggunakan kurir pilihan Kakak! Ada yang bisa dibantu lagi, Kak? 💕";
  } else if (lower.includes("rekomendasi") || lower.includes("pesta") || lower.includes("kondangan")) {
    responseText = "Wah pas banget nih Kak! Kebetulan untuk acara formal atau pesta kondangan, kami sangat merekomendasikan **Tunik Brokat Premium Ceruti Cream** ✨.\n\nPerpaduan brokat Chantilly impor premium dengan furing ceritunya anggun banget, memberi siluet ramping dan elegan. Kakak bisa pasangkan dengan **Hijab Voal Ultrafine Soft Pink** kami untuk menambah kesan chic & manis! 🥰\n\nMau langsung di-co sekarang atau mau tanya ukuran dulu Kak? ✨";
  } else {
    responseText = `Halo Kak! Selamat datang di Jassinta Atelier. 🌸✨ Ada yang bisa Jassinta-Bot bantu hari ini?\n\nKami melayani tanya-jawab produk, cek stok gudang real-time, rekomendasi OOTD hijab kasual atau formal, hingga pelacakan nomor resi pesanan Kakak.\n\nSilakan tanya tentang: "Ready gamis plum ukuran L?", "Rekomendasi baju kondangan", atau "Lacak pesanan ORD-1001" ya Kak! ❤️`;
  }

  if (isRateLimited) {
    responseText += `\n\n*(Catatan Kinerja: Batas kuota harian Gemini API saat ini telah terpenuhi / rate-limit aktif. Kami mengaktifkan mode asisten kecerdasan cadangan offline secara otomatis agar operasional Anda tetap berjalan mulus!)*`;
  }

  return responseText;
}

// Helper to generate a high-quality tactical mock business advice when key is missing or quota is exceeded
function generateMockAdvisorResponse(message: string, orders: any[] = [], isRateLimited: boolean = false): string {
  const lower = message.toLowerCase();
  let responseText = "";

  if (lower.includes("ringkasan") || lower.includes("pagi") || lower.includes("morning")) {
    responseText = `### 🌅 RINGKASAN BISNIS PAGI INI: JASSINTA ATELIER

Selamat pagi, Owner! 🌸 Berikut adalah laporan eksekutif ringkasan kondisi bisnis Jassinta Atelier pagi ini, **Sabtu, 23 Mei 2026**:

#### 1. Ringkasan Keuangan & Arus Kas
• **Kas Operasional**: Saldo kas kita saat ini tercatat sangat stabil di angka **Rp 8.900.000**, dengan peningkatan modal masuk yang sehat.
• **Arus Kas Masuk**: Sebesar **Rp 1.450.000** berhasil didapatkan dari pelunasan 3 order terbaru kemarin.
• **Iklan Aktif**: Alokasi anggaran iklan kita berjalan di angka **Rp 250.000** per hari dengan tingkat konversi yang terus dipantau.

#### 2. Kinerja Penjualan & Status Pesanan
• **Total Pesanan Terdaftar**: Terdata **5 Pesanan** di sistem kita.
• **Status Logistik**: Sebanyak **2 Pesanan** telah berhasil terkirim (*Selesai*). Terdapat **2 Pesanan** dalam proses packing (*Kirim/Proses*), dan **1 Pesanan** masih berstatus tunda (*Tunda*) menunggu verifikasi pembayaran bank.
• **Top Kategori Terlaris**: Gamis mewah sutra (*Silk Premium*) mendominasi **52% total volume penjualan** minggu ini.

#### 3. Kondisi Gudang & Stok Kritis
• **Stok Menipis**: Produk **Gamis Syari Silk Premium Plum** (ukuran **XL**) tersisa hanya **3 unit** di rak.
• **Stok Kosong**: Varian **Hijab Voal Ultrafine Soft Pink** (ukuran **XL**) sudah habis total (**0 unit**). Direkomendasikan segera melakukan pesan ulang ke pemasok grosir Tanah Abang.
• **Stok Aman**: Koleksi *Blouse Linen Sage Green* masih melimpah sebanyak **55 unit**, siap ditawarkan untuk bundling promo diskon gajian.

#### 4. Rekomendasi Aksi Mendadak Pagi Ini
1. **Segera Verifikasi Pembayaran**: Minta admin bagian finance untuk memvalidasi bukti transfer untuk pesanan tunda milik Kak **Siti Masitoh (ORD-1002)** agar bisa dipacking gudang pagi ini sebelum kurir ekspedisi datang menjemput.
2. **Setup Bundling Produk Lambat Laku**: Pasangkan *Blouse Linen Sage Green* dengan *Kulot Charcoal* dalam paket bundling diskon 12% untuk melikuidasi sisa tumpukan stok.

Semoga hari ini penjualan butik kita melimpah ruah dan dipenuhi berkah, Kak! Ada yang ingin dianalisis lebih lanjut? 😊✨`;
  } else if (lower.includes("restok") || lower.includes("gudang") || lower.includes("habis")) {
    responseText = `### 📋 ANALISIS PRIORITAS RESTOK MINGGU INI

Berdasarkan analisis run-rate penjualan dan sisa kapasitas rak gudang Jassinta Atelier, berikut rekomendasi restok mendesak Anda:

1. **Tunik Brokat Premium Ceruti Cream (SKU: TNK-BRK-CRM)**
   * **Status**: Sangat Kritis 🚨
   * **Sisa Stok**: Ukuran **XL** tinggal **1 unit** dan **M** tersisa **10 unit**.
   * **Laju Penjualan**: Laku 14 unit per minggu secara omni-channel.
   * **Rekomendasi Restok**: **35 unit** (distribusi: S:5, M:15, L:10, XL:5).

2. **Hijab Voal Ultrafine Soft Pink (SKU: HJB-VOC-PNK)**
   * **Status**: Habis Total ⚠️
   * **Sisa Stok**: Ukuran **XL** kosong (**0 unit**).
   * **Rekomendasi Restok**: **50 unit** ukuran XL karena hijab voal di masa gajian naik permintaannya hingga 150%.

3. **Gamis Syari Silk Premium Plum (SKU: GMS-SLK-PLM)**
   * **Status**: Menipis 📈
   * **Sisa Stok**: Ukuran **XL** tinggal **3 unit**. Karakteristik kain mewah sangat dicari pada akhir pekan.
   * **Rekomendasi Restok**: **15 unit** khusus ukuran besar (L & XL).

**Estimasi Kebutuhan Modal**: Rp 4.250.000,- (Estimasi harga beli grosir 55% dari harga jual retail). Kami sarankan alokasikan dari saldo kas yang sehat sebesar Rp 8.900.000 saat ini.`;
  } else if (lower.includes("turun") || lower.includes("omzet") || lower.includes("performa")) {
    responseText = `### 📊 DIAGNOSIS PENURUNAN OMZET & EVALUASI STRATEGIS

Melihat data histori saldo kas dan transaksi 7 hari terakhir, omzet tercatat melambat sekitar **12.4%** dibanding periode minggu sebelumnya. Mari kita bedah penyebab utama dan solusinya:

#### 1. Masalah Utama (Root Causes):
* **Kehabisan Varian Favorit (Stok Mati vs Stok Laris)**: Produk paling mendulang profit seperti *Gamis Syari Silk Plum* ukuran L/XL tersisa sangat sedikit di rak utama. Pelanggan batal check-out karena ukuran favorit kosong.
* **Biaya Pengeluaran Iklan Tinggi**: Pengeluaran harian ads mencapai Rp 250.000,- tetapi konversi dari WhatsApp ke Closing melambat akibat waktu respons CS rata-rata meningkat menjadi 12 menit di atas jam 7 malam.

#### 2. Rencana Aksi Pemulihan Kemakmuran (Recovery Plan):
* **Fokuskan Anggaran Ads ke Produk Berstok Melimpah**: Alihkan 60% anggaran TikTok Ads dari produk Tunik Cream ke **Blouse Linen S Sage Green** (stok melimpah: 25 unit S, 30 unit M). Produk ini berserat sejuk dan sangat laku bagi kaum milenial aktif.
* **Optimasi CS Respons**: Terapkan Chatbot AI Otomatis 'Jassinta-Bot' setelah jam kerja (19:00 - 24:00) yang merespons pertanyaan varian produk dalam 3 detik untuk mengurangi gerilya kompetitor.`;
  } else if (lower.includes("flash") || lower.includes("promo") || lower.includes("kapan")) {
    responseText = `### ⚡ STRATEGI JAM EMAS FLASH SALE & LIQUIDASI STOK

Untuk mengoptimalkan arus kas keluar-masuk Jassinta Atelier, waktu terbaik untuk menjalankan kampanye promosi adalah:

#### 1. Hari & Waktu Terbaik:
* **Hari**: **Jumat sore (16:00 - 20:00)** dan **Minggu pagi (09:00 - 12:00)**.
* **Mengapa?**: Berdasarkan data aktivitas pesanan di Tokopedia & Shopee toko Anda, impresi dan obrolan (chat) naik 3.4 kali lipat di jam santai menjelang libur akhir pekan, serta saat gajian (Payday) tanggal 25-28 setiap bulannya.

#### 2. Produk Utama Target Flash Sale:
* **Blouse Linen Sage Green & Kulot Highwaist Linen Charcoal**: Kedua produk ini memiliki jumlah stok gabungan tertinggi (**120 unit**). 
* **Taktik Bundling**: Buat promo *"OOTD Casual Set (Blouse + Kulot)"* dengan harga coret Rp 249.000 (diskon 12% dari harga beli terpisah). Ini mendongkrak *Average Order Value (AOV)* dari Rp 150.000 naik ke Rp 249.000 per bill!`;
  } else {
    const backlogOrdersCount = orders ? orders.filter((o: any) => o.status !== "Selesai").length : 3;
    responseText = `### 🤝 HALO! SAYA CLAUDE-BIZ, ADVISOR BISNIS ANDA

Saya siap membedah kesehatan finansial dan operasional butik **Jassinta Atelier**. Saat ini saya mendeteksi:
* **Total Katalog**: 5 Produk Utama
* **Pesanan Aktif**: 5 Pesanan (${backlogOrdersCount} dalam proses pengerjaan)
* **Status Kas Toko**: Saldo Kas Operasional stabil dengan alokasi porsi Iklan cukup agresif (Rp 250.000 harian).

**Silakan instruksikan konsultasi strategis Anda:**
1. *"Analisis performa restok minggu ini"* (Menghitung run-rate stok menipis dan modal grosir).
2. *"Mengapa omzet melambat dibanding minggu lalu?"* (Analisis konversi pemasaran dan korelasi stok).
3. *"Strategi flash sale dan bundling produk"* (Rekomendasi jam operasional paling ramai & paket promo).`;
  }

  if (isRateLimited) {
    responseText += `\n\n*(Catatan Kinerja: Batas kuota harian Gemini API saat ini telah terpenuhi / rate-limit aktif. Kami mengaktifkan mode asisten kecerdasan cadangan offline secara otomatis agar operasional Anda tetap berjalan mulus!)*`;
  }

  return responseText;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 10mb limit for base64 OCR uploads
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // API Route: Check keys and health status
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: isGeminiKeyValid(),
    });
  });

  // API Route: AI Customer Chatbot
  app.post("/api/gemini/chatbot", async (req, res): Promise<any> => {
    const { message, history, products, orders } = req.body;

    const formattedProducts = JSON.stringify(products || [], null, 2);
    const formattedOrders = JSON.stringify(orders || [], null, 2);

    const systemPrompt = `Anda adalah "Jassinta-Bot", asisten Customer Service AI yang sangan ramah, profesional, dan cekatan untuk butik fashion wanita premium "Jassinta Atelier".
Tugas utama Anda adalah membantu pelanggan menjawab pertanyaan tentang:
1. Katalog produk fashion kami (stok, harga, varian ukuran, warna, deskripsi produk).
2. Status pengiriman pesanan (misalnya melacak pesanan ORD-1001, dll).
3. Memberikan rekomendasi fashion (dress kondangan, gamis casual, mix & match, dll) berdasarkan katalog produk kami.
4. Menangani keluhan pelanggan (komplain ukuran, retur barang) dengan sabar dan berempati tinggi.

Berikut adalah Katalog Produk nyata kami yang tersedia saat ini di database toko:
${formattedProducts}

Berikut adalah daftar Pesanan Pelanggan kami saat ini untuk referensi pelacakan:
${formattedOrders}

Gunakan bahasa Indonesia yang ramah, sopan, bersahabat, dan gunakan kata sapaan hangat seperti "Kak" atau "Sist".
Jika pelanggan menanyakan ketersediaan produk, cek varian ukuran dan warna. Beritahukan jika stok suatu varian menipis atau kosong secara jujur tetapi tawarkan alternatif.
Jika mereka menanyakan status pesanan, cari di database di atas berdasarkan nama pelanggan atau nomor order (misalnya ORD-1002). Jelaskan statusnya (Tunda, Proses, Kirim, Selesai) beserta detail pengiriman secara informatif.

PENTING FORMAT PENULISAN:
- Jangan biarkan tulisan mengumpul dalam satu paragraf tunggal yang panjang & membosankan.
- Pisahkan jawaban selalu menjadi beberapa bagian/paragraf pendek dengan spasi baris kosong (\n\n) untuk meningkatkan kenyamanan baca.
- Gunakan bullet point (•) untuk menyusun daftar varian ukuran, warna, harga, atau petunjuk operasional.
- Tebalkan kata-kata kunci utama, nomor pesanan, nama produk, status, and rincian penting lainnya menggunakan penanda ganda asteris (**contoh**) agar terekspos jelas secara visual.

Jawablah dengan gaya asisten chat WhatsApp yang cantik, rapi dengan spasi antar baris, dan gunakan beberapa emoji yang relevan secara elegan.`;

    if (isQuotaExceededActive() || !isGeminiKeyValid()) {
      return res.json({ 
        text: generateMockChatbotResponse(message, isQuotaExceededActive()), 
        isMock: true,
        rateLimited: isQuotaExceededActive()
      });
    }

    try {
      const ai = getGemini();
      const geminiHistory = history.map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      }));

      // Add the final user message to contents along with the history
      const contents = [
        ...geminiHistory,
        { role: "user", parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents as any,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text || "Mohon maaf, Jassinta-Bot sedang kesulitan merespons." });
    } catch (err: any) {
      handleGeminiError(err);
      return res.json({
        text: generateMockChatbotResponse(message, true),
        isMock: true,
        rateLimited: true,
        errorNote: err.message
      });
    }
  });

  // API Route: AI Business Advisor (Business Strategic Consulting)
  app.post("/api/gemini/advisor", async (req, res): Promise<any> => {
    const { message, products, orders, transactions } = req.body;

    const formattedProducts = JSON.stringify(products || [], null, 2);
    const formattedOrders = JSON.stringify(orders || [], null, 2);
    const formattedTransactions = JSON.stringify(transactions || [], null, 2);

    const systemPrompt = `Anda adalah "Claude-Biz", Konsultan Analisis Bisnis Retail Fashion & AI Strategis berkelas dunia yang didedikasikan khusus untuk membantu pemilik butik fashion "Jassinta Atelier".
Tugas Anda adalah membaca data penjualan, performa stok, transaksi pengeluaran/pemasukan toko kami, kemudian memberikan jawaban analitik, solusi operasional, taktik pemasaran, dan saran finansial berdasarkan DATA NYATA toko kami di bawah.

Berikut adalah kondisi produk & sisa stok di database:
${formattedProducts}

Berikut adalah histori pesanan pelanggan:
${formattedOrders}

Berikut adalah rangkuman arus kas keuangan (Cashflow / Transactions):
${formattedTransactions}

Instruksi Analitik:
1. Berikan jawaban yang SANGAT DETAIL, didukung oleh angka, persentase, perbandingan data rasional, bukan saran generik retail umum.
2. Hitunglah total omzet jika ditanyakan, analisis produk paling lambat laku (dead stock), dan proyeksikan tren atau sisa hari stok habis (run-rate).
3. Jika ditanyakan "Restok produk apa?", bandingkan sisa stok saat ini dengan order terbanyak. Rekomendasikan secara spesifik SKU, Ukuran, jumlah unit restok, serta estimasi modal yang dibutuhkan berdasarkan harga beli historis.
4. Gunakan bahasa Indonesia profesional yang tegas, percaya diri, antusias, dan ramah seperti mentor bisnis elit berkebangsaan Indonesia.

PENTING - LAYOUT PRESENTASI & GAYA BACA:
- Jangan biarkan tulisan mengumpul dalam satu paragraf tunggal yang panjang & membosankan.
- Pisahkan jawaban selalu menjadi beberapa bagian/paragraf pendek dengan spasi baris kosong (\\n\\n) untuk meningkatkan kenyamanan baca.
- Gunakan bahasa yang elegan, rapi, dan mudah dicerna.
- Gunakan sub-heading (### dan ####) untuk memisahkan bagian secara logis.
- Gunakan bullet point (•) untuk mendaftar rincian produk, stok, atau angka performa.
- Tebalkan kata-kata kunci utama, nomor pesanan, nama produk, status, and rincian penting lainnya menggunakan penanda ganda asteris (**contoh**) agar terekspos jelas secara visual.`;

    if (isQuotaExceededActive() || !isGeminiKeyValid()) {
      return res.json({ 
        text: generateMockAdvisorResponse(message, orders, isQuotaExceededActive()), 
        isMock: true,
        rateLimited: isQuotaExceededActive()
      });
    }

    try {
      const ai = getGemini();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `Pertanyaan dari Owner: "${message}"` }],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
        },
      });

      return res.json({ text: response.text || "Mohon maaf, saya membutuhkan waktu lebih untuk memproses data finansial." });
    } catch (err: any) {
      handleGeminiError(err);
      return res.json({
        text: generateMockAdvisorResponse(message, orders, true),
        isMock: true,
        rateLimited: true,
        errorNote: err.message
      });
    }
  });

  // API Route: Smart AI OCR Scan Invoice / Receipt
  app.post("/api/gemini/ocr", async (req, res): Promise<any> => {
    const { imageBase64, mimeType, presetName } = req.body;

    const instructions = `Anda adalah sistem kecerdasan buatan AI OCR spesialis ekstraksi dokumen inventaris pergudangan retail fashion "Jassinta Atelier".
Tugas Anda adalah membaca gambar dokumen (bisa berupa Faktur Resmi Agen, Nota Tulis Tangan Grosir, Bon Pembelian Fabric, atau Struk Pembelian Gudang) yang dilampirkan.
Ekstrak daftar barang belanjaan atau item stok masuk yang dibeli dari supplier grosir tersebut menjadi struktur data JSON murni.

Format JSON hasil ekstraksi harus berupa ARRAY dari OBJECT dengan format tepat:
[
  {
    "sku": "Kode SKU terdekat atau buatkan kode masuk akal yang disingkat (Capital), misalnya GMS-SLK-PLM, BLS-LN-SGE, TNK-BRK-CRM, KLT-HWT-BLK, atau buat baru jika tidak mirip",
    "name": "Nama produk lengkap (misal: Gamis Silk Plum, Blouse Sage Green, dll)",
    "qty": angka_bulat_jumlah_item,
    "buyPrice": angka_bulat_harga_beli_per_unit,
    "total": angka_bulat_subtotal_harga_beli
  }
]

Sangat penting:
1. Pastikan return output adalah JSON valid tanpa kode pembungkus markdown murni \`\`\`json ... \`\`\`. Output murni berupa teks JSON saja supaya bisa langsung di-parse oleh program.
2. Jika ada coretan tulis tangan pada jumlah atau harga, prioritaskan membaca angka yang direvisi terbaru.
3. Carilah total keseluruhan belanjaan agen untuk dicatat dalam log pengeluaran keuangan kas.`;

    // High fidelity mock database for OCR Presets
    if (presetName === "faktur_grosir" && (!imageBase64 || !isGeminiKeyValid() || isQuotaExceededActive())) {
      const data = [
        { sku: "GMS-SLK-PLM", name: "Gamis Syari Silk Premium Plum", qty: 30, buyPrice: 175000, total: 5250000 },
        { sku: "HJB-VOC-PNK", name: "Hijab Voal Ultrafine Soft Pink", qty: 40, buyPrice: 35000, total: 140000 }
      ];
      return res.json({ items: data, totalBill: 5390000, documentType: "Faktur Resmi Grosir Tanah Abang (Fallback)", isMock: true, rateLimited: isQuotaExceededActive() });
    } else if (presetName === "nota_tangan" && (!imageBase64 || !isGeminiKeyValid() || isQuotaExceededActive())) {
      const data = [
        { sku: "BLS-LN-SGE", name: "Blouse Linen Oversized Sage Green", qty: 15, buyPrice: 85000, total: 1275000 },
        { sku: "KLT-HWT-BLK", name: "Kulot Highwaist Linen Charcoal", qty: 20, buyPrice: 65000, total: 1300000 }
      ];
      return res.json({ items: data, totalBill: 2575000, documentType: "Nota Tangan Toko Sinar Jaya Cotton (Fallback)", isMock: true, rateLimited: isQuotaExceededActive() });
    } else if (presetName === "struk_gudang" && (!imageBase64 || !isGeminiKeyValid() || isQuotaExceededActive())) {
      const data = [
        { sku: "TNK-BRK-CRM", name: "Tunik Brokat Premium Ceruti Cream", qty: 10, buyPrice: 135000, total: 1350000 }
      ];
      return res.json({ items: data, totalBill: 1350000, documentType: "Struk Kasir Agen Tekstil Makmur (Fallback)", isMock: true, rateLimited: isQuotaExceededActive() });
    } else if (presetName === "resi_pengiriman" && (!imageBase64 || !isGeminiKeyValid() || isQuotaExceededActive())) {
      const data = [
        { sku: "GMS-SLK-PLM", name: "Gamis Syari Silk Premium Plum", qty: 2, buyPrice: 175000, total: 350000 },
        { sku: "BLS-LN-SGE", name: "Blouse Linen Oversized Sage Green", qty: 3, buyPrice: 85000, total: 255000 },
        { sku: "TNK-BRK-CRM", name: "Tunik Brokat Premium Ceruti Cream", qty: 1, buyPrice: 135000, total: 135000 }
      ];
      return res.json({ items: data, totalBill: 740000, documentType: "Resi Pengiriman J&T Express (Fallback)", isMock: true, rateLimited: isQuotaExceededActive() });
    }

    if (isQuotaExceededActive() || !isGeminiKeyValid()) {
      let defaultData = [
        { sku: "GMS-SLK-PLM", name: "Gamis Syari Silk Premium Plum (Fallback)", qty: 30, buyPrice: 175000, total: 5250000 }
      ];
      return res.json({
        items: defaultData,
        totalBill: 5250000,
        documentType: "Hasil Analisis Kamera (Fallback - Kuota Gemini Terlampaui)",
        isMock: true,
        rateLimited: true
      });
    }

    try {
      const ai = getGemini();

      // Ensure base64 string doesn't include the data url header
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      };

      const textPart = {
        text: instructions,
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
      });

      const responseText = response.text || "";
      // Strip markdown codeblocks if Gemini added them despite the system instruction
      const jsonStr = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

      const parsedItems = JSON.parse(jsonStr);
      const totalBill = parsedItems.reduce((acc: number, item: any) => acc + (item.total || (item.qty * item.buyPrice) || 0), 0);

      return res.json({
        items: parsedItems,
        totalBill: totalBill,
        documentType: "Hasil Analisis Kamera / File Upload",
        rawOutput: responseText,
      });

    } catch (err: any) {
      handleGeminiError(err);
      
      // Let's suggest realistic demo data based on presetName or default
      let data = [
        { sku: "GMS-SLK-PLM", name: "Gamis Syari Silk Premium Plum (Fallback)", qty: 30, buyPrice: 175000, total: 5250000 },
        { sku: "HJB-VOC-PNK", name: "Hijab Voal Ultrafine Soft Pink (Fallback)", qty: 40, buyPrice: 35000, total: 140000 }
      ];
      let docTitle = "Hasil Analisis Kamera (Auto Fallback - Rate-Limit Aktif)";
      let totalBill = 5390000;

      if (presetName === "nota_tangan") {
        data = [
          { sku: "BLS-LN-SGE", name: "Blouse Linen Oversized Sage Green (Fallback)", qty: 15, buyPrice: 85000, total: 1275000 },
          { sku: "KLT-HWT-BLK", name: "Kulot Highwaist Linen Charcoal (Fallback)", qty: 20, buyPrice: 65000, total: 1300000 }
        ];
        docTitle = "Nota Tangan Toko (Auto Fallback - Rate-Limit Aktif)";
        totalBill = 2575000;
      } else if (presetName === "struk_gudang") {
        data = [
          { sku: "TNK-BRK-CRM", name: "Tunik Brokat Premium Ceruti Cream (Fallback)", qty: 10, buyPrice: 135000, total: 1350000 }
        ];
        docTitle = "Struk Kasir Agen (Auto Fallback - Rate-Limit Aktif)";
        totalBill = 1350000;
      } else if (presetName === "resi_pengiriman") {
        data = [
          { sku: "GMS-SLK-PLM", name: "Gamis Syari Silk Premium Plum (Fallback)", qty: 2, buyPrice: 175000, total: 350000 },
          { sku: "BLS-LN-SGE", name: "Blouse Linen Oversized Sage Green (Fallback)", qty: 3, buyPrice: 85000, total: 255000 },
          { sku: "TNK-BRK-CRM", name: "Tunik Brokat Premium Ceruti Cream (Fallback)", qty: 1, buyPrice: 135000, total: 135000 }
        ];
        docTitle = "Resi Pengiriman J&T Express (Auto Fallback - Rate-Limit Aktif)";
        totalBill = 740000;
      }

      return res.json({
        items: data,
        totalBill: totalBill,
        documentType: docTitle,
        isMock: true,
        rateLimited: true,
        errorNote: err.message
      });
    }
  });

  // Setup Vite Dev Server vs Production Static Serving
  if (process.env.NODE_ENV !== "production") {
    // Development middleware serving
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server connected in middleware Mode.");
  } else {
    // Production file server serving built assets from /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production server configured with static path:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Jassinta Boutique ERP] Full-stack Server listening on port ${PORT}`);
  });
}

// Global process error catchers to avoid crash looping
process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at Promise:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
});

startServer();
