"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, BarChart, BookOpen, Heart, MessageSquare, Send, X, Plus, Smile, UserPlus, Clock, Check, UserCheck, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import EmojiPicker from 'emoji-picker-react';
import { supabase } from "@/lib/supabaseClient";

export default function PublicProfile({ targetUsername }: { targetUsername: string }) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [profileData, setProfileData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  const [stories, setStories] = useState<any[]>([]);
  const [activeStory, setActiveStory] = useState<any>(null);
  const [isStoryPaused, setIsStoryPaused] = useState(false);

  const [relationship, setRelationship] = useState<any>({ status: 'none', id: null, isSender: false });

  useEffect(() => {
    setIsMounted(true);
    fetchData().then(() => setIsLoadingProfile(false));
    fetchCurrentUserRole();
  }, [targetUsername, session]);

  const fetchCurrentUserRole = async () => {
    if (session?.user?.email) {
      const { data } = await supabase.from('profiles').select('role').eq('email', session.user.email).maybeSingle();
      if (data) setCurrentUserRole(data.role);
    }
  };

  const fetchData = async () => {
     const { data: userProfile } = await supabase.from('profiles').select('*').eq('username', targetUsername).maybeSingle();
     if (userProfile) {
        setProfileData(userProfile);
     } else {
        return;
     }

     if (session?.user?.email && userProfile.email) {
          const { data: rels } = await supabase.from('friendships').select('*')
           .or(`and(user_email.eq.${session.user.email},friend_email.eq.${userProfile.email}),and(user_email.eq.${userProfile.email},friend_email.eq.${session.user.email})`)
           .maybeSingle();

          if (rels) {
              setRelationship({
                 status: rels.status,
                 id: rels.id,
                 isSender: rels.user_email === session.user.email
              });
          }
     }

     const authorName = userProfile.full_name;
     const { data: postsData } = await supabase
        .from('posts')
        .select('*, comments (*)')
        .eq('author', authorName)
        .order('created_at', { ascending: false });
        
     if (postsData) {
        const formattedPosts = postsData.map(p => ({
            ...p,
            commentsList: p.comments.sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        }));
        setPosts(formattedPosts);
     }

     const { data: storiesData } = await supabase.from('stories').select('*').eq('author', authorName).order('created_at', { ascending: false });
     if (storiesData && storiesData.length > 0) {
          let viewedStories: string[] = [];
          try {
              const stored = localStorage.getItem('ZARDUZ_LMS_VIEWED_STORIES');
              if (stored) viewedStories = JSON.parse(stored);
          } catch(e) {}
          
          const formattedStories = storiesData.map(s => ({
             ...s,
             isViewed: viewedStories.includes(s.id)
          }));
          setStories(formattedStories);
     } else {
          setStories([]);
     }
  };

  const handleAddFriend = async () => {
    if (!session?.user?.email || !profileData?.email) return;
    const { error } = await supabase.from('friendships').insert([
        { user_email: session.user.email, friend_email: profileData.email, status: 'pending' }
    ]);
    if (!error) fetchData();
  };

  const handleAcceptFriend = async () => {
    if (relationship.id) {
        await supabase.from('friendships').update({ status: 'accepted' }).eq('id', relationship.id);
        fetchData();
    }
  };

  const handleBlock = async () => {
    if (!session?.user?.email || !profileData?.email) return;
    if (relationship.id) {
        await supabase.from('friendships').update({ status: 'blocked', user_email: session.user.email, friend_email: profileData.email }).eq('id', relationship.id);
    } else {
        await supabase.from('friendships').insert([{ user_email: session.user.email, friend_email: profileData.email, status: 'blocked' }]);
    }
    fetchData();
  };

  const handleUnblock = async () => {
    if (relationship.id) {
        await supabase.from('friendships').delete().eq('id', relationship.id);
        fetchData();
    }
  };

  const closeStory = () => {
    setIsStoryPaused(false);
    if (activeStory && activeStory.id !== '0') {
       let viewedStories: string[] = [];
       try {
           const stored = localStorage.getItem('ZARDUZ_LMS_VIEWED_STORIES');
           if (stored) viewedStories = JSON.parse(stored);
       } catch(e) {}

       if (!viewedStories.includes(activeStory.id)) {
           localStorage.setItem('ZARDUZ_LMS_VIEWED_STORIES', JSON.stringify([...viewedStories, activeStory.id]));
       }
       setStories(prev => prev.map(s => s.id === activeStory.id ? { ...s, isViewed: true } : s));
    }
    setActiveStory(null);
  };

  useEffect(() => {
    let timer: any;
    if (activeStory && !isStoryPaused) {
      timer = setTimeout(() => { closeStory() }, 3000);
    }
    return () => clearTimeout(timer);
  }, [activeStory, isStoryPaused]);

  const handleDeleteStory = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (!window.confirm("Ushbu historyni o'chirmoqchimisiz?")) return;
    const { error } = await supabase.from('stories').delete().eq('id', storyId);
    if (!error) {
      setStories(prev => prev.filter(s => s.id !== storyId));
      setActiveStory(null);
    } else {
      alert("Xatolik: " + error.message);
    }
  };

  const toggleLike = async (postId: string, currentLikes: number) => {
     const post = posts.find(p => p.id === postId);
     const newIsLiked = !post?.isLikedLocal; 
     const change = newIsLiked ? 1 : -1;
     setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLikedLocal: newIsLiked, likes: p.likes + change } : p));
     await supabase.from('posts').update({ likes: currentLikes + change }).eq('id', postId);
  };

  const handleCommentSubmit = async (postId: string) => {
    if(!commentText.trim() || !session?.user?.name) return;
    setLoadingComment(true);
    const { data: newComment } = await supabase.from('comments').insert([
       { post_id: postId, author: session.user.name, text: commentText }
    ]).select().single();
    if (newComment) {
       setPosts(prev => prev.map(p => {
         if (p.id === postId) {
            return { ...p, commentsList: [...(p.commentsList || []), newComment] };
         }
         return p;
       }));
    }
    setCommentText("");
    setShowCommentEmoji(false);
    setLoadingComment(false);
  };

  const handleEmojiClick = (emojiData: any) => {
     setCommentText(prev => prev + emojiData.emoji);
  };

  const timeAgo = (dateStr: string) => {
     const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000); 
     if (diff < 1) return "Hozirgina";
     if (diff < 60) return `${diff} daq oldin`;
     if (diff < 1440) return `${Math.floor(diff/60)} soat oldin`;
     return `${Math.floor(diff/1440)} kun oldin`;
  };

  if (!isMounted) return null;

  if (isLoadingProfile) {
    return (
      <div className="w-full flex h-[70vh] items-center justify-center animate-in fade-in">
         <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-500 dark:text-gray-400 font-medium pulse">Profil yuklanmoqda...</p>
         </div>
      </div>
    );
  }

  if (!profileData) return <div className="text-center py-20 font-bold text-gray-500 text-xl">Profil topilmadi.</div>;

  return (
    <div className="w-full flex flex-col gap-6 relative">
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
         <div className="relative h-48 md:h-64 w-full bg-gray-200 dark:bg-zinc-800">
            <img src={profileData.cover_url || "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&q=80&w=2000"} className="w-full h-full object-cover" alt="Cover" />
         </div>

         <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row items-center md:items-start md:justify-between relative">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-16 relative z-10 w-full md:w-auto text-center md:text-left">
               <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#121212] bg-white dark:bg-black overflow-hidden shadow-md">
                  <img src={profileData.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profileData.full_name}`} className="w-full h-full object-cover" alt="Avatar" />
               </div>
               <div className="pb-2">
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3">{profileData.full_name}</h1>
                 <p className="text-gray-500 dark:text-gray-400 font-medium">Fakultet: {profileData.department || "Kiritilmagan"}</p>
               </div>
            </div>
            <div className="mt-4 md:mt-2 hidden md:flex gap-6 pb-2 text-center md:text-right text-gray-900 dark:text-white">
               <div><span className="block font-bold text-xl">{posts.length}</span><span className="text-sm text-gray-400">Postlar</span></div>
               <div><span className="block font-bold text-xl">{profileData.followers || 0}</span><span className="text-sm text-gray-400">Kuzatuvchilar</span></div>
               <div><span className="block font-bold text-xl">{profileData.gpa || 0}</span><span className="text-sm text-gray-400">GPA</span></div>
            </div>
         </div>
         
         <div className="px-6 pb-6 flex gap-3 flex-wrap">
             {relationship.status === 'none' && <button onClick={handleAddFriend} className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition">Do'stlashish</button>}
             {relationship.status === 'pending' && relationship.isSender && <button disabled className="px-6 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 font-bold text-sm rounded-xl">Kutilmoqda</button>}
             {relationship.status === 'pending' && !relationship.isSender && <button onClick={handleAcceptFriend} className="px-6 py-2.5 bg-green-500 text-white font-bold text-sm rounded-xl hover:bg-green-600 transition">Qabul qilish</button>}
             {relationship.status === 'accepted' && <button disabled className="px-6 py-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-bold text-sm rounded-xl border border-blue-200">Sizning do'stingiz</button>}
             {relationship.status !== 'blocked' && <button onClick={handleBlock} className="px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 font-bold text-sm rounded-xl hover:bg-red-500 hover:text-white transition">Bloklash</button>}
             {relationship.status === 'blocked' && relationship.isSender && <button onClick={handleUnblock} className="px-6 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 font-bold text-sm rounded-xl border border-red-200">Blokni ochish</button>}
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full">
         <div className="w-full md:w-[320px] flex flex-col gap-6">
            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><BarChart className="w-5 h-5 text-indigo-500"/> Ko'rsatkichlar</h3>
               <div className="mb-6">
                 <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-gray-500 dark:text-gray-400">GPA (O'rtacha ball)</span>
                    <span className="text-black dark:text-white font-bold">{relationship.status === 'blocked' ? "???" : `${profileData.gpa || 0} / 4.0`}</span>
                 </div>
                 <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${((profileData.gpa || 0) / 4) * 100}%` }}></div>
                 </div>
               </div>
            </div>
         </div>

         <div className="flex-1 max-w-full flex flex-col gap-6">
            {relationship.status === 'blocked' ? (
                  <div className="text-center py-20 bg-white dark:bg-[#121212] rounded-3xl border border-dashed border-gray-200">Profil yopilgan🚫</div>
            ) : (
                <>
                  <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-4 shadow-sm flex gap-4 overflow-x-auto hide-scrollbar items-center">
                    <span className="text-sm font-bold text-gray-700 dark:text-white shrink-0 bg-gray-100 dark:bg-white/5 py-2 px-4 rounded-xl border border-gray-200 dark:border-white/10">Tarixlar:</span>
                    {stories.map(story => (
                       <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={() => setActiveStory(story)}>
                          <div className={`relative w-16 h-16 rounded-full p-[2px] ${story.isViewed ? 'bg-gray-200 dark:bg-zinc-800' : 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500'}`}>
                             <div className="w-full h-full rounded-full border-2 border-white dark:border-[#121212] bg-white overflow-hidden shadow-lg"><img src={story.image_url} className="w-full h-full object-cover" /></div>
                          </div>
                       </div>
                    ))}
                  </div>

                  {posts.map(post => (
                    <div key={post.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                           <img src={post.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${post.author}`} className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" />
                           <div><h4 className="font-bold text-gray-900 dark:text-white text-sm">{post.author}</h4><p className="text-xs text-gray-500">{timeAgo(post.created_at)}</p></div>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        {post.image_url && <div className="w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 mb-4 shadow-sm"><img src={post.image_url} className="w-full h-auto" /></div>}
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                           <button onClick={() => toggleLike(post.id, post.likes)} className="flex items-center gap-2 group transition active:scale-95"><Heart className={`w-5 h-5 ${post.isLikedLocal ? 'fill-red-500 text-red-500' : 'text-gray-500 group-hover:text-red-500'}`} /><span className={`text-sm font-bold ${post.isLikedLocal ? 'text-red-500' : 'text-gray-500'}`}>{post.likes}</span></button>
                           <button onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} className="flex items-center gap-2 group transition active:scale-95"><MessageSquare className={`w-5 h-5 ${activeCommentPostId === post.id ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'}`} /><span className="text-sm font-bold text-gray-500">{post.commentsList?.length || 0}</span></button>
                        </div>
                    </div>
                  ))}
                </>
            )}
         </div>
      </div>

      {activeStory && (
         <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="absolute top-4 w-full max-w-md px-4 flex flex-col gap-3 z-10">
               <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden flex">
                  <div className="h-full bg-white animate-[story-progress_3s_linear_forwards] w-0 shadow-[0_0_10px_white]" style={{ animationPlayState: isStoryPaused ? 'paused' : 'running' }}></div>
               </div>
               <div className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                     <img src={activeStory.image_url} className="w-8 h-8 rounded-full border border-white/20" />
                     <span className="font-bold text-sm">{activeStory.author}</span>
                     <span className="text-xs text-white/50">{timeAgo(activeStory.created_at || new Date().toISOString())}</span>
                  </div>
                  <button onClick={closeStory} className="p-2 hover:bg-white/10 rounded-full transition"><X className="w-6 h-6"/></button>
               </div>
            </div>
            <div 
              className="relative w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center h-[75vh] md:h-[85vh] cursor-pointer"
              onMouseDown={() => setIsStoryPaused(true)}
              onMouseUp={() => setIsStoryPaused(false)}
              onMouseLeave={() => setIsStoryPaused(false)}
              onTouchStart={() => setIsStoryPaused(true)}
              onTouchEnd={() => setIsStoryPaused(false)}
            >
                <img src={activeStory.image_url} className="w-full h-full object-contain pointer-events-none" />
                {currentUserRole === 'director' && (
                  <button onClick={(e) => handleDeleteStory(e, activeStory.id)} className="absolute bottom-10 right-6 p-4 bg-red-600/40 hover:bg-red-600 text-white rounded-full transition active:scale-95 z-30 shadow-xl"><Trash2 className="w-6 h-6" /></button>
                )}
                {isStoryPaused && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm font-black animate-pulse z-20 border border-white/20 tracking-widest uppercase">To'xtatildi</div>
                )}
            </div>
            <style jsx>{`
              @keyframes story-progress { 0% { width: 0%; } 100% { width: 100%; } }
            `}</style>
         </div>
      )}
    </div>
  );
}
