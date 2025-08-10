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
  
  const stats = {
    teacherWorkload: {}
  };
  
  // Teacher workload only
  allocations.forEach(allocation => {
    if (allocation.teacherId) {
      if (!stats.teacherWorkload[allocation.teacherId]) {
        stats.teacherWorkload[allocation.teacherId] = 0;
      }
      stats.teacherWorkload[allocation.teacherId]++;
    }
  });
  
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
  console.log('\n📈 TEACHER WORKLOAD STATISTICS');
  console.log('===============================');
  
  console.log('\n👨‍🏫 Teacher Workload (All Teachers):');
  const allTeachers = Object.entries(stats.teacherWorkload)
    .sort(([,a], [,b]) => b - a);
  
  if (allTeachers.length === 0) {
    console.log('   No teacher assignments found');
  } else {
    allTeachers.forEach(([teacherId, count]) => {
      console.log(`   ${teacherId}: ${count} classes`);
    });
    
    // Show summary statistics
    const workloads = allTeachers.map(([,count]) => count);
    const avgWorkload = (workloads.reduce((a, b) => a + b, 0) / workloads.length).toFixed(1);
    const maxWorkload = Math.max(...workloads);
    const minWorkload = Math.min(...workloads);
    
    console.log(`\n   Summary:`);
    console.log(`   • Total Teachers: ${allTeachers.length}`);
    console.log(`   • Average Classes per Teacher: ${avgWorkload}`);
    console.log(`   • Maximum Classes: ${maxWorkload}`);
    console.log(`   • Minimum Classes: ${minWorkload}`);
  }
  
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
