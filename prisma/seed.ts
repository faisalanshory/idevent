import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);
const future = (d: number, h = 0) => { const dt = daysFromNow(d); dt.setHours(h, 0, 0, 0); return dt; };
const past = (d: number, h = 0) => { const dt = daysAgo(d); dt.setHours(h, 0, 0, 0); return dt; };

const unsplash = (id: string, w = 800, h = 500) =>
  `https://picsum.photos/seed/${id}/${w}/${h}`;

// Gallery: 4 images per event
const gallery = (ids: string[]) => JSON.stringify(ids.map(id => unsplash(id)));

const hl = (...items: string[]) => JSON.stringify(items);
const rd = (...items: { time: string; title: string; description?: string }[]) =>
  JSON.stringify(items.map(i => ({ ...i, description: i.description || "" })));
const faq = (...items: { question: string; answer: string }[]) => JSON.stringify(items);
const benefits = (...items: string[]) => JSON.stringify(items);

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database...");

  // ── Categories ──────────────────────────────────────────────────────────────
  const [catMusic, catTech, catFestival, catWorkshop, catSport, catCulture] = await Promise.all([
    db.category.upsert({ where: { slug: "musik" }, update: {}, create: { name: "Musik", slug: "musik" } }),
    db.category.upsert({ where: { slug: "teknologi" }, update: {}, create: { name: "Teknologi", slug: "teknologi" } }),
    db.category.upsert({ where: { slug: "festival" }, update: {}, create: { name: "Festival", slug: "festival" } }),
    db.category.upsert({ where: { slug: "workshop" }, update: {}, create: { name: "Workshop", slug: "workshop" } }),
    db.category.upsert({ where: { slug: "olahraga" }, update: {}, create: { name: "Olahraga", slug: "olahraga" } }),
    db.category.upsert({ where: { slug: "budaya" }, update: {}, create: { name: "Budaya & Seni", slug: "budaya" } }),
  ]);

  // ── Organizers ──────────────────────────────────────────────────────────────
  const jakartaEvent = await db.organizer.upsert({
    where: { subdomain: "jakartaevent" },
    update: {},
    create: {
      name: "Jakarta Event",
      slug: "jakarta-event",
      subdomain: "jakartaevent",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=JE&backgroundColor=2563eb&textColor=ffffff",
      description: "Platform tiket event musik, festival, dan hiburan terbesar di Jakarta.",
      aboutText: "Jakarta Event adalah platform ticketing terpercaya yang telah melayani lebih dari 500.000 penonton sejak 2020. Kami menghadirkan pengalaman membeli tiket yang mudah, aman, dan menyenangkan.",
      heroImageUrl: unsplash("1540039155733-adbc6dc1f07e"),
      primaryColor: "#2563eb",
      secondaryColor: "#1e3a8a",
      email: "hello@jakartaevent.id",
      phone: "+62811000001",
    },
  });

  const bandungConcerts = await db.organizer.upsert({
    where: { subdomain: "bandungconcerts" },
    update: {},
    create: {
      name: "Bandung Concerts",
      slug: "bandung-concerts",
      subdomain: "bandungconcerts",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=BC&backgroundColor=7c3aed&textColor=ffffff",
      description: "Promotor konser dan event musik indie terdepan di Kota Bandung.",
      aboutText: "Bandung Concerts adalah event organizer yang fokus pada musik indie, folk, dan jazz. Berdiri sejak 2018, kami telah menyelenggarakan lebih dari 200 konser dengan artis lokal dan internasional.",
      heroImageUrl: unsplash("1501386761578-ecc7fc0ac63a"),
      primaryColor: "#7c3aed",
      secondaryColor: "#4c1d95",
      email: "info@bandungconcerts.id",
      phone: "+62822000002",
    },
  });

  // ── Site Settings ────────────────────────────────────────────────────────────
  await db.siteSetting.upsert({
    where: { organizerId: jakartaEvent.id },
    update: {},
    create: {
      organizerId: jakartaEvent.id,
      title: "Jakarta Event — Tiket Event Terpercaya",
      description: "Beli tiket event musik, festival, workshop di Jakarta.",
      socialInstagram: "jakartaevent",
      socialTiktok: "jakartaevent",
      socialYoutube: "JakartaEventOfficial",
      socialFacebook: "jakartaevent",
      contactEmail: "hello@jakartaevent.id",
      contactPhone: "+62811000001",
      contactAddress: "Jl. Sudirman No.1, Jakarta Pusat 10220",
    },
  });

  await db.siteSetting.upsert({
    where: { organizerId: bandungConcerts.id },
    update: {},
    create: {
      organizerId: bandungConcerts.id,
      title: "Bandung Concerts — Konser & Live Music",
      description: "Tiket konser dan live music terbaik di Bandung.",
      socialInstagram: "bandungconcerts",
      socialTiktok: "bandungconcerts",
      socialYoutube: "BandungConcerts",
      contactEmail: "info@bandungconcerts.id",
      contactPhone: "+62822000002",
      contactAddress: "Jl. Braga No.10, Bandung 40111",
    },
  });

  // ── Banners ──────────────────────────────────────────────────────────────────
  await db.banner.deleteMany({ where: { organizerId: jakartaEvent.id } });
  await db.banner.createMany({
    data: [
      { organizerId: jakartaEvent.id, title: "Jakarta Music Festival 2026", subtitle: "3 Hari Penuh Musik", imageUrl: unsplash("1540039155733-adbc6dc1f07e"), ctaLabel: "Beli Tiket Sekarang", ctaUrl: "/events/jakarta-music-festival-2026", sortOrder: 0, isActive: true },
      { organizerId: jakartaEvent.id, title: "TechConf Jakarta 2026", subtitle: "Konferensi Teknologi Terbesar", imageUrl: unsplash("1591453089816-c2bc3e88ef89"), ctaLabel: "Daftar Sekarang", ctaUrl: "/events/techconf-jakarta-2026", sortOrder: 1, isActive: true },
      { organizerId: jakartaEvent.id, title: "Jakarta Night Run 2026", subtitle: "Lari Malam Bersama 5000 Peserta", imageUrl: unsplash("1571019614242-c5c5dee9f993"), ctaLabel: "Ikut Lari", ctaUrl: "/events/jakarta-night-run-2026", sortOrder: 2, isActive: true },
    ],
  });

  await db.banner.deleteMany({ where: { organizerId: bandungConcerts.id } });
  await db.banner.createMany({
    data: [
      { organizerId: bandungConcerts.id, title: "Bandung Jazz Night", subtitle: "Malam Penuh Harmoni", imageUrl: unsplash("1501386761578-ecc7fc0ac63a"), ctaLabel: "Pesan Tiket", ctaUrl: "/events/bandung-jazz-night", sortOrder: 0, isActive: true },
    ],
  });

  // ── Promo Codes ──────────────────────────────────────────────────────────────
  await db.promoCode.deleteMany({ where: { organizerId: jakartaEvent.id } });
  await db.promoCode.deleteMany({ where: { organizerId: bandungConcerts.id } });
  await db.promoCode.createMany({
    data: [
      { organizerId: jakartaEvent.id, code: "EARLY20", discountType: "PERCENTAGE", discountValue: 20, maxUses: 100, usedCount: 23, isActive: true, validUntil: future(30) },
      { organizerId: jakartaEvent.id, code: "HEMAT50K", discountType: "FIXED", discountValue: 50000, maxUses: 50, usedCount: 12, isActive: true, validUntil: future(15) },
      { organizerId: bandungConcerts.id, code: "BANDUNG15", discountType: "PERCENTAGE", discountValue: 15, maxUses: 200, usedCount: 5, isActive: true, validUntil: future(60) },
    ],
  });

  // ── EVENTS ────────────────────────────────────────────────────────────────────
  // Wipe all existing events (for clean reseed)
  await db.ticket.deleteMany({});
  await db.orderItem.deleteMany({});
  await db.payment.deleteMany({});
  await db.order.deleteMany({});
  await db.ticketType.deleteMany({});
  await db.event.deleteMany({ where: { organizerId: jakartaEvent.id } });
  await db.event.deleteMany({ where: { organizerId: bandungConcerts.id } });

  // ────────────────────────────────────────────────────────────
  // UPCOMING 1 — Jakarta Music Festival (FEATURED)
  const e1 = await db.event.create({ data: {
    organizerId: jakartaEvent.id, categoryId: catFestival.id,
    title: "Jakarta Music Festival 2026",
    slug: "jakarta-music-festival-2026",
    description: "Jakarta Music Festival 2026 adalah event musik terbesar yang menampilkan 30+ artis dari seluruh Indonesia dan mancanegara.\n\nSelama 3 hari 3 malam, nikmati penampilan spektakuler di atas panggung megah dengan teknologi visual dan sound terbaik. Dari pop, rock, indie, hingga EDM — semua ada di sini!\n\nPengalaman yang tidak akan terlupakan menanti kamu di Jakarta International Expo.",
    coverImage: unsplash("1540039155733-adbc6dc1f07e"),
    gallery: gallery(["1540039155733-adbc6dc1f07e","1493225457124-a31da8b8f8bb","1516450360452-9312f5e86fc7","1514320291840-2e0a9bf2a9ae"]),
    location: "Jakarta", venue: "Jakarta International Expo (JIExpo)", address: "Jl. Benyamin Sueb No.1, Kemayoran, Jakarta Pusat",
    mapsUrl: "https://maps.google.com/?q=JIExpo+Kemayoran",
    startDate: future(14, 18), endDate: future(17, 23),
    status: "PUBLISHED", isFeatured: true,
    highlights: hl("30+ artis nasional & internasional","3 panggung berbeda","VIP area dengan akses backstage","Food & Beverage dari 50+ tenant","Live streaming untuk yang tidak hadir"),
    rundown: rd(
      { time: "15:00", title: "Gates Open", description: "Pintu masuk dibuka untuk semua kategori tiket" },
      { time: "16:00", title: "Opening Act — Band Lokal", description: "Penampilan dari band-band lokal terpilih" },
      { time: "18:00", title: "Main Stage Dimulai", description: "Penampilan artis utama di panggung besar" },
      { time: "21:00", title: "Headliner Night 1", description: "Penampilan utama malam pertama" },
      { time: "23:30", title: "Closing", description: "Penutupan hari pertama" },
    ),
    faq: faq(
      { question: "Apakah ada batas usia?", answer: "Tidak ada batas usia. Anak di bawah 3 tahun gratis masuk tanpa tiket." },
      { question: "Bolehkah membawa kamera?", answer: "Kamera handphone diperbolehkan. Kamera profesional dengan lensa panjang tidak diperbolehkan." },
      { question: "Bagaimana cara redeem tiket?", answer: "Tunjukkan QR code e-ticket di pintu masuk. Petugas akan scan untuk verifikasi." },
      { question: "Apakah ada area khusus anak-anak?", answer: "Ya, tersedia kids zone di area barat venue." },
    ),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e1.id, name: "Reguler Day 1", price: 250000, quantity: 2000, saleStart: daysAgo(30), saleEnd: future(13), maxPurchase: 5, benefits: benefits("Akses panggung reguler","1 free drink"), status: "AVAILABLE" },
    { eventId: e1.id, name: "Reguler 3 Day Pass", price: 600000, quantity: 1000, saleStart: daysAgo(30), saleEnd: future(13), maxPurchase: 4, benefits: benefits("Akses 3 hari penuh","2 free drinks per hari","Exclusive lanyard"), status: "AVAILABLE" },
    { eventId: e1.id, name: "VIP 3 Day Pass", price: 1500000, quantity: 300, saleStart: daysAgo(30), saleEnd: future(13), maxPurchase: 2, benefits: benefits("VIP area dekat stage","Free food & drinks unlimited","Exclusive merchandise bag","Akses backstage area","Priority queue masuk"), status: "AVAILABLE" },
  ]});

  // UPCOMING 2 — TechConf
  const e2 = await db.event.create({ data: {
    organizerId: jakartaEvent.id, categoryId: catTech.id,
    title: "TechConf Jakarta 2026",
    slug: "techconf-jakarta-2026",
    description: "TechConf Jakarta adalah konferensi teknologi terbesar di Indonesia yang menghadirkan 50+ speaker dari perusahaan teknologi terkemuka.\n\nTopik meliputi AI/ML, Cloud Computing, Cybersecurity, Web3, dan banyak lagi. Cocok untuk developer, product manager, startup founder, dan tech enthusiast.",
    coverImage: unsplash("1591453089816-c2bc3e88ef89"),
    gallery: gallery(["1591453089816-c2bc3e88ef89","1540575467063-078a8ca1c68f","1531297484001-80022131f5a1","1522071820081-009f0129c71c"]),
    location: "Jakarta", venue: "Jakarta Convention Center (JCC)", address: "Jl. Gatot Subroto, Senayan, Jakarta Selatan",
    mapsUrl: "https://maps.google.com/?q=Jakarta+Convention+Center",
    startDate: future(21, 8), endDate: future(22, 17),
    status: "PUBLISHED", isFeatured: true,
    highlights: hl("50+ speaker dari Google, Meta, Tokopedia","Workshop hands-on AI & Cloud","Networking dinner eksklusif","Hackathon dengan hadiah 100 juta","Job fair tech companies"),
    rundown: rd(
      { time: "08:00", title: "Registration & Breakfast" },
      { time: "09:00", title: "Opening Keynote — The Future of AI" },
      { time: "10:30", title: "Parallel Sessions (Track A-E)" },
      { time: "12:00", title: "Lunch & Networking" },
      { time: "13:30", title: "Workshop Sessions" },
      { time: "17:00", title: "Closing & After Party" },
    ),
    faq: faq(
      { question: "Apakah ada sertifikat?", answer: "Ya, semua peserta akan mendapatkan e-certificate setelah event selesai." },
      { question: "Apa bahasa yang digunakan?", answer: "Sebagian besar sesi menggunakan Bahasa Indonesia, beberapa sesi internasional menggunakan Bahasa Inggris." },
    ),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e2.id, name: "Early Bird", price: 350000, quantity: 500, saleStart: daysAgo(60), saleEnd: daysAgo(1), maxPurchase: 3, benefits: benefits("Akses 2 hari penuh","Makan siang","E-certificate"), status: "SOLD_OUT" },
    { eventId: e2.id, name: "Regular", price: 500000, quantity: 1500, saleStart: daysAgo(30), saleEnd: future(20), maxPurchase: 3, benefits: benefits("Akses 2 hari penuh","Makan siang","E-certificate","Tote bag"), status: "AVAILABLE" },
    { eventId: e2.id, name: "VIP All-Access", price: 1200000, quantity: 100, saleStart: daysAgo(30), saleEnd: future(20), maxPurchase: 2, benefits: benefits("Semua akses Regular","Workshop eksklusif","Networking dinner","1-on-1 dengan speaker","Premium merchandise kit"), status: "AVAILABLE" },
  ]});

  // UPCOMING 3 — Jazz Night
  const e3 = await db.event.create({ data: {
    organizerId: jakartaEvent.id, categoryId: catMusic.id,
    title: "Jakarta Jazz Night 2026",
    slug: "jakarta-jazz-night-2026",
    description: "Malam jazz yang intim dan elegan di rooftop Jakarta. Nikmati alunan jazz dari musisi-musisi terbaik Indonesia ditemani pemandangan kota Jakarta yang memukau.\n\nDress code: Smart Casual. Tersedia wine dan cocktail bar.",
    coverImage: unsplash("1493225457124-a31da8b8f8bb"),
    gallery: gallery(["1493225457124-a31da8b8f8bb","1516450360452-9312f5e86fc7","1415201329565-8f9f6c990bc4","1514320291840-2e0a9bf2a9ae"]),
    location: "Jakarta", venue: "Rooftop Hotel Mulia, Jakarta", address: "Jl. Asia Afrika Senayan, Jakarta Selatan",
    startDate: future(7, 19), endDate: future(7, 23),
    status: "PUBLISHED", isFeatured: false,
    highlights: hl("5 musisi jazz kelas dunia","Pemandangan kota Jakarta dari ketinggian","Wine & cocktail bar","3-course dinner (VIP)","Limited capacity 300 orang"),
    rundown: rd(
      { time: "19:00", title: "Doors Open & Cocktail Hour" },
      { time: "19:30", title: "Opening Set — Trio Jazz" },
      { time: "20:30", title: "Main Performance" },
      { time: "22:00", title: "Special Guest Appearance" },
      { time: "23:00", title: "Jam Session & Closing" },
    ),
    faq: faq(
      { question: "Apakah ada dress code?", answer: "Ya, dress code Smart Casual. Dilarang menggunakan sandal atau pakaian terlalu kasual." },
      { question: "Apakah anak-anak boleh masuk?", answer: "Acara ini khusus 18+." },
    ),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e3.id, name: "Reguler", price: 450000, quantity: 200, saleStart: daysAgo(14), saleEnd: future(6, 20), maxPurchase: 4, benefits: benefits("Akses venue","1 welcome drink"), status: "AVAILABLE" },
    { eventId: e3.id, name: "VIP Dinner", price: 1200000, quantity: 80, saleStart: daysAgo(14), saleEnd: future(6, 20), maxPurchase: 2, benefits: benefits("Meja reserved","3-course dinner","Unlimited drinks","Foto dengan artis"), status: "AVAILABLE" },
  ]});

  // UPCOMING 4 — Night Run
  const e4 = await db.event.create({ data: {
    organizerId: jakartaEvent.id, categoryId: catSport.id,
    title: "Jakarta Night Run 2026",
    slug: "jakarta-night-run-2026",
    description: "Lari malam bersama 5.000 peserta menyusuri jalanan ikonik Jakarta yang dihiasi lampu neon dan kembang api. Tersedia kategori 5K, 10K, dan 21K.\n\nEvent ini ramah keluarga — ada kategori Fun Run untuk anak-anak!",
    coverImage: unsplash("1571019614242-c5c5dee9f993"),
    gallery: gallery(["1571019614242-c5c5dee9f993","1552674605-db5fecabfe68","1517649763962-0c623066013b","1530143584-b5efbec61f16"]),
    location: "Jakarta", venue: "Monas, Jakarta Pusat", address: "Jl. Medan Merdeka Utara, Jakarta Pusat",
    mapsUrl: "https://maps.google.com/?q=Monas+Jakarta",
    startDate: future(35, 18), endDate: future(35, 22),
    status: "PUBLISHED", isFeatured: false,
    highlights: hl("5K / 10K / 21K categories","Finisher medal & certificate","LED race bib","Post-run concert","Goodie bag senilai 200K"),
    rundown: rd(
      { time: "17:00", title: "Registrasi & Race Pack Pick-up" },
      { time: "18:30", title: "Opening Ceremony" },
      { time: "19:00", title: "Flag Off — Kategori 21K" },
      { time: "19:30", title: "Flag Off — Kategori 10K & 5K" },
      { time: "21:30", title: "Finish & Award Ceremony" },
      { time: "22:00", title: "Post-Run Concert" },
    ),
    faq: faq(
      { question: "Bagaimana jika hujan?", answer: "Event tetap berjalan kecuali ada peringatan cuaca ekstrem dari BMKG." },
      { question: "Bisakah mendaftar on-site?", answer: "Tidak. Pendaftaran hanya bisa dilakukan online sebelum event." },
    ),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e4.id, name: "Fun Run 5K", price: 150000, quantity: 1500, saleStart: daysAgo(30), saleEnd: future(34), maxPurchase: 10, benefits: benefits("Race bib LED","Finisher medal","Goodie bag","Post-run concert"), status: "AVAILABLE" },
    { eventId: e4.id, name: "10K Race", price: 250000, quantity: 2000, saleStart: daysAgo(30), saleEnd: future(34), maxPurchase: 5, benefits: benefits("Race bib LED","Finisher medal & certificate","Goodie bag","Jersey event","Post-run concert"), status: "AVAILABLE" },
    { eventId: e4.id, name: "Half Marathon 21K", price: 400000, quantity: 500, saleStart: daysAgo(30), saleEnd: future(34), maxPurchase: 2, benefits: benefits("Race bib LED","Finisher medal eksklusif","Certificate","Premium goodie bag","Jersey & compression socks","Priority start line"), status: "AVAILABLE" },
  ]});

  // UPCOMING 5 — Wayang Modern
  const e5 = await db.event.create({ data: {
    organizerId: jakartaEvent.id, categoryId: catCulture.id,
    title: "Wayang Modern: Mahakarya Nusantara",
    slug: "wayang-modern-mahakarya-nusantara",
    description: "Pertunjukan wayang dengan sentuhan modern yang memadukan seni tradisional dengan teknologi visual mapping, live orchestra, dan narasi kontemporer.\n\nPertunjukan ini cocok untuk semua usia — dari anak-anak hingga orang tua.",
    coverImage: unsplash("1582555172866-f73bb12a2ab3"),
    gallery: gallery(["1582555172866-f73bb12a2ab3","1513759565286-20e9c5fad06b","1537731121640-bc1f4177c3a7","1518998053901-5348d3961a04"]),
    location: "Jakarta", venue: "Taman Ismail Marzuki (TIM)", address: "Jl. Cikini Raya No.73, Menteng, Jakarta Pusat",
    startDate: future(28, 19), endDate: future(28, 22),
    status: "PUBLISHED", isFeatured: false,
    highlights: hl("360° visual mapping stage","Live orchestra 40 musisi","Narator bilingual (ID/EN)","Post-show meet & greet dengan dalang","Pameran wayang interaktif"),
    rundown: rd(
      { time: "19:00", title: "Pameran Wayang Interaktif" },
      { time: "20:00", title: "Pertunjukan Utama — Sesi 1" },
      { time: "21:00", title: "Intermission & Merchandise" },
      { time: "21:30", title: "Pertunjukan Utama — Sesi 2" },
      { time: "22:30", title: "Meet & Greet dengan Dalang" },
    ),
    faq: faq(
      { question: "Apakah ada subtitle?", answer: "Ya, tersedia subtitle Bahasa Inggris untuk semua dialog." },
      { question: "Berapa durasi pertunjukan?", answer: "Total durasi sekitar 2.5 jam termasuk intermission." },
    ),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e5.id, name: "Tribun", price: 200000, quantity: 500, saleStart: daysAgo(21), saleEnd: future(27, 20), maxPurchase: 6, benefits: benefits("Kursi tribun","Akses pameran"), status: "AVAILABLE" },
    { eventId: e5.id, name: "Balkon Premium", price: 350000, quantity: 200, saleStart: daysAgo(21), saleEnd: future(27, 20), maxPurchase: 4, benefits: benefits("Kursi balkon dengan view terbaik","Akses pameran","Program booklet eksklusif"), status: "AVAILABLE" },
    { eventId: e5.id, name: "VVIP", price: 800000, quantity: 50, saleStart: daysAgo(21), saleEnd: future(27, 20), maxPurchase: 2, benefits: benefits("Kursi VVIP barisan depan","Private lounge","Dinner sebelum pertunjukan","Meet & greet dengan dalang","Souvenir eksklusif"), status: "AVAILABLE" },
  ]});

  // UPCOMING 6 — Digital Marketing Workshop
  const e6 = await db.event.create({ data: {
    organizerId: jakartaEvent.id, categoryId: catWorkshop.id,
    title: "Masterclass Digital Marketing 2026",
    slug: "masterclass-digital-marketing-2026",
    description: "Workshop intensif 1 hari yang akan mengajarkan strategi digital marketing terkini — dari Instagram ads, TikTok content strategy, SEO, hingga email automation.\n\nDibawakan oleh praktisi yang telah mengelola brand-brand besar di Indonesia.",
    coverImage: unsplash("1611532736597-de2d4265fba3"),
    gallery: gallery(["1611532736597-de2d4265fba3","1460925895917-afdab827c52f","1516321318423-f06f85e504b3","1499750310107-5fef28a66643"]),
    location: "Jakarta", venue: "The Ritz-Carlton Jakarta, Pacific Place", address: "Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan",
    startDate: future(10, 9), endDate: future(10, 17),
    status: "PUBLISHED", isFeatured: false,
    highlights: hl("8 jam full training","Template & toolkit senilai 5 juta","Sertifikat digital marketing","Akses komunitas eksklusif 1 tahun","Mentorship session 30 menit"),
    rundown: rd(
      { time: "09:00", title: "Registrasi & Morning Coffee" },
      { time: "09:30", title: "Session 1: Instagram & TikTok Strategy" },
      { time: "11:30", title: "Session 2: Paid Ads Masterclass" },
      { time: "12:30", title: "Lunch Break & Networking" },
      { time: "13:30", title: "Session 3: SEO & Content Marketing" },
      { time: "15:00", title: "Session 4: Email Marketing & Automation" },
      { time: "16:00", title: "Q&A & Sertifikasi" },
    ),
    faq: faq(
      { question: "Apakah perlu laptop?", answer: "Ya, disarankan membawa laptop untuk praktik langsung." },
      { question: "Apakah materi dibagikan?", answer: "Ya, semua slide dan template akan dibagikan via Google Drive setelah workshop." },
    ),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e6.id, name: "Regular Seat", price: 750000, quantity: 80, saleStart: daysAgo(14), saleEnd: future(9, 20), maxPurchase: 3, benefits: benefits("Workshop full day","Makan siang & coffee break","Template toolkit","E-certificate","Akses komunitas 3 bulan"), status: "AVAILABLE" },
    { eventId: e6.id, name: "VIP Seat", price: 1500000, quantity: 20, saleStart: daysAgo(14), saleEnd: future(9, 20), maxPurchase: 2, benefits: benefits("Semua akses Regular","Mentorship 1-on-1 30 menit","Printed certificate","Akses komunitas 12 bulan","Buku digital marketing eksklusif"), status: "AVAILABLE" },
  ]});

  // UPCOMING 7 — Bandung Jazz Night
  const e7 = await db.event.create({ data: {
    organizerId: bandungConcerts.id, categoryId: catMusic.id,
    title: "Bandung Jazz Night",
    slug: "bandung-jazz-night",
    description: "Malam jazz paling romantis di Kota Kembang. Diadakan di venue bersejarah Gedung Merdeka Bandung dengan sentuhan dekorasi vintage yang memukau.\n\nNikmati alunan jazz dari trio jazz Bandung yang telah manggung di berbagai festival internasional.",
    coverImage: unsplash("1501386761578-ecc7fc0ac63a"),
    gallery: gallery(["1501386761578-ecc7fc0ac63a","1415201329565-8f9f6c990bc4","1516450360452-9312f5e86fc7","1493225457124-a31da8b8f8bb"]),
    location: "Bandung", venue: "Gedung Merdeka Bandung", address: "Jl. Asia Afrika No.65, Bandung",
    mapsUrl: "https://maps.google.com/?q=Gedung+Merdeka+Bandung",
    startDate: future(5, 19), endDate: future(5, 23),
    status: "PUBLISHED", isFeatured: true,
    highlights: hl("3 musisi jazz terbaik Bandung","Venue bersejarah Gedung Merdeka","Champagne welcome drink","Live painting performance","Limited 250 seats"),
    rundown: rd(
      { time: "19:00", title: "Welcome Cocktail" },
      { time: "19:30", title: "Opening — Solo Piano" },
      { time: "20:30", title: "Main Jazz Trio Performance" },
      { time: "22:00", title: "Guest Vocalist Special" },
      { time: "23:00", title: "Closing" },
    ),
    faq: faq(
      { question: "Bagaimana menuju venue?", answer: "Gedung Merdeka berada di pusat kota Bandung, dekat Alun-Alun. Tersedia parkir dan ojek online." },
    ),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e7.id, name: "Silver", price: 350000, quantity: 150, saleStart: daysAgo(10), saleEnd: future(4, 20), maxPurchase: 4, benefits: benefits("Akses venue","1 welcome drink"), status: "AVAILABLE" },
    { eventId: e7.id, name: "Gold VIP", price: 750000, quantity: 80, saleStart: daysAgo(10), saleEnd: future(4, 20), maxPurchase: 2, benefits: benefits("Meja reserved","Champagne 1 botol","3-course dinner","Priority seat"), status: "AVAILABLE" },
    { eventId: e7.id, name: "Platinum Table", price: 2500000, quantity: 20, saleStart: daysAgo(10), saleEnd: future(4, 20), maxPurchase: 1, benefits: benefits("Meja untuk 4 orang","Champagne 2 botol","Dinner lengkap","Meet & greet musisi","Foto eksklusif"), status: "AVAILABLE" },
  ]});

  // ── PAST EVENTS (COMPLETED) ──────────────────────────────────────────────────

  // COMPLETED 1 — Konser Lebaran 2025
  const e8 = await db.event.create({ data: {
    organizerId: jakartaEvent.id, categoryId: catMusic.id,
    title: "Konser Lebaran Spesial 2025",
    slug: "konser-lebaran-spesial-2025",
    description: "Konser spesial Lebaran yang mempertemukan artis-artis ternama Indonesia dalam satu panggung spektakuler. Event ini telah sukses diselenggarakan dengan lebih dari 15.000 penonton.",
    coverImage: unsplash("1514320291840-2e0a9bf2a9ae"),
    gallery: gallery(["1514320291840-2e0a9bf2a9ae","1540039155733-adbc6dc1f07e","1493225457124-a31da8b8f8bb","1516450360452-9312f5e86fc7"]),
    location: "Jakarta", venue: "Gelora Bung Karno (GBK)", address: "Pintu X, GBK, Senayan, Jakarta",
    startDate: past(45, 19), endDate: past(45, 23),
    status: "COMPLETED", isFeatured: false,
    highlights: hl("15.000+ penonton hadir","20 artis tampil","Sold out dalam 2 jam","Disiarkan langsung di TV nasional"),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e8.id, name: "Festival", price: 300000, quantity: 10000, saleStart: past(90), saleEnd: past(46), maxPurchase: 5, benefits: benefits("Akses area festival"), status: "SOLD_OUT" },
    { eventId: e8.id, name: "Tribune VIP", price: 750000, quantity: 5000, saleStart: past(90), saleEnd: past(46), maxPurchase: 3, benefits: benefits("Tribun VIP","Welcome drink","Goodie bag"), status: "SOLD_OUT" },
  ]});

  // COMPLETED 2 — Hackathon 2025
  const e9 = await db.event.create({ data: {
    organizerId: jakartaEvent.id, categoryId: catTech.id,
    title: "Jakarta Startup Hackathon 2025",
    slug: "jakarta-startup-hackathon-2025",
    description: "48 jam hackathon intensif yang mengumpulkan lebih dari 500 developer, designer, dan entrepreneur dari seluruh Indonesia. Total hadiah 500 juta rupiah telah diraih para pemenang.",
    coverImage: unsplash("1531297484001-80022131f5a1"),
    gallery: gallery(["1531297484001-80022131f5a1","1591453089816-c2bc3e88ef89","1522071820081-009f0129c71c","1540575467063-078a8ca1c68f"]),
    location: "Jakarta", venue: "Hub.id, Jakarta Selatan", address: "Jl. Gatot Subroto Kav. 14, Jakarta Selatan",
    startDate: past(120, 8), endDate: past(118, 18),
    status: "COMPLETED", isFeatured: false,
    highlights: hl("500+ peserta hadir","Total hadiah 500 juta","25 mentor dari unicorn startup","30 tim masuk final","Demo day disaksikan 50 investor"),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e9.id, name: "Peserta", price: 0, quantity: 500, saleStart: past(150), saleEnd: past(121), maxPurchase: 1, benefits: benefits("Gratis!","Makan 3x sehari","Akses 48 jam hackathon","Goodie bag"), status: "SOLD_OUT" },
  ]});

  // COMPLETED 3 — Bandung Indie Fest
  const e10 = await db.event.create({ data: {
    organizerId: bandungConcerts.id, categoryId: catMusic.id,
    title: "Bandung Indie Fest 2025",
    slug: "bandung-indie-fest-2025",
    description: "Festival indie music terbesar di Bandung yang menampilkan 25 band indie dari Bandung dan Jakarta. Event ini sukses besar dengan 8.000 penonton yang hadir.",
    coverImage: unsplash("1516450360452-9312f5e86fc7"),
    gallery: gallery(["1516450360452-9312f5e86fc7","1501386761578-ecc7fc0ac63a","1415201329565-8f9f6c990bc4","1493225457124-a31da8b8f8bb"]),
    location: "Bandung", venue: "Sabuga Bandung", address: "Jl. Tamansari No.73, Bandung",
    startDate: past(60, 15), endDate: past(60, 23),
    status: "COMPLETED", isFeatured: false,
    highlights: hl("25 band indie","8.000 penonton","2 panggung besar","Food festival 30 tenant","Sold out 3 minggu sebelum event"),
  }});
  await db.ticketType.createMany({ data: [
    { eventId: e10.id, name: "Regular", price: 150000, quantity: 5000, saleStart: past(90), saleEnd: past(61), maxPurchase: 6, benefits: benefits("Akses venue","1 free drink"), status: "SOLD_OUT" },
    { eventId: e10.id, name: "VIP", price: 350000, quantity: 3000, saleStart: past(90), saleEnd: past(61), maxPurchase: 4, benefits: benefits("VIP area","3 free drinks","Goodie bag"), status: "SOLD_OUT" },
  ]});

  // ── DEMO CUSTOMERS & ORDERS ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("demo1234", 10);

  // Demo Customer 1 — Budi (jakartaevent)
  const customer1 = await db.customer.upsert({
    where: { organizerId_email: { organizerId: jakartaEvent.id, email: "budi@demo.com" } },
    update: { password: passwordHash, name: "Budi Santoso", phone: "081234567890", notifEmailOrder: true, notifWaOrder: true, notifWaReminder: true },
    create: {
      organizerId: jakartaEvent.id,
      name: "Budi Santoso",
      email: "budi@demo.com",
      phone: "081234567890",
      password: passwordHash,
      notifEmailOrder: true,
      notifEmailReminder: true,
      notifWaOrder: true,
      notifWaReminder: false,
    },
  });

  // Demo Customer 2 — Sari (jakartaevent)
  const customer2 = await db.customer.upsert({
    where: { organizerId_email: { organizerId: jakartaEvent.id, email: "sari@demo.com" } },
    update: { password: passwordHash },
    create: {
      organizerId: jakartaEvent.id,
      name: "Sari Dewi",
      email: "sari@demo.com",
      phone: "089876543210",
      password: passwordHash,
      notifEmailOrder: true,
      notifEmailReminder: false,
      notifWaOrder: false,
      notifWaReminder: false,
    },
  });

  // Demo Customer 3 — Arif (bandungconcerts)
  const customer3 = await db.customer.upsert({
    where: { organizerId_email: { organizerId: bandungConcerts.id, email: "arif@demo.com" } },
    update: { password: passwordHash },
    create: {
      organizerId: bandungConcerts.id,
      name: "Arif Rahman",
      email: "arif@demo.com",
      phone: "082111222333",
      password: passwordHash,
      notifEmailOrder: true,
      notifEmailReminder: true,
      notifWaOrder: true,
      notifWaReminder: true,
    },
  });

  // ── DEMO ORDERS (PAID) ───────────────────────────────────────────────────────
  // Helper: create a paid order for a customer
  async function makePaidOrder(params: {
    id: string;
    organizerId: string;
    customerId: string;
    event: any;
    tickets: { ticketTypeId: string; name: string; qty: number; price: number }[];
    paidDaysAgo: number;
  }) {
    const total = params.tickets.reduce((a, t) => a + t.qty * t.price, 0);

    const order = await db.order.create({
      data: {
        id: params.id,
        organizerId: params.organizerId,
        customerId: params.customerId,
        eventId: params.event.id,
        totalAmount: total,
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        paymentProvider: "MOCK",
        paymentReference: `MOCK-${params.id}`,
        createdAt: daysAgo(params.paidDaysAgo),
        updatedAt: daysAgo(params.paidDaysAgo),
        orderItems: {
          create: params.tickets.map(t => ({
            ticketTypeId: t.ticketTypeId,
            quantity: t.qty,
            price: t.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "MOCK",
        providerTransactionId: `MOCK-TXN-${params.id}`,
        paymentMethod: "qris",
        amount: total,
        status: "PAID",
        paidAt: daysAgo(params.paidDaysAgo),
        expiredAt: daysAgo(params.paidDaysAgo - 1),
        rawResponse: JSON.stringify({ vaNumber: null, qrString: "MOCK_QR" }),
      },
    });

    // Create tickets
    for (const item of order.orderItems) {
      const ticketData = params.tickets.find(t => t.ticketTypeId === item.ticketTypeId)!;
      for (let i = 1; i <= item.quantity; i++) {
        await db.ticket.create({
          data: {
            orderItemId: item.id,
            ticketTypeId: item.ticketTypeId,
            customerId: params.customerId,
            ticketCode: `TCK-${params.id}-${item.ticketTypeId.slice(-4).toUpperCase()}-${i}`,
            status: params.event.status === "COMPLETED" ? "USED" : "VALID",
          },
        });
      }
    }

    return order;
  }

  // Get ticket type IDs for the events
  const e1Tickets = await db.ticketType.findMany({ where: { eventId: e1.id } });
  const e2Tickets = await db.ticketType.findMany({ where: { eventId: e2.id } });
  const e3Tickets = await db.ticketType.findMany({ where: { eventId: e3.id } });
  const e4Tickets = await db.ticketType.findMany({ where: { eventId: e4.id } });
  const e7Tickets = await db.ticketType.findMany({ where: { eventId: e7.id } });
  const e8Tickets = await db.ticketType.findMany({ where: { eventId: e8.id } });
  const e10Tickets = await db.ticketType.findMany({ where: { eventId: e10.id } });

  // Budi's orders: 2 upcoming + 1 past
  await makePaidOrder({ id: "ORD-2026-BUD01", organizerId: jakartaEvent.id, customerId: customer1.id, event: e1, paidDaysAgo: 5, tickets: [{ ticketTypeId: e1Tickets[1].id, name: e1Tickets[1].name, qty: 2, price: e1Tickets[1].price }] });
  await makePaidOrder({ id: "ORD-2026-BUD02", organizerId: jakartaEvent.id, customerId: customer1.id, event: e3, paidDaysAgo: 3, tickets: [{ ticketTypeId: e3Tickets[0].id, name: e3Tickets[0].name, qty: 2, price: e3Tickets[0].price }] });
  await makePaidOrder({ id: "ORD-2026-BUD03", organizerId: jakartaEvent.id, customerId: customer1.id, event: e8, paidDaysAgo: 47, tickets: [{ ticketTypeId: e8Tickets[0].id, name: e8Tickets[0].name, qty: 3, price: e8Tickets[0].price }] });

  // Sari's orders: 1 upcoming + 1 past
  await makePaidOrder({ id: "ORD-2026-SAR01", organizerId: jakartaEvent.id, customerId: customer2.id, event: e2, paidDaysAgo: 10, tickets: [{ ticketTypeId: e2Tickets[1].id, name: e2Tickets[1].name, qty: 1, price: e2Tickets[1].price }] });
  await makePaidOrder({ id: "ORD-2026-SAR02", organizerId: jakartaEvent.id, customerId: customer2.id, event: e4, paidDaysAgo: 7, tickets: [{ ticketTypeId: e4Tickets[0].id, name: e4Tickets[0].name, qty: 4, price: e4Tickets[0].price }] });

  // Arif's orders (bandungconcerts): 1 upcoming + 1 past
  await makePaidOrder({ id: "ORD-2026-ARI01", organizerId: bandungConcerts.id, customerId: customer3.id, event: e7, paidDaysAgo: 4, tickets: [{ ticketTypeId: e7Tickets[1].id, name: e7Tickets[1].name, qty: 2, price: e7Tickets[1].price }] });
  await makePaidOrder({ id: "ORD-2026-ARI02", organizerId: bandungConcerts.id, customerId: customer3.id, event: e10, paidDaysAgo: 65, tickets: [{ ticketTypeId: e10Tickets[1].id, name: e10Tickets[1].name, qty: 3, price: e10Tickets[1].price }] });

  // ── Articles ─────────────────────────────────────────────────────────────────
  await db.article.deleteMany({ where: { organizerId: jakartaEvent.id } });
  await db.article.createMany({ data: [
    { organizerId: jakartaEvent.id, title: "Tips Membeli Tiket Event Online Agar Tidak Ketipu", slug: "tips-membeli-tiket-event-online", excerpt: "Berikut panduan lengkap agar kamu aman berbelanja tiket online.", content: "Di era digital ini, membeli tiket event secara online semakin mudah. Namun, kamu perlu waspada terhadap penipuan. Berikut tipsnya:\n\n1. **Beli dari platform resmi** — Pastikan kamu membeli dari website resmi penyelenggara.\n2. **Cek review platform** — Baca ulasan pembeli sebelumnya.\n3. **Jangan transfer langsung** — Hindari transfer langsung ke rekening pribadi.\n4. **Simpan bukti pembelian** — Screenshot atau download e-ticket kamu.\n5. **Cek kebijakan refund** — Pahami syarat pengembalian dana jika event dibatalkan.", author: "Tim Jakarta Event", category: "Tips & Panduan", status: "PUBLISHED", publishedAt: daysAgo(10), coverImage: unsplash("1553484771-11ad7afda3ac") },
    { organizerId: jakartaEvent.id, title: "5 Event Jakarta yang Paling Ditunggu di 2026", slug: "5-event-jakarta-paling-ditunggu-2026", excerpt: "Dari festival musik hingga konferensi teknologi, ini 5 event paling hype di Jakarta tahun 2026.", content: "Tahun 2026 akan menjadi tahun yang luar biasa untuk dunia event di Jakarta. Berikut 5 event yang paling ditunggu-tunggu:\n\n1. **Jakarta Music Festival 2026** — Festival musik terbesar dengan 30+ artis.\n2. **TechConf Jakarta 2026** — Konferensi teknologi dengan 50+ speaker.\n3. **Jakarta Night Run** — Lari malam bersama 5.000 peserta.\n4. **Wayang Modern** — Pertunjukan seni tradisional berteknologi tinggi.\n5. **Jakarta Jazz Night** — Malam jazz eksklusif di rooftop.", author: "Redaksi JE", category: "Event Guide", status: "PUBLISHED", publishedAt: daysAgo(5), coverImage: unsplash("1540039155733-adbc6dc1f07e") },
    { organizerId: jakartaEvent.id, title: "Kenapa Harus Beli Tiket Jauh-Jauh Hari?", slug: "kenapa-harus-beli-tiket-jauh-jauh-hari", excerpt: "Alasan logis mengapa tiket early bird selalu lebih baik dari beli last minute.", content: "Selalu ada alasan kenapa tiket early bird ada:\n\n**Harga Lebih Murah** — Early bird biasanya 20-40% lebih murah dari harga normal.\n\n**Pilihan Kursi Lebih Baik** — Kamu bisa memilih posisi terbaik.\n\n**Tenang & Tidak Panik** — Tidak perlu rebutan di hari H.\n\n**Promo Eksklusif** — Sering ada bonus merchandise atau upgrade gratis.\n\nJadi, segera beli tiketmu sekarang!", author: "Tim Marketing JE", category: "Tips & Panduan", status: "PUBLISHED", publishedAt: daysAgo(2), coverImage: unsplash("1553484771-11ad7afda3ac") },
  ]});

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Demo Accounts:");
  console.log("  jakartaevent.localhost:3000");
  console.log("    Email: budi@demo.com   | Password: demo1234  (3 orders)");
  console.log("    Email: sari@demo.com   | Password: demo1234  (2 orders)");
  console.log("  bandungconcerts.localhost:3000");
  console.log("    Email: arif@demo.com   | Password: demo1234  (2 orders)");
  console.log("\n🎫 Events: 7 upcoming + 3 completed");
  console.log("  jakartaevent.localhost:3000  — 8 events");
  console.log("  bandungconcerts.localhost:3000 — 2 events\n");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
