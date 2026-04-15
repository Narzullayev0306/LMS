"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, CheckCircle2, ChevronRight, BarChart, BookOpen, Camera, Edit2, Heart, MessageSquare, Image as ImageIcon, Send, MoreHorizontal, X, Plus, Smile, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { supabase } from "@/lib/supabaseClient";

export default function StudentProfile() {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  // Customization States
  const [coverImage, setCoverImage] = useState<string>("https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&q=80&w=2000");
  const [avatarImage, setAvatarImage] = useState<string>("https://api.dicebear.com/7.x/notionists/svg?seed=Felix");
  const [nickname, setNickname] = useState<string>("Talaba");
  const [username, setUsername] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  
  // Real DB Profile Data
  const [profileData, setProfileData] = useState<{ gpa: number, department: string, followers: number, role?: string, username?: string }>({
      gpa: 0,
      department: "Software Engineering • 2-kurs",
      followers: 0,
      role: "",
      username: ""
  });

  const [posts, setPosts] = useState<any[]>([]);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImagePreview, setNewPostImagePreview] = useState<string | null>(null);
  const [newPostFile, setNewPostFile] = useState<File | null>(null);
  const [showPostEmoji, setShowPostEmoji] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  const [stories, setStories] = useState<any[]>([]);
  const [activeStory, setActiveStory] = useState<any>(null);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [isStoryPaused, setIsStoryPaused] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (session?.user?.email) {
      fetchData().then(() => setIsLoadingProfile(false));
    } else if (session === null) {
      setIsLoadingProfile(false);
    }
  }, [session]);

  const fetchData = async () => {
     const { data: myProfile } = await supabase.from('profiles').select('*').eq('email', session?.user?.email).maybeSingle();
     
     if (myProfile) {
        if (myProfile.cover_url) setCoverImage(myProfile.cover_url);
        if (myProfile.avatar_url) setAvatarImage(myProfile.avatar_url);
        if (myProfile.full_name) setNickname(myProfile.full_name);
        if (myProfile.username) setUsername(myProfile.username);
        
        setProfileData({
            gpa: myProfile.gpa || 3.8,
            department: myProfile.department || (myProfile.role === 'teacher' ? 'O\'qituvchi' : "Software Engineering • 2-kurs"),
            followers: myProfile.followers || 150,
            role: myProfile.role
         });
     } else {
        if (session?.user?.image) setAvatarImage(session.user.image);
        if (session?.user?.name) setNickname(session.user.name);
     }

     const { data: postsData } = await supabase
        .from('posts')
        .select('*, comments (*)')
        .order('created_at', { ascending: false });
        
     if (postsData) {
        const formattedPosts = postsData.map(p => ({
            ...p,
            commentsList: p.comments.sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        }));
        setPosts(formattedPosts);
     }

     const { data: storiesData } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
     const baseStory = { id: '0', author: "Siz", image_url: myProfile?.avatar_url || avatarImage, isViewed: true, isAdd: true };
     
     if (storiesData) {
         // LocalStorage orqali View statusini tiklash (Foydalanuvchi qirqimida)
         let viewedStories: string[] = [];
         try {
             const stored = localStorage.getItem(`ZARDUZ_LMS_VIEWED_STORIES_${session?.user?.email}`);
             if (stored) viewedStories = JSON.parse(stored);
         } catch(e) {}
         
         const formattedStories = storiesData.map(s => ({
            ...s,
            isViewed: viewedStories.includes(s.id)
         }));
         setStories([baseStory, ...formattedStories]);
     } else {
         setStories([baseStory]);
     }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file || !session?.user?.email) return;

     if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        alert("Xatolik: Supabase URL topilmadi. Netlify sozlamalarini tekshiring.");
        return;
     }

     setCoverImage(URL.createObjectURL(file));

     const ext = file.name.split('.').pop();
     const fileName = `cover_${Date.now()}.${ext}`;
     const { data, error } = await supabase.storage.from('lms-media').upload(`profiles/${fileName}`, file);
     
     if (data) {
        const { data: { publicUrl } } = supabase.storage.from('lms-media').getPublicUrl(`profiles/${fileName}`);
        const { error: dbErr } = await supabase.from('profiles').update({ cover_url: publicUrl }).eq('email', session.user.email);
        
        if (dbErr) {
            alert(`DB Ga Rasm yozilmadi: ${dbErr.message}`);
        }
     } else {
        alert("Cover rasm xotiraga yuklanmadi. Muammo: " + (error?.message === "Load failed" ? "Netlify sozlamalarida Environment Variables (Supabase URL/Key) yo'q yoki CORS taqiqlangan." : error?.message));
     }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file || !session?.user?.email) return;

     if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        alert("Xatolik: Supabase URL topilmadi. Netlify sozlamalarini tekshiring.");
        return;
     }

     setAvatarImage(URL.createObjectURL(file));

     const ext = file.name.split('.').pop();
     const fileName = `avatar_${Date.now()}.${ext}`;
     const { data, error } = await supabase.storage.from('lms-media').upload(`profiles/${fileName}`, file);
     
     if (data) {
        const { data: { publicUrl } } = supabase.storage.from('lms-media').getPublicUrl(`profiles/${fileName}`);
        const { error: dbErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('email', session.user.email);
        if (dbErr) {
            alert(`DB Ga Rasm yozilmadi: ${dbErr.message}`);
        }
     } else {
        alert("Avatar rasm xotiraga yuklanmadi. Muammo: " + (error?.message === "Load failed" ? "Netlify sozlamalarida Environment Variables (Supabase URL/Key) yo'q yoki CORS taqiqlangan." : error?.message));
     }
  };

  const saveNicknameToDB = async () => {
      setIsEditingName(false);
      if (!session?.user?.email) return;
      await supabase.from('profiles').update({ full_name: nickname }).eq('email', session.user.email);
  };

  const saveUsernameToDB = async () => {
      setIsEditingUsername(false);
      if (!session?.user?.email || !username.trim()) return;
      
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

      const { error } = await supabase.from('profiles').update({ username: cleanUsername }).eq('email', session.user.email);
      
      if (error) {
          setUsername(profileData?.username || "");
      } else {
          setUsername(cleanUsername);
          setProfileData((prev: any) => ({ ...prev, username: cleanUsername }));
      }
  };

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPostFile(file);
      setNewPostImagePreview(URL.createObjectURL(file));
      e.target.value = ''; 
    }
  };

  const handleAddStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
         alert("Xatolik: Supabase URL topilmadi.");
         return;
      }
      setUploadingStory(true);
      const ext = file.name.split('.').pop();
      const fileName = `story_${Date.now()}_${Math.floor(Math.random()*1000)}.${ext}`;
      
      const { data: uploadData, error: uploadErr } = await supabase.storage.from('lms-media').upload(`stories/${fileName}`, file);
      
      if (uploadErr) {
          alert(`Story yuklanmadi. Muammo: ${uploadErr.message === "Load failed" ? "Tarmoq xatosi yoki Environment Variables yetishmayapti." : uploadErr.message}`);
      }

      if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('lms-media').getPublicUrl(`stories/${fileName}`);
          const { data: newStory } = await supabase.from('stories').insert([{ author: nickname, image_url: publicUrl }]).select().single();
          
          if (newStory) {
              setStories(prev => {
                  const arr = [...prev];
                  arr.splice(1, 0, newStory);
                  return arr;
              });
          }
      }
      setUploadingStory(false);
      e.target.value = ''; 
    }
  };

  const handleStoryClick = (story: any) => {
    if (story.isAdd) {
       storyInputRef.current?.click();
    } else {
       setActiveStory(story);
    }
  };

  const closeStory = () => {
    if (activeStory && activeStory.id !== '0') {
       // O'qilgan storieslarni Saqlab qolish
       let viewedStories: string[] = [];
       try {
           const stored = localStorage.getItem(`ZARDUZ_LMS_VIEWED_STORIES_${session?.user?.email}`);
           if (stored) viewedStories = JSON.parse(stored);
       } catch(e) {}

       if (!viewedStories.includes(activeStory.id)) {
           localStorage.setItem(`ZARDUZ_LMS_VIEWED_STORIES_${session?.user?.email}`, JSON.stringify([...viewedStories, activeStory.id]));
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
    if (!window.confirm("Ushbu storyni (history) o'chirmoqchimisiz?")) return;
    
    const { error } = await supabase.from('stories').delete().eq('id', storyId);
    if (!error) {
       setStories(prev => prev.filter(s => s.id !== storyId));
       if (activeStory?.id === storyId) setActiveStory(null);
    } else {
       alert("Xatolik: " + error.message);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPostText.trim() && !newPostFile) return;
    setLoadingPost(true);
    let publicUrl = null;

    if (newPostFile) {
       if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
          alert("Xatolik: Supabase URL topilmadi.");
          setLoadingPost(false);
          return;
       }
       const ext = newPostFile.name.split('.').pop();
       const fileName = `post_${Date.now()}_${Math.floor(Math.random()*1000)}.${ext}`;
       const { data: uploadData, error: uploadErr } = await supabase.storage.from('lms-media').upload(`posts/${fileName}`, newPostFile);
       
       if (uploadErr) {
           alert(`Rasm xotiraga yuklanmadi. Muammo: ${uploadErr.message === "Load failed" ? "Netlify Env Vars sozlanmagan." : uploadErr.message}`);
       }

       if (uploadData) {
          const { data: urlData } = supabase.storage.from('lms-media').getPublicUrl(`posts/${fileName}`);
          publicUrl = urlData.publicUrl;
       }
    }

    const { data: newPost } = await supabase.from('posts').insert([
       { author: nickname, avatar: avatarImage, content: newPostText, image_url: publicUrl, likes: 0 }
    ]).select().single();

    if (newPost) {
       setPosts([{ ...newPost, commentsList: [] }, ...posts]);
    }
    
    setNewPostText("");
    setNewPostImagePreview(null);
    setNewPostFile(null);
    setShowPostEmoji(false);
    setLoadingPost(false);
  };

  const handleDeletePost = async (postId: string) => {
      if (!window.confirm("Rostdan ham ushbu postni o'chirmoqchimisiz?")) return;
      
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (!error) {
          setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
          alert(`Post o'chirilmadi: ${error.message}`);
      }
      setActiveMenuPostId(null);
  };

  const handleEditStart = (post: any) => {
      setEditingPostId(post.id);
      setEditContent(post.content);
      setActiveMenuPostId(null);
  };

  const handleEditSave = async (postId: string) => {
      if (!editContent.trim()) return;
      const { error } = await supabase.from('posts').update({ content: editContent }).eq('id', postId);
      
      if (!error) {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent } : p));
      } else {
          alert(`O'zgarish saqlanmadi: ${error.message}`);
      }
      setEditingPostId(null);
  };

  const toggleLike = async (postId: string, currentLikes: number) => {
     const post = posts.find(p => p.id === postId);
     const newIsLiked = !post?.isLikedLocal; 
     const change = newIsLiked ? 1 : -1;

     setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLikedLocal: newIsLiked, likes: p.likes + change } : p));
     await supabase.from('posts').update({ likes: currentLikes + change }).eq('id', postId);
  };

  const handleCommentSubmit = async (postId: string) => {
    if(!commentText.trim()) return;
    setLoadingComment(true);

    const { data: newComment } = await supabase.from('comments').insert([
       { post_id: postId, author: nickname, text: commentText }
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

  const handleEmojiClick = (emojiData: any, isPost: boolean) => {
     if (isPost) {
       setNewPostText(prev => prev + emojiData.emoji);
     } else {
       setCommentText(prev => prev + emojiData.emoji);
     }
  };

  const timeAgo = (dateStr: string) => {
     const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000); 
     if (diff < 1) return "Hozirgina";
     if (diff < 60) return `${diff} daqiqa oldin`;
     if (diff < 1440) return `${Math.floor(diff/60)} soat oldin`;
     return `${Math.floor(diff/1440)} kun oldin`;
  };

  if (!isMounted) return null;

  if (isLoadingProfile) {
    return (
      <div className="w-full flex h-[70vh] items-center justify-center animate-in fade-in">
         <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Ma'lumotlar yuklanmoqda...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 relative">
      {/* 1. TO'LIQ KENGAKLIKDAGI BANNER VA AVATAR */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
         <div className="relative h-48 md:h-64 w-full bg-gray-200 dark:bg-zinc-800 group">
            <img src={coverImage} className="w-full h-full object-cover" alt="Cover" />
            <div className="absolute inset-0 bg-black/20 md:bg-black/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button onClick={() => coverInputRef.current?.click()} className="flex items-center gap-2 bg-black/40 md:bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium transition active:scale-95 shadow-lg border border-white/20">
                  <Camera className="w-4 h-4" /> Fonni o'zgartirish
               </button>
               <input type="file" hidden ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} />
            </div>
         </div>

         <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row items-center md:items-end md:justify-between relative">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-16 relative z-10 w-full md:w-auto text-center md:text-left">
               <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#121212] bg-white dark:bg-black overflow-hidden shadow-md">
                     <img src={avatarImage} className="w-full h-full object-cover" alt="Avatar" />
                  </div>
                  <button 
                    onClick={() => avatarInputRef.current?.click()} 
                    className="absolute bottom-1 right-1 w-10 h-10 bg-gray-900 border-2 border-white dark:border-[#121212] text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-md"
                  >
                     <Camera className="w-4 h-4" />
                  </button>
                  <input type="file" hidden ref={avatarInputRef} accept="image/*" onChange={handleAvatarUpload} />
               </div>

               <div className="pb-2 w-full flex flex-col gap-3 items-center md:items-start mt-3 md:mt-0">
                 {/* Name Block */}
                 <div className="flex flex-col items-center md:items-start w-full">
                   <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-1">To'liq ism</span>
                   {isEditingName ? (
                      <input 
                        type="text" 
                        className="text-2xl md:text-3xl font-bold text-black border-b-2 border-black focus:outline-none dark:bg-transparent dark:text-white dark:border-white px-1 w-full text-center md:text-left" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        onBlur={saveNicknameToDB}
                        onKeyDown={(e) => e.key === 'Enter' && saveNicknameToDB()}
                        autoFocus
                      />
                   ) : (
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3 group cursor-pointer" onClick={() => setIsEditingName(true)} title="Ismni o'zgartirish">
                         {nickname}
                         <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </h1>
                   )}
                 </div>

                 {/* Username Block */}
                 <div className="flex flex-col items-center md:items-start w-full">
                   <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">@ Taxallus (Username)</span>
                   {isEditingUsername ? (
                      <div className="flex items-center justify-center md:justify-start">
                        <span className="text-sm font-bold text-indigo-500 mr-0.5">@</span>
                        <input 
                          type="text" 
                          className="text-sm font-bold text-indigo-500 border-b border-indigo-500 focus:outline-none bg-transparent px-1 w-40 text-center md:text-left" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)}
                          onBlur={saveUsernameToDB}
                          onKeyDown={(e) => e.key === 'Enter' && saveUsernameToDB()}
                          autoFocus
                          placeholder="taxallus"
                        />
                      </div>
                   ) : (
                      <div className="flex items-center justify-center md:justify-start gap-2 group cursor-pointer" onClick={() => setIsEditingUsername(true)} title="Taxallusni (Username) o'zgartirish">
                         <span className="py-1 px-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold border border-indigo-100 dark:border-indigo-500/20">
                           @{username}
                         </span>
                         <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                   )}
                 </div>

                 <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{profileData.department}</p>
               </div>
            </div>

            <div className="hidden md:flex gap-6 pb-2 text-center">
               <div><span className="block font-bold text-xl text-gray-900 dark:text-white">{posts.filter(p => p.author === nickname).length}</span><span className="text-sm text-gray-500 dark:text-gray-400">Postlar</span></div>
               <div><span className="block font-bold text-xl text-gray-900 dark:text-white">{profileData.followers}</span><span className="text-sm text-gray-500 dark:text-gray-400">Kuzatuvchilar</span></div>
               <div><span className="block font-bold text-xl text-gray-900 dark:text-white">{profileData.gpa}</span><span className="text-sm text-gray-500 dark:text-gray-400">GPA</span></div>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full">
         <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-500/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
               <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><BarChart className="w-5 h-5 text-indigo-500"/> Ko'rsatkichlar</h3>
               
               <div className="mb-6">
                 <div className="flex justify-between text-sm mb-2 font-medium">
                   <span className="text-gray-500 dark:text-gray-400">GPA Darajasi</span>
                   <span className="text-black dark:text-white font-bold">{profileData.gpa} / 4.0</span>
                 </div>
                 <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                   <div className="bg-indigo-500 h-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${(profileData.gpa / 4) * 100}%` }}></div>
                 </div>
               </div>
            </div>

            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm max-h-[500px] overflow-y-auto custom-scrollbar flex-1">
               <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-[#121212] z-10 py-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dars Jadvali</h3>
                  <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-lg">Bugun</button>
               </div>
               <div className="grid grid-cols-1 gap-3">
                 {[
                   { title: 'Database', type: 'Maruz\'za', room: '14B', time: '09:00 - 10:30' },
                   { title: 'React Hooks', type: 'Amaliyot', room: 'Lab 3', time: '11:00 - 12:30' },
                 ].map((lesson, idx) => (
                   <div key={idx} className="flex border border-gray-100 dark:border-white/5 rounded-2xl hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 hover:shadow-md dark:hover:bg-white/5 bg-gray-50/50 dark:bg-[#181818] p-3 items-center justify-between group">
                      <div className="flex items-center gap-3 truncate">
                         <div className="w-10 h-10 shrink-0 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                            <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                         </div>
                         <div className="min-w-0 pr-1">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{lesson.title}</h4>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">{lesson.type} • {lesson.room}</p>
                         </div>
                      </div>
                      <div className="shrink-0 px-2 py-1 bg-black dark:bg-white rounded-lg">
                         <span className="text-[10px] font-bold text-white dark:text-black">{lesson.time}</span>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
         </div>

         <div className="flex-1 max-w-full flex flex-col gap-6 overflow-hidden">
            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-4 shadow-sm flex gap-4 overflow-x-auto hide-scrollbar items-center">
               <input type="file" hidden ref={storyInputRef} accept="image/*" onChange={handleAddStory} />

               {stories.map(story => (
                  <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={() => handleStoryClick(story)}>
                     <div className={`relative w-16 h-16 rounded-full p-[2px] transition-transform active:scale-95 ${story.isViewed || story.isAdd ? 'bg-gray-200 dark:bg-zinc-800' : 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 shadow-md'}`}>
                        <div className="w-full h-full rounded-full border-2 border-white dark:border-[#121212] bg-white dark:bg-black overflow-hidden relative">
                           {uploadingStory && story.isAdd ? (
                               <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-black"><div className="w-5 h-5 border-2 border-t-blue-500 rounded-full animate-spin"></div></div>
                           ) : (
                               <img src={story.image_url || avatarImage} className="w-full h-full object-cover" alt="story" />
                           )}
                           {story.isAdd && !uploadingStory && (
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                               <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"><Plus className="w-4 h-4"/></div>
                             </div>
                           )}
                        </div>
                     </div>
                     <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{story.author}</span>
                  </div>
               ))}
               {stories.length === 1 && <span className="text-sm font-medium text-gray-400 ml-4">Birinchi bo'lib tarix yarating!</span>}
            </div>

            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-5 shadow-sm">
               <div className="flex gap-4 mb-4">
                  <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-800">
                     <img src={avatarImage} className="w-full h-full object-cover" alt="Me" />
                  </div>
                  <div className="w-full relative">
                     <textarea 
                       className="w-full bg-gray-50 dark:bg-[#181818] border border-transparent hover:border-gray-200 focus:border-gray-300 dark:hover:border-white/10 dark:focus:border-white/10 text-gray-900 dark:text-white rounded-2xl resize-none outline-none p-3 placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm transition-colors pr-10"
                       rows={2}
                       placeholder="Yangi bilimlaringizni ulashing..."
                       value={newPostText}
                       onChange={(e) => setNewPostText(e.target.value)}
                     />
                     <button onClick={() => setShowPostEmoji(!showPostEmoji)} className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Smile className="w-5 h-5" />
                     </button>

                     {showPostEmoji && (
                        <div className="absolute z-[100] top-full mt-2 right-0">
                           <EmojiPicker onEmojiClick={(data) => handleEmojiClick(data, true)} theme={Theme.AUTO} />
                        </div>
                     )}
                  </div>
               </div>
               
               {newPostImagePreview && (
                  <div className="relative w-max mb-4 ml-14 group">
                      <img src={newPostImagePreview} className="h-32 rounded-xl object-cover border border-gray-200 dark:border-white/10 shadow-sm" alt="New Post Attachment"/>
                      <button onClick={() => {setNewPostImagePreview(null); setNewPostFile(null)}} className="absolute -top-2 -right-2 bg-gray-900 border-2 border-white dark:border-[#121212] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><X className="w-4 h-4"/></button>
                  </div>
               )}

               <div className="flex justify-between items-center ml-14 relative z-10">
                 <div className="flex gap-2">
                     <input type="file" hidden ref={postImageInputRef} accept="image/*" onChange={handlePostImageSelect} />
                    <button onClick={() => postImageInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors">
                       <ImageIcon className="w-4 h-4 text-green-500" /> Rasm tasviri
                    </button>
                 </div>
                 <button 
                   onClick={handlePostSubmit}
                   disabled={(!newPostText.trim() && !newPostFile) || loadingPost}
                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white px-5 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md disabled:cursor-not-allowed disabled:shadow-none"
                 >
                   {loadingPost ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Joylash'} <Send className="w-3.5 h-3.5 ml-1" />
                 </button>
               </div>
            </div>

            <div className="flex flex-col gap-6 pb-20">
               {posts.length === 0 && <div className="text-center text-gray-500 mt-10">Hozircha lenta bo'm-bosh. Birinchi postni yarating! 🚀</div>}
               {posts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-5 shadow-sm group">
                      <div className="flex justify-between items-start mb-4 relative">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-800 shrink-0">
                               <img src={post.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${post.author}`} className="w-full h-full object-cover" alt="Author"/>
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900 dark:text-white text-sm">{post.author}</h4>
                               <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.created_at)}</p>
                            </div>
                         </div>
                         
                         {post.author === nickname && (
                           <div className="relative">
                              <button 
                                onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)} 
                                className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                              >
                                 <MoreHorizontal className="w-5 h-5"/>
                              </button>
                              
                              {activeMenuPostId === post.id && (
                                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1c1c1c] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 overflow-hidden z-20 animate-in fade-in zoom-in-95">
                                   <button onClick={() => handleEditStart(post)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left font-medium">
                                      <Edit2 className="w-4 h-4"/> Tahrirlash
                                   </button>
                                   <button onClick={() => handleDeletePost(post.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left font-medium">
                                      <Trash2 className="w-4 h-4"/> O'chirish
                                   </button>
                                </div>
                              )}
                           </div>
                         )}
                      </div>

                      {editingPostId === post.id ? (
                          <div className="w-full mb-4">
                             <textarea 
                               className="w-full bg-gray-50 dark:bg-[#181818] border border-blue-500 text-gray-900 dark:text-white rounded-xl resize-none outline-none p-3 text-sm"
                               rows={3}
                               value={editContent}
                               onChange={(e) => setEditContent(e.target.value)}
                             />
                             <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setEditingPostId(null)} className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">Bekor qilish</button>
                                <button onClick={() => handleEditSave(post.id)} className="px-4 py-1.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors">Saqlash</button>
                             </div>
                          </div>
                      ) : (
                          <p className="text-gray-800 dark:text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      )}

                      {post.image_url && (
                         <div className="w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 mb-4 bg-gray-50 dark:bg-black">
                            <img src={post.image_url} className="w-full h-auto object-cover max-h-[500px] object-center mx-auto" alt="Post view" />
                         </div>
                      )}

                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                         <button onClick={() => toggleLike(post.id, post.likes)} className="flex items-center gap-2 group/btn active:scale-95 transition-transform">
                            <div className={`p-1.5 rounded-full transition-colors ${post.isLikedLocal ? 'bg-red-50 dark:bg-red-500/10' : 'group-hover/btn:bg-gray-100 dark:group-hover/btn:bg-white/5'}`}>
                               <Heart className={`w-5 h-5 transition-colors ${post.isLikedLocal ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400 group-hover/btn:text-red-500'}`} />
                            </div>
                            <span className={`text-sm font-bold ${post.isLikedLocal ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-hover/btn:text-gray-700 dark:group-hover/btn:text-gray-300'}`}>{post.likes}</span>
                         </button>
                         <button onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} className="flex items-center gap-2 group/btn active:scale-95 transition-transform">
                            <div className={`p-1.5 rounded-full transition-colors ${activeCommentPostId === post.id ? 'bg-blue-50 dark:bg-blue-500/10' : 'group-hover/btn:bg-blue-50 dark:group-hover/btn:bg-blue-500/10'}`}>
                               <MessageSquare className={`w-5 h-5 transition-colors ${activeCommentPostId === post.id ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 group-hover/btn:text-blue-500'}`} />
                            </div>
                            <span className={`text-sm font-bold ${activeCommentPostId === post.id ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 group-hover/btn:text-gray-700 dark:group-hover/btn:text-gray-300'}`}>{post.commentsList?.length || 0}</span>
                         </button>
                      </div>

                      {activeCommentPostId === post.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 animate-in fade-in slide-in-from-top-2 relative z-0">
                           <div className="flex flex-col gap-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
                             {post.commentsList?.map((comment: any) => (
                                <div key={comment.id} className="flex gap-2 relative group/comment">
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-800 shrink-0 mt-1">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${comment.author}`} className="w-full h-full object-cover" alt="User"/>
                                  </div>
                                  <div className="bg-gray-50 dark:bg-[#181818] p-3 rounded-2xl rounded-tl-sm text-sm border border-gray-100 dark:border-white/5">
                                     <div className="flex items-end gap-2 mb-0.5">
                                        <span className="font-bold text-gray-900 dark:text-white block leading-none">{comment.author}</span>
                                        <span className="text-[10px] text-gray-400 leading-none">{timeAgo(comment.created_at)}</span>
                                     </div>
                                     <span className="text-gray-700 dark:text-gray-300">{comment.text}</span>
                                  </div>
                                </div>
                             ))}
                             {(!post.commentsList || post.commentsList.length === 0) && (
                               <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">Hali izohlar yo'q. Birinchi bo'lib izoh qoldiring!</p>
                             )}
                           </div>
                           
                           <div className="flex items-center gap-2 relative z-[80]">
                              <button onClick={() => setShowCommentEmoji(!showCommentEmoji)} className="absolute left-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10 hover:scale-110 transition-transform">
                                 <Smile className="w-5 h-5" />
                              </button>
                              
                              {showCommentEmoji && (
                                <div className="absolute top-full lg:bottom-full lg:top-auto mb-2 left-0 z-[100]">
                                   <EmojiPicker onEmojiClick={(data) => handleEmojiClick(data, false)} theme={Theme.AUTO} />
                                </div>
                              )}

                              <input 
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                placeholder="Izoh qoldiring..."
                                className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-white/20 outline-none rounded-full py-2.5 pl-10 pr-12 text-sm text-gray-900 dark:text-white transition-colors"
                              />
                              <button 
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={!commentText.trim() || loadingComment}
                                className="absolute right-1 w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full transition-colors"
                              >
                                {loadingComment ? <div className="w-3 h-3 border-2 border-white rounded-full animate-spin border-t-transparent"></div> : <Send className="w-3.5 h-3.5 -ml-0.5" />}
                              </button>
                           </div>
                        </div>
                      )}
                  </div>
               ))}
            </div>
         </div>
      </div>

      {activeStory && (
         <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 p-4">
            <div className="absolute top-4 w-full max-w-md px-4 flex flex-col gap-3 z-10">
               <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-white shadow-[0_0_10px_white] animate-[story-progress_3s_linear_forwards] w-0"
                    style={{ animationPlayState: isStoryPaused ? 'paused' : 'running' }}
                  ></div>
               </div>
               <div className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                     <img src={activeStory.image_url || activeStory.image} className="w-8 h-8 border border-white/20 rounded-full bg-black/50 object-cover" alt="Story Autor"/>
                     <span className="font-bold text-sm text-shadow-sm">{activeStory.author || activeStory.user}</span>
                     <span className="text-xs text-white/50 font-medium">{timeAgo(activeStory.created_at || new Date().toISOString())}</span>
                  </div>
                  <button onClick={closeStory} className="p-2 hover:bg-white/10 rounded-full transition"><X className="w-6 h-6"/></button>
               </div>
            </div>

            <div 
              className="relative w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center h-[75vh] md:h-[85vh] cursor-pointer"
              onMouseDown={() => setIsStoryPaused(true)}
              onMouseUp={() => setIsStoryPaused(false)}
              onTouchStart={() => setIsStoryPaused(true)}
              onTouchEnd={() => setIsStoryPaused(false)}
            >
                <img src={activeStory.image_url || activeStory.image} className="w-full h-full object-contain pointer-events-none" alt="Story Full" />
                
                {/* Delete button inside story for author or director */}
                {(activeStory.author === nickname || profileData?.role === 'director') && (
                  <button 
                    onClick={(e) => handleDeleteStory(e, activeStory.id)}
                    className="absolute bottom-10 right-6 p-4 bg-red-600/20 hover:bg-red-600 backdrop-blur-md text-white rounded-full transition-all active:scale-95 z-20"
                    title="O'chirish"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                )}
                
                {isStoryPaused && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full text-white text-xs font-bold animate-pulse">
                    PAUSED
                  </div>
                )}
            </div>

            <style jsx>{`
              @keyframes story-progress {
                0% { width: 0%; }
                100% { width: 100%; }
              }
              .text-shadow-sm { text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
            `}</style>
         </div>
      )}
    </div>
  )
}
