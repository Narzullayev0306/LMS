"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Megaphone, Send, Info, Check, Trash2, UserPlus, FileWarning, Star } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Broadcast states
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
     if (session?.user?.email) {
         fetchInitialData();
     } else if (session === null) {
         setIsLoading(false);
     }
  }, [session]);

  const fetchInitialData = async () => {
      // 1. Get user profile
      const { data: myProfile } = await supabase.from('profiles').select('*').eq('email', session?.user?.email).maybeSingle();
      if (myProfile) setProfile(myProfile);

      // 2. Load Notifications
      await loadNotifications(session?.user?.email);
  };

  const loadNotifications = async (email?: string | null) => {
      if (!email) return;
      const { data } = await supabase.from('notifications')
         .select('*, sender:profiles!notifications_sender_email_fkey(full_name, avatar_url, username)')
         .or(`user_email.eq.${email},type.eq.broadcast`)
         .order('created_at', { ascending: false });

      if (data) {
         setNotifications(data);
         // O'qilmagan bo'lsa darhol o'qilgan qilamiz (chunki sahifaga kirdi)
         const unreadIds = data.filter(n => !n.is_read).map(n => n.id);
         if (unreadIds.length > 0) {
             await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
             setNotifications(prev => prev.map(n => unreadIds.includes(n.id) ? { ...n, is_read: true } : n));
         }
      }
      setIsLoading(false);
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!broadcastTitle.trim() || !broadcastContent.trim() || !profile?.email) return;

      setIsSending(true);
      const { error } = await supabase.from('notifications').insert([{
         type: 'broadcast',
         title: broadcastTitle,
         content: broadcastContent,
         sender_email: profile.email
      }]);

      if (!error) {
          setBroadcastTitle("");
          setBroadcastContent("");
          await loadNotifications(profile.email);
          alert("E'lon barcha talabalarga yuborildi!");
      }
      setIsSending(false);
  };

  const getIconForType = (type: string) => {
      switch(type) {
          case 'friend_request': return <UserPlus className="w-5 h-5 text-indigo-500" />;
          case 'friend_removed': return <FileWarning className="w-5 h-5 text-red-500" />;
          case 'grade': return <Star className="w-5 h-5 text-yellow-500" />;
          case 'broadcast': return <Megaphone className="w-5 h-5 text-orange-500" />;
          default: return <Info className="w-5 h-5 text-blue-500" />;
      }
  };

  if (isLoading) return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const isFaculty = profile?.role === 'teacher' || profile?.role === 'director';

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
       
       {/* Bildirishnomalar Lentalari (Timelines) */}
       <div className="flex-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-white/5 pb-6">
             <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
                <Bell className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xabarnomalar</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tizim va do'stlaringizdan kelgan so'nggi ma'lumotlar</p>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             {notifications.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                   <div className="p-4 bg-gray-50 dark:bg-[#181818] rounded-full inline-block mb-4">
                      <Check className="w-8 h-8 text-green-500" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Hamma xabarlar o'qilgan!</h3>
                   <p className="text-gray-500 dark:text-gray-400 text-sm">Hozircha yangi bildirishnomalar mavjud emas</p>
                </div>
             ) : (
                notifications.map(note => (
                   <div key={note.id} className={`p-4 md:p-5 rounded-2xl flex items-start gap-4 transition-all duration-300 ${!note.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-gray-50 dark:bg-[#181818] hover:shadow-md'}`}>
                       <div className="shrink-0 p-2.5 bg-white dark:bg-black rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                           {getIconForType(note.type)}
                       </div>
                       <div className="flex-1 min-w-0">
                           <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">{note.title}</h4>
                           <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{note.content}</p>
                           
                           {/* Sender infosi */}
                           {note.sender && note.type !== 'broadcast' && (
                              <div className="flex items-center gap-2 mt-2">
                                  <img src={note.sender.avatar_url} className="w-5 h-5 rounded-full" alt="sender"/>
                                  <Link href={`/students/${note.sender.username}`} className="text-xs font-bold text-indigo-500 hover:underline">@{note.sender.username}</Link>
                              </div>
                           )}

                           {note.type === 'broadcast' && note.sender && (
                              <div className="flex items-center gap-2 mt-2">
                                  <div className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs font-bold">UMUMIY E'LON</div>
                                  <span className="text-xs text-gray-500 font-medium">Yuborgan: {note.sender.full_name}</span>
                              </div>
                           )}
                       </div>
                       <div className="shrink-0 text-xs text-gray-400 font-medium mt-1">
                          {new Date(note.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                       </div>
                   </div>
                ))
             )}
          </div>
       </div>

       {/* O'qituvchilar / Direktor Broadcast Paneli */}
       {isFaculty && (
           <div className="w-full lg:w-[400px] shrink-0">
               <div className="bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-[#121212] border border-orange-200 dark:border-orange-500/20 rounded-3xl p-6 shadow-sm sticky top-24">
                  <div className="flex items-center gap-3 mb-6">
                     <Megaphone className="w-5 h-5 text-orange-500" />
                     <h2 className="text-lg font-bold text-gray-900 dark:text-white">Umumiy E'lon (Broadcast)</h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Siz ushbu bo'lim orqali Tizimdagi barcha foydalanuvchilar (talabalar) lentasiga to'g'ridan-to'g'ri umumiy ma'lumotlar yuborishingiz mumkin.</p>
                  
                  <form onSubmit={handleBroadcastSubmit} className="flex flex-col gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E'lon Sarlavhasi</label>
                        <input 
                           type="text" 
                           value={broadcastTitle} 
                           onChange={e => setBroadcastTitle(e.target.value)}
                           className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:border-orange-500 outline-none transition-colors"
                           placeholder="Masalan: Imtihon qoidalari haqida" 
                           required 
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Asosiy Matn</label>
                        <textarea 
                           value={broadcastContent} 
                           onChange={e => setBroadcastContent(e.target.value)}
                           className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white focus:border-orange-500 outline-none transition-colors min-h-[120px] resize-y"
                           placeholder="Talabalarga xabar beriladigan asosiy ma'lumot qismi yozing..." 
                           required 
                        ></textarea>
                     </div>

                     <button disabled={isSending} type="submit" className="w-full mt-2 py-3 bg-orange-500 text-white font-bold text-sm rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50">
                        {isSending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send className="w-4 h-4"/> Yuborish (Barchaga)</>}
                     </button>
                  </form>
               </div>
           </div>
       )}

    </div>
  )
}
