const fs = require('fs');
const path = require('path');

// Read the current subjects.json file
const subjectsPath = path.join(__dirname, 'data', 'subjects.json');
const subjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));

// Map semesterLevel to semesterId
const semesterLevelToId = {
  1: 'sem1',
  3: 'sem3', 
  5: 'sem5',
  7: 'sem7'
};

// Update each subject to add semesterId if not present and remove duplicates
const updatedSubjects = subjects.map(subject => {
  // Remove any duplicate semesterId entries
  delete subject.semesterId;
  
  // Add the correct semesterId based on semesterLevel
  if (subject.semesterLevel && semesterLevelToId[subject.semesterLevel]) {
    subject.semesterId = semesterLevelToId[subject.semesterLevel];
  }
  
  return subject;
});

// Write the updated subjects back to the file
fs.writeFileSync(subjectsPath, JSON.stringify(updatedSubjects, null, 2));

console.log('Successfully added semesterId to all subjects!');
console.log(`Processed ${updatedSubjects.length} subjects`);
