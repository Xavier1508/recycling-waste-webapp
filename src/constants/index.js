import {
  activecampaign,
  afterpay,
  airwallex,
  amplitude,
  asana,
  fb,
  insta,
  twitter,
  reviewStars,
  reviewStars2,
  reviewPerson,
  reviewPerson2,
  liquidWasteCollectionImg,
  solidWasteCollectionImg,
  recyclingServicesImg,
  teamMember,
  teamBg,
  efficientCollectionImg,
  inovativeSortingImg,
  disposableMethodsImg,
  reviewPerson4,
  reviewPerson5,
  reviewPerson3,
  teamMember2,
  teamMember3,
  teamMember4,
  teamMember5,
} from "../assets";

export const navLinks = [
  {
    id: "/",
    title: "Home",
  },
  {
    id: "/services",
    title: "Services",
  },
  {
    id: "/aboutus",
    title: "About Us",
  },
  {
    id: "/redeem",
    title: "Redeem",
  },
  {
    id: "/contactus",
    title: "Contact Us",
  },
];

export const clients = [
  {
    id: "client-1",
    logo: activecampaign,
  },
  {
    id: "client-2",
    logo: afterpay,
  },
  {
    id: "client-3",
    logo: airwallex,
  },
  {
    id: "client-4",
    logo: amplitude,
  },
  {
    id: "client-5",
    logo: asana,
  },
];

export const socialMedia = [
  {
    id: "social-media-1",
    icon: fb,
    link: "https://www.instagram.com/",
  },
  {
    id: "social-media-2",
    icon: twitter,
    link: "https://www.twitter.com/",
  },
  {
    id: "social-media-3",
    icon: insta,
    link: "https://www.facebook.com/",
  },
];

export const teamMembers = [
  {
    id: "member-1",
    img: teamMember,
    name: "Xavier",
    title: "CEO & Founder",
    background: teamBg,
  },
  {
    id: "member-2",
    img: teamMember2,
    name: "Thio",
    title: "CTO & Co-Founder",
    background: teamBg,
  },
  {
    id: "member-3",
    img: teamMember3,
    name: "Christoper Panic Deadline",
    title: "COO & Co-Founder",
    background: teamBg,
  },
  {
    id: "member-4",
    img: teamMember4,
    name: "Putra Wakekok",
    title: "Holiday Manager",
    background: teamBg,
  },
  {
    id: "member-5",
    img: teamMember5,
    name: "Nicho",
    title: "Our New Pope, Habemus Papam!",
    background: teamBg,
  },
];

export const testimonials = [
  {
    id: "testimonials-1",
    content:
      "“Layanan pengelolaan limbah yang sangat profesional dan tepat waktu. Sangat membantu kami menjaga lingkungan kantor tetap bersih.”",
    name: "We Tok De Tok",
    img: reviewPerson,
    rating: reviewStars2,
  },
  {
    id: "testimonials-2",
    content:
      "“Proses pengumpulan limbah yang efisien dan ramah lingkungan. Timnya sangat responsif dan mudah diajak bekerja sama.”",
    name: "Hockowi",
    img: reviewPerson2,
    rating: reviewStars,
  },
  {
    id: "testimonials-3",
    content:
      "“Saya sangat puas dengan layanan daur ulang yang mereka tawarkan. Membantu kami mengurangi sampah dan meningkatkan kesadaran lingkungan.”",
    name: "Xian Jink",
    img: reviewPerson3,
    rating: reviewStars2,
  },
  {
    id: "testimonials-4",
    content:
      "“Mereka selalu datang tepat waktu dan memberikan solusi pengelolaan limbah yang sangat praktis untuk kebutuhan rumah tangga kami.”",
    name: "Nona Ambon",
    img: reviewPerson4,
    rating: reviewStars2,
  },
  {
    id: "testimonials-5",
    content:
      "“Layanan pengangkutan limbah cair yang aman dan sesuai standar. Saya merasa sangat terbantu dengan profesionalisme tim ini.”",
    name: "Stecu Stecu Stelan Cuek Baru Malu",
    img: reviewPerson5,
    rating: reviewStars,
  },
  {
    id: "testimonials-6",
    content:
      "“Fleksibilitas dan kemudahan dalam penjadwalan online membuat pengalaman menggunakan layanan mereka sangat menyenangkan.”",
    name: "Prabroro",
    img: reviewPerson,
    rating: reviewStars2,
  },
];

