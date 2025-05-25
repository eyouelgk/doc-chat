"use client"

import { Skeleton } from "@/app/components/ui/skeleton"

function DocumentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-muted-foreground bg-muted/50 border-b border-border">
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Created</div>
          <div className="col-span-4 text-right">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
            >
              <div className="col-span-5 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="col-span-3">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="col-span-4 flex justify-end gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default DocumentsSkeleton
