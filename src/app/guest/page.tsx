"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Phone, Send, Camera, MessageCircle, PlaySquare, Globe, MapPin, GraduationCap, Map, Rocket, Monitor, Cpu, Database, Mail, ShieldAlert, Sun, Moon, User, LogOut, ChevronDown } from "lucide-react";
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';

export default function GuestLandingPage() {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [currentNewsFilter, setCurrentNewsFilter] = useState("Barchasi");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  // Dropdown tashqarisiga bosganida yopish
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const heroImages = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=2000"
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600"
  ];

  const newsItems = [
    { cat: "E'lonlar", title: "Yangi qabul mavsumi 2025", desc: "Akita universitetiga onlayn hujjat topshirish boshlandi. Shoshiling!", date: "12 Okt, 2025", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=500" },
    { cat: "Yangiliklar", title: "Janubiy Koreya elchisi tashrifi", desc: "Universitetimizga elchi o'zining rasmiy tashrifi bilan keldi...", date: "05 Okt, 2025", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=500" },
    { cat: "E'lonlar", title: "Open Data hackathon", desc: "Dasturlash sohasi talabalari uchun ochiq ma'lumotlar bo'yicha yirik hackathon.", date: "28 Sen, 2025", img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=500" },
    { cat: "Yangiliklar", title: "Sun'iy jellekt ko'rgazmasi", desc: "Talabalarimiz AI sohasidagi o'z ishlanmalarini namoyish etishdi.", date: "20 Sen, 2025", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=500" },
  ];

  const filteredNews = currentNewsFilter === "Barchasi" ? newsItems : newsItems.filter(n => n.cat === currentNewsFilter);

  // Auto-slide Hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full font-sans bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      
      {/* 1. Header & Navigation (Sticky Secondary Nav) */}
      <div className="sticky top-0 z-40 bg-white dark:bg-[#121212] shadow-sm dark:shadow-none transition-all border-b border-gray-100 dark:border-white/10 hidden md:block w-full">
        {/* Top Bar */}
        <div className="bg-[#F3F4F6] dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-white/10 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex justify-between items-center">
             <div className="flex items-center gap-3 text-sm font-bold text-[#004792] dark:text-[#4da6ff] uppercase tracking-widest transition-colors">
                <span>AKITA</span>
                <span className="text-gray-400">&bull;</span>
                <span>TURIN POLYTECHNIC</span>
             </div>
             <div className="flex items-center gap-6">
                 <div className="flex items-center">
                   <div className="flex gap-2 items-center">
                      <Link href="#" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#004792] text-white flex items-center justify-center hover:bg-[#E63946] transition-colors"><Send className="w-3 h-3 sm:w-3.5 sm:h-3.5"/></Link>
                      <Link href="#" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#004792] text-white flex items-center justify-center hover:bg-[#E63946] transition-colors"><Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5"/></Link>
                      <Link href="#" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#004792] text-white flex items-center justify-center hover:bg-[#E63946] transition-colors"><Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5"/></Link>
                      
                      <div className="w-px h-4 sm:h-5 bg-gray-300 dark:bg-gray-700 mx-1 sm:mx-2 block transition-colors"></div>

                      {mounted && (
                         <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
                            {theme === 'dark' ? <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500" /> : <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                         </button>
                      )}

                       {session ? (
                         /* Google bilan kirgan — Avatar + Dropdown */
                         <div className="relative" ref={dropdownRef}>
                           <button
                             onClick={() => setDropdownOpen(!dropdownOpen)}
                             className="flex items-center gap-2 ml-2 px-2 py-1 rounded-xl hover:bg-white/10 transition-colors"
                           >
                             <img
                               src={session.user?.image || "https://api.dicebear.com/7.x/notionists/svg?seed=Guest"}
                               className="w-7 h-7 rounded-full border-2 border-white/30 shadow-sm object-cover"
                               alt="avatar"
                             />
                             <span className="text-xs font-bold text-gray-800 dark:text-gray-200 max-w-[80px] truncate hidden sm:block">{session.user?.name?.split(' ')[0]}</span>
                             <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                           </button>

                           {dropdownOpen && (
                             <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                               <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                                 <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                                 <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                                 <span className="mt-1.5 inline-block text-[11px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-500/20">
                                   🔒 Mehmon maqomi
                                 </span>
                               </div>
                               <div className="p-2">
                                 <Link
                                   href="/profile"
                                   onClick={() => setDropdownOpen(false)}
                                   className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                 >
                                   <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                     <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                   </div>
                                   Mening profilim
                                 </Link>
                               </div>
                               <div className="h-px bg-gray-100 dark:bg-white/5 mx-2" />
                               <div className="p-2">
                                 <button
                                   onClick={() => { signOut(); setDropdownOpen(false); }}
                                   className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                 >
                                   <div className="w-7 h-7 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center justify-center">
                                     <LogOut className="w-3.5 h-3.5 text-red-500" />
                                   </div>
                                   Tizimdan chiqish
                                 </button>
                               </div>
                             </div>
                           )}
                         </div>
                       ) : (
                         /* Kirmagan — Tizimga Kirish tugmasi */
                         <Link href="/login" className="px-3 sm:px-4 py-1 sm:py-1.5 ml-1 sm:ml-2 bg-[#004792] text-white text-[10px] sm:text-xs font-bold rounded-lg hover:bg-[#E63946] transition-colors shadow-sm">
                           Tizimga Kirish
                         </Link>
                       )}
                   </div>
                 </div>
             </div>
          </div>
        </div>
        {/* Bottom Bar Navigation */}
        <div className="bg-white dark:bg-[#121212] transition-colors">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
              <nav className="flex space-x-8 lg:space-x-12 text-sm font-bold tracking-wide text-gray-800 dark:text-gray-300">
                 {["AKITA HAQIDA", "TTJ", "YO'NALISHLAR", "BOG'LANISH", "YANGILIKLAR", "MANZIL"].map((item, idx) => (
                    <a key={idx} href={`#${item.toLowerCase().replace(/[' ]/g,'-')}`} className="hover:text-[#004792] dark:hover:text-[#4da6ff] transition-colors py-2 relative group uppercase">
                       {item}
                       <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#004792] dark:bg-[#4da6ff] transition-all group-hover:w-full"></span>
                    </a>
                 ))}
              </nav>
           </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="w-full h-[60vh] md:h-[75vh] bg-gray-900 overflow-hidden relative group">
         <div className="w-full h-full relative transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentHeroSlide * 100}%)`, display: 'flex' }}>
            {heroImages.map((img, idx) => (
               <div key={idx} className="w-full h-full flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-black/40 z-10" />
                  <img src={img} className="w-full h-full object-cover" alt="Campus Banner" />
               </div>
            ))}
         </div>
         {/* Controls */}
         <button onClick={() => setCurrentHeroSlide(p => p === 0 ? heroImages.length-1 : p-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft className="w-6 h-6"/></button>
         <button onClick={() => setCurrentHeroSlide(p => (p+1) % heroImages.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"><ChevronRight className="w-6 h-6"/></button>
         {/* Dots */}
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {heroImages.map((_, idx) => (
               <button key={idx} onClick={() => setCurrentHeroSlide(idx)} className={`w-3 h-3 rounded-full transition-all ${currentHeroSlide === idx ? 'bg-[#E63946] w-8' : 'bg-white/50 hover:bg-white'}`}></button>
            ))}
         </div>
      </section>

      {/* 3. Welcome Section */}
      <section id="akita-haqida" className="py-20 md:py-32 px-4 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
         <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight text-[#004792] dark:text-[#4da6ff] transition-colors">
            Welcome to <span className="text-[#E63946]">A</span><span className="text-[#004792] dark:text-[#4da6ff]">K</span><span className="text-[#E63946]">IT</span><span className="text-[#004792] dark:text-[#4da6ff]">A</span>, Academy of Korea IT Alliance
         </h1>
         <h2 className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-8 transition-colors">Turin politexnika universitetining Koreya IT fakulteti</h2>
         <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg mx-auto transition-colors">
            Birlashgan ta'lim dasturlarimiz zamonaviy axborot texnologiyalari sohasida jahon standartlariga javob beradigan yetuk mutaxassislarni tayyorlashga qaratilgan. Bizning maqsadimiz – talabalarga Koreya tajribasini va yirik xalqaro kompaniyalar muhitini taqdim etish.
         </p>
      </section>

      {/* 4. Director's Message */}
      <section className="w-full bg-[#F9FAFB] dark:bg-[#18181B] py-24 transition-colors">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-black text-[#004792] dark:text-[#4da6ff] text-center mb-12 uppercase tracking-wide transition-colors">So'z boshi</h2>
            
            <div className="bg-white dark:bg-[#202020] rounded-3xl shadow-xl dark:shadow-none overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center max-w-5xl mx-auto min-h-[400px] transition-colors">
               <div className="w-full md:w-[40%] h-[300px] md:h-full shrink-0 relative bg-gray-200 dark:bg-[#2A2A2A]">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover absolute inset-0" alt="Director OK-RAE, CHONG" />
               </div>
               <div className="w-full md:w-[60%] p-8 md:p-14 flex flex-col justify-center">
                  <div className="text-6xl text-[#E63946] mb-4 opacity-50 font-serif leading-none">"</div>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 italic mb-8 leading-relaxed font-medium transition-colors">
                     "Kelajakni qalam uchi bilan emas, balki IT qatorlari va algoritmlar bilan yozamiz. Bizning fakultet O'zbekistondagi yosh iqtidorlarni kashf etib, ularni Koreya standartlari asosida raqamli innovatsiyalar dunyosiga olib kirishni maqsad qiladi. Akademiyamizga xush kelibsiz!"
                  </p>
                  <div>
                     <h4 className="text-xl font-bold text-gray-900 dark:text-white uppercase transition-colors">OK-RAE, CHONG</h4>
                     <span className="text-[#004792] dark:text-[#4da6ff] font-semibold text-sm transition-colors">Akita Universiteti IT Fakultasining direktori</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 5. Photo Gallery */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((src, i) => (
               <div key={i} className="aspect-square rounded-2xl overflow-hidden group shadow-sm bg-gray-100">
                  <img src={src} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out cursor-pointer" alt={`Gallery ${i}`} />
               </div>
            ))}
         </div>
      </section>

      {/* 6. News & Announcements */}
      <section id="yangiliklar" className="w-full bg-[#F3F4F6] dark:bg-[#1A1A1A] py-24 transition-colors">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white text-center mb-8 uppercase tracking-wide transition-colors">AKITA Yangiliklari</h2>
            
            {/* Filters */}
            <div className="flex justify-center gap-3 mb-12 flex-wrap">
               {["Barchasi", "E'lonlar", "Yangiliklar"].map((f) => (
                  <button 
                     key={f}
                     onClick={() => setCurrentNewsFilter(f)}
                     className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${currentNewsFilter === f ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-[#202020] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]'}`}
                  >
                     {f}
                  </button>
               ))}
            </div>

            {/* Slider container */}
            <div className="w-full overflow-x-auto pb-8 snap-x snap-mandatory flex gap-6 hide-scrollbar px-2">
               {filteredNews.map((news, idx) => (
                  <div key={idx} className="shrink-0 w-[300px] md:w-[350px] bg-white dark:bg-[#202020] rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5 snap-center group transition-colors">
                     <div className="h-48 overflow-hidden relative">
                         <img src={news.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={news.title} />
                         <span className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-black uppercase px-3 py-1.5 rounded-lg text-[#004792] dark:text-[#4da6ff] shadow-sm">{news.cat}</span>
                     </div>
                     <div className="p-6">
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-[#004792] dark:group-hover:text-[#4da6ff] transition-colors">{news.title}</h3>
                         <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 transition-colors">{news.desc}</p>
                         <div className="flex justify-between items-center mt-auto border-t border-gray-100 dark:border-white/5 pt-4 transition-colors">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">{news.date}</span>
                            <button className="w-10 h-10 bg-gray-50 dark:bg-[#2A2A2A] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full flex items-center justify-center transition-colors shadow-sm"><ChevronRight className="w-5 h-5"/></button>
                         </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 7. Features Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-[#004792] dark:text-[#4da6ff] mb-4 uppercase tracking-wide transition-colors">Ta'lim dasturining o'ziga xos xususiyatlari</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg transition-colors">Kelajagingiz uchun munosib qarorlarni bitta joyda qabul qiling.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 relative">
            {/* Fake borders for desktop visually */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/3 w-px bg-gray-200 dark:bg-white/10"></div>
            <div className="hidden md:block absolute top-0 bottom-0 left-2/3 w-px bg-gray-200 dark:bg-white/10"></div>

            <div className="flex flex-col items-center text-center relative z-10 px-4">
               <div className="w-20 h-20 bg-blue-50 dark:bg-[#004792]/20 text-[#004792] dark:text-[#4da6ff] rounded-full flex items-center justify-center mb-6 shadow-inner transition-colors"><GraduationCap className="w-10 h-10 stroke-[1.5]"/></div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Ikki tomonlama diplom, 2+2 dasturi</h3>
               <p className="text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">2 yil O'zbekistonda, 2 yil esa yirik Janubiy Koreya muassasalarida ta'lim olib, ikkita xalqaro diplomga ega bo'lish imkoniyati.</p>
            </div>
            <div className="flex flex-col items-center text-center relative z-10 px-4">
               <div className="w-20 h-20 bg-blue-50 dark:bg-[#004792]/20 text-[#004792] dark:text-[#4da6ff] rounded-full flex items-center justify-center mb-6 shadow-inner transition-colors"><Map className="w-10 h-10 stroke-[1.5]"/></div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Xalqaro darajadagi malaka</h3>
               <p className="text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">Kelajakdagi faoliyatingizni dunyo bo'ylab olib borishingiz uchun ingliz va koreys tillarida yuqori sifatdagi fundamental bilimlar baza orqali taqdim etiladi.</p>
            </div>
            <div className="flex flex-col items-center text-center relative z-10 px-4">
               <div className="w-20 h-20 bg-red-50 dark:bg-[#E63946]/20 text-[#E63946] dark:text-[#fc5c65] rounded-full flex items-center justify-center mb-6 shadow-inner transition-colors"><Rocket className="w-10 h-10 stroke-[1.5]"/></div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Startap ekotizimlari</h3>
               <p className="text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">IT laboratoriyalarda g'oyalaringizni Startap qilib bozorga olib chiqish uchun inkubatsiya jarayonlari o'tiladi.</p>
            </div>
         </div>
      </section>

      {/* 8. Majors / Directions */}
      <section id="yo'nalishlar" className="w-full bg-[#F9FAFB] dark:bg-[#18181A] py-24 transition-colors">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white text-center mb-16 uppercase tracking-wide transition-colors">Yo'nalishlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
               {[
                 { title: "Software Engineering", desc: "Dasturiy injiniring: Web, mobil va tizimli texnologiyalar yaratuvchisi.", icon: Monitor },
                 { title: "Artificial Intelligence", desc: "Sun'iy intellekt arxitekturasi: AI algoritmlar hamda ma'lumotlar bilan ishlash.", icon: Cpu },
                 { title: "Data Science", desc: "Katta ma'lumotlarni tahlil qilish, mashinali o'rganish va Cloud Analytics.", icon: Database },
                 { title: "Cybersecurity", desc: "Zamonaviy raqamli xavflarga qarshi to'siqlar va tarmoq mudofaasi.", icon: ShieldAlert }
               ].map((m, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#202020] p-8 rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                     <div className="w-[70%]">
                        <h3 className="text-xl font-bold text-[#004792] dark:text-[#4da6ff] mb-2 transition-colors">{m.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed transition-colors">{m.desc}</p>
                     </div>
                     <div className="w-16 h-16 shrink-0 bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-500 group-hover:text-[#E63946] dark:group-hover:text-[#fc5c65] group-hover:bg-red-50 dark:group-hover:bg-[#E63946]/10 rounded-full flex items-center justify-center transition-colors">
                        <m.icon className="w-8 h-8 stroke-[1.5]"/>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 9. Facilities Collage */}
      <section id="ttj" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wide transition-colors">Kampus & Hayot</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Bizning infratuzilmamiz bilan yaqindan tanishing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[600px] w-full max-w-6xl mx-auto">
              <div className="bg-gray-200 dark:bg-[#1A1A1A] rounded-3xl overflow-hidden h-full group relative shadow-md">
                 <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Main Hall"/>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                     <h3 className="text-white text-2xl font-bold">Katta Konferens Zali</h3>
                 </div>
              </div>
              <div className="grid grid-rows-2 gap-4 h-full">
                  <div className="grid grid-cols-2 gap-4 h-full">
                     <div className="bg-gray-200 rounded-3xl overflow-hidden group relative shadow-sm">
                        <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=500" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Relaxation Room"/>
                        <div className="absolute bottom-4 left-4"><span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">Dam Olish Xonasi</span></div>
                     </div>
                     <div className="bg-gray-200 rounded-3xl overflow-hidden group relative shadow-sm">
                        <img src="https://images.unsplash.com/photo-1529900898569-8bc3fa90848a?auto=format&fit=crop&q=80&w=500" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Pitch"/>
                        <div className="absolute bottom-4 left-4"><span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">Sport Maydoni</span></div>
                     </div>
                  </div>
                  <div className="bg-gray-200 rounded-3xl overflow-hidden h-full group relative shadow-sm">
                      <img src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Campus View"/>
                      <div className="absolute bottom-6 left-6"><span className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold text-[#004792] shadow-sm">Zamonaviy O'quv Binolari</span></div>
                  </div>
              </div>
          </div>
      </section>

      {/* 10. Location & Contacts */}
      <section id="manzil" className="w-full bg-[#F3F4F6] dark:bg-[#1A1A1A] py-24 transition-colors">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white text-center mb-4 uppercase tracking-wide transition-colors">Manzilimiz</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-center mb-12 flex items-center justify-center gap-2 transition-colors"><MapPin className="w-5 h-5 text-[#E63946] dark:text-[#fc5c65]"/> Toshkent shahar, Olmazor tumani, Kichik halqa yo'li 17.</p>
            
            <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[450px]">
                <div className="w-full lg:w-2/3 h-[300px] lg:h-full bg-gray-300 dark:bg-[#2A2A2A] rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/5 relative transition-colors">
                    <iframe 
                      src="https://yandex.com/map-widget/v1/?um=constructor%3A32f... (Add actual coord keys here if needed)&ll=69.215443%2C41.341857&z=16" 
                      frameBorder="0" 
                      allowFullScreen={true}
                      className="w-full h-full absolute inset-0 mix-blend-multiply dark:mix-blend-normal"
                    ></iframe>
                    {/* Placeholder map if iframe fails visual styling gracefully */}
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-white z-[-1] absolute inset-0">
                       <Map className="w-16 h-16 opacity-30 mb-2"/>
                       <span className="font-bold opacity-50">Yandex Map Widget</span>
                    </div>
                </div>
                
                <div className="w-full lg:w-1/3 grid grid-cols-2 grid-rows-3 gap-3">
                    <a href="#" className="bg-black hover:bg-gray-800 text-white rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors group shadow-sm"><Phone className="w-8 h-8 group-hover:scale-110 transition-transform"/><span className="font-bold text-sm">Aloqa</span></a>
                    <a href="#" className="bg-[#2CA5E0] hover:bg-[#208aba] text-white rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors group shadow-sm"><Send className="w-8 h-8 group-hover:scale-110 transition-transform"/><span className="font-bold text-sm">Telegram</span></a>
                    <a href="#" className="bg-[#004792] hover:bg-[#003366] text-white rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors group shadow-sm"><MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform"/><span className="font-bold text-sm">Facebook</span></a>
                    <a href="#" className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white rounded-3xl flex flex-col items-center justify-center gap-2 transition-all group shadow-sm"><Camera className="w-8 h-8 group-hover:scale-110 transition-transform"/><span className="font-bold text-sm">Instagram</span></a>
                    <a href="#" className="bg-[#FF0000] hover:bg-[#CC0000] text-white rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors group shadow-sm"><PlaySquare className="w-8 h-8 group-hover:scale-110 transition-transform"/><span className="font-bold text-sm">YouTube</span></a>
                    <a href="#" className="bg-gray-800 hover:bg-black text-white rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors group shadow-sm"><Globe className="w-8 h-8 group-hover:scale-110 transition-transform"/><span className="font-bold text-sm">Vebsayt</span></a>
                </div>
            </div>
         </div>
      </section>

      {/* 11. Footer */}
      <footer id="bog'lanish" className="w-full bg-[#004792] py-8 text-center">
         <p className="text-white/80 font-medium text-sm">© 2025 www.akita.uz. Barcha huquqlar himoyalangan.</p>
      </footer>

    </div>
  )
}
