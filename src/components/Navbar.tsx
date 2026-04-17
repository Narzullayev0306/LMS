"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, Code, User, BookOpen, LayoutDashboard, Sun, Moon, Users, Bell, Shield, Building, ChevronDown, LogIn } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Google orqali kirgan (mehmon) ni aniqlash
  const isGuest = userRole === 'guest' || (session && (session as any).provider === 'google');
  
  // HAR SAHIFA O'TISHDA o'chirilgan foydalanuvchini tekshirish
  // [session, pathname] → har navigatsiyada qayta ishlaydi
  useEffect(() => {
    const syncProfile = async () => {
       if (!session?.user?.email) return;

       const { supabase } = await import("@/lib/supabaseClient");
       const { data, error } = await supabase
         .from('profiles')
         .select('email, role')
         .eq('email', session.user.email)
         .maybeSingle();
       const provider = (session as any).provider;

       if (!data && !error) {
          if (provider === 'google') {
            // FAQAT Google mehmonlarga yangi guest profil yaratiladi (faqat birinchi marta)
            // Agar ular allaqachon mavjud bo'lsa bu blok ishlamaydi
            const baseUsername = session.user.email.split('@')[0];
            const randomSuffix = Math.floor(Math.random()*1000);
            await supabase.from('profiles').insert({
              email: session.user.email,
              username: `${baseUsername}_${randomSuffix}`,
              full_name: session.user.name || "Foydalanuvchi",
              avatar_url: session.user.image || "",
              role: 'guest'
            }).select().maybeSingle(); // duplicate bolmasligi uchun
            setUserRole('guest');
          } else {
            // Credentials user o'chirilgan → DARHOL CHIQARISH
            signOut({ callbackUrl: '/login' });
          }
       } else if (data) {
          setUserRole(data.role);
       }
    };
    syncProfile();
  }, [session, pathname]); // ← pathname qo'shildi: har navigatsiyada qayta tekshiradi


  // Xavfsizlik bo'limi (RBAC Redirect Guard)
  useEffect(() => {
      // Hali to'liq yuklanmagan bo'lsa yoki Auth tekshirilayotgan bo'lsa kutamiz
      if (session === undefined) return;

      const adminRoutes = ['/director'];
      const studentRoutes = ['/', '/courses', '/students', '/notifications', '/profile'];
      
      if (!session) {
          // Umuman kirmagan mehmonlar
          if (studentRoutes.includes(pathname) || adminRoutes.includes(pathname)) {
              router.replace('/guest');
          }
      } else if (userRole === 'guest') {
          // Akkaunti bor lekin mehmon (guest)
          const guestAvoid = ['/', '/courses', '/students', '/notifications', '/director'];
          if (guestAvoid.includes(pathname)) {
              router.replace('/guest');
          }
      } else if (userRole === 'student' && adminRoutes.includes(pathname)) {
          router.replace('/');
      }
  }, [session, userRole, pathname, router]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
       if (session?.user?.email) {
          const { supabase } = await import("@/lib/supabaseClient");
          const { count } = await supabase.from('notifications')
             .select('*', { count: 'exact', head: true })
             .or(`user_email.eq.${session.user.email},type.eq.broadcast`)
             .eq('is_read', false);
          
          if (count) setUnreadCount(count);
       }
    };
    if (session?.user?.email && userRole !== 'guest') {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }
  }, [session, userRole]);

  useEffect(() => {
    if (pathname === '/notifications') {
        setUnreadCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  let navLinks: any[] = [];

  if (!session || isGuest) {
      navLinks = [
          { name: 'Universitet', href: '/guest', icon: Building },
          { name: 'Profil', href: '/profile', icon: User },
      ];
      if (!session) {
          // Umuman kirmagan — Profilni ko'rsatmaymiz
          navLinks = [{ name: 'Universitet', href: '/guest', icon: Building }];
      }
  } else {
      navLinks = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Darslar', href: '/courses', icon: BookOpen },
        { name: 'Kampus', href: '/students', icon: Users },
        { name: 'Xabarlar', href: '/notifications', icon: Bell, badge: unreadCount },
        { name: 'Profil', href: '/profile', icon: User },
      ];

      if (session?.user?.email === 'narzullayevislom21@gmail.com' || userRole === 'director') {
          navLinks.splice(1, 0, { name: 'Boshqaruv', href: '/director', icon: Shield, badge: 0 });
      }
  }

  return (
    <nav className={`w-full z-[100] sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 transition-colors duration-300 ${pathname?.startsWith('/guest') ? 'md:hidden block' : 'block'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* LOGO: Zamonaviy va Premium */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-black to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-black flex items-center justify-center rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <Code className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-gray-200">
              {(!session || userRole === 'guest') ? (
                 "Akita"
              ) : (
                 <>LMS<span className="text-gray-400 dark:text-gray-500 font-medium">Akita</span></>
              )}
            </span>
          </Link>

          {/* Katta ekranlar uchun menyu: Silliq Animatsiyalar */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="flex bg-gray-100/50 dark:bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-gray-200/50 dark:border-white/5 mr-6 shadow-sm transition-colors">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.name} href={link.href} className={`relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${isActive ? 'bg-white dark:bg-[#1f1f1f] text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}>
                    <link.icon className={`w-4 h-4 ${isActive ? 'text-black dark:text-white' : 'text-gray-400'}`} />
                    {link.name}
                    {link.badge && link.badge > 0 ? (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">{link.badge}</span>
                    ) : null}
                  </Link>
                )
              })}
            </div>

            {/* Tema o'zgartirgich */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-sm group mr-4"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            )}

            {/* User Profil UI */}
            {session ? (
              // Kirgan foydalanuvchi — avatar + dropdown
              <div className="relative pl-4 border-l border-gray-200 dark:border-white/10" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 group hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl px-3 py-2 transition-all duration-200"
                >
                  <div className="h-9 w-9 relative rounded-full overflow-hidden border-2 border-white dark:border-zinc-700 shadow-md ring-2 ring-offset-1 ring-transparent group-hover:ring-indigo-400 transition-all">
                    <img
                      src={session.user?.image || "https://api.dicebear.com/7.x/notionists/svg?seed=Guest"}
                      className="object-cover w-full h-full"
                      alt="avatar"
                    />
                  </div>
                  {isGuest && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-500/20">
                      Mehmon
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menyu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Foydalanuvchi ma'lumoti */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                      {isGuest && (
                        <span className="mt-1.5 inline-block text-[11px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-500/20">
                          🔒 Mehmon maqomi
                        </span>
                      )}
                    </div>

                    {/* Havolalar */}
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Mening profilim
                      </Link>

                      {!isGuest && (
                        <Link
                          href="/notifications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          Bildirishnomalar
                          {unreadCount > 0 && (
                            <span className="ml-auto text-[11px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                          )}
                        </Link>
                      )}
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-white/5 mx-2" />

                    <div className="p-2">
                      <button
                        onClick={() => { signOut(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <div className="w-8 h-8 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-red-500" />
                        </div>
                        Tizimdan chiqish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Umuman kirmagan mehmon — Tizimga Kirish tugmasi
              <Link href="/login" className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                Tizimga Kirish
              </Link>
            )}
          </div>

          {/* Mobil uchun Hamburger tugmasi */}
          <div className="flex md:hidden items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl active:scale-95 transition-transform"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            )}
            <button
              aria-label="Menyuni ochish"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white rounded-xl active:scale-95 transition-transform shadow-sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil menyu: Glass effekti va Animatsiya bilan */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 shadow-2xl absolute w-full left-0 z-[90] ${
          isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-5 flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.98] ${
                  isActive 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`} 
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white/10 dark:bg-black/10' : 'bg-gray-100 dark:bg-white/5'}`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <span>{link.name}</span>
                </div>
                {link.badge && link.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{link.badge}</span>
                )}
              </Link>
            );
          })}

          <div className="h-px bg-gray-100 dark:bg-white/5 w-full my-3"></div>

          {session ? (
            <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-4 mt-1 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img
                    src={session.user?.image || "https://api.dicebear.com/7.x/notionists/svg?seed=Guest"}
                    className="w-12 h-12 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm"
                    alt="avatar"
                  />
                  {isGuest && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#121212]">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold dark:text-white truncate">{session.user?.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  <User className="w-3.5 h-3.5" /> Profil
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center gap-2 bg-red-500 dark:bg-red-500 text-white py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-red-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" /> Chiqish
                </button>
              </div>
            </div>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="w-full py-4 mt-2 flex items-center justify-center gap-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold transition-all active:scale-95 shadow-xl hover:shadow-2xl"
            >
              <LogIn className="w-5 h-5" />
              Tizimga Kirish
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
