import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[260px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[120px] rounded-lg" />
          <Skeleton className="h-9 w-[100px] rounded-lg" />
          <Skeleton className="h-9 w-[110px] rounded-lg" />
        </div>
      </div>

      {/* KPI skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-3 w-[80px] mb-2" />
            <Skeleton className="h-7 w-[100px] mb-2" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-[160px]" />
              <Skeleton className="h-3 w-[200px] mt-1" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-6">
                <Skeleton className="h-5 w-[60px] rounded-full" />
                <Skeleton className="h-5 w-[70px] rounded-full" />
                <Skeleton className="h-5 w-[80px] rounded-full" />
              </div>
              <Skeleton className="h-[220px] w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom sections skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-[140px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3 w-[60%]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
