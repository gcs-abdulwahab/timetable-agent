'use client';

import React, { useState, useEffect } from 'react';
import { Toggle } from '@/components/ui/toggle';

interface Semester {
  id: string;
  name: string;
  year: number;
  term: 'Spring' | 'Fall';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface SemesterToggleProps {
  semesters: Semester[];
  onSemestersUpdate: (semesters: Semester[]) => void;
  className?: string;
}

const SemesterToggle: React.FC<SemesterToggleProps> = ({
  semesters,
  onSemestersUpdate,
  className = ''
}) => {
  // Extract semester numbers from semester names
  const getSpringTermSemesters = () => {
    return semesters.filter(sem => sem.term === 'Spring').map(sem => {
      const match = sem.name.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
  };

  const getFallTermSemesters = () => {
    return semesters.filter(sem => sem.term === 'Fall').map(sem => {
      const match = sem.name.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
  };

  // Check if even/odd semesters are currently active
  const [evenActive, setEvenActive] = useState(false);
  const [oddActive, setOddActive] = useState(false);

  useEffect(() => {
    // Check current state based on active semesters
    const activeSemesters = semesters.filter(sem => sem.isActive);
    const activeSemesterNumbers = activeSemesters.map(sem => {
      const match = sem.name.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }).filter(num => num > 0);

    const hasEvenActive = activeSemesterNumbers.some(num => num % 2 === 0);
    const hasOddActive = activeSemesterNumbers.some(num => num % 2 === 1);

    setEvenActive(hasEvenActive);
    setOddActive(hasOddActive);
  }, [semesters]);

  const handleOddToggle = (isPressed: boolean) => {
    setOddActive(isPressed);
    
    const updatedSemesters = semesters.map(sem => {
      const match = sem.name.match(/\d+/);
      const semesterNumber = match ? parseInt(match[0], 10) : 0;
      
      // If it's an odd semester, update its active state
      if (semesterNumber > 0 && semesterNumber % 2 === 1) {
        return { ...sem, isActive: isPressed };
      }
      return sem;
    });

    // If enabling odd semesters and none exist, create default odd semesters
    if (isPressed && !updatedSemesters.some(sem => {
      const match = sem.name.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num % 2 === 1 && sem.isActive;
    })) {
      // Add default odd semesters (1, 3, 5, 7)
      const oddSemestersToAdd = [
        {
          id: `sem1_${Date.now()}`,
          name: 'Semester 1',
          year: 2024,
          term: 'Fall' as const,
          isActive: true,
          startDate: '2024-09-01',
          endDate: '2024-12-20'
        },
        {
          id: `sem3_${Date.now()}`,
          name: 'Semester 3',
          year: 2025,
          term: 'Spring' as const,
          isActive: true,
          startDate: '2025-01-15',
          endDate: '2025-05-15'
        },
        {
          id: `sem5_${Date.now()}`,
          name: 'Semester 5',
          year: 2025,
          term: 'Fall' as const,
          isActive: true,
          startDate: '2025-09-01',
          endDate: '2025-12-20'
        },
        {
          id: `sem7_${Date.now()}`,
          name: 'Semester 7',
          year: 2026,
          term: 'Spring' as const,
          isActive: true,
          startDate: '2026-01-15',
          endDate: '2026-05-15'
        }
      ];
      
      // Only add semesters that don't already exist
      const existingSemesterNumbers = new Set(updatedSemesters.map(sem => {
        const match = sem.name.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      }));
      
      const newSemesters = oddSemestersToAdd.filter(sem => {
        const match = sem.name.match(/\d+/);
        const num = match ? parseInt(match[0], 10) : 0;
        return !existingSemesterNumbers.has(num);
      });
      
      onSemestersUpdate([...updatedSemesters, ...newSemesters]);
    } else {
      onSemestersUpdate(updatedSemesters);
    }
  };

  const handleEvenToggle = (isPressed: boolean) => {
    setEvenActive(isPressed);
    
    const updatedSemesters = semesters.map(sem => {
      const match = sem.name.match(/\d+/);
      const semesterNumber = match ? parseInt(match[0], 10) : 0;
      
      // If it's an even semester, update its active state
      if (semesterNumber > 0 && semesterNumber % 2 === 0) {
        return { ...sem, isActive: isPressed };
      }
      return sem;
    });

    // If enabling even semesters and none exist, create default even semesters
    if (isPressed && !updatedSemesters.some(sem => {
      const match = sem.name.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num % 2 === 0 && sem.isActive;
    })) {
      // Add default even semesters (2, 4, 6, 8)
      const evenSemestersToAdd = [
        {
          id: `sem2_${Date.now()}`,
          name: 'Semester 2',
          year: 2025,
          term: 'Spring' as const,
          isActive: true,
          startDate: '2025-01-15',
          endDate: '2025-05-15'
        },
        {
          id: `sem4_${Date.now()}`,
          name: 'Semester 4',
          year: 2025,
          term: 'Fall' as const,
          isActive: true,
          startDate: '2025-09-01',
          endDate: '2025-12-20'
        },
        {
          id: `sem6_${Date.now()}`,
          name: 'Semester 6',
          year: 2026,
          term: 'Spring' as const,
          isActive: true,
          startDate: '2026-01-15',
          endDate: '2026-05-15'
        },
        {
          id: `sem8_${Date.now()}`,
          name: 'Semester 8',
          year: 2026,
          term: 'Fall' as const,
          isActive: true,
          startDate: '2026-09-01',
          endDate: '2026-12-20'
        }
      ];
      
      // Only add semesters that don't already exist
      const existingSemesterNumbers = new Set(updatedSemesters.map(sem => {
        const match = sem.name.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      }));
      
      const newSemesters = evenSemestersToAdd.filter(sem => {
        const match = sem.name.match(/\d+/);
        const num = match ? parseInt(match[0], 10) : 0;
        return !existingSemesterNumbers.has(num);
      });
      
      onSemestersUpdate([...updatedSemesters, ...newSemesters]);
    } else {
      onSemestersUpdate(updatedSemesters);
    }
  };

  const oddCount = semesters.filter(sem => {
    const match = sem.name.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 0;
    return num % 2 === 1 && sem.isActive;
  }).length;

  const evenCount = semesters.filter(sem => {
    const match = sem.name.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 0;
    return num % 2 === 0 && sem.isActive;
  }).length;

  return (
    <div className={`flex items-center gap-4 p-4 bg-gray-50 rounded-lg border ${className}`}>
      <div className="text-sm font-medium text-gray-700">
        Semester Activation:
      </div>
      
      <div className="flex items-center gap-2">
        <Toggle
          pressed={oddActive}
          onPressedChange={handleOddToggle}
          variant="outline"
          size="lg"
          className="flex flex-col items-center p-3 min-h-[80px] min-w-[120px] data-[state=on]:bg-blue-100 data-[state=on]:border-blue-500 data-[state=on]:text-blue-700"
        >
          <div className="text-lg font-semibold">Odd</div>
          <div className="text-xs opacity-70">1, 3, 5, 7</div>
          {oddCount > 0 && (
            <div className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5 mt-1">
              {oddCount} active
            </div>
          )}
        </Toggle>
        
        <Toggle
          pressed={evenActive}
          onPressedChange={handleEvenToggle}
          variant="outline"
          size="lg"
          className="flex flex-col items-center p-3 min-h-[80px] min-w-[120px] data-[state=on]:bg-green-100 data-[state=on]:border-green-500 data-[state=on]:text-green-700"
        >
          <div className="text-lg font-semibold">Even</div>
          <div className="text-xs opacity-70">2, 4, 6, 8</div>
          {evenCount > 0 && (
            <div className="text-xs bg-green-500 text-white rounded-full px-2 py-0.5 mt-1">
              {evenCount} active
            </div>
          )}
        </Toggle>
      </div>

      <div className="flex-1 text-xs text-gray-500">
        <div>• Toggle odd semesters (1st, 3rd, 5th, 7th)</div>
        <div>• Toggle even semesters (2nd, 4th, 6th, 8th)</div>
        <div>• Active semesters will be available for scheduling</div>
      </div>
    </div>
  );
};

export default SemesterToggle;
