"use client";

import { useSession } from "next-auth/react";
import { BookOpen, PlayCircle, Clock } from "lucide-react";

export default function CoursesPage() {
  const { data: session } = useSession();

  const courses = [
    { title: "React & Next.js Masterclass", instructor: "Aziz Rakhimov", duration: "12 hafta", lessons: 48, color: "from-blue-500 to-cyan-400" },
    { title: "Node.js Backend Architecture", instructor: "Jamshid Qodirov", duration: "8 hafta", lessons: 32, color: "from-green-500 to-emerald-400" },
    { title: "UI/UX & Figma Advanced", instructor: "Otabek Turobov", duration: "6 hafta", lessons: 24, color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-gray-900 dark:text-white">
      <div className="mb-10 lg:pl-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Barcha Darsliklar</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg border-none">Siz uchun tayyorlangan premium darsliklar va amaliyotlar portfeli.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, idx) => (
          <div key={idx} className="group bg-white dark:bg-[#121212] rounded-3xl p-2 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 transition-all duration-300">
            <div className={`h-48 rounded-2xl bg-gradient-to-br ${course.color} p-6 flex flex-col justify-between relative overflow-hidden`}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-6 h-6 text-white isolate" />
               </div>
               <div className="text-white z-10">
                 <h3 className="text-xl font-bold mb-1 shadow-sm leading-tight">{course.title}</h3>
                 <p className="text-white/90 text-sm font-medium">{course.instructor}</p>
               </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {course.duration}</span>
                <span className="flex items-center gap-1.5"><PlayCircle className="w-4 h-4" /> {course.lessons} ta dars</span>
              </div>
              <button className="w-full h-[48px] bg-gray-50 dark:bg-white/5 text-black dark:text-white font-bold rounded-xl group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors active:scale-95 duration-200 border border-gray-200 dark:border-white/10 group-hover:border-transparent">
                Darsni Boshlash
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
