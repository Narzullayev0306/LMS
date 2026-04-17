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
  const [isScrolled, setIsScrolled] = useState(false);
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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <nav className={`w-full z-[100] sticky top-0 transition-all duration-300 ${isScrolled || isOpen ? 'bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-sm' : 'bg-white dark:bg-black md:bg-transparent border-b border-transparent'} ${pathname?.startsWith('/guest') ? 'md:hidden block' : 'block'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'h-16' : 'h-16 md:h-20'}`}>
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-black flex items-center justify-center rounded-xl shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300 transform group-hover:rotate-3">
              <Code className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors">
              {(!session || userRole === 'guest') ? (
                 "Akita"
              ) : (
                 <>LMS<span className="text-indigo-500 font-medium">Akita</span></>
              )}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="flex bg-gray-100/50 dark:bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-gray-200/50 dark:border-white/5 mr-6 shadow-sm">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.name} href={link.href} className={`relative px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${isActive ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                    }`}>
                    <link.icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                    {link.name}
                    {link.badge && link.badge > 0 ? (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">{link.badge}</span>
                    ) : null}
                  </Link>
                )
              })}
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm group mr-4"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
              </button>
            )}

            {session ? (
              <div className="relative pl-4 border-l border-gray-200 dark:border-white/10" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 group hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl px-3 py-1.5 transition-all duration-200"
                >
                  <div className="h-8 w-8 relative rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-sm transition-all group-hover:border-indigo-400">
                    <img
                      src={session.user?.image || "https://api.dicebear.com/7.x/notionists/svg?seed=Guest"}
                      className="object-cover w-full h-full"
                      alt="avatar"
                    />
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-4 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-500" /> Mening profilim
                      </Link>
                      {!isGuest && (
                        <Link
                          href="/notifications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <Bell className="w-4 h-4 text-blue-500" /> Bildirishnomalar
                        </Link>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100 dark:border-white/5">
                      <button
                        onClick={() => { signOut(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                         <LogOut className="w-4 h-4" /> Tizimdan chiqish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Kirish
              </Link>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl active:scale-90 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            )}
            <button
              aria-label="Menyuni ochish"
              className="w-10 h-10 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl active:scale-90 transition-all shadow-md"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil menyu: Premium Overlay */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-t border-gray-200 dark:border-white/10 shadow-2xl absolute w-full left-0 z-[90] ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-6 flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-[0.97] ${
                  isActive 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl ring-4 ring-gray-900/10 dark:ring-white/10' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`} 
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-4">
                  <link.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400 dark:text-indigo-600' : 'text-gray-400'}`} />
                  <span>{link.name}</span>
                </div>
                {link.badge && link.badge > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg">{link.badge}</span>
                )}
              </Link>
            );
          })}

          <div className="h-px bg-gray-100 dark:bg-white/10 w-full my-4"></div>

          {session ? (
            <div className="bg-gray-50 dark:bg-white/5 rounded-[2rem] p-5 border border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <img
                    src={session.user?.image || "https://api.dicebear.com/7.x/notionists/svg?seed=Guest"}
                    className="w-12 h-12 rounded-full border-2 border-white dark:border-zinc-800 shadow-md"
                    alt="avatar"
                  />
                  {isGuest && <Shield className="w-4 h-4 text-amber-500 absolute -bottom-1 -right-1 fill-white dark:fill-black" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black dark:text-white truncate uppercase tracking-tight">{session.user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                >
                  <User className="w-4 h-4" /> Profil
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center gap-2 bg-red-500 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/20"
                >
                  <LogOut className="w-4 h-4" /> Chiqish
                </button>
              </div>
            </div>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="w-full py-5 flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.98] shadow-2xl"
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
