const fs = require('fs');

const rooms = JSON.parse(fs.readFileSync('data/rooms.json', 'utf-8'));

console.log('All available rooms:');
rooms.forEach(room => console.log(`- ${room.name} (${room.id})`));

console.log('\nSearching for potential matches for 4A, 110, 133:');

const searchTerms = ['4', '110', '133'];
searchTerms.forEach(term => {
  console.log(`\nFor ${term}:`);
  const matches = rooms.filter(r => 
    r.name.includes(term) || 
    r.id.includes(term) ||
    r.name.toLowerCase().includes(term.toLowerCase())
  );
  if (matches.length > 0) {
    matches.forEach(match => console.log(`  - ${match.name} (${match.id})`));
  } else {
    console.log('  No matches found');
  }
});

// Look for rooms that might be "4A" - check for rooms with "4" and letter
console.log('\nLooking for rooms with "4" and letter combinations:');
const fourLetterRooms = rooms.filter(r => /4[a-zA-Z]/i.test(r.name));
fourLetterRooms.forEach(match => console.log(`  - ${match.name} (${match.id})`));

// Check what room numbers are actually available
console.log('\nRoom numbers analysis:');
const numericRooms = rooms.filter(r => /^\d+$/.test(r.name)).map(r => parseInt(r.name)).sort((a,b) => a-b);
console.log('Pure numeric room names:', numericRooms.join(', '));

const bRooms = rooms.filter(r => /^B\d+$/i.test(r.name)).map(r => r.name).sort();
console.log('B-series rooms:', bRooms.join(', '));

const rRooms = rooms.filter(r => /^R-?\d+$/i.test(r.name)).map(r => r.name).sort();
console.log('R-series rooms:', rRooms.join(', '));
