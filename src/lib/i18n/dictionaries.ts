export type Language = "id" | "en";

export const dictionaries = {
  id: {
    // Navbar
    home: "Beranda",
    events: "Event",
    articles: "Artikel",
    myTickets: "Tiket Saya",
    login: "Masuk",
    logout: "Keluar",
    
    // Homepage Hero
    heroTitle: "Temukan Pengalaman Tak Terlupakan",
    heroSubtitle: "Cari dan pesan tiket untuk event terbaik, konser, workshop, dan pameran dengan mudah dan aman.",
    searchPlaceholder: "Cari event atau kategori...",
    searchButton: "Cari Event",

    // Homepage Sections
    upcomingEvents: "Event Mendatang",
    viewAll: "Lihat Semua",
    latestArticles: "Artikel Terbaru",
    
    // Event Cards
    free: "GRATIS",
    startsFrom: "Mulai dari",
    
    // Event Detail
    aboutEvent: "Tentang Event",
    location: "Lokasi",
    dateAndTime: "Waktu & Tanggal",
    selectTickets: "Pilih Tiket",
    terms: "Syarat & Ketentuan",
    buyTickets: "Beli Tiket",
    eventEnded: "Event Berakhir",
    soldOut: "Habis Terjual",
    unavailable: "Tidak Tersedia",
    
    // Ticket Selection
    quantity: "Jumlah",
    subtotal: "Subtotal",
    continueCheckout: "Lanjut ke Pembayaran",
    
    // Checkout
    checkoutInfo: "Informasi Pembeli",
    fullName: "Nama Lengkap",
    email: "Alamat Email",
    orderSummary: "Ringkasan Pesanan",
    totalAmount: "Total Tagihan",
    payNow: "Bayar Sekarang",
    processing: "Memproses...",

    // Customer Portal (My Tickets)
    yourTickets: "Tiket Anda",
    noTickets: "Anda belum memiliki tiket.",
    findEvents: "Cari Event Menarik",
    
    // Misc
    back: "Kembali",
    error: "Terjadi kesalahan",
    success: "Berhasil",
  },
  en: {
    // Navbar
    home: "Home",
    events: "Events",
    articles: "Articles",
    myTickets: "My Tickets",
    login: "Login",
    logout: "Logout",
    
    // Homepage Hero
    heroTitle: "Discover Unforgettable Experiences",
    heroSubtitle: "Search and book tickets for the best events, concerts, workshops, and exhibitions safely and easily.",
    searchPlaceholder: "Search events or categories...",
    searchButton: "Search Events",

    // Homepage Sections
    upcomingEvents: "Upcoming Events",
    viewAll: "View All",
    latestArticles: "Latest Articles",
    
    // Event Cards
    free: "FREE",
    startsFrom: "Starts from",
    
    // Event Detail
    aboutEvent: "About Event",
    location: "Location",
    dateAndTime: "Date & Time",
    selectTickets: "Select Tickets",
    terms: "Terms & Conditions",
    buyTickets: "Buy Tickets",
    eventEnded: "Event Ended",
    soldOut: "Sold Out",
    unavailable: "Unavailable",
    
    // Ticket Selection
    quantity: "Quantity",
    subtotal: "Subtotal",
    continueCheckout: "Continue to Checkout",
    
    // Checkout
    checkoutInfo: "Buyer Information",
    fullName: "Full Name",
    email: "Email Address",
    orderSummary: "Order Summary",
    totalAmount: "Total Amount",
    payNow: "Pay Now",
    processing: "Processing...",

    // Customer Portal (My Tickets)
    yourTickets: "Your Tickets",
    noTickets: "You don't have any tickets yet.",
    findEvents: "Find Exciting Events",
    
    // Misc
    back: "Back",
    error: "An error occurred",
    success: "Success",
  },
};

export type Dictionary = typeof dictionaries.id;
