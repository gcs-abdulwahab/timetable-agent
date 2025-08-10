const fs = require('fs').promises;
const path = require('path');

// Import rooms data
async function loadRoomsData() {
  const roomsPath = path.join(__dirname, 'data', 'rooms.json');
  const roomsData = await fs.readFile(roomsPath, 'utf-8');
  return JSON.parse(roomsData);
}

// Room normalizer function
function normalizeRoomName(roomName) {
  if (!roomName || typeof roomName !== 'string') {
    return '';
  }
  let normalized = roomName.trim();
  normalized = normalized.replace(/^room\s*/i, '');
  normalized = normalized.replace(/[^\w\s]/g, '');
  normalized = normalized.replace(/\s+/g, '');
  normalized = normalized.toUpperCase();
  return normalized;
}

// Find similar rooms using fuzzy matching
function findSimilarRooms(targetName, rooms, maxSuggestions = 5) {
  const target = normalizeRoomName(targetName);
  const suggestions = [];
  
  for (const room of rooms) {
    const roomNorm = normalizeRoomName(room.name);
    
    // Calculate similarity score
    let score = 0;
    
    // Exact match gets highest score
    if (roomNorm === target) {
      score = 100;
    }
    // Contains target
    else if (roomNorm.includes(target)) {
      score = 80;
    }
    // Target contains room name
    else if (target.includes(roomNorm)) {
      score = 70;
    }
    // Edit distance based similarity
    else {
      const editDistance = calculateEditDistance(roomNorm, target);
      const maxLen = Math.max(roomNorm.length, target.length);
      score = Math.max(0, 60 - (editDistance / maxLen) * 60);
    }
    
    if (score > 20) { // Only suggest if similarity is reasonable
      suggestions.push({
        room,
        score,
        similarity: `${Math.round(score)}%`
      });
    }
  }
  
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions);
}

// Simple edit distance calculation
function calculateEditDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Main validation function
async function validateRoomsWithReport() {
  console.log('🏢 Room Validation and Analysis Report');
  console.log('=====================================\n');
  
  try {
    const rooms = await loadRoomsData();
    console.log(`📊 Dataset: ${rooms.length} rooms loaded from data/rooms.json\n`);
    
    // Required rooms to validate
    const requiredRooms = ['1', '2', '4A', '62', '64', '79', '104', '110', '133', '135', 'B12', 'B14', 'B18', 'B24'];
    
    console.log('🎯 Required Room Validation:');
    console.log('----------------------------\n');
    
    const results = {
      found: [],
      missing: [],
      suggestions: {}
    };
    
    // Create lookup map for fast searching
    const lookupMap = new Map();
    for (const room of rooms) {
      lookupMap.set(room.name.toLowerCase(), room);
      lookupMap.set(normalizeRoomName(room.name).toLowerCase(), room);
      lookupMap.set(room.id.toLowerCase(), room);
    }
    
    // Validate each required room
    for (const roomName of requiredRooms) {
      let found = false;
      let matchedRoom = null;
      
      // Try exact match
      matchedRoom = lookupMap.get(roomName.toLowerCase()) || 
                   lookupMap.get(normalizeRoomName(roomName).toLowerCase());
      
      if (matchedRoom) {
        found = true;
        results.found.push({
          requested: roomName,
          found: matchedRoom.name,
          id: matchedRoom.id,
          building: matchedRoom.building
        });
        console.log(`✅ FOUND: "${roomName}" → ${matchedRoom.name} (${matchedRoom.id})`);
      } else {
        results.missing.push(roomName);
        
        // Find similar rooms
        const similar = findSimilarRooms(roomName, rooms, 3);
        results.suggestions[roomName] = similar;
        
        console.log(`❌ MISSING: "${roomName}" - Room not found in dataset`);
        if (similar.length > 0) {
          console.log(`   💡 Did you mean one of these?`);
          similar.forEach(s => {
            console.log(`      - ${s.room.name} (${s.room.id}) - ${s.similarity} similar`);
          });
        }
      }
    }
    
    // Summary
    console.log('\\n📈 Validation Summary:');
    console.log('======================');
    console.log(`Total required rooms: ${requiredRooms.length}`);
    console.log(`✅ Found: ${results.found.length}`);
    console.log(`❌ Missing: ${results.missing.length}`);
    console.log(`📊 Success rate: ${Math.round((results.found.length / requiredRooms.length) * 100)}%`);
    
    if (results.missing.length > 0) {
      console.log('\\n🚨 Action Required:');
      console.log('===================');
      console.log('The following rooms are missing from the dataset and need manual resolution:');
      
      results.missing.forEach(roomName => {
        console.log(`\\n📍 Missing Room: "${roomName}"`);
        console.log('   Options:');
        console.log('   1. Verify if this room actually exists in the institution');
        console.log('   2. Check if it goes by a different name');
        console.log('   3. Create the room in the dataset if it exists');
        console.log('   4. Update the required rooms list if it should not be included');
        
        if (results.suggestions[roomName] && results.suggestions[roomName].length > 0) {
          console.log('   🔍 Possible alternatives:');
          results.suggestions[roomName].forEach(s => {
            console.log(`      - ${s.room.name} (${s.room.id}) in ${s.room.building}`);
          });
        }
      });
    }
    
    // Dataset analysis
    console.log('\\n🏗️  Dataset Analysis:');
    console.log('=====================');
    
    const roomTypes = {};
    const buildings = {};
    const programTypes = {};
    
    rooms.forEach(room => {
      // Count by type
      roomTypes[room.type || 'Unknown'] = (roomTypes[room.type || 'Unknown'] || 0) + 1;
      
      // Count by building
      buildings[room.building || 'Unknown'] = (buildings[room.building || 'Unknown'] || 0) + 1;
      
      // Count by program types
      room.programTypes.forEach(pt => {
        programTypes[pt] = (programTypes[pt] || 0) + 1;
      });
    });
    
    console.log('\\n📊 Room Types:');
    Object.entries(roomTypes).sort(([,a], [,b]) => b - a).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} rooms`);
    });
    
    console.log('\\n🏢 Buildings:');
    Object.entries(buildings).sort(([,a], [,b]) => b - a).forEach(([building, count]) => {
      console.log(`   ${building}: ${count} rooms`);
    });
    
    console.log('\\n🎓 Program Types:');
    Object.entries(programTypes).sort(([,a], [,b]) => b - a).forEach(([program, count]) => {
      console.log(`   ${program}: ${count} rooms`);
    });
    
    // Room naming patterns
    console.log('\\n🏷️  Room Naming Patterns:');
    const patterns = {
      'R-series (R-X)': rooms.filter(r => /^R-\\d+$/i.test(r.name)).length,
      'B-series (BX)': rooms.filter(r => /^B\\d+$/i.test(r.name)).length,
      'Numeric only': rooms.filter(r => /^\\d+$/.test(r.name)).length,
      'Other patterns': rooms.filter(r => !/^(R-\\d+|B\\d+|\\d+)$/i.test(r.name)).length
    };
    
    Object.entries(patterns).forEach(([pattern, count]) => {
      if (count > 0) {
        console.log(`   ${pattern}: ${count} rooms`);
      }
    });
    
    // Recommendations
    console.log('\\n💡 Recommendations:');
    console.log('===================');
    
    if (results.missing.length > 0) {
      console.log('1. 🔍 Investigate missing rooms:');
      results.missing.forEach(room => {
        console.log(`   - Verify existence of room "${room}"`);
      });
      
      console.log('\\n2. 📝 Possible actions:');
      console.log('   - Add missing rooms to data/rooms.json if they exist');
      console.log('   - Update REQUIRED_ROOM_NAMES list to remove non-existent rooms');
      console.log('   - Consider using suggested alternatives');
    } else {
      console.log('✅ All required rooms found! The dataset is complete for the specified requirements.');
    }
    
    console.log('\\n3. 🔄 Keep room data synchronized:');
    console.log('   - Regular validation checks');
    console.log('   - Update room data when physical changes occur');
    console.log('   - Maintain consistent naming conventions');
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
  }
}

// Run the validation
validateRoomsWithReport();
