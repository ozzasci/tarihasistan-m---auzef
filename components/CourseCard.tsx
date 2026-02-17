
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
      className="bg-white/80 dark:bg-black/30 p-6 sm:p-8 rounded-[3rem] shadow-xl border-t-4 border-altin flex flex-col items-start gap-6 active:scale-[0.96] transition-all text-left group relative overflow-hidden rumi-border"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-hunkar dark:text-altin">
              <path d="M50 0C50 0 40 20 20 20C20 20 0 30 0 50C0 70 20 80 20 80C20 80 40 100 50 100C50 100 60 80 80 80C80 80 100 70 100 50C100 30 80 20 80 20C80 20 60 0 50 0Z" />
          </svg>
      </div>

      <div className="flex items-center gap-5 w-full">
        <div className={`bg-hunkar w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-2 border-altin group-hover:scale-110 transition-transform shrink-0`}>
          {course.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-hunkar dark:text-altin text-lg sm:text-xl leading-tight group-hover:drop-shadow-sm transition-all truncate tracking-wider">
            {course.name}
          </h3>
          <p className="text-enderun dark:text-orange-200/40 text-[10px] font-display font-bold uppercase tracking-[0.2em] mt-1">Hicri 1446 | Tedrisat</p>
        </div>
      </div>
      
      <p className="text-slate-700 dark:text-orange-50/70 text-sm font-serif italic line-clamp-2 leading-relaxed h-10 border-l-2 border-altin/30 pl-4">
        {course.description}
      </p>

      <div className="w-full space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-display font-black text-hunkar dark:text-altin/50 uppercase tracking-widest">İlerleyiş-i Şerif</span>
          <span className="text-[11px] font-bold text-enderun dark:text-altin">%{prog}</span>
        </div>
        <div className="w-full h-2 bg-parshmen dark:bg-black/40 rounded-full overflow-hidden border border-altin/20">
          <div 
            className="h-full bg-hunkar dark:bg-altin/80 transition-all duration-1000" 
            style={{ width: `${prog}%` }}
          ></div>
        </div>
      </div>

      <div className="w-full pt-4 border-t border-altin/10 flex justify-end items-center">
        <span className="text-[10px] font-display font-black text-hunkar dark:text-altin uppercase tracking-[0.3em] group-hover:translate-x-1 transition-transform">Tedrisata Başla ✒️</span>
      </div>
    </button>
  );
};

export default CourseCard;
