import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILTERS_FILE = path.join(DATA_DIR, 'filter-preferences.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// GET: Load filter preferences
export async function GET(request: NextRequest) {
  try {
    await ensureDataDirectory()
    
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key') || 'default'
    
    try {
      const data = await fs.readFile(FILTERS_FILE, 'utf-8')
      const allFilters = JSON.parse(data)
      
      if (allFilters[key]) {
        return NextResponse.json(allFilters[key])
      } else {
        return NextResponse.json(null, { status: 404 })
      }
    } catch (error) {
      // File doesn't exist or is invalid JSON
      return NextResponse.json(null, { status: 404 })
    }
  } catch (error) {
    console.error('Error loading filters:', error)
    return NextResponse.json(
      { error: 'Failed to load filters' },
      { status: 500 }
    )
  }
}

// POST: Save filter preferences
export async function POST(request: NextRequest) {
  try {
    await ensureDataDirectory()
    
    const body = await request.json()
    const { key = 'default', data: filterData } = body
    
    if (!filterData) {
      return NextResponse.json(
        { error: 'No filter data provided' },
        { status: 400 }
      )
    }
    
    let allFilters = {}
    
    // Try to read existing filters
    try {
      const existingData = await fs.readFile(FILTERS_FILE, 'utf-8')
      allFilters = JSON.parse(existingData)
    } catch {
      // File doesn't exist or is invalid, start with empty object
    }
    
    // Update the specific key
    allFilters[key] = {
      ...filterData,
      updatedAt: new Date().toISOString()
    }
    
    // Save to file
    await fs.writeFile(FILTERS_FILE, JSON.stringify(allFilters, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving filters:', error)
    return NextResponse.json(
      { error: 'Failed to save filters' },
      { status: 500 }
    )
  }
}

// DELETE: Remove specific filter preferences
export async function DELETE(request: NextRequest) {
  try {
    await ensureDataDirectory()
    
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key') || 'default'
    
    try {
      const data = await fs.readFile(FILTERS_FILE, 'utf-8')
      const allFilters = JSON.parse(data)
      
      if (allFilters[key]) {
        delete allFilters[key]
        await fs.writeFile(FILTERS_FILE, JSON.stringify(allFilters, null, 2))
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: 'Filter key not found' },
          { status: 404 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Filter file not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error deleting filters:', error)
    return NextResponse.json(
      { error: 'Failed to delete filters' },
      { status: 500 }
    )
  }
}
