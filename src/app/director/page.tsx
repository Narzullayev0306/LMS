"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import {
  Shield, Users, UserPlus, FileWarning, Search, Key, Copy, Trash2,
  LayoutDashboard, MessageSquare, Image as ImageIcon, AlertTriangle, X, Check, Clock
} from "lucide-react";

type Tab = "users" | "posts" | "comments" | "stories";

export default function DirectorDashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("users");

  // User creation states
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [isCreating, setIsCreating] = useState(false);

  // Content management states
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [allStories, setAllStories] = useState<any[]>([]);
  
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [storiesLoading, setStoriesLoading] = useState(false);
  
  const [postSearch, setPostSearch] = useState("");
  const [commentSearch, setCommentSearch] = useState("");
  const [storySearch, setStorySearch] = useState("");

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; title: string; desc: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchInitialData();
    } else if (session === null) {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (activeTab === "posts") fetchAllPosts();
    if (activeTab === "comments") fetchAllComments();
    if (activeTab === "stories") fetchAllStories();
  }, [activeTab]);

  const fetchInitialData = async () => {
    const { data: myProfile } = await supabase.from('profiles').select('*').eq('email', session?.user?.email).maybeSingle();
    setProfile(myProfile);

    if (myProfile?.role === 'director' || myProfile?.email === 'narzullayevislom21@gmail.com') {
      const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (users) setAllUsers(users);
    }
    setIsLoading(false);
  };

  const fetchAllPosts = async () => {
    setPostsLoading(true);
    const { data } = await supabase.from('posts').select('*, comments(count)').order('created_at', { ascending: false });
    if (data) setAllPosts(data);
    setPostsLoading(false);
  };

  const fetchAllComments = async () => {
    setCommentsLoading(true);
    const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (data) setAllComments(data);
    setCommentsLoading(false);
  };

  const fetchAllStories = async () => {
    setStoriesLoading(true);
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (data) setAllStories(data);
    setStoriesLoading(false);
  };

  const confirmAction = (title: string, desc: string, onConfirm: () => void) => {
    setConfirmModal({ show: true, title, desc, onConfirm });
  };

  const handleDeleteUser = async (email: string, name: string) => {
    confirmAction("Foydalanuvchini o'chirish", `"${name}" ba barcha ma'lumotlarini butunlay o'chirib tashlamoqchimisiz?`, async () => {
      setConfirmModal(null);
      await Promise.all([
        supabase.from('notifications').delete().eq('user_email', email),
        supabase.from('notifications').delete().eq('sender_email', email),
        supabase.from('friendships').delete().eq('user_email', email),
        supabase.from('friendships').delete().eq('friend_email', email),
      ]);
      const { error } = await supabase.from('profiles').delete().eq('email', email);
      if (!error) setAllUsers(prev => prev.filter(u => u.email !== email));
      else alert("Xatolik: " + error.message);
    });
  };

  const handleDeletePost = async (postId: string, author: string) => {
    confirmAction("Postni o'chirish", `"${author}"ning ushbu posti va barcha izohlari o'chiriladi. Ishonchingiz komilmi?`, async () => {
      setConfirmModal(null);
      await supabase.from('comments').delete().eq('post_id', postId);
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (!error) setAllPosts(prev => prev.filter(p => p.id !== postId));
    });
  };

  const handleDeleteComment = async (commentId: string, author: string) => {
    confirmAction("Izohni o'chirish", `"${author}"ning ushbu izohini o'chirmoqchimisiz?`, async () => {
      setConfirmModal(null);
      const { error } = await supabase.from('comments').delete().filter('id', 'eq', commentId);
      if (!error) setAllComments(prev => prev.filter(c => c.id !== commentId));
      else alert("Xatolik: " + error.message);
    });
  };

  const handleDeleteStory = async (storyId: string, author: string) => {
    confirmAction("History (Story) o'chirish", `"${author}"ning ushbu historysi o'chiriladi. Ishonchingiz komilmi?`, async () => {
      setConfirmModal(null);
      const { error } = await supabase.from('stories').delete().eq('id', storyId);
      if (!error) setAllStories(prev => prev.filter(s => s.id !== storyId));
      else alert("Xatolik: " + error.message);
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return "Hozirgina";
    if (diff < 60) return `${diff} daq oldin`;
    if (diff < 1440) return `${Math.floor(diff / 60)} soat oldin`;
    return `${Math.floor(diff / 1440)} kun oldin`;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const tabs: { id: Tab; label: string; icon: any; count: number }[] = [
    { id: "users", label: "Foydalanuvchilar", icon: Users, count: allUsers.length },
    { id: "posts", label: "Postlar", icon: ImageIcon, count: allPosts.length },
    { id: "comments", label: "Izohlar", icon: MessageSquare, count: allComments.length },
    { id: "stories", label: "History (Stories)", icon: Clock, count: allStories.length },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4 p-1">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"><Shield className="w-6 h-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Boshqaruv Markazi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tizim tarkibini to'liq nazorat qilish</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ===== USERS TAB ===== */}
      {activeTab === "users" && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full lg:w-1/3 shrink-0">
             {/* User Creation Form code here (same as before) */}
             <div className="bg-indigo-900 dark:bg-zinc-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-800 dark:border-white/10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserPlus className="w-5 h-5"/> Yangi foydalanuvchi</h2>
                <div className="flex flex-col gap-4">
                   <input type="text" placeholder="Ism" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:border-white/40" value={newName} onChange={e => setNewName(e.target.value)} />
                   <input type="email" placeholder="Email" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:border-white/40" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                   <input type="password" placeholder="Parol" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:border-white/40" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                   <select className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 outline-none [&>option]:text-black" value={newRole} onChange={e => setNewRole(e.target.value)}>
                      <option value="student">Talaba</option>
                      <option value="teacher">O'qituvchi</option>
                      <option value="director">Direktor</option>
                   </select>
                   <button onClick={async () => {
                      setIsCreating(true);
                      const { error } = await supabase.from('profiles').insert([{ email: newEmail, password: newPassword, full_name: newName, role: newRole, username: newEmail.split('@')[0]+'_'+Math.floor(Math.random()*100) }]);
                      if (!error) { fetchInitialData(); setNewEmail(""); setNewPassword(""); setNewName(""); alert("Muvaffaqiyatli!"); }
                      else alert("Xato: " + error.message);
                      setIsCreating(false);
                   }} disabled={isCreating} className="bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition shadow-lg active:scale-95 disabled:opacity-50">Yaratish</button>
                </div>
             </div>
          </div>
          <div className="flex-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="border-b border-gray-100 dark:border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-4">Foydalanuvchi</th>
                      <th className="py-4 px-4">Rol</th>
                      <th className="py-4 px-4 text-right">Amal</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                   {allUsers.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase())).map(user => (
                      <tr key={user.email} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                         <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                               <img src={user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.full_name}`} className="w-8 h-8 rounded-full border dark:border-zinc-700" />
                               <div><div className="font-bold text-sm text-gray-900 dark:text-white">{user.full_name}</div><div className="text-xs text-gray-500">{user.email}</div></div>
                            </div>
                         </td>
                         <td className="py-4 px-4"><span className="text-xs font-bold px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-500/20">{user.role}</span></td>
                         <td className="py-4 px-4 text-right"><button onClick={() => handleDeleteUser(user.email, user.full_name)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* ===== POSTS TAB ===== */}
      {activeTab === "posts" && (
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
           {postsLoading ? <div className="py-20 text-center animate-pulse text-gray-400">Yuklanmoqda...</div> : 
             allPosts.map(post => (
               <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#181818] border border-gray-100 dark:border-white/5 rounded-2xl group">
                  <div className="flex items-center gap-4">
                     {post.image_url && <img src={post.image_url} className="w-12 h-12 rounded-lg object-cover" />}
                     <div><div className="font-bold text-sm text-gray-900 dark:text-white">{post.author}</div><p className="text-xs text-gray-500 line-clamp-1">{post.content}</p></div>
                  </div>
                  <button onClick={() => handleDeletePost(post.id, post.author)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4"/></button>
               </div>
             ))
           }
        </div>
      )}

      {/* ===== COMMENTS TAB ===== */}
      {activeTab === "comments" && (
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
           {commentsLoading ? <div className="py-20 text-center animate-pulse text-gray-400">Yuklanmoqda...</div> : 
             allComments.map(comment => (
               <div key={comment.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-[#181818] border border-gray-100 dark:border-white/5 rounded-2xl group">
                  <div className="flex gap-3">
                     <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${comment.author}`} className="w-8 h-8 rounded-full border dark:border-zinc-700" />
                     <div><div className="font-bold text-xs dark:text-white">{comment.author} <span className="font-normal text-gray-500 ml-2">{timeAgo(comment.created_at)}</span></div><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{comment.text}</p></div>
                  </div>
                  <button onClick={() => handleDeleteComment(comment.id, comment.author)} className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
               </div>
             ))
           }
        </div>
      )}

      {/* ===== STORIES TAB ===== */}
      {activeTab === "stories" && (
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
           {storiesLoading ? <div className="py-20 text-center animate-pulse text-gray-400">Yuklanmoqda...</div> : 
             allStories.map(story => (
               <div key={story.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#181818] border border-gray-100 dark:border-white/5 rounded-2xl group">
                  <div className="flex items-center gap-4">
                     <img src={story.image_url} className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-500/20" />
                     <div><div className="font-bold text-sm text-gray-900 dark:text-white">{story.author}</div><div className="text-xs text-gray-500">{timeAgo(story.created_at)}</div></div>
                  </div>
                  <button onClick={() => handleDeleteStory(story.id, story.author)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4"/></button>
               </div>
             ))
           }
           {allStories.length === 0 && !storiesLoading && <div className="text-center py-10 text-gray-400">Historylar mavjud emas.</div>}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal?.show && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl w-full max-w-md animate-in zoom-in-95">
            <div className="flex gap-4 mb-6"><AlertTriangle className="w-10 h-10 text-red-500" /><div><h3 className="font-bold text-lg dark:text-white">{confirmModal.title}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{confirmModal.desc}</p></div></div>
            <div className="flex gap-3 justify-end"><button onClick={() => setConfirmModal(null)} className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">Bekor qilish</button><button onClick={confirmModal.onConfirm} className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg">Ha, o'chirish</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
