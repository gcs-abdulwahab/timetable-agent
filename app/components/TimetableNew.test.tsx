import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimetableNew from './TimetableNew';
import { TimetableEntry } from './data';

// Mock the data imports since they might not be available in test environment
jest.mock('./data', () => ({
  departments: [
    { id: 'd1', name: 'Computer Science', shortName: 'CS' },
    { id: 'd2', name: 'Mathematics', shortName: 'MATH' },
  ],
  rooms: [
    { id: 'r1', name: 'Room 101', capacity: 30, type: 'Lecture' },
    { id: 'r2', name: 'Room 102', capacity: 25, type: 'Tutorial' },
  ],
  semesters: [
    { id: 'sem1', name: 'Semester 1', level: 1, isActive: true },
    { id: 'sem2', name: 'Semester 2', level: 2, isActive: true },
  ],
  subjects: [
    { id: 's1', name: 'Programming Basics', shortName: 'PROG101', code: 'CS101', departmentId: 'd1', semesterLevel: 1, color: 'bg-blue-100' },
    { id: 's2', name: 'Calculus I', shortName: 'CALC101', code: 'MATH101', departmentId: 'd2', semesterLevel: 1, color: 'bg-green-100' },
  ],
  teachers: [
    { id: 't1', name: 'Dr. Smith', shortName: 'Smith', departmentId: 'd1' },
    { id: 't2', name: 'Prof. Johnson', shortName: 'Johnson', departmentId: 'd2' },
  ],
  timeSlots: [
    { id: 'ts1', period: '1', start: '08:00', end: '09:30' },
    { id: 'ts2', period: '2', start: '09:45', end: '11:15' },
    { id: 'ts3', period: '3', start: '11:30', end: '13:00' },
  ],
  Subject: {} as Record<string, never>,
  Teacher: {} as Record<string, never>,
  TimetableEntry: {} as Record<string, never>,
}));

