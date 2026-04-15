"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Edit2, ShieldAlert, BookOpen, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";

export default function GuestProfile() {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  // Customization States
  const [coverImage, setCoverImage] = useState<string>("https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&q=80&w=2000");
  const [avatarImage, setAvatarImage] = useState<string>("https://api.dicebear.com/7.x/notionists/svg?seed=Guest");
  const [nickname, setNickname] = useState<string>("Mehmon");
  const [username, setUsername] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    } else {
      if (session?.user?.image) setAvatarImage(session.user.image);
      if (session?.user?.name) setNickname(session.user.name);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.email) return;

    setCoverImage(URL.createObjectURL(file));

    const ext = file.name.split('.').pop();
    const fileName = `cover_guest_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('lms-media').upload(`profiles/${fileName}`, file);
    
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('lms-media').getPublicUrl(`profiles/${fileName}`);
      await supabase.from('profiles').update({ cover_url: publicUrl }).eq('email', session.user.email);
    } else {
      alert("Cover rasm xotiraga yuklanmadi: " + error?.message);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.email) return;

    setAvatarImage(URL.createObjectURL(file));

    const ext = file.name.split('.').pop();
    const fileName = `avatar_guest_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('lms-media').upload(`profiles/${fileName}`, file);
    
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('lms-media').getPublicUrl(`profiles/${fileName}`);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('email', session.user.email);
    } else {
      alert("Avatar rasm xotiraga yuklanmadi: " + error?.message);
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
    if (!error) setUsername(cleanUsername);
  };

  if (!isMounted) return null;

  if (isLoadingProfile) {
    return (
      <div className="w-full flex h-[70vh] items-center justify-center animate-in fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* BANNER VA AVATAR */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="relative h-48 md:h-64 w-full bg-gray-200 dark:bg-zinc-800 group">
          <img src={coverImage} className="w-full h-full object-cover" alt="Cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button onClick={() => coverInputRef.current?.click()} className="flex items-center gap-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium transition active:scale-95 shadow-lg">
              <Camera className="w-4 h-4" /> Fonni o'zgartirish
            </button>
            <input type="file" hidden ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} />
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row items-center md:items-end md:justify-between relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-16 relative z-10 w-full md:w-auto text-center md:text-left">
            <div className="relative group mx-auto md:mx-0">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#121212] bg-white dark:bg-black overflow-hidden shadow-md">
                <img src={avatarImage} className="w-full h-full object-cover" alt="Avatar" />
              </div>
              <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-1 right-1 w-10 h-10 bg-gray-900 border-2 border-white dark:border-[#121212] text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform opacity-0 group-hover:opacity-100 shadow-md">
                <Camera className="w-4 h-4" />
              </button>
              <input type="file" hidden ref={avatarInputRef} accept="image/*" onChange={handleAvatarUpload} />
            </div>

            <div className="pb-2 w-full flex flex-col gap-3 items-center md:items-start mt-3 md:mt-0">
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
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                    {nickname} <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  </h1>
                )}
              </div>

              <div className="flex flex-col items-center md:items-start w-full">
                <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">@ Taxallus (Username)</span>
                {isEditingUsername ? (
                  <div className="flex items-center justify-center md:justify-start">
                    <span className="text-sm font-bold text-amber-500 mr-0.5">@</span>
                    <input
                      type="text"
                      className="text-sm font-bold text-amber-500 border-b border-amber-500 focus:outline-none bg-transparent px-1 w-40 text-center md:text-left"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onBlur={saveUsernameToDB}
                      onKeyDown={(e) => e.key === 'Enter' && saveUsernameToDB()}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center md:justify-start gap-2 group cursor-pointer" onClick={() => setIsEditingUsername(true)}>
                    <span className="py-1 px-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-bold border border-amber-100 dark:border-amber-500/20">
                      @{username || "tasdiqlanmagan"}
                    </span>
                    <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-2 items-center bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-xl text-amber-600 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-500/20 mb-2">
            <ShieldAlert className="w-5 h-5" /> Mehmon maqomi
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center !py-16">
          <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-zinc-800">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Siz Tizimda Mehmon sifatida yozilgansiz</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
            Hozirgi vaqtda profilingiz rasmiy o'quv jarayonlari, dars platformalari (kampus) hamda yopiq ijtimoiy tarmoq funksiyalariga ulanmagan. Barcha yashirin blog va xabarlarni ko'rish uchun huquqingiz yetarli emas.
          </p>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-500/20 w-full max-w-lg text-left">
            <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2"><BookOpen className="w-5 h-5"/> Tizimga qanday ulanish mumkin?</h4>
            <p className="text-sm text-amber-600 dark:text-amber-300">Agar siz haqiqatdan ham Talaba yoki O'qituvchi bo'lsangiz, Universitet boshqaruvi (Direktor) tomonidan sizga alohida Parol o'rnatib berilishi kerak. Ro'yxatdan o'tish uchun O'quv bo'limiga murojaat qiling.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
