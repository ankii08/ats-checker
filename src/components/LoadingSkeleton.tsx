// Loading skeleton component
'use client';

export function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Score skeleton */}
      <div className="flex flex-col items-center">
        <div className="w-40 h-40 bg-gray-700 rounded-full mb-4" />
        <div className="h-4 bg-gray-700 rounded w-48 mb-2" />
        <div className="h-3 bg-gray-700 rounded w-64" />
      </div>

      {/* Keywords skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="h-6 bg-gray-700 rounded w-40 mb-3" />
          <div className="p-4 bg-gray-900 rounded-xl space-y-2">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-7 bg-gray-700 rounded-full" style={{ width: `${60 + i * 15}px` }} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="h-6 bg-gray-700 rounded w-40 mb-3" />
          <div className="p-4 bg-gray-900 rounded-xl space-y-2">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-7 bg-gray-700 rounded-full" style={{ width: `${70 + i * 20}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-4" />
        {[1, 2].map(i => (
          <div key={i} className="p-4 bg-gray-900 rounded-lg border-l-4 border-gray-700 space-y-3">
            <div className="h-3 bg-gray-700 rounded w-20" />
            <div className="h-4 bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-700 rounded w-5/6" />
            <div className="h-3 bg-gray-700 rounded w-24 mt-4" />
            <div className="h-4 bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-700 rounded w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
