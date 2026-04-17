"use client";

import { signIn } from "next-auth/react";
import { LogIn, Key, Mail, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const res = await signIn('credentials', { email, password, callbackUrl: '/', redirect: false });
      if (res?.error) {
          alert("Email yoki maxfiy parol noto'g'ri!");
          setLoading(false);
      } else if (res?.ok) {
          window.location.href = '/';
      }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0c0c0e] transition-colors py-8 px-4">
      <div className="p-6 sm:p-10 bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-[2.5rem] shadow-2xl text-center max-w-[400px] w-full mx-auto relative overflow-hidden">
        {/* Dekorativ elementlar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="mb-8">
          <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-600/20">
            <LogIn className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black mb-2 text-gray-900 dark:text-white tracking-tight">Xush kelibsiz</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-2">
            LMS Akita platformasiga kirish uchun ma'lumotlaringizni kiriting.
          </p>
        </div>
        
        <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-4 mb-8 text-left">
           <div className="space-y-1.5">
             <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1 uppercase tracking-wider">Email Pochta</label>
             <div className="relative group">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="name@university.uz" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-gray-50 dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-black dark:text-white outline-none transition-all" 
                />
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1 uppercase tracking-wider">Maxfiy Parol</label>
             <div className="relative group">
                <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-gray-50 dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-black dark:text-white outline-none transition-all" 
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 focus:outline-none transition-colors"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
             </div>
           </div>

           <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-4 mt-2 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
           >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Kirilmoqda...
                </>
              ) : "Tizimga kirish"}
           </button>
        </form>

        <div className="relative flex items-center justify-center mb-8">
           <div className="border-t border-gray-100 dark:border-white/5 w-full absolute"></div>
           <span className="bg-white dark:bg-[#121214] px-4 relative text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Yoki</span>
        </div>

        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full py-4 flex items-center justify-center gap-3 bg-white dark:bg-white text-gray-900 dark:text-black rounded-2xl active:scale-[0.98] transition-all font-bold hover:shadow-xl border border-gray-200 dark:border-transparent"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Google orqali kirish
        </button>

        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500 leading-relaxed font-medium">
          Kirishda muammo bormi? <br/>
          <span className="text-indigo-500 cursor-pointer hover:underline">Ma'muriyat bilan bog'laning</span>
        </p>
      </div>
    </div>
  )
}
