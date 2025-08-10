import { Room } from '@/app/components/data';

/**
 * Room lookup result interface
 */
export interface RoomLookupResult {
  success: boolean;
  roomId?: string;
  room?: Room;
  normalizedName?: string;
  originalName: string;
  error?: string;
  matchType?: 'exact' | 'normalized' | 'altName' | 'regex' | 'not_found';
}

/**
 * Room validation result interface
 */
export interface RoomValidationResult {
  success: boolean;
  foundRooms: Array<{
    originalName: string;
    normalizedName: string;
    roomId: string;
    room: Room;
    matchType: 'exact' | 'normalized' | 'altName' | 'regex';
  }>;
  missingRooms: Array<{
    originalName: string;
    normalizedName: string;
    error: string;
  }>;
  summary: {
    total: number;
    found: number;
    missing: number;
  };
}

/**
 * Normalizes room name for consistent matching
 * - Case-insensitive match
 * - Strip leading "Room", spaces, and punctuation
 * - Accept alphanumeric codes (e.g., B12, B14, B18, B24, 4A)
 * 
 * Examples:
 * - "Room 4a" → "4A"
 * - "room B-12" → "B12"  
 * - "  R-6  " → "R6"
 * - "b 14" → "B14"
 */
export function normalizeRoomName(roomName: string): string {
  if (!roomName || typeof roomName !== 'string') {
    return '';
  }

  let normalized = roomName.trim();
  
  // Remove leading "Room" (case insensitive)
  normalized = normalized.replace(/^room\s*/i, '');
  
  // Remove common punctuation and normalize spaces
  normalized = normalized.replace(/[^\w\s]/g, ''); // Remove punctuation except word chars and spaces
  normalized = normalized.replace(/\s+/g, ''); // Remove all spaces
  
  // Convert to uppercase for consistency
  normalized = normalized.toUpperCase();
  
  return normalized;
}

/**
 * Loads rooms from JSON file
 */
