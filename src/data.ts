import { MenuItem, GuestReview, OutpostProfile } from './types.ts';

export const OUTPOST_PROFILE: OutpostProfile = {
  name: "OUTPOST Coffee & Beverage",
  tagline: "Slow-roasted, Naturally Flavorful Standard in Coffee Crafting",
  address: "Jl. Harmonika Baru, Titi Rantai, Kec. Medan Baru, Kota Medan, Sumatera Utara 20132",
  phone: "+62 812-3456-7890",
  hours: "Setiap Hari (08:00 - 22:00 WIB)",
  historyTitle: "Kisah Cita Rasa OUTPOST Coffee",
  historyContent: "Didirikan dengan idealisme untuk menghadirkan seduhan kopi murni yang bercita rasa jujur dan dipanggang secara presisi, OUTPOST Coffee menyambut penatnya hari Anda dalam suasana tenang dan estetik. Kami berdedikasi mencari biji kopi single origin nusantara terbaik dan memanggangnya dengan penuh perhatian demi kebahagiaan di setiap tegukan."
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // COFFEE
  {
    id: "m-01",
    name: "Outpost Aren Latte",
    category: "coffee",
    description: "Espresso house blend kami dipadukan dengan susu segar premium dan manis legitnya gula aren organik pilihan.",
    price: 28000,
    tags: ["Signature", "Best Seller", "Manis"],
    isAvailable: true,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600",
    isHotAvailable: true,
    isIcedAvailable: true,
    isBest: true
  },
  // NON COFFEE
  {
    id: "m-05",
    name: "Uji Matcha Latte",
    category: "non-coffee",
    description: "Bubuk matcha premium asli Jepang diseduh dengan susu segar hangat atau es dingin sembari menjaga aroma kelat alaminya.",
    price: 34000,
    tags: ["Creamy", "Popular"],
    isAvailable: true,
    rating: 4.85,
    imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600",
    isHotAvailable: true,
    isIcedAvailable: true,
    isBest: true
  },
  // FOOD
  {
    id: "m-10",
    name: "Outpost Butter Croissant",
    category: "food",
    description: "Croissant mentega klasik Prancis dengan lapisan renyah (flaky) keemasan yang disajikan hangat dengan selai stroberi.",
    price: 24000,
    tags: ["Flaky", "Bakery"],
    isAvailable: true,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600",
    isHotAvailable: false,
    isIcedAvailable: false,
    isBest: true
  }
];

export const INITIAL_REVIEWS: GuestReview[] = [
  {
    id: "r-01",
    name: "Rian Permana",
    rating: 5,
    comment: "Kopi Gula Aren di sini bener-bener mantap! Espresso-nya kerasa kuat tapi gak bikin lambung perih, manisnya arennya pas gak lebay. Tempatnya juga teduh banget berasa nugas di halaman rumah sendiri.",
    date: "10 Juni 2026",
    reply: "Terima kasih banyak Mas Rian! Senang sekali Aren Latte kami cocok di lidah, ditunggu kunjungan nugas berikutnya ya!"
  },
  {
    id: "r-02",
    name: "Clara Amalia",
    rating: 5,
    comment: "Paling suka sama Burnt Cheesecake-nya! Lembut parah, bagian atasnya dapet caramelize yang enak bgt. Matchanya juga kerasa premium, asli bukan matcha sirup instan biasa. Sukses terus Outpost!",
    date: "08 Juni 2026"
  },
  {
    id: "r-03",
    name: "Budi Santoso",
    rating: 4,
    comment: "Cozy bgt buat kumpul keluarga sore hari. Cobain Truffle Fries porsinya lumayan banyak, wangi beut. Baristanya juga ramah ngejelasin menu manual brew secara detail.",
    date: "05 Juni 2026",
    reply: "Halo Pak Budi, terima kasih atas ulasannya! Kami selalu berkomitmen memberikan pelayanan terbaik demi kenyamanan bersantai keluarga."
  }
];
