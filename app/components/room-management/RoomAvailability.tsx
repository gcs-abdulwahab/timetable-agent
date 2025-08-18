'use client';


import React, { useEffect, useState } from 'react';
import { Room, Subject, Teacher, TimetableEntry, allocations as staticAllocations, rooms as staticRooms, semesters as staticSemesters, subjects as staticSubjects, teachers as staticTeachers, timeSlots } from '../data';




interface RoomAvailabilityProps {
  selectedRoomId?: string;
}

const RoomAvailability: React.FC<RoomAvailabilityProps> = ({ selectedRoomId }) => {
  const [mounted, setMounted] = useState(false);
  const [rooms] = useState<Room[]>(staticRooms);
  const [allocations] = useState<TimetableEntry[]>(staticAllocations);
  const [loading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>(selectedRoomId || '');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [semesters] = useState<{ id: string; name: string }[]>(staticSemesters);
  const [subjects] = useState<Subject[]>(staticSubjects);
  const [teachers] = useState<Teacher[]>(staticTeachers);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // No API fetch, use static data
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set initial selected room if provided
  useEffect(() => {
    if (selectedRoomId && rooms.length > 0) {
      setSelectedRoom(selectedRoomId);
    }
  }, [selectedRoomId, rooms]);

  const getRoomOccupancy = (roomName: string, timeSlotId: string, day: string): TimetableEntry[] => {
    return allocations.filter(entry => 
      entry.room === roomName && 
      entry.timeSlotId === timeSlotId && 
      entry.day === day
    );
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || subjectId;
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || teacherId;
  };

  const getSemesterName = (semesterId: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester?.name || semesterId;
  };

  const isRoomAvailable = (roomName: string, timeSlotId: string, day: string): boolean => {
    return getRoomOccupancy(roomName, timeSlotId, day).length === 0;
  };

  const getCurrentRoom = () => {
    return rooms.find(r => r.id === selectedRoom);
  };

  if (!mounted || loading) {
    return <div className="p-6">Loading room availability and allocation data...</div>;
  }

  const currentRoom = getCurrentRoom();

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Availability</h2>
        
        {/* Room Selection */}
        <div className="mb-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a room...</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.type} (Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Information */}
        {currentRoom && (
          <div className="p-4 rounded-lg mb-6 bg-gray-50 border-l-4 border-gray-300">
            <h3 className="text-lg font-semibold mb-2">{currentRoom.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Type:</span> {currentRoom.type}
              </div>
              <div>
                <span className="font-medium">Capacity:</span> {currentRoom.capacity}
              </div>
              <div>
                <span className="font-medium">Building:</span> {currentRoom.building || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Floor:</span> {currentRoom.floor || 'N/A'}
              </div>
              
              <div>
                <span className="font-medium">Projector:</span> {currentRoom.hasProjector ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">AC:</span> {currentRoom.hasAC ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Shared:</span> {currentRoom.availableForOtherDepartments ? 'Yes' : 'No'}
              </div>
            </div>
            {currentRoom.description && (
              <div className="mt-2">
                <span className="font-medium">Description:</span> {currentRoom.description}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedRoom && currentRoom ? (
        <div>

          {/* Weekly Time Slot Availability */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Time Slot</th>
                  {days.map(day => (
                    <th key={day} className="border border-gray-300 px-4 py-2 text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.id}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      Period {slot.period}<br/>
                      <span className="text-sm text-gray-600">{slot.start} - {slot.end}</span>
                    </td>
                    {days.map(day => {
                      const isAvailable = isRoomAvailable(currentRoom.name, slot.id, day);
                      const occupancy = getRoomOccupancy(currentRoom.name, slot.id, day);
                      
                      return (
                        <td key={day} className={`border border-gray-300 px-2 py-2 text-center text-xs ${
                          isAvailable ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {isAvailable ? (
                            <span className="text-green-800 font-medium">Available</span>
                          ) : (
                            <div className="space-y-1">
                              {occupancy.map((entry, index) => (
                                <div key={index} className="text-red-800">
                                  <div className="font-medium">{getSubjectName(entry.subjectId)}</div>
                                  <div>{getTeacherName(entry.teacherId)}</div>
                                  <div className="text-xs text-red-600 mt-1">{getSemesterName(entry.semesterId)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Weekly Availability Summary */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Weekly Availability Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {days.map(day => {
                const availableSlots = timeSlots.filter(slot => 
                  isRoomAvailable(currentRoom.name, slot.id, day)
                ).length;
                const totalSlots = timeSlots.length;
                const occupiedSlots = totalSlots - availableSlots;
                
                return (
                  <div key={day} className="text-center">
                    <div className="font-medium text-blue-800">{day}</div>
                    <div className="text-green-600">{availableSlots} Available</div>
                    <div className="text-red-600">{occupiedSlots} Occupied</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg mb-2">Select a room to view its availability</div>
          <div className="text-sm">Choose from {rooms.length} available rooms</div>
        </div>
      )}
    </div>
  );
};

export default RoomAvailability;
