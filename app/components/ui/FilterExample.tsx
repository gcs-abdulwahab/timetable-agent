"use client"

import * as React from "react"
import { FilterComponent } from "./FilterComponent"
import { Button } from "@/components/ui/button"

// Example interface for the data you might be filtering
interface FilterableItem {
  id: string
  name: string
  type: "inter" | "bs" | "both"
  capacity: number
}

// Example data - replace with your actual data source
const exampleData: FilterableItem[] = [
  { id: "1", name: "Room A", type: "inter", capacity: 50 },
  { id: "2", name: "Room B", type: "bs", capacity: 75 },
  { id: "3", name: "Room C", type: "both", capacity: 100 },
  { id: "4", name: "Room D", type: "inter", capacity: 25 },
  { id: "5", name: "Room E", type: "bs", capacity: 150 },
]

export default function FilterExample() {
  // Filter state
  const [filterType, setFilterType] = React.useState<"inter" | "bs" | "both">("both")
  const [capacity, setCapacity] = React.useState<number[]>([0, 200])

  // Reset filters function
  const resetFilters = () => {
    setFilterType("both")
    setCapacity([0, 200])
  }

  // Apply filters to data
  const filteredData = React.useMemo(() => {
    return exampleData.filter((item) => {
      // Filter by type
      const typeMatch = 
        filterType === "both" || 
        item.type === filterType || 
        (filterType === "both" && (item.type === "inter" || item.type === "bs"))

      // Filter by capacity range
      const capacityMatch = item.capacity >= capacity[0] && item.capacity <= capacity[1]

      return typeMatch && capacityMatch
    })
  }, [filterType, capacity])

  // Function to save filter state to JSON (following your rule to use JSON files)
  const saveFiltersToJson = () => {
    const filterState = {
      filterType,
      capacity,
      appliedAt: new Date().toISOString()
    }
    
    // In a real app, you'd save this to a JSON file
    // For demo purposes, we'll just log it
    console.log("Filter state to save:", JSON.stringify(filterState, null, 2))
    
    // You could use this data to save to your data directory
    // Example: save to data/filter-preferences.json
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Filter Component Example</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filter Component */}
        <div className="lg:col-span-1">
          <FilterComponent
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            capacity={capacity}
            onCapacityChange={setCapacity}
            minCapacity={0}
            maxCapacity={200}
            className="sticky top-4"
          />
          
          {/* Additional Controls */}
          <div className="mt-4 space-y-2">
            <Button 
              onClick={resetFilters} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Reset Filters
            </Button>
            <Button 
              onClick={saveFiltersToJson} 
              variant="secondary" 
              size="sm" 
              className="w-full"
            >
              Save Filters
            </Button>
          </div>
        </div>

        {/* Filtered Results */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filtered Results</h2>
              <span className="text-sm text-muted-foreground">
                {filteredData.length} of {exampleData.length} items
              </span>
            </div>

            <div className="space-y-2">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg bg-card text-card-foreground"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {item.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Capacity: {item.capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items match the current filters.</p>
                  <Button 
                    onClick={resetFilters} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Filter State (for debugging) */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Current Filter State:</h3>
        <pre className="text-sm">
          {JSON.stringify({ filterType, capacity }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
