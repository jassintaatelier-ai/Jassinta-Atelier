import { Product, Order, StockHistory, Transaction, Karyawan } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    sku: "GMS-SLK-PLM",
    name: "Gamis Syari Silk Premium Plum",
    category: "Gamis",
    normalPrice: 389000,
    promoPrice: 329000,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60",
    rackLocation: "Rak A-01",
    description: "Gamis mewah berbahan Silk Premium yang lembut, jatuh, dan dingin di kulit. Motif emboss mawar yang anggun cocok untuk acara formal mau pun kasual lebaran.",
    variants: [
      { size: "S", color: "Plum", stock: 12 },
      { size: "M", color: "Plum", stock: 18 },
      { size: "L", color: "Plum", stock: 8 },
      { size: "XL", color: "Plum", stock: 3 },
    ]
  },
  {
    id: "p2",
    sku: "BLS-LN-SGE",
    name: "Blouse Linen Oversized Sage Green",
    category: "Blouse",
    normalPrice: 189000,
    promoPrice: 159000,
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60",
    rackLocation: "Rak B-04",
    description: "Kemeja blouse oversized kasual dengan material Linen rami premium. Breathable, menyerap keringat, dan memberi kesan effortless chic ala streetwear modern.",
    variants: [
      { size: "S", color: "Sage Green", stock: 25 },
      { size: "M", color: "Sage Green", stock: 30 },
      { size: "L", color: "Sage Green", stock: 15 },
      { size: "XL", color: "Sage Green", stock: 5 },
    ]
  },
  {
    id: "p3",
    sku: "TNK-BRK-CRM",
    name: "Tunik Brokat Premium Ceruti Cream",
    category: "Tunik",
    normalPrice: 279000,
    promoPrice: 249000,
    imageUrl: "https://images.unsplash.com/photo-1561932774-75762e285785?w=500&auto=format&fit=crop&q=60",
    rackLocation: "Rak A-08",
    description: "Tunik pesta dengan paduan kain brokat chantilly impor dan furing hijab-ready ceruti babydoll. Sangat elegan untuk resepsi pernikahan atau kondangan formal.",
    variants: [
      { size: "S", color: "Cream", stock: 4 },
      { size: "M", color: "Cream", stock: 10 },
      { size: "L", color: "Cream", stock: 6 },
      { size: "XL", color: "Cream", stock: 1 }, // Alert menipis!
    ]
  },
  {
    id: "p4",
    sku: "KLT-HWT-BLK",
    name: "Kulot Highwaist Linen Charcoal",
    category: "Kulot",
    normalPrice: 149000,
    promoPrice: 125000,
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=60",
    rackLocation: "Rak C-02",
    description: "Celana kulot berpotongan high-waisted membuat kaki terlihat jenjang. Menggunakan bahan linen tebal berserat yang tidak menerawang.",
    variants: [
      { size: "S", color: "Charcoal Black", stock: 15 },
      { size: "M", color: "Charcoal Black", stock: 20 },
      { size: "L", color: "Charcoal Black", stock: 22 },
      { size: "XL", color: "Charcoal Black", stock: 8 },
    ]
  },
  {
    id: "p5",
    sku: "HJB-VOC-PNK",
    name: "Hijab Voal Ultrafine Soft Pink",
    category: "Hijab",
    normalPrice: 89000,
    promoPrice: 65000,
    imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=500&auto=format&fit=crop&q=60",
    rackLocation: "Rak D-01",
    description: "Hijab segi empat voal ultrafine yang tegak di dahi, tidak mendengung di telinga, dan sangat mudah dibentuk. Sisi jahit tepi rapi berstandar butik.",
    variants: [
      { size: "S", color: "Soft Pink", stock: 45 },
      { size: "M", color: "Soft Pink", stock: 50 },
      { size: "L", color: "Soft Pink", stock: 40 },
      { size: "XL", color: "Soft Pink", stock: 0 },
    ]
  },
  {
    id: "p6",
    sku: "CDG-KNT-OAT",
    name: "Cardigan Knit Premium Oatmeal",
    category: "Cardigan",
    normalPrice: 220000,
    promoPrice: 185000,
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60",
    rackLocation: "Rak B-10",
    description: "Cardigan rajut dengan bahan premium benang rajun tebal bertekstur lembut. Memberikan kehangatan maksimal dengan style Korean-look drapper hangat.",
    variants: [
      { size: "S", color: "Oatmeal", stock: 15 },
      { size: "M", color: "Oatmeal", stock: 22 },
      { size: "L", color: "Oatmeal", stock: 18 },
      { size: "XL", color: "Oatmeal", stock: 8 },
    ]
  },
  {
    id: "p7",
    sku: "RMP-VNT-KHK",
    name: "Rompi Vest Knit Vintage Khaki",
    category: "Rompi",
    normalPrice: 159000,
    promoPrice: 129000,
    imageUrl: "https://images.unsplash.com/photo-1551799517-eb8f03cb5e6a?w=500&auto=format&fit=crop&q=60",
    rackLocation: "Rak B-15",
    description: "Rompi rajut model vintage dengan potongan kerah V-neck. Sangat cocok dipadupadankan sebagai luaran (outer) kemeja berkerah putih kesayangan Anda.",
    variants: [
      { size: "S", color: "Khaki", stock: 10 },
      { size: "M", color: "Khaki", stock: 15 },
      { size: "L", color: "Khaki", stock: 10 },
      { size: "XL", color: "Khaki", stock: 4 },
    ]
  },
  {
    id: "p8",
    sku: "CLN-PLZ-BLK",
    name: "Celana Palazzo Premium Crepe Black",
    category: "Celana",
    normalPrice: 199000,
    promoPrice: 169000,
    imageUrl: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=500&auto=format&fit=crop&q=60",
    rackLocation: "Rak C-05",
    description: "Celana panjang model Palazzo berlipit anggun, melebar ke bawah. Berbahan crepe stretch premium yang lentur, adem, dan sangat elegan di kaki.",
    variants: [
      { size: "S", color: "Black", stock: 18 },
      { size: "M", color: "Black", stock: 24 },
      { size: "L", color: "Black", stock: 20 },
      { size: "XL", color: "Black", stock: 12 },
    ]
  },
  {
    id: "p9",
    sku: "ONS-RYS-MOC",
    name: "One Set Casual Rayon Mocha",
    category: "One Set",
    normalPrice: 289000,
    promoPrice: 245000,
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60",
    rackLocation: "Rak D-05",
    description: "Satu set baju atasan berkerah kancing hidup dan celana pinggang karet elastis. Menggunakan bahan katun Rayon Viscose premium super lembut dan sejuk.",
    variants: [
      { size: "S", color: "Mocha", stock: 12 },
      { size: "M", color: "Mocha", stock: 15 },
      { size: "L", color: "Mocha", stock: 8 },
      { size: "XL", color: "Mocha", stock: 3 },
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-1001",
    date: "2026-05-23T08:12:00Z",
    customerName: "Aisyah Rahmawati",
    customerPhone: "081234567890",
    shippingAddress: "Jl. Margonda Raya No. 45, Kecamatan Beji, Kota Depok, Jawa Barat 16424",
    total: 329000,
    status: "Proses",
    platform: "Shopee",
    trackingCode: "JP890123456",
    items: [
      {
        productSku: "GMS-SLK-PLM",
        productName: "Gamis Syari Silk Premium Plum",
        qty: 1,
        price: 329000,
        size: "M",
        color: "Plum"
      }
    ]
  },
  {
    id: "ORD-1002",
    date: "2026-05-23T09:45:00Z",
    customerName: "Siti Masitoh",
    customerPhone: "085699887766",
    shippingAddress: "Cluster Rosewood Blok AI No. 12, Gading Serpong, Tangerang, Banten 15810",
    total: 409000,
    status: "Tunda", // Perlu Konfirmasi Pembayaran
    platform: "WhatsApp",
    trackingCode: "",
    paymentProofUrl: "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=400&auto=format&fit=crop&q=60", // Mock transfer slip
    items: [
      {
        productSku: "TNK-BRK-CRM",
        productName: "Tunik Brokat Premium Ceruti Cream",
        qty: 1,
        price: 249000,
        size: "M",
        color: "Cream"
      },
      {
        productSku: "BLS-LN-SGE",
        productName: "Blouse Linen Oversized Sage Green",
        qty: 1,
        price: 159000,
        size: "L",
        color: "Sage Green"
      }
    ]
  },
  {
    id: "ORD-1003",
    date: "2026-05-22T14:30:00Z",
    customerName: "Hana Fadilah",
    customerPhone: "089911223344",
    shippingAddress: "Sedayu City Kelapa Gading Tower B Lantai 7, Jakarta Utara, DKI Jakarta 14240",
    total: 443000,
    status: "Kirim",
    platform: "Tokopedia",
    trackingCode: "TKP-7765123A",
    items: [
      {
        productSku: "GMS-SLK-PLM",
        productName: "Gamis Syari Silk Premium Plum",
        qty: 1,
        price: 329000,
        size: "L",
        color: "Plum"
      },
      {
        productSku: "HJB-VOC-PNK",
        productName: "Hijab Voal Ultrafine Soft Pink",
        qty: 1,
        price: 65000,
        size: "S",
        color: "Soft Pink"
      },
      {
        productSku: "HJB-VOC-PNK",
        productName: "Hijab Voal Ultrafine Soft Pink",
        qty: 1,
        price: 65000,
        size: "M",
        color: "Soft Pink"
      }
    ]
  },
  {
    id: "ORD-1004",
    date: "2026-05-21T11:20:00Z",
    customerName: "Zahra Amalia",
    customerPhone: "081122334455",
    shippingAddress: "Perumahan Dago Asri No. C-18, Coblong, Kota Bandung, Jawa Barat 40135",
    total: 125000,
    status: "Selesai",
    platform: "Offline",
    trackingCode: "Ambil Di Toko",
    items: [
      {
        productSku: "KLT-HWT-BLK",
        productName: "Kulot Highwaist Linen Charcoal",
        qty: 1,
        price: 125000,
        size: "M",
        color: "Charcoal Black"
      }
    ]
  },
  {
    id: "ORD-1005",
    date: "2026-05-22T10:15:00Z",
    customerName: "Rania Wardhana",
    customerPhone: "081987654321",
    shippingAddress: "Margorejo Indah Blok B-201, Kecamatan Wonocolo, Kota Surabaya, Jawa Timur 60238",
    total: 329000,
    status: "Selesai",
    platform: "Shopee",
    trackingCode: "SPX-44321-JKT",
    returnStatus: "Diajukan",
    returnReason: "Ukuran L terlalu kecil di pundak, mau tukar ukuran XL jika ada.",
    items: [
      {
        productSku: "GMS-SLK-PLM",
        productName: "Gamis Syari Silk Premium Plum",
        qty: 1,
        price: 329000,
        size: "L",
        color: "Plum"
      }
    ]
  }
];

