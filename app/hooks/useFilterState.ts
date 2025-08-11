"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * useFilterState Hook
 * 
 * Provides filter state management with JSON file persistence via API.
 * No localStorage usage - all persistence is handled server-side via /api/filters
 */

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
  saveFiltersToJson: () => Promise<{ success: boolean }>
  loadFiltersFromJson: () => Promise<void>
  clearSavedFilters: () => Promise<{ success: boolean }>
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

  // Save filter state to JSON file via API
  const saveFiltersToJson = useCallback(async () => {
    const dataToSave = {
      ...filterState,
      savedAt: new Date().toISOString(),
      version: "1.0"
    }

    try {
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to save filters`)
      }

      console.log('Filters saved successfully to JSON file')
      return { success: true }
    } catch (error) {
      console.error('Error saving filters:', error)
      throw new Error('Failed to save filters. Please check your connection and try again.')
    }
  }, [filterState, persistenceKey])

  // Load filter state from JSON file via API
  const loadFiltersFromJson = useCallback(async () => {
    try {
      const response = await fetch(`/api/filters?key=${encodeURIComponent(persistenceKey)}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data && typeof data.filterType === 'string' && Array.isArray(data.capacity)) {
          // Validate the loaded data before applying
          const validFilterTypes = ['inter', 'bs', 'both']
          if (validFilterTypes.includes(data.filterType) && 
              data.capacity.length === 2 && 
              typeof data.capacity[0] === 'number' && 
              typeof data.capacity[1] === 'number') {
            
            setFilterState({
              filterType: data.filterType,
              capacity: [
                Math.max(minCapacity, Math.min(data.capacity[0], maxCapacity)),
                Math.max(minCapacity, Math.min(data.capacity[1], maxCapacity))
              ]
            })
            console.log('Filters loaded successfully from JSON file')
          } else {
            console.warn('Invalid filter data format, using defaults')
          }
        }
      } else if (response.status === 404) {
        console.log('No saved filters found, using defaults')
      } else {
        console.error('Failed to load filters:', response.status)
      }
    } catch (error) {
      console.error('Error loading filters:', error)
      // Silently fail and keep default state - don't throw error on load
    }
  }, [persistenceKey, minCapacity, maxCapacity])

  // Clear saved filters from JSON file via API
  const clearSavedFilters = useCallback(async () => {
    try {
      const response = await fetch(`/api/filters?key=${encodeURIComponent(persistenceKey)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        console.log('Saved filters cleared successfully')
        return { success: true }
      } else if (response.status === 404) {
        console.log('No saved filters to clear')
        return { success: true }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to clear filters`)
      }
    } catch (error) {
      console.error('Error clearing saved filters:', error)
      throw new Error('Failed to clear saved filters. Please try again.')
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
    loadFiltersFromJson,
    clearSavedFilters
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
