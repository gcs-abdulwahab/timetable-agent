#!/usr/bin/env node

/**
 * Validation Report Generator
 * 
 * Generates detailed validation reports with statistics and recommendations
 */

const fs = require('fs');
const path = require('path');
const { runValidation, validationResults } = require('./validate-timetable');

function generateDetailedReport() {
  console.log('📊 Generating detailed validation report...\n');
  
  // Run validation
  const success = runValidation();
  
  // Generate additional statistics
  const stats = generateStatistics();
  const recommendations = generateRecommendations();
  
  // Create report
  const report = {
    timestamp: new Date().toISOString(),
    validationResult: validationResults,
    additionalStats: stats,
    recommendations: recommendations
  };
  
  // Save to file
  const reportPath = path.join(__dirname, '..', 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print detailed summary
  printDetailedSummary(stats, recommendations);
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return success;
}

function generateStatistics() {
  const allocations = require(path.join(__dirname, '..', 'data', 'allocations.json'));
  const rooms = require(path.join(__dirname, '..', 'data', 'rooms.json'));
  const teachers = require(path.join(__dirname, '..', 'data', 'teachers.json'));
  const subjects = require(path.join(__dirname, '..', 'data', 'subjects.json'));
  const timeslots = require(path.join(__dirname, '..', 'data', 'timeslots.json'));
  
  const stats = {
    roomUtilization: {},
    teacherWorkload: {},
    timeSlotDistribution: {},
    dayDistribution: {},
    semesterDistribution: {},
    departmentDistribution: {},
    averages: {},
    efficiency: {}
  };
  
  // Room utilization
  allocations.forEach(allocation => {
    if (allocation.room) {
      if (!stats.roomUtilization[allocation.room]) {
        stats.roomUtilization[allocation.room] = 0;
      }
      stats.roomUtilization[allocation.room]++;
    }
  });
  
  // Teacher workload
  allocations.forEach(allocation => {
    if (allocation.teacherId) {
      if (!stats.teacherWorkload[allocation.teacherId]) {
        stats.teacherWorkload[allocation.teacherId] = 0;
      }
      stats.teacherWorkload[allocation.teacherId]++;
    }
  });
  
  // Time slot distribution
  allocations.forEach(allocation => {
    if (!stats.timeSlotDistribution[allocation.timeSlotId]) {
      stats.timeSlotDistribution[allocation.timeSlotId] = 0;
    }
    stats.timeSlotDistribution[allocation.timeSlotId]++;
  });
  
  // Day distribution
  allocations.forEach(allocation => {
    if (!stats.dayDistribution[allocation.day]) {
      stats.dayDistribution[allocation.day] = 0;
    }
    stats.dayDistribution[allocation.day]++;
  });
  
  // Semester distribution
  allocations.forEach(allocation => {
    if (!stats.semesterDistribution[allocation.semesterId]) {
      stats.semesterDistribution[allocation.semesterId] = 0;
    }
    stats.semesterDistribution[allocation.semesterId]++;
  });
  
  // Department distribution (based on subjects)
  allocations.forEach(allocation => {
    const subject = subjects.find(s => s.id === allocation.subjectId);
    if (subject && subject.departmentId) {
      if (!stats.departmentDistribution[subject.departmentId]) {
        stats.departmentDistribution[subject.departmentId] = 0;
      }
      stats.departmentDistribution[subject.departmentId]++;
    }
  });
  
  // Calculate averages
  const teacherWorkloads = Object.values(stats.teacherWorkload);
  const roomUtilizations = Object.values(stats.roomUtilization);
  
  stats.averages = {
    teacherWorkload: teacherWorkloads.length > 0 ? 
      (teacherWorkloads.reduce((a, b) => a + b, 0) / teacherWorkloads.length).toFixed(1) : 0,
    roomUtilization: roomUtilizations.length > 0 ? 
      (roomUtilizations.reduce((a, b) => a + b, 0) / roomUtilizations.length).toFixed(1) : 0,
    allocationsPerDay: (allocations.length / Object.keys(stats.dayDistribution).length).toFixed(1),
    allocationsPerTimeSlot: (allocations.length / timeslots.length).toFixed(1)
  };
  
  // Calculate efficiency metrics
  const totalPossibleSlots = rooms.length * timeslots.length * Object.keys(stats.dayDistribution).length;
  const allocatedSlots = allocations.filter(a => a.room).length;
  
  stats.efficiency = {
    roomUtilizationRate: totalPossibleSlots > 0 ? 
      ((allocatedSlots / totalPossibleSlots) * 100).toFixed(1) + '%' : '0%',
    teacherUtilizationRate: teachers.length > 0 ? 
      ((Object.keys(stats.teacherWorkload).length / teachers.length) * 100).toFixed(1) + '%' : '0%',
    averageClassSize: 'N/A', // Would need enrollment data
    peakUtilizationDay: Object.keys(stats.dayDistribution).reduce((a, b) => 
      stats.dayDistribution[a] > stats.dayDistribution[b] ? a : b, 'Monday'),
    peakUtilizationTimeSlot: Object.keys(stats.timeSlotDistribution).reduce((a, b) => 
      stats.timeSlotDistribution[a] > stats.timeSlotDistribution[b] ? a : b, 'ts1')
  };
  
  return stats;
}

function generateRecommendations() {
  const recommendations = [];
  
  if (validationResults.errors.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Data Integrity',
      issue: `${validationResults.errors.length} validation errors detected`,
      recommendation: 'Fix all validation errors before deploying to production',
      actions: [
        'Review error list in validation output',
        'Update data files to resolve missing references',
        'Fix scheduling conflicts'
      ]
    });
  }
  
  if (validationResults.warnings.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Data Quality',
      issue: `${validationResults.warnings.length} warnings detected`,
      recommendation: 'Address warnings to improve data quality',
      actions: [
        'Update room mappings in rooms.json',
        'Verify data consistency across files'
      ]
    });
  }
  
  // Add performance recommendations based on stats
  if (validationResults.stats.conflicts > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Scheduling',
      issue: 'Scheduling conflicts detected',
      recommendation: 'Resolve all room and teacher conflicts',
      actions: [
        'Reschedule conflicting classes',
        'Find alternative rooms or time slots',
        'Coordinate with department heads'
      ]
    });
  }
  
  if (validationResults.stats.uniqueRooms < validationResults.stats.totalAllocations / 10) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Resource Utilization',
      issue: 'Low room diversity - possible overutilization of some rooms',
      recommendation: 'Distribute classes across more rooms',
      actions: [
        'Review room capacity and features',
        'Consider using underutilized rooms',
        'Balance room assignments by department'
      ]
    });
  }
  
  if (validationResults.stats.uniqueTeachers < validationResults.stats.totalAllocations / 5) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Workload Distribution',
      issue: 'High teacher workload concentration',
      recommendation: 'Distribute teaching load more evenly',
      actions: [
        'Review teacher assignments',
        'Consider hiring additional faculty',
        'Optimize subject-teacher mappings'
      ]
    });
  }
  
  return recommendations;
}

