"use client"

import { useState, useEffect, useCallback } from "react"

export interface FilterState {
  filterType: "inter" | "bs" | "both"
  capacity: number[]
}

interface UseFilterStateOptions {
  defaultFilterType?: "inter" | "bs" | "both"
  defaultCapacity?: number[]
  minCapacity?: number
  maxCapacity?: number
  persistenceKey?: string // Key for JSON file persistence
}

interface UseFilterStateReturn {
  filterState: FilterState
  setFilterType: (type: "inter" | "bs" | "both") => void
  setCapacity: (capacity: number[]) => void
  resetFilters: () => void
  saveFiltersToJson: () => Promise<void>
  loadFiltersFromJson: () => Promise<void>
}

export function useFilterState(options: UseFilterStateOptions = {}): UseFilterStateReturn {
  const {
    defaultFilterType = "both",
    defaultCapacity = [0, 200],
    minCapacity = 0,
    maxCapacity = 200,
    persistenceKey = "filter-preferences"
  } = options

  const [filterState, setFilterState] = useState<FilterState>({
    filterType: defaultFilterType,
    capacity: defaultCapacity
  })

  const setFilterType = useCallback((type: "inter" | "bs" | "both") => {
    setFilterState(prev => ({ ...prev, filterType: type }))
  }, [])

  const setCapacity = useCallback((capacity: number[]) => {
    // Ensure capacity is within bounds
    const boundedCapacity = [
      Math.max(minCapacity, Math.min(capacity[0], maxCapacity)),
      Math.max(minCapacity, Math.min(capacity[1], maxCapacity))
    ]
    setFilterState(prev => ({ ...prev, capacity: boundedCapacity }))
  }, [minCapacity, maxCapacity])

  const resetFilters = useCallback(() => {
    setFilterState({
      filterType: defaultFilterType,
      capacity: defaultCapacity
    })
  }, [defaultFilterType, defaultCapacity])

  // Save filter state to JSON file (following your rule to use JSON files)
  const saveFiltersToJson = useCallback(async () => {
    const dataToSave = {
      ...filterState,
      savedAt: new Date().toISOString(),
      version: "1.0"
    }

    try {
      // In a real Next.js app, you'd make an API call to save to the server
      const response = await fetch('/api/filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: persistenceKey,
          data: dataToSave
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save filters')
      }

      console.log('Filters saved successfully to JSON file')
    } catch (error) {
      console.error('Error saving filters:', error)
      // Fallback: save to browser's localStorage (though we avoid localStorage per your rule)
      // Instead, we could show a notification to the user
      alert('Failed to save filters. Please try again.')
    }
  }, [filterState, persistenceKey])

  // Load filter state from JSON file
  const loadFiltersFromJson = useCallback(async () => {
    try {
      const response = await fetch(`/api/filters?key=${persistenceKey}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.filterType && data.capacity) {
          setFilterState({
            filterType: data.filterType,
            capacity: data.capacity
          })
          console.log('Filters loaded successfully from JSON file')
        }
      }
    } catch (error) {
      console.error('Error loading filters:', error)
      // Silently fail and keep default state
    }
  }, [persistenceKey])

  // Load filters on component mount
  useEffect(() => {
    loadFiltersFromJson()
  }, [loadFiltersFromJson])

  return {
    filterState,
    setFilterType,
    setCapacity,
    resetFilters,
    saveFiltersToJson,
    loadFiltersFromJson
  }
}

// Utility function to apply filters to data
export function applyFilters<T extends { type: string; capacity: number }>(
  data: T[],
  filterState: FilterState
): T[] {
  return data.filter((item) => {
    // Filter by type
    const typeMatch = 
      filterState.filterType === "both" || 
      item.type === filterState.filterType

    // Filter by capacity range
    const capacityMatch = 
      item.capacity >= filterState.capacity[0] && 
      item.capacity <= filterState.capacity[1]

    return typeMatch && capacityMatch
  })
}
