import React from 'react';
import { PlusCircle, Edit3, Trash2, FileText, UploadCloud } from 'lucide-react';

const courses = [
  { id: 1, title: 'Python Backend Dasturlash', students: 120, assignments: 5 },
  { id: 2, title: 'Software Engineering 101', students: 85, assignments: 3 },
];

export default function TeacherCabinet() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">O'qituvchi Kabineti</h1>
          <p className="text-gray-500 mt-1">Xush kelibsiz, Hurmatli o'qituvchi.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition">
          <PlusCircle className="w-5 h-5" />
          Yangi Kurs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kurslar Ro'yxati */}
        <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6 border-b pb-4">Faol Kurslar</h2>
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition group cursor-pointer">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-black">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.students} talaba • {course.assignments} vazifa</p>
                </div>
                <div className="flex gap-3 px-2">
                  <button className="text-gray-400 hover:text-black transition"><Edit3 className="w-5 h-5"/></button>
                  <button className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-5 h-5"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topshiriqlarni boshqarish */}
        <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm text-center flex flex-col justify-center items-center h-full min-h-[300px]">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <UploadCloud className="w-8 h-8 text-gray-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Vazifa Yuklash</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">Kurs uchun test yoki amaliy topshiriqlarni yuklash va belgilash</p>
          <button className="px-6 py-2.5 border-2 border-black font-medium rounded-lg hover:bg-black hover:text-white transition">
            Fayl tanlash
          </button>
        </div>
      </div>
    </div>
  );
}
