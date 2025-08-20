import { useCallback, useState } from "react";
import type { TimetableEntry } from "../types";

export function useTimetableEntries(initialEntries: TimetableEntry[]) {
  const [entryList, setEntryList] = useState<TimetableEntry[]>(initialEntries);

  // Drag and drop handlers
  const handleDragStart = useCallback((entryId: number) => (event: React.DragEvent) => {
    event.dataTransfer.setData("entryId", entryId.toString());
  }, []);

  const handleDrop = useCallback((slotId: number) => async (event: React.DragEvent) => {
    event.preventDefault();
    const entryId = Number(event.dataTransfer.getData("entryId"));
    setEntryList(prev => prev.map(e => e.id === entryId ? { ...e, timeSlotId: slotId } : e));
    // Persist change to backend
    try {
      await fetch(`/api/timetable-entries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entryId, timeSlotId: slotId }),
      });
    } catch (err) {
      // Optionally handle error (e.g., show notification)
      console.error("Failed to update timeslot", err);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return {
    entryList,
    setEntryList,
    handleDragStart,
    handleDrop,
    handleDragOver,
  };
}