export const INITIAL_STOCK_HISTORY: StockHistory[] = [
  {
    id: "st-1",
    productSku: "GMS-SLK-PLM",
    productName: "Gamis Syari Silk Premium Plum",
    variantSize: "M",
    variantColor: "Plum",
    date: "2026-05-20T10:00:00Z",
    changeQty: 50,
    type: "Restok",
    notes: "Restock dari Agen Muktamar Tanah Abang",
    operator: "Ahmad Gudang"
  },
  {
    id: "st-2",
    productSku: "GMS-SLK-PLM",
    productName: "Gamis Syari Silk Premium Plum",
    variantSize: "M",
    variantColor: "Plum",
    date: "2026-05-23T08:12:00Z",
    changeQty: -1,
    type: "Penjualan",
    notes: "Pembelian via Shopee ORD-1001",
    operator: "Sistem Otomatis"
  },
  {
    id: "st-3",
    productSku: "HJB-VOC-PNK",
    productName: "Hijab Voal Ultrafine Soft Pink",
    variantSize: "XL",
    variantColor: "Soft Pink",
    date: "2026-05-22T17:00:00Z",
    changeQty: 2,
    type: "Opname",
    notes: "Koreksi selisih hitung fisik bulanan",
    operator: "Putri Spv"
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TX-901",
    date: "2026-05-23T08:12:00Z",
    type: "Masuk",
    category: "Penjualan",
    amount: 329000,
    notes: "Pembayaran ORD-1001 Shopee"
  },
  {
    id: "TX-902",
    date: "2026-05-23T01:00:00Z",
    type: "Keluar",
    category: "Iklan",
    amount: 250000,
    notes: "Instagram & TikTok Ads Harian"
  },
  {
    id: "TX-903",
    date: "2026-05-22T14:30:00Z",
    type: "Masuk",
    category: "Penjualan",
    amount: 443000,
    notes: "Pembayaran ORD-1003 Tokopedia"
  },
  {
    id: "TX-904",
    date: "2026-05-20T11:00:00Z",
    type: "Keluar",
    category: "Restok",
    amount: 5400000,
    notes: "Kulakan Grosir Gamis & Blouse Tanah Abang Blok B"
  }
];

export const INITIAL_KARYAWAN: Karyawan[] = [
  {
    id: "emp1",
    name: "Laras Kirana",
    role: "CS",
    phone: "08191234567",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60",
    completedTasks: 142, // Chats handled
    commissionRate: 0.015, // 1.5%
    commissionEarned: 135000,
    attendances: [
      { date: "2026-05-23", checkInTime: "07:55 AM", status: "Hadir" },
      { date: "2026-05-22", checkInTime: "07:48 AM", status: "Hadir" },
      { date: "2026-05-21", checkInTime: "07:58 AM", status: "Hadir" }
    ]
  },
  {
    id: "emp2",
    name: "Ahmad Faisal",
    role: "Gudang",
    phone: "08571234567",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60",
    completedTasks: 89, // Orders packed
    commissionRate: 0.005, // 0.5%
    commissionEarned: 45000,
    attendances: [
      { date: "2026-05-23", checkInTime: "07:42 AM", status: "Hadir" },
      { date: "2026-05-22", checkInTime: "07:50 AM", status: "Hadir" },
      { date: "2026-05-21", checkInTime: "07:45 AM", status: "Hadir" }
    ]
  }
];
