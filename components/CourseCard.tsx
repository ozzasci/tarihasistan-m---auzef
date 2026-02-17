
import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { getProgress } from '../services/dbService';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const [prog, setProg] = useState(0);

  useEffect(() => {
    getProgress(course.id).then(setProg);
  }, [course.id]);

  return (
    <button
      onClick={() => onClick(course)}
      className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start gap-4 active:scale-[0.96] transition-all text-left group hover:shadow-xl dark:hover:shadow-indigo-950/20 w-full"
    >
      <div className="flex items-center gap-4 w-full">
        <div className={`${course.color} w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:rotate-6 transition-transform shrink-0`}>
          {course.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            {course.name}
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">3. Sınıf - AUZEF</p>
        </div>
      </div>
      
      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed h-8">
        {course.description}
      </p>

      <div className="w-full">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tamamlanma</span>
          <span className="text-[10px] font-black text-blue-600 dark:text-indigo-400">%{prog}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 dark:bg-indigo-500 transition-all duration-1000" 
            style={{ width: `${prog}%` }}
          ></div>
        </div>
      </div>

      <div className="w-full pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-end items-center">
        <span className="text-[10px] font-black text-blue-500 dark:text-indigo-400 uppercase tracking-wider group-hover:translate-x-1 transition-transform">Derse Başla →</span>
      </div>
    </button>
  );
};

export default CourseCard;