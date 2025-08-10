const fs = require('fs').promises;
const path = require('path');

// Import rooms data
async function loadRoomsData() {
  const roomsPath = path.join(__dirname, 'data', 'rooms.json');
  const roomsData = await fs.readFile(roomsPath, 'utf-8');
  return JSON.parse(roomsData);
}

// Room normalizer function (copied from roomUtils.ts)
function normalizeRoomName(roomName) {
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

// Create lookup map
function createRoomLookupMap(rooms) {
  const lookupMap = new Map();
  
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

// Add alternative mappings
function addAlternativeMapping(room, lookupMap) {
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

// Generate variations
function generateRoomNameVariations(roomName) {
  const variations = [];
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

// Lookup room function
function lookupRoom(roomName, lookupMap) {
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

// Main test function
async function testRoomLookup() {
  console.log('🔍 Testing Room Lookup System...\n');
  
  try {
    const rooms = await loadRoomsData();
    const lookupMap = createRoomLookupMap(rooms);
    
    console.log(`📊 Loaded ${rooms.length} rooms from data/rooms.json`);
    console.log(`🗺️  Created lookup map with ${lookupMap.size} entries\n`);
    
    // List of required rooms to validate
    const requiredRooms = ['1', '2', '4A', '62', '64', '79', '104', '110', '133', '135', 'B12', 'B14', 'B18', 'B24'];
    
    console.log('🎯 Validating Required Rooms:\n');
    
    const results = {
      found: [],
      missing: []
    };
    
    for (const roomName of requiredRooms) {
      const result = lookupRoom(roomName, lookupMap);
      
      if (result.success) {
        results.found.push(result);
        console.log(`✅ FOUND: "${roomName}" → Room ${result.room.name} (${result.room.id}) [${result.matchType}]`);
      } else {
        results.missing.push(result);
        console.log(`❌ MISSING: ${result.error}`);
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`Total required rooms: ${requiredRooms.length}`);
    console.log(`Found: ${results.found.length}`);
    console.log(`Missing: ${results.missing.length}`);
    
    if (results.missing.length > 0) {
      console.log('\n🚨 Missing Rooms Details:');
      results.missing.forEach(result => {
        console.log(`- ${result.originalName}: ${result.error}`);
      });
      
      console.log('\n💡 Available rooms that might match:');
      results.missing.forEach(missingResult => {
        const possibleMatches = rooms.filter(room => 
          room.name.toLowerCase().includes(missingResult.originalName.toLowerCase()) ||
          room.name.toLowerCase().includes(missingResult.normalizedName?.toLowerCase() || '')
        );
        
        if (possibleMatches.length > 0) {
          console.log(`For "${missingResult.originalName}":`);
          possibleMatches.forEach(match => {
            console.log(`  - ${match.name} (${match.id})`);
          });
        }
      });
    } else {
      console.log('\n🎉 All required rooms found successfully!');
    }
    
    // Test some edge cases
    console.log('\n🧪 Testing Edge Cases:');
    const testCases = [
      'Room 1',
      'room b12',
      'B-14',
      'b 18',
      '  62  ',
      '4a',
      '4A',
      'ROOM104',
      'R-64',
      'invalid room',
      '',
      null,
      undefined
    ];
    
    testCases.forEach(testCase => {
      const result = lookupRoom(testCase, lookupMap);
      const status = result.success ? '✅' : '❌';
      console.log(`${status} "${testCase}" → ${result.success ? `${result.room.name} [${result.matchType}]` : result.error}`);
    });
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testRoomLookup();
