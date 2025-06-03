import React from 'react';

const DashboardSkeleton = ({ type = 'candidate' }) => {
  return (
    <div className="container mx-auto py-8 px-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 mt-4 sm:mt-0"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <section className="mb-10">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Table Skeleton */}
      <section>
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4">
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map(j => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardSkeleton;
