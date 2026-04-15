"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, GraduationCap, TrendingUp, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';

const data = [
  { name: 'Yan', students: 400, teachers: 24 },
  { name: 'Fev', students: 500, teachers: 26 },
  { name: 'Mar', students: 550, teachers: 28 },
  { name: 'Apr', students: 780, teachers: 35 },
  { name: 'May', students: 890, teachers: 42 },
];

export default function AdminPanel() {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#333333' : '#E5E7EB';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';
  const primaryLine = isDark ? '#818CF8' : '#4F46E5'; // Indigo
  const secondaryLine = isDark ? '#FCD34D' : '#F59E0B'; // Amber

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10 p-1">
        <div>
           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Maktab Statistikasi</h1>
           <p className="text-gray-500 dark:text-gray-400">Tizimning umumiy o'sish ko'rsatkichlari sizning nazoratingizda.</p>
        </div>
        <button className="p-3 border border-gray-200 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition bg-white dark:bg-[#121212]">
          <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Jami Talabalar", value: "2,845", icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { title: "Faol O'qituvchilar", value: "142", icon: Users, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
          { title: "Jami Kurslar", value: "86", icon: BookOpen, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-500/10" },
          { title: "O'zlashtirish", value: "+14%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 border border-gray-200 dark:border-white/10 rounded-3xl flex flex-col justify-between bg-white dark:bg-[#121212] shadow-sm hover:shadow-md transition-shadow group cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                 <stat.icon className="w-7 h-7" />
              </div>
            </div>
            <div>
               <span className="text-4xl font-black text-gray-900 dark:text-white block mb-1">{stat.value}</span>
               <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="p-6 border border-gray-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#121212] shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Tizim o'sish dinamikasi (Oylar kesimida)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: textColor, fontWeight: 'bold'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: textColor, fontWeight: 'bold'}} dx={-10} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: isDark ? '#1a1a1a' : '#fff', color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}
              />
              <Line type="monotone" name="Talabalar" dataKey="students" stroke={primaryLine} strokeWidth={4} dot={{r: 6, fill: primaryLine, strokeWidth: 0}} activeDot={{r: 8}} />
              <Line type="monotone" name="O'qituvchilar" dataKey="teachers" stroke={secondaryLine} strokeWidth={4} dot={{r: 6, fill: secondaryLine, strokeWidth: 0}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