export async function loadRoomsFromFile(): Promise<Room[]> {
  try {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    const roomsPath = path.join(process.cwd(), 'data', 'rooms.json');
    const roomsData = await fs.readFile(roomsPath, 'utf-8');
    return JSON.parse(roomsData) as Room[];
  } catch (error) {
    throw new Error(`Failed to load rooms data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a room lookup map from rooms array
 */
export function createRoomLookupMap(rooms: Room[]): Map<string, Room> {
  const lookupMap = new Map<string, Room>();
  
  for (const room of rooms) {
    // Add exact name mapping
    lookupMap.set(room.name.toLowerCase(), room);
    
    // Add normalized name mapping  
    const normalizedName = normalizeRoomName(room.name);
    if (normalizedName && normalizedName !== room.name.toLowerCase()) {
      lookupMap.set(normalizedName.toLowerCase(), room);
    }
    
    // Add ID mapping (in case someone searches by ID)
    lookupMap.set(room.id.toLowerCase(), room);
    
    // Add alternative mappings based on room patterns
    addAlternativeMapping(room, lookupMap);
  }
  
  return lookupMap;
}

/**
 * Adds alternative mappings for a room based on common patterns
 */
function addAlternativeMapping(room: Room, lookupMap: Map<string, Room>): void {
  const name = room.name;
  
  // For "R-X" rooms, also map to "RX" and "R X"
  if (name.match(/^R-\d+$/i)) {
    const number = name.replace(/^R-/i, '');
    lookupMap.set(`R${number}`.toLowerCase(), room);
    lookupMap.set(`R ${number}`.toLowerCase(), room);
  }
  
  // For "BX" rooms, also map to "B-X" and "B X"
  if (name.match(/^B\d+$/i)) {
    const number = name.replace(/^B/i, '');
    lookupMap.set(`B-${number}`.toLowerCase(), room);
    lookupMap.set(`B ${number}`.toLowerCase(), room);
  }
  
  // For numeric-only names, add variations
  if (name.match(/^\d+$/)) {
    lookupMap.set(`ROOM${name}`.toLowerCase(), room);
    lookupMap.set(`ROOM ${name}`.toLowerCase(), room);
  }
}

/**
 * Looks up a room by name using various matching strategies
 */
export function lookupRoom(roomName: string, lookupMap: Map<string, Room>): RoomLookupResult {
  const originalName = roomName;
  
  if (!roomName || typeof roomName !== 'string') {
    return {
      success: false,
      originalName,
      error: 'Invalid room name provided',
      matchType: 'not_found'
    };
  }
  
  const trimmedName = roomName.trim();
  if (!trimmedName) {
    return {
      success: false,
      originalName,
      error: 'Empty room name provided',
      matchType: 'not_found'
    };
  }
  
  // Strategy 1: Exact match (case-insensitive)
  let room = lookupMap.get(trimmedName.toLowerCase());
  if (room) {
    return {
      success: true,
      roomId: room.id,
      room,
      normalizedName: trimmedName,
      originalName,
      matchType: 'exact'
    };
  }
  
  // Strategy 2: Normalized match
  const normalizedName = normalizeRoomName(trimmedName);
  if (normalizedName) {
    room = lookupMap.get(normalizedName.toLowerCase());
    if (room) {
      return {
        success: true,
        roomId: room.id,
        room,
        normalizedName,
        originalName,
        matchType: 'normalized'
      };
    }
  }
  
  // Strategy 3: Try common variations and patterns
  const variations = generateRoomNameVariations(trimmedName);
  for (const variation of variations) {
    room = lookupMap.get(variation.toLowerCase());
    if (room) {
      return {
        success: true,
        roomId: room.id,
        room,
        normalizedName: variation,
        originalName,
        matchType: 'regex'
      };
    }
  }
  
  // Not found
  return {
    success: false,
    originalName,
    normalizedName: normalizedName || trimmedName,
    error: `Room "${originalName}" not found. Searched for variations: ${[trimmedName, normalizedName, ...variations].filter(Boolean).join(', ')}`,
    matchType: 'not_found'
  };
}

/**
 * Generates common variations of a room name for matching
 */
function generateRoomNameVariations(roomName: string): string[] {
  const variations: string[] = [];
  const normalized = normalizeRoomName(roomName);
  
  // Add the normalized version
  if (normalized && normalized !== roomName) {
    variations.push(normalized);
  }
  
  // If it looks like "4A" or "4a", try variations
  const alphanumericMatch = roomName.match(/^(\d+)([a-zA-Z]+)$/);
  if (alphanumericMatch) {
    const [, number, letter] = alphanumericMatch;
    variations.push(
      `${number}${letter.toUpperCase()}`,
      `${number}${letter.toLowerCase()}`,
      `ROOM${number}${letter.toUpperCase()}`,
      `R${number}${letter.toUpperCase()}`,
      `ROOM-${number}${letter.toUpperCase()}`
    );
  }
  
  // If it's just a number, try various prefixes
  if (/^\d+$/.test(normalized)) {
    variations.push(
      `ROOM${normalized}`,
      `R${normalized}`,
      `R-${normalized}`,
      `BS-${normalized}`
    );
  }
  
  // If it starts with B and has numbers, try variations
  if (/^B\d+$/i.test(normalized)) {
    const number = normalized.replace(/^B/i, '');
    variations.push(
      `B${number}`,
      `B-${number}`,
      `b${number}`,
      `b-${number}`
    );
  }
  
  return [...new Set(variations)]; // Remove duplicates
}

/**
 * Validates the presence of required rooms
 */
export async function validateRequiredRooms(
  requiredRoomNames: string[]
): Promise<RoomValidationResult> {
  const rooms = await loadRoomsFromFile();
  const lookupMap = createRoomLookupMap(rooms);
  
  const foundRooms: RoomValidationResult['foundRooms'] = [];
  const missingRooms: RoomValidationResult['missingRooms'] = [];
  
  for (const roomName of requiredRoomNames) {
    const result = lookupRoom(roomName, lookupMap);
    
    if (result.success && result.room) {
      foundRooms.push({
        originalName: result.originalName,
        normalizedName: result.normalizedName || roomName,
        roomId: result.roomId!,
        room: result.room,
        matchType: result.matchType as any
      });
    } else {
      missingRooms.push({
        originalName: result.originalName,
        normalizedName: result.normalizedName || roomName,
        error: result.error || 'Room not found'
      });
    }
  }
  
  return {
    success: missingRooms.length === 0,
    foundRooms,
    missingRooms,
    summary: {
      total: requiredRoomNames.length,
      found: foundRooms.length,
      missing: missingRooms.length
    }
  };
}

/**
 * Default list of required room names
 */
export const REQUIRED_ROOM_NAMES = [
  '1', '2', '4A', '62', '64', '79', '104', '110', '133', '135',
  'B12', 'B14', 'B18', 'B24'
];

/**
 * Validates all required rooms and returns a detailed report
 */
export async function validateAllRequiredRooms(): Promise<RoomValidationResult> {
  return validateRequiredRooms(REQUIRED_ROOM_NAMES);
}

/**
 * Gets room by ID
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
  const rooms = await loadRoomsFromFile();
  return rooms.find(room => room.id === roomId) || null;
}

/**
 * Gets all rooms
 */
export async function getAllRooms(): Promise<Room[]> {
  return loadRoomsFromFile();
}
