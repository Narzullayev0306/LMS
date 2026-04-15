"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AdminPanel from "@/components/AdminPanel";
import TeacherCabinet from "@/components/TeacherCabinet";
import { Play, Bell, Flame, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function StudentDashboard({ session }: { session: any }) {
  // Yangi betakror Student Dashboard aynan Home sahifasi uchun yaratildi
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
       <div className="mb-8 p-1">
           <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
              Xush kelibsiz, {session?.user?.name?.split(' ')[0] || "Talaba"} 👋
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-lg">Bugun yangi marralarni zabt etish uchun ajoyib kun!</p>
       </div>

       {/* Quick Stats Qator */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
             <div className="w-14 h-14 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                 <Flame className="w-6 h-6 text-orange-500" />
             </div>
             <h3 className="text-3xl font-black text-gray-900 dark:text-white">12 Kun</h3>
             <p className="text-sm font-medium text-gray-400 mt-1">Uzluksiz ta'lim seriyasi</p>
          </div>
          
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
             <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                 <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
             </div>
             <h3 className="text-3xl font-black text-gray-900 dark:text-white">1,450</h3>
             <p className="text-sm font-medium text-gray-400 mt-1">Umumiy reyting ballari</p>
          </div>

          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
             <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                 <Clock className="w-6 h-6 text-blue-500 dark:text-blue-400" />
             </div>
             <h3 className="text-3xl font-black text-gray-900 dark:text-white">2 soat</h3>
             <p className="text-sm font-medium text-gray-400 mt-1">Bugungi o'qish vaqti</p>
          </div>
       </div>

       {/* Davom etish bloki */}
       <div className="mb-10">
          <div className="flex justify-between items-end mb-6 p-1">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">O'quv jarayonini davom eting</h2>
             <Link href="/courses" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Barcha darslar &rarr;</Link>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-900/80 dark:to-purple-900/80 rounded-3xl overflow-hidden shadow-xl p-1.5 group cursor-pointer relative border border-black/5 dark:border-white/10">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
             <div className="bg-black/10 dark:bg-black/20 backdrop-blur-sm rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <span className="px-3 py-1 bg-white/20 dark:bg-white/10 text-white text-xs font-bold rounded-full mb-4 inline-block shadow-sm">Modul 3: Backend API</span>
                   <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 shadow-sm">RESTful API arxitekturasi</h3>
                   <p className="text-white/80 font-medium max-w-lg mb-2">Keyingi qadam: Express.js orqali ma'lumotlarni xavfsiz uzatish tamoyillari va JWT sozlamalarini chuqur o'rganamiz.</p>
                </div>
                <div className="shrink-0 flex items-center justify-center w-16 h-16 bg-white dark:bg-[#121212] text-indigo-600 dark:text-indigo-400 rounded-full group-hover:scale-110 shadow-xl transition-transform duration-300">
                   <Play className="w-6 h-6 ml-1" />
                </div>
             </div>
          </div>
       </div>

       {/* E'lonlar */}
       <div className="mb-8">
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 p-1">So'nggi E'lonlar</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[
               { date: 'Bugun, 09:30', title: 'Texnik xizmat ko\'rsatish tanaffusi', text: 'Tizimda 2 soat davomida profilaktika ishlari olib boriladi, uzilishlar uchun uzr so\'raymiz.' },
               { date: 'Kecha, 18:45', title: 'Yangi UX dizayn master-klassi', text: 'Otabek Turobovning Figma bo\'yicha yangi amaliy darsligi platformaga qo\'shildi.' },
             ].map((msg, i) => (
                <div key={i} className="flex gap-4 p-5 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                   <div className="shrink-0 w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/5">
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 drop-shadow-sm" />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900 dark:text-white text-md">{msg.title}</h4>
                     <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-2 leading-relaxed">{msg.text}</p>
                     <span className="text-xs font-bold text-blue-500 dark:text-blue-400">{msg.date}</span>
                   </div>
                </div>
             ))}
         </div>
       </div>
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // SUPABASE RBAC DB orqali rolni aniqlash
  useEffect(() => {
    const fetchRole = async () => {
      if (session?.user?.email) {
        // 1-qatlam: Provider aniq 'google' bo'lsa — HAR DOIM mehmon
        const provider = (session as any).provider;
        if (provider === 'google') {
          setRole('guest');
          setLoadingRole(false);
          return;
        }

        // 2-qatlam: Credentials orqali kirgan — Supabase dan tekshirish
        try {
          const { data } = await supabase
            .from('profiles')
            .select('role, password')
            .eq('email', session.user.email)
            .maybeSingle();

          if (data?.password && data?.role) {
            // Profil mavjud va paroli bor = haqiqiy foydalanuvchi
            setRole(data.role);
          } else {
            // Profil o'chirilgan (Direktor tomonidan) → MAJBURIY CHIQARISH
            // signOut import qilish kerak, shuning uchun dynamic import ishlatamiz
            const { signOut } = await import('next-auth/react');
            signOut({ callbackUrl: '/login' });
            return;
          }
        } catch (err) {
          setRole('guest');
        }
      }
      setLoadingRole(false);
    };

    if (session) {
       fetchRole();
    } else {
       setLoadingRole(false);
    }
  }, [session]);

  if (status === "loading" || (session && loadingRole)) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-gray-200 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin"></div></div>;
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white tracking-tight">Ochiq Ta'lim Tizimi</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">Siz hozirda mehmon rolidasiz. O'zlashtirish kabinetingiz, o'quv materiallari hamda topshiriqlarni yuklash kabi eksklyuziv imkoniyatlar uchun avtorizatsiyadan o'ting.</p>
        <Link href="/login" className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl active:scale-95 hover:bg-gray-800 dark:hover:bg-gray-200 shadow-xl shadow-black/10 dark:shadow-white/10 transition-all duration-200">Google bilan kirish &rarr;</Link>
      </div>
    )
  }

  // DB-dan qaytgan "Role" asosida Dashboardlarni ko'rsatish
  if (role === "guest") {
    // Bazada yo'q - Google orqali kirgan mehmon, Guest sahifasiga yo'naltir
    window.location.href = '/guest';
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-gray-200 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin"></div></div>;
  }

  if (role === "director" || role === "admin") {
    return <AdminPanel />;
  }

  if (role === "teacher") {
    return <TeacherCabinet />;
  }

  // Default
  return <StudentDashboard session={session} />;
}
