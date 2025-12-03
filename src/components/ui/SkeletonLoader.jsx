import React from 'react';

/**
 * Skeleton loading animation component
 */
export const SkeletonLoader = ({ isDark }) => (
  <div className="w-full max-w-4xl mx-auto space-y-6">
    <div className={`h-8 w-64 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className={`col-span-2 h-32 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
      <div className={`h-32 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-24 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
      ))}
    </div>
  </div>
);

export default SkeletonLoader;
