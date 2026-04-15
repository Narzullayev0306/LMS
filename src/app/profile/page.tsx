"use client";

import StudentProfile from "@/components/StudentProfile";
import GuestProfile from "@/components/GuestProfile";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
   const { data: session, status } = useSession();
   const [role, setRole] = useState<string | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const resolveRole = async () => {
       if (!session?.user?.email) { setLoading(false); return; }

       // Google orqali kirgan → har doim mehmon
       const provider = (session as any).provider;
       if (provider === 'google') {
         setRole('guest');
         setLoading(false);
         return;
       }

       // Credentials → Supabase dan parol + rol tekshirish
       const { data } = await supabase
         .from('profiles')
         .select('role, password')
         .eq('email', session.user.email)
         .maybeSingle();

       if (data?.password && data?.role) {
         // Profil mavjud = haqiqiy foydalanuvchi
         setRole(data.role);
       } else {
         // Profil o'chirilgan → MAJBURIY CHIQARISH
         const { signOut } = await import('next-auth/react');
         signOut({ callbackUrl: '/login' });
         return;
       }
       setLoading(false);
     };

     if (status !== 'loading') resolveRole();
   }, [session, status]);

   if (status === "loading" || loading) {
     return (
       <div className="min-h-[60vh] flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-gray-200 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
       </div>
     );
   }

   if (!session) {
      return (
         <div className="text-center mt-20">
             <h1 className="text-2xl font-bold mb-4">Profil yopiq</h1>
             <p className="text-gray-500">Profilni ko'rish uchun avvalo tizimga kiring.</p>
         </div>
      );
   }

   return (
       <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="mb-4 px-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {role === 'guest' ? 'Mehmon Profili' : 'Shaxsiy Profilingiz'}
              </h1>
              <p className="text-gray-500 mt-1">
                {role === 'guest'
                  ? 'Siz mehmon sifatida kirdingiz — faqat umumiy ma\'lumotlar mavjud'
                  : 'Barcha hisobotlar va dars jadvalingiz'}
              </p>
           </div>
           {role === 'guest' ? <GuestProfile /> : <StudentProfile />}
       </div>
   );
}
