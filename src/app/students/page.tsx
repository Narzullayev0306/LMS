"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Search, UserPlus, Check, Clock, UserCheck, Users, Ban, X, RefreshCw, UserMinus } from "lucide-react";

export default function CampusDirectory() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<any[]>([]);
  const [friendships, setFriendships] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'all' | 'friends' | 'requests' | 'blocked'>('all');

  useEffect(() => {
     if (session?.user?.email) {
         fetchData();
     } else if (session === null) {
         setIsLoading(false);
     }
  }, [session]);

  const fetchData = async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').order('full_name');
      const { data: relations } = await supabase.from('friendships').select('*')
           .or(`user_email.eq.${session?.user?.email},friend_email.eq.${session?.user?.email}`);

      if (profiles) setStudents(profiles.filter((p:any) => p.email !== session?.user?.email));
      if (relations) setFriendships(relations);
      setIsLoading(false);
  };

  const handleAction = async (friendEmail: string, action: 'add' | 'accept' | 'reject' | 'block' | 'unblock' | 'remove') => {
      if (!session?.user?.email) return;
      
      const rel = friendships.find(f => 
          (f.user_email === session?.user?.email && f.friend_email === friendEmail) ||
          (f.friend_email === session?.user?.email && f.user_email === friendEmail)
      );

      if (action === 'add') {
          await supabase.from('friendships').insert([{ user_email: session?.user?.email, friend_email: friendEmail, status: 'pending' }]);
          
          // Xabar
          await supabase.from('notifications').insert([{
             user_email: friendEmail, sender_email: session?.user?.email, type: 'friend_request', title: "Yangi Do'stlik So'rovi",
             content: "siz bilan do'stlashmoqchi. Kampus tarmog'iga o'tib qabul qiling!"
          }]);
      } else if (action === 'accept' && rel) {
          await supabase.from('friendships').update({ status: 'accepted' }).eq('id', rel.id);
          
          await supabase.from('notifications').insert([{
             user_email: friendEmail, sender_email: session?.user?.email, type: 'message', title: "So'rov Qabul qilindi",
             content: "sizning do'stlik so'rovingizni qabul qildi! Endi siz uning tarmog'idasiz."
          }]);
      } else if (action === 'reject' && rel) {
          await supabase.from('friendships').delete().eq('id', rel.id);
      } else if (action === 'remove' && rel) {
          if(!confirm("Kuzatishni to'xtatmoqchimisiz?")) return;
          await supabase.from('friendships').delete().eq('id', rel.id);
          
          if (rel.status === 'accepted') {
             await supabase.from('notifications').insert([{
               user_email: friendEmail, sender_email: session?.user?.email, type: 'friend_removed', title: "Do'stlik uzildi",
               content: "sizni o'zining do'stlar qatoridan chiqarib yubordi."
             }]);
          }
      } else if (action === 'block') {
          if(!confirm("Ushbu foydalanuvchini rostdan ham qora ro'yxatga kiritmoqchimisiz?")) return;
          if (rel) {
               await supabase.from('friendships').update({ status: 'blocked', user_email: session?.user?.email, friend_email: friendEmail }).eq('id', rel.id);
          } else {
               await supabase.from('friendships').insert([{ user_email: session?.user?.email, friend_email: friendEmail, status: 'blocked' }]);
          }
      } else if (action === 'unblock' && rel) {
          await supabase.from('friendships').delete().eq('id', rel.id);
      }
      
      fetchData();
  };

  const getFriendStatus = (friendEmail: string) => {
     const rel = friendships.find(f => 
        (f.user_email === session?.user?.email && f.friend_email === friendEmail) ||
        (f.friend_email === session?.user?.email && f.user_email === friendEmail)
     );
     if (!rel) return { status: 'none', isSender: false };
     return { 
        status: rel.status, 
        isSender: rel.user_email === session?.user?.email 
     };
  };

  const filteredStudents = students.filter(s => {
       const relationship = getFriendStatus(s.email);
       const blockedByThem = relationship.status === 'blocked' && !relationship.isSender;
       
       // Agar ular meni bloklagan bo'lsa hech qayerda korinmaydi
       if (blockedByThem) return false;

       // Izlash
       const matchesSearch = s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                             s.username?.toLowerCase().includes(search.toLowerCase()) || 
                             s.department?.toLowerCase().includes(search.toLowerCase());
       if (!matchesSearch) return false;

       // Tabbing
       if (activeTab === 'all') {
           return relationship.status !== 'blocked'; 
       }
       if (activeTab === 'friends') {
           return relationship.status === 'accepted';
       }
       if (activeTab === 'requests') {
           return relationship.status === 'pending' && !relationship.isSender;
       }
       if (activeTab === 'blocked') {
           return relationship.status === 'blocked' && relationship.isSender;
       }
       return false;
  });

  const getActiveTabTitle = () => {
    if(activeTab === 'all') return "Universitet qidiruvi";
    if(activeTab === 'friends') return "Mening Do'stlarim";
    if(activeTab === 'requests') return "Kelib tushgan so'rovlar";
    return "Qora ro'yxatidagilar";
  };

  if (isLoading) {
      return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Count requests for badge
  const pendingRequestsCount = students.filter(s => {
     const r = getFriendStatus(s.email);
     return r.status === 'pending' && !r.isSender;
  }).length;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
       <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400">
                   <Users className="w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kampus Tarmog'i</h1>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Yangi odamlar va kursdoshlaringizni toping</p>
                </div>
             </div>

             <div className="relative w-full md:w-72">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Ism, @username, Fakultet..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                />
             </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
             <button onClick={() => setActiveTab('all')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'all' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                Barcha Talabalar
             </button>
             <button onClick={() => setActiveTab('friends')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'friends' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                Do'stlar qatorida
             </button>
             <button onClick={() => setActiveTab('requests')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${activeTab === 'requests' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                So'rovlar
                {pendingRequestsCount > 0 && (
                   <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] animate-pulse">{pendingRequestsCount}</span>
                )}
             </button>
             <button onClick={() => setActiveTab('blocked')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'blocked' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                Bloklanganlar
             </button>
          </div>

          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{getActiveTabTitle()}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {filteredStudents.length === 0 && <div className="col-span-full py-12 text-center flex flex-col items-center gap-2"><div className="p-4 bg-gray-50 dark:bg-[#181818] rounded-full inline-block mb-2"><Users className="w-8 h-8 text-gray-400"/></div><p className="font-bold text-gray-600 dark:text-gray-300 text-lg">Bu bo'limda hech kim topilmadi</p><p className="text-gray-400 text-sm">Hali hech kim yo'q yeki filterni o'zgartiring</p></div>}
             
             {filteredStudents.map(student => {
                 const relationship = getFriendStatus(student.email);
                 
                 return (
                 <div key={student.email} className={`flex flex-col border border-gray-100 dark:border-white/5 rounded-2xl transition-all duration-300 overflow-hidden group relative ${relationship.status === 'blocked' ? 'opacity-80 grayscale' : 'hover:shadow-lg bg-gray-50/50 dark:bg-white/5 hover:-translate-y-1'}`}>
                    {/* Blocker Action Overlay (Always visible in top right) */}
                    {relationship.status !== 'blocked' && activeTab !== 'requests' && (
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleAction(student.email, 'block')} className="p-1.5 bg-black/50 hover:bg-red-500 backdrop-blur-md rounded-lg text-white transition-colors" title="Bloklash">
                               <Ban className="w-4 h-4"/>
                            </button>
                        </div>
                    )}

                    <div className="h-20 w-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 relative">
                       {student.cover_url && <img src={student.cover_url} className="w-full h-full object-cover opacity-80" alt="Cover" />}
                    </div>
                    
                    <div className="px-5 pb-5 relative flex flex-col items-center text-center -mt-10 flex-1">
                       <Link href={`/students/${student.username}`} className="block relative w-20 h-20 rounded-full border-4 border-white dark:border-[#121212] bg-white dark:bg-black overflow-hidden shadow-md mb-3 group-hover:scale-105 transition-transform z-10">
                          <img src={student.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${student.full_name}`} className="w-full h-full object-cover" alt="Avatar" />
                       </Link>
                       
                       <Link href={`/students/${student.username}`} className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-lg truncate w-full">
                          {student.full_name}
                       </Link>
                       <p className="text-xs font-bold text-indigo-500 mb-1 truncate w-full">@{student.username}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400 font-medium h-4 line-clamp-1 mb-5">{student.department}</p>
                       
                       <div className="w-full mt-auto">
                          {/* Tab: Barcha Talabalar */}
                          {activeTab === 'all' && relationship.status === 'none' && (
                             <button onClick={() => handleAction(student.email, 'add')} className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-colors flex justify-center items-center gap-2">
                                <UserPlus className="w-4 h-4" /> Do'stlashish
                             </button>
                          )}
                          
                          {activeTab === 'all' && relationship.status === 'pending' && relationship.isSender && (
                             <button onClick={() => handleAction(student.email, 'remove')} className="w-full py-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold text-sm rounded-xl flex justify-center items-center gap-2 hover:bg-red-50 hover:text-red-500 transition-colors group/btn">
                                <span className="group-hover/btn:hidden flex items-center gap-2"><Clock className="w-4 h-4" /> Kutilmoqda</span>
                                <span className="hidden group-hover/btn:flex items-center gap-2"><X className="w-4 h-4" /> Bekor qilish</span>
                             </button>
                          )}

                          {/* O'zini Profilida yuborgan odami */}
                          {activeTab === 'all' && relationship.status === 'accepted' && (
                             <button onClick={() => handleAction(student.email, 'remove')} className="w-full py-2.5 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold text-sm rounded-xl flex justify-center items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors">
                                <UserCheck className="w-4 h-4" /> Do'stlar
                             </button>
                          )}


                          {/* Tab: Do'stlar */}
                          {activeTab === 'friends' && (
                             <button onClick={() => handleAction(student.email, 'remove')} className="w-full py-2.5 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold text-sm rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors flex justify-center items-center gap-2">
                                <UserMinus className="w-4 h-4" /> O'chirish
                             </button>
                          )}

                          {/* Tab: Sorovlar */}
                          {activeTab === 'requests' && relationship.status === 'pending' && !relationship.isSender && (
                             <div className="flex gap-2 w-full">
                                <button onClick={() => handleAction(student.email, 'accept')} className="flex-1 py-2.5 bg-green-500 text-white font-bold text-sm rounded-xl hover:bg-green-600 transition-colors flex justify-center items-center gap-1 shadow-sm shadow-green-500/30">
                                   <Check className="w-4 h-4" /> Ha
                                </button>
                                <button onClick={() => handleAction(student.email, 'reject')} className="flex-1 py-2.5 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-300 dark:hover:bg-white/20 transition-colors flex justify-center items-center gap-1">
                                   <X className="w-4 h-4" /> Yo'q
                                </button>
                             </div>
                          )}

                          {/* Tab: Bloklanganlar */}
                          {activeTab === 'blocked' && (
                             <button onClick={() => handleAction(student.email, 'unblock')} className="w-full py-2.5 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white font-bold text-sm rounded-xl hover:bg-gray-300 dark:hover:bg-white/20 transition-colors flex justify-center items-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Blokdan chiqarish
                             </button>
                          )}
                       </div>
                    </div>
                 </div>
                 )
             })}
          </div>
       </div>
    </div>
  )
}
