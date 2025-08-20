'use client';

import React from 'react';

interface Stats {
  dayDistribution: Record<string, number>;
  teacherLoad: Record<string, number>;
  totalEntries: number;
}

interface StatisticsPanelProps {
  stats: Stats;
  conflictCount: number;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats, conflictCount }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Timetable Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Day Distribution</h3>
          <div className="space-y-1">
            {Object.entries(stats.dayDistribution).map(([day, count]) => (
              <div key={day} className="flex justify-between text-sm">
                <span>{day}:</span>
                <span>{count} classes</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Teacher Workload (Top 5)</h3>
          <div className="space-y-1">
            {Object.entries(stats.teacherLoad)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([teacherId, count]) => (
                <div key={teacherId} className="flex justify-between text-sm">
                  <span>{teacherId}:</span>
                  <span>{count} classes</span>
                </div>
              ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
          <div className="space-y-1 text-sm">
            <div>Total Entries: {stats.totalEntries}</div>
            <div>Conflicts: {conflictCount}</div>
            <div>Teachers: {Object.keys(stats.teacherLoad).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