function printDetailedSummary(stats, recommendations) {
  console.log('\n📈 DETAILED STATISTICS');
  console.log('=====================');
  
  console.log('\n🏢 Room Utilization (Top 5):');
  const topRooms = Object.entries(stats.roomUtilization)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  topRooms.forEach(([room, count]) => {
    console.log(`   ${room}: ${count} classes`);
  });
  
  console.log('\n👨‍🏫 Teacher Workload (Top 5):');
  const topTeachers = Object.entries(stats.teacherWorkload)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  topTeachers.forEach(([teacherId, count]) => {
    console.log(`   ${teacherId}: ${count} classes`);
  });
  
  console.log('\n📅 Day Distribution:');
  Object.entries(stats.dayDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([day, count]) => {
      console.log(`   ${day}: ${count} classes`);
    });
  
  console.log('\n⏰ Time Slot Distribution:');
  Object.entries(stats.timeSlotDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([timeSlot, count]) => {
      console.log(`   ${timeSlot}: ${count} classes`);
    });
  
  console.log('\n📊 Efficiency Metrics:');
  Object.entries(stats.efficiency).forEach(([metric, value]) => {
    const displayName = metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`   ${displayName}: ${value}`);
  });
  
  if (recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.category}`);
      console.log(`   Issue: ${rec.issue}`);
      console.log(`   Recommendation: ${rec.recommendation}`);
      console.log(`   Actions:`);
      rec.actions.forEach(action => {
        console.log(`     • ${action}`);
      });
    });
  }
}

// Run if called directly
if (require.main === module) {
  const success = generateDetailedReport();
  process.exit(success ? 0 : 1);
}

module.exports = { generateDetailedReport };