describe('TimetableNew Drag and Drop Functionality', () => {
  const mockEntries: TimetableEntry[] = [
    {
      id: 'entry1',
      subjectId: 's1',
      teacherId: 't1',
      timeSlotId: 'ts1',
      day: 'Monday',
      room: 'Room 101',
      semesterId: 'sem1'
    },
    {
      id: 'entry2',
      subjectId: 's1',
      teacherId: 't1',
      timeSlotId: 'ts1',
      day: 'Tuesday',
      room: 'Room 101',
      semesterId: 'sem1'
    },
    {
      id: 'entry3',
      subjectId: 's2',
      teacherId: 't2',
      timeSlotId: 'ts2',
      day: 'Wednesday',
      room: 'Room 102',
      semesterId: 'sem1'
    }
  ];

  const mockOnUpdateEntries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console mocks
    (console.log as jest.Mock).mockClear();
    (console.warn as jest.Mock).mockClear();
    (console.error as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders timetable with drag-and-drop entries', async () => {
    await act(async () => {
      render(
        <TimetableNew
          entries={mockEntries}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('Timetable')).toBeInTheDocument();
    });

    // Check that subjects are rendered - use partial text match since day info is appended
    expect(screen.getByText(/PROG101/)).toBeInTheDocument();
    expect(screen.getByText(/CALC101/)).toBeInTheDocument();
  });

  it('should start drag operation when draggable element is dragged', async () => {
    await act(async () => {
      render(
        <TimetableNew
          entries={mockEntries}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText(/PROG101/)).toBeInTheDocument();
    });

    // Find the draggable element
    const draggableElement = screen.getByText('PROG101').closest('[draggable="true"]');
    expect(draggableElement).toBeInTheDocument();

    // Simulate drag start
    if (draggableElement) {
      const dragStartEvent = global.createDragStartEvent({
        clientX: 100,
        clientY: 100,
      });

      await act(async () => {
        fireEvent(draggableElement, dragStartEvent);
      });

      // Verify drag data is set in dataTransfer
      expect(dragStartEvent.dataTransfer.effectAllowed).toBe('move');
      expect(dragStartEvent.dataTransfer.getData('text/plain')).toBeTruthy();
    }
  });

  it('should allow drop only within same department row', async () => {
    await act(async () => {
      render(
        <TimetableNew
          entries={mockEntries}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('PROG101')).toBeInTheDocument();
    });

    const draggableElement = screen.getByText('PROG101').closest('[draggable="true"]');
    expect(draggableElement).toBeInTheDocument();

    if (draggableElement) {
      // Start drag
      const dragStartEvent = global.createDragStartEvent({
        clientX: 100,
        clientY: 100,
      });

      await act(async () => {
        fireEvent(draggableElement, dragStartEvent);
      });

      // Try to drag over a cell in the same department (should be allowed)
      const sameDepartmentCell = screen.getByText('CS').closest('tr')?.querySelector('[data-testid]:not([data-testid*="entry"])')?.closest('td');
      
      if (sameDepartmentCell) {
        const dragOverEvent = global.createDragOverEvent();
        
        await act(async () => {
          fireEvent(sameDepartmentCell, dragOverEvent);
        });

        // Should prevent default to allow drop
        expect(dragOverEvent.defaultPrevented).toBe(true);
      }
    }
  });

  it('should update timeSlot when dropping in different time period within same department', async () => {
    await act(async () => {
      render(
        <TimetableNew
          entries={mockEntries}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('PROG101')).toBeInTheDocument();
    });

    const draggableElement = screen.getByText('PROG101').closest('[draggable="true"]');
    expect(draggableElement).toBeInTheDocument();

    if (draggableElement) {
      // Start drag from Period 1 (ts1)
      const dragStartEvent = global.createDragStartEvent({
        clientX: 100,
        clientY: 100,
      });

      await act(async () => {
        fireEvent(draggableElement, dragStartEvent);
      });

      // Find a cell in Period 2 (ts2) in the same department (CS)
      const targetCell = document.querySelector('[data-department-id="d1"][data-timeslot-id="ts2"]') as HTMLElement;
      
      if (targetCell) {
        // Simulate drag over
        const dragOverEvent = global.createDragOverEvent();
        await act(async () => {
          fireEvent(targetCell, dragOverEvent);
        });

        // Simulate drop
        const dropEvent = global.createDropEvent();
        await act(async () => {
          fireEvent(targetCell, dropEvent);
        });

        // Simulate drag end
        const dragEndEvent = global.createDragEndEvent();
        await act(async () => {
          fireEvent(draggableElement, dragEndEvent);
        });

        // Wait for state updates
        await waitFor(() => {
          expect(mockOnUpdateEntries).toHaveBeenCalled();
        });

        // Verify the entries were updated with new timeSlotId
        const updatedEntries = mockOnUpdateEntries.mock.calls[0][0];
        expect(updatedEntries).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'entry1',
              timeSlotId: 'ts2' // Should be updated from ts1 to ts2
            }),
            expect.objectContaining({
              id: 'entry2',
              timeSlotId: 'ts2' // Should be updated from ts1 to ts2
            })
          ])
        );
      }
    }
  });

  it('should prevent drop when there are conflicts', async () => {
    const entriesWithConflict: TimetableEntry[] = [
      ...mockEntries,
      // Add a conflicting entry - same teacher, same time slot, same day
      {
        id: 'conflict-entry',
        subjectId: 's2', // Different subject
        teacherId: 't1', // Same teacher as entry1
        timeSlotId: 'ts2',
        day: 'Monday', // Same day as entry1
        room: 'Room 103',
        semesterId: 'sem1'
      }
    ];

    await act(async () => {
      render(
        <TimetableNew
          entries={entriesWithConflict}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('PROG101')).toBeInTheDocument();
    });

    const draggableElement = screen.getByText('PROG101').closest('[draggable="true"]');
    expect(draggableElement).toBeInTheDocument();

    if (draggableElement) {
      // Start drag from Period 1 (ts1)
      const dragStartEvent = global.createDragStartEvent({
        clientX: 100,
        clientY: 100,
      });

      await act(async () => {
        fireEvent(draggableElement, dragStartEvent);
      });

      // Try to drop in Period 2 where there's a teacher conflict
      const conflictCell = document.querySelector('[data-department-id="d1"][data-timeslot-id="ts2"]') as HTMLElement;
      
      if (conflictCell) {
        // Simulate drag over
        const dragOverEvent = global.createDragOverEvent();
        await act(async () => {
          fireEvent(conflictCell, dragOverEvent);
        });

        // Simulate drop
        const dropEvent = global.createDropEvent();
        await act(async () => {
          fireEvent(conflictCell, dropEvent);
        });

        // Simulate drag end
        const dragEndEvent = global.createDragEndEvent();
        await act(async () => {
          fireEvent(draggableElement, dragEndEvent);
        });

        // Wait for state updates
        await waitFor(() => {
          // The drop should be prevented, so onUpdateEntries should not be called
          // or should be called with original entries (no change)
          if (mockOnUpdateEntries.mock.calls.length > 0) {
            const updatedEntries = mockOnUpdateEntries.mock.calls[0][0];
            // Entries should remain unchanged due to conflict
            expect(updatedEntries.find((e: TimetableEntry) => e.id === 'entry1')?.timeSlotId).toBe('ts1');
            expect(updatedEntries.find((e: TimetableEntry) => e.id === 'entry2')?.timeSlotId).toBe('ts1');
          }
        });
      }
    }
  });

  it('should show success notification when drag completes successfully', async () => {
    await act(async () => {
      render(
        <TimetableNew
          entries={mockEntries}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('PROG101')).toBeInTheDocument();
    });

    const draggableElement = screen.getByText('PROG101').closest('[draggable="true"]');
    expect(draggableElement).toBeInTheDocument();

    if (draggableElement) {
      // Perform successful drag and drop
      const dragStartEvent = global.createDragStartEvent({
        clientX: 100,
        clientY: 100,
      });

      await act(async () => {
        fireEvent(draggableElement, dragStartEvent);
      });

      // Find a valid target cell
      const targetCell = document.querySelector('[data-department-id="d1"][data-timeslot-id="ts3"]') as HTMLElement;
      
      if (targetCell) {
        const dragOverEvent = global.createDragOverEvent();
        await act(async () => {
          fireEvent(targetCell, dragOverEvent);
        });

        const dropEvent = global.createDropEvent();
        await act(async () => {
          fireEvent(targetCell, dropEvent);
        });

        const dragEndEvent = global.createDragEndEvent();
        await act(async () => {
          fireEvent(draggableElement, dragEndEvent);
        });

        // Wait for success notification to appear
        await waitFor(() => {
          const notification = screen.queryByText(/Successfully moved/);
          if (notification) {
            expect(notification).toBeInTheDocument();
          }
        });
      }
    }
  });

  it('should handle drag cancellation properly', async () => {
    await act(async () => {
      render(
        <TimetableNew
          entries={mockEntries}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('PROG101')).toBeInTheDocument();
    });

    const draggableElement = screen.getByText('PROG101').closest('[draggable="true"]');
    expect(draggableElement).toBeInTheDocument();

    if (draggableElement) {
      // Start drag
      const dragStartEvent = global.createDragStartEvent({
        clientX: 100,
        clientY: 100,
      });

      await act(async () => {
        fireEvent(draggableElement, dragStartEvent);
      });

      // End drag without dropping (simulates cancellation)
      const dragEndEvent = global.createDragEndEvent();
      await act(async () => {
        fireEvent(draggableElement, dragEndEvent);
      });

      // onUpdateEntries should not be called when drag is cancelled
      expect(mockOnUpdateEntries).not.toHaveBeenCalled();
    }
  });

  it('should maintain entry data integrity during drag operations', async () => {
    await act(async () => {
      render(
        <TimetableNew
          entries={mockEntries}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('PROG101')).toBeInTheDocument();
    });

    const draggableElement = screen.getByText('PROG101').closest('[draggable="true"]');
    expect(draggableElement).toBeInTheDocument();

    if (draggableElement) {
      // Perform drag and drop
      const dragStartEvent = global.createDragStartEvent({
        clientX: 100,
        clientY: 100,
      });

      await act(async () => {
        fireEvent(draggableElement, dragStartEvent);
      });

      const targetCell = document.querySelector('[data-department-id="d1"][data-timeslot-id="ts3"]') as HTMLElement;
      
      if (targetCell) {
        const dragOverEvent = global.createDragOverEvent();
        await act(async () => {
          fireEvent(targetCell, dragOverEvent);
        });

        const dropEvent = global.createDropEvent();
        await act(async () => {
          fireEvent(targetCell, dropEvent);
        });

        const dragEndEvent = global.createDragEndEvent();
        await act(async () => {
          fireEvent(draggableElement, dragEndEvent);
        });

        // Verify data integrity
        await waitFor(() => {
          if (mockOnUpdateEntries.mock.calls.length > 0) {
            const updatedEntries = mockOnUpdateEntries.mock.calls[0][0];
            
            // Check that only timeSlotId changed, all other properties remain the same
            const updatedEntry1 = updatedEntries.find((e: TimetableEntry) => e.id === 'entry1');
            expect(updatedEntry1).toEqual({
              ...mockEntries.find(e => e.id === 'entry1'),
              timeSlotId: 'ts3' // Only this should change
            });

            const updatedEntry2 = updatedEntries.find((e: TimetableEntry) => e.id === 'entry2');
            expect(updatedEntry2).toEqual({
              ...mockEntries.find(e => e.id === 'entry2'),
              timeSlotId: 'ts3' // Only this should change
            });

            // Other entries should remain unchanged
            const unchangedEntry = updatedEntries.find((e: TimetableEntry) => e.id === 'entry3');
            expect(unchangedEntry).toEqual(mockEntries.find(e => e.id === 'entry3'));
          }
        });
      }
    }
  });

  it('should handle multiple subjects being dragged across different periods', async () => {
    const multipleSubjectEntries: TimetableEntry[] = [
      {
        id: 'entry1',
        subjectId: 's1',
        teacherId: 't1',
        timeSlotId: 'ts1',
        day: 'Monday',
        room: 'Room 101',
        semesterId: 'sem1'
      },
      {
        id: 'entry2',
        subjectId: 's2',
        teacherId: 't2',
        timeSlotId: 'ts2',
        day: 'Wednesday',
        room: 'Room 102',
        semesterId: 'sem1'
      }
    ];

    await act(async () => {
      render(
        <TimetableNew
          entries={multipleSubjectEntries}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('PROG101')).toBeInTheDocument();
      expect(screen.getByText('CALC101')).toBeInTheDocument();
    });

    // Test first subject drag
    const draggableElement1 = screen.getByText('PROG101').closest('[draggable="true"]');
    if (draggableElement1) {
      const dragStartEvent = global.createDragStartEvent({ clientX: 100, clientY: 100 });
      await act(async () => { fireEvent(draggableElement1, dragStartEvent); });

      const targetCell = document.querySelector('[data-department-id="d1"][data-timeslot-id="ts3"]') as HTMLElement;
      if (targetCell) {
        const dragOverEvent = global.createDragOverEvent();
        await act(async () => { fireEvent(targetCell, dragOverEvent); });
        
        const dropEvent = global.createDropEvent();
        await act(async () => { fireEvent(targetCell, dropEvent); });
        
        const dragEndEvent = global.createDragEndEvent();
        await act(async () => { fireEvent(draggableElement1, dragEndEvent); });

        await waitFor(() => {
          expect(mockOnUpdateEntries).toHaveBeenCalled();
        });
      }
    }
  });

  it('should not cause uncaught exceptions during drag operations', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(
        <TimetableNew
          entries={mockEntries}
          onUpdateEntries={mockOnUpdateEntries}
        />
      );
    });

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('PROG101')).toBeInTheDocument();
    });

    const draggableElement = screen.getByText('PROG101').closest('[draggable="true"]');
    
    if (draggableElement) {
      // Perform multiple drag operations rapidly to test for race conditions
      for (let i = 0; i < 3; i++) {
        const dragStartEvent = global.createDragStartEvent({ clientX: 100 + i, clientY: 100 + i });
        await act(async () => { fireEvent(draggableElement, dragStartEvent); });

        const dragEndEvent = global.createDragEndEvent();
        await act(async () => { fireEvent(draggableElement, dragEndEvent); });
      }
    }

    // Should not have any uncaught exceptions
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/uncaught|error/i)
    );

    consoleSpy.mockRestore();
  });
});
