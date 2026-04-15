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
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 dark:bg-[#121212] transition-colors py-10">
      <div className="p-8 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-lg text-center max-w-sm w-full mx-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Tizimga kirish</h1>
        <p className="text-gray-500 mb-6 text-sm">Talabalar, o'qituvchi va ma'muriyat maxsus parollari orqali kirishadi. Google orqali faqat mehmonlar kira oladi.</p>
        
        <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-4 mb-6 text-left">
           <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" placeholder="Email pochta" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-indigo-500 text-black dark:text-white outline-none transition-colors" />
           </div>
           <div className="relative">
              <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Maxfiy parol" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-12 text-sm focus:border-indigo-500 text-black dark:text-white outline-none transition-colors" 
              />
              <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
              >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
           </div>
           <button disabled={loading} type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? "Tekshirilmoqda..." : "Parol orqali kirish"}
           </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
           <div className="border-t border-gray-200 dark:border-zinc-800 w-full absolute"></div>
           <span className="bg-white dark:bg-black px-3 relative text-gray-400 text-[10px] font-bold uppercase tracking-widest">Yoki (Mehmonlar uchun)</span>
        </div>

        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full py-3 flex items-center justify-center gap-3 bg-black dark:bg-white text-white dark:text-black rounded-xl active:scale-95 transition-transform font-bold hover:bg-gray-800 dark:hover:bg-gray-200 shadow-md"
        >
          <LogIn className="w-5 h-5" />
          Google account orqali
        </button>
      </div>
    </div>
  )
}
