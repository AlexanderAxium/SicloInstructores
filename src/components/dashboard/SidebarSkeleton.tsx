export function SidebarSkeleton() {
  return (
    <div className="w-64 bg-primary h-screen flex flex-col">
      {/* Header skeleton */}
      <div className="p-2">
        <div className="flex items-center gap-2 rounded-md p-2">
          <div className="h-8 w-8 bg-white/20 rounded-full animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-white/20 rounded animate-pulse w-16" />
            <div className="h-3 bg-white/20 rounded animate-pulse w-24" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Navegación section */}
        <div className="space-y-2">
          <div className="h-8 flex items-center px-2">
            <div className="h-4 bg-white/20 rounded animate-pulse w-20" />
          </div>
          <div className="space-y-1">
            {Array.from({ length: 6 }, (_, i) => `nav-skeleton-item-${i}`).map(
              (id) => (
                <div key={id} className="flex items-center gap-2 h-8 px-2">
                  <div className="h-4 w-4 bg-white/20 rounded animate-pulse flex-shrink-0" />
                  <div className="h-4 bg-white/20 rounded animate-pulse flex-1" />
                </div>
              )
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="mx-2 border-t border-white/20" />

        {/* Bonos section */}
        <div className="space-y-2">
          <div className="h-8 flex items-center px-2">
            <div className="h-4 bg-white/20 rounded animate-pulse w-16" />
          </div>
          <div className="space-y-1">
            {Array.from(
              { length: 3 },
              (_, i) => `bonus-skeleton-item-${i}`
            ).map((id) => (
              <div key={id} className="flex items-center gap-2 h-8 px-2">
                <div className="h-4 w-4 bg-white/20 rounded animate-pulse flex-shrink-0" />
                <div className="h-4 bg-white/20 rounded animate-pulse flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="mx-2 border-t border-white/20" />

        {/* Gestión section */}
        <div className="space-y-2">
          <div className="h-8 flex items-center px-2">
            <div className="h-4 bg-white/20 rounded animate-pulse w-28" />
          </div>
          <div className="space-y-1">
            {Array.from(
              { length: 6 },
              (_, i) => `management-skeleton-item-${i}`
            ).map((id) => (
              <div key={id} className="flex items-center gap-2 h-8 px-2">
                <div className="h-4 w-4 bg-white/20 rounded animate-pulse flex-shrink-0" />
                <div className="h-4 bg-white/20 rounded animate-pulse flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="p-2 border-t border-white/20">
        <div className="flex items-center gap-2 h-8 px-2">
          <div className="h-4 w-4 bg-white/20 rounded animate-pulse flex-shrink-0" />
          <div className="h-4 bg-white/20 rounded animate-pulse flex-1" />
        </div>
      </div>
    </div>
  );
}
