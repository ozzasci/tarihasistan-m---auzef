
import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <button
      onClick={() => onClick(course)}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start gap-3 active:scale-95 transition-all text-left group"
    >
      <div className={`${course.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
        {course.icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
          {course.name}
        </h3>
        <p className="text-slate-500 text-sm mt-1 line-clamp-2">
          {course.description}
        </p>
      </div>
      <div className="mt-auto w-full pt-3 flex justify-between items-center text-xs font-medium text-slate-400">
        <span>AUZEF - 3. Sınıf</span>
        <span className="bg-slate-50 px-2 py-1 rounded">İncele →</span>
      </div>
    </button>
  );
};

export default CourseCard;
