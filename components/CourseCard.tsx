
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
      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start gap-4 active:scale-[0.97] transition-all text-left group hover:shadow-xl dark:hover:shadow-indigo-950/20"
    >
      <div className={`${course.color} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-slate-100 dark:shadow-none group-hover:rotate-6 transition-transform`}>
        {course.icon}
      </div>
      <div className="w-full">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.name}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
          {course.description}
        </p>
      </div>

      <div className="w-full mt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">İlerleme</span>
          <span className="text-[10px] font-bold text-blue-600 dark:text-indigo-400">%{prog}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 dark:bg-indigo-500 transition-all duration-1000" 
            style={{ width: `${prog}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-2 w-full pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
        <span>AUZEF - 3. SINIF</span>
        <span className="text-blue-500 dark:text-indigo-400">ÇALIŞMAYA BAŞLA →</span>
      </div>
    </button>
  );
};

export default CourseCard;