export const workingHours = [
  {
    id: "hour-1",
    day: "Senin",
    timing: "9:00 AM To 6:00 PM",
  },
  {
    id: "hour-2",
    day: "Selasa",
    timing: "9:00 AM To 6:00 PM",
  },
  {
    id: "hour-3",
    day: "Rabu",
    timing: "9:00 AM To 6:00 PM",
  },
  {
    id: "hour-4",
    day: "Kamis",
    timing: "9:00 AM To 6:00 PM",
  },
  {
    id: "hour-5",
    day: "Jumat",
    timing: "9:00 AM To 6:00 PM",
  },
];

export const servicesCards = [
  {
    id: "card-1",
    title: "Recycling Services",
    content:
      "“Layanan daur ulang limbah rumah tangga dan industri untuk mendukung pelestarian lingkungan dan ekonomi sirkular.”",
    img: recyclingServicesImg,
  },
  {
    id: "card-2",
    title: "Solid Waste Collection",
    content:
      "“Pengangkutan limbah padat secara terjadwal dan aman dari berbagai jenis lokasi, mulai dari rumah hingga fasilitas umum.”",
    img: solidWasteCollectionImg,
  },
  {
    id: "card-3",
    title: "Liquid Waste Collection",
    content:
      "“Penanganan limbah cair yang aman dan sesuai standar, menjaga kebersihan lingkungan dan kesehatan masyarakat.”",
    img: liquidWasteCollectionImg,
  },
];

export const processesCards = [
  {
    id: "card-1",
    title: "Efficient Collection",
    content:
      "“Kami menyediakan layanan pengumpulan sampah yang cepat, tepat waktu, dan disesuaikan dengan kebutuhan lingkungan sekitar.”",
    img: efficientCollectionImg,
  },
  {
    id: "card-2",
    title: "Innovative Sorting Techniques",
    content:
      "“Menggunakan teknologi dan metode terbaru untuk memilah limbah secara efisien demi mendukung proses daur ulang yang optimal.”",
    img: inovativeSortingImg,
  },
  {
    id: "card-3",
    title: "Eco-Friendly Disposal Methods",
    content:
      "“Pembuangan limbah yang bertanggung jawab dan ramah lingkungan, demi masa depan yang berkelanjutan.”",
    img: disposableMethodsImg,
  },
];

export const stats = [
  {
    id: "stats-1",
    title: "Completed Projects",
    value: "210",
  },
  {
    id: "stats-2",
    title: "Clients Helped",
    value: "790K",
  },
];

export const footerLinks = [
  {
    title: "Company",
    links: [
      {
        name: "Home",
        link: "/",
      },
      {
        name: "Services",
        link: "/services",
      },
      {
        name: "About Us",
        link: "/aboutus",
      },
      // {
      //   name: "Redeem",  // Add new redeem link
      //   link: "/redeem",
      // },
      // {
      //   name: "Contact Us",
      //   link: "/contactus",
      // },
      // {
      //   id: "/userprofile",
      //   title: "Profile",
      // },
    ],
  },
  {
    title: "Services",
    links: [
      {
        name: "Recycling Services",
        link: "/services",
      },
      {
        name: "Solid Waste Collection",
        link: "/services",
      },
      {
        name: "Liquid Waste Collection",
        link: "/services",
      },
      {
        name: "Collection Services",
        link: "/services",
      },
    ],
  },
];

export const faqs = [
  {
    id: 1,
    question: "Gimana Cara Order Layanan Jemput Sampah?",
    answer:
      "Gampang banget! Kamu tinggal pesan lewat aplikasi atau WhatsApp kami. Pilih waktu penjemputan, isi alamatmu, dan tim kami akan langsung jemput sampahmu sesuai jadwal. Gak perlu repot!",
  },
  {
    id: 2,
    question: "Apakah Harus Pisahin Sampah Dulu?",
    answer:
      "Kalau bisa, iya dong! Kamu bisa pisahin sampah organik, anorganik, dan daur ulang. Tapi kalau belum sempat, tenang aja—tim kami akan bantu sortir ulang dengan standar ramah lingkungan.",
  },
  {
    id: 3,
    question: "Area Mana Aja yang Bisa Dijemput?",
    answer:
      "Saat ini kami melayani beberapa area di kota kamu. Cek daftar area di aplikasi atau website kami. Belum ada di daerahmu? Tungguin ya, kami terus berkembang!",
  },
  {
    id: 4,
    question: "Apakah Ada Biayanya?",
    answer:
      "Ada, tapi tenang, terjangkau kok! Biaya tergantung frekuensi penjemputan dan volume sampah. Semua info harga transparan bisa kamu lihat sebelum checkout.",
  },
  {
    id: 5,
    question: "Dapat Apa Aja Selain Layanan Jemput?",
    answer:
      "Selain rumah bersih, kamu juga bisa dapetin poin reward tiap kali jemput sampah. Poin bisa ditukar hadiah menarik, diskon, bahkan voucher belanja! Asik kan?",
  },
];
