"use client"

import * as React from "react"
import { FilterComponent } from "./FilterComponent"
import { useFilterState, applyFilters } from "@/hooks/useFilterState"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilterComponentWithHookProps<T extends { type: string; capacity: number }> {
  data: T[]
  onFilteredDataChange?: (filteredData: T[]) => void
  minCapacity?: number
  maxCapacity?: number
  persistenceKey?: string
  className?: string
  children?: (filteredData: T[]) => React.ReactNode
}

function FilterComponentWithHook<T extends { type: string; capacity: number }>({
  data,
  onFilteredDataChange,
  minCapacity = 0,
  maxCapacity = 200,
  persistenceKey = "default",
  className,
  children
}: FilterComponentWithHookProps<T>) {
  const {
    filterState,
    setFilterType,
    setCapacity,
    resetFilters,
    saveFiltersToJson,
  } = useFilterState({
    minCapacity,
    maxCapacity,
    persistenceKey
  })

  // Apply filters to data
  const filteredData = React.useMemo(() => {
    return applyFilters(data, filterState)
  }, [data, filterState])

  // Notify parent component of filtered data changes
  React.useEffect(() => {
    onFilteredDataChange?.(filteredData)
  }, [filteredData, onFilteredDataChange])

  const handleSaveFilters = async () => {
    try {
      await saveFiltersToJson()
      // You could add a toast notification here
      console.log("Filters saved successfully!")
    } catch (error) {
      console.error("Failed to save filters:", error)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <FilterComponent
        filterType={filterState.filterType}
        onFilterTypeChange={setFilterType}
        capacity={filterState.capacity}
        onCapacityChange={setCapacity}
        minCapacity={minCapacity}
        maxCapacity={maxCapacity}
      />
      
      <div className="flex space-x-2">
        <Button 
          onClick={resetFilters} 
          variant="outline" 
          size="sm"
        >
          Reset Filters
        </Button>
        <Button 
          onClick={handleSaveFilters} 
          variant="secondary" 
          size="sm"
        >
          Save Preferences
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} items
      </div>

      {children && children(filteredData)}
    </div>
  )
}

export { FilterComponentWithHook }
