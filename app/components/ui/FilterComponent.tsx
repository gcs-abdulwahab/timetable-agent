"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export interface FilterComponentProps {
  // Filter type state and handlers
  filterType: "inter" | "bs" | "both"
  onFilterTypeChange: (type: "inter" | "bs" | "both") => void
  
  // Capacity slider state and handlers
  capacity: number[]
  onCapacityChange: (capacity: number[]) => void
  
  // Optional configuration
  minCapacity?: number
  maxCapacity?: number
  className?: string
}

const FilterComponent = React.forwardRef<HTMLDivElement, FilterComponentProps>(
  ({ 
    filterType,
    onFilterTypeChange,
    capacity,
    onCapacityChange,
    minCapacity = 0,
    maxCapacity = 200,
    className,
    ...props
  }, ref) => {
    const filterButtons = [
      { value: "inter" as const, label: "Inter" },
      { value: "bs" as const, label: "BS" },
      { value: "both" as const, label: "Both" }
    ]

    return (
      <div
        ref={ref}
        className={cn("space-y-6 p-4 border rounded-lg bg-background", className)}
        {...props}
      >
        {/* Filter Type Buttons */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Filter Type
          </label>
          <div className="flex space-x-2">
            {filterButtons.map((button) => (
              <Button
                key={button.value}
                variant={filterType === button.value ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterTypeChange(button.value)}
                className={cn(
                  "transition-all duration-200",
                  filterType === button.value && "shadow-md"
                )}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Capacity Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">
              Capacity Range
            </label>
            <span className="text-sm text-muted-foreground">
              {capacity[0]} - {capacity[1]}
            </span>
          </div>
          
          <div className="px-2">
            <Slider
              value={capacity}
              onValueChange={onCapacityChange}
              min={minCapacity}
              max={maxCapacity}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minCapacity}</span>
            <span>{maxCapacity}</span>
          </div>
        </div>
      </div>
    )
  }
)
FilterComponent.displayName = "FilterComponent"

export { FilterComponent }
