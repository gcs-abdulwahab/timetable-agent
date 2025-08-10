'use client';

import React, { useEffect, useState } from 'react';
import { Room, TimetableEntry, rooms as initialRooms, subjects, teachers, timeSlots, timetableEntries } from '../data';

const STORAGE_KEY = 'room-data';

// Function to get room type color
const getRoomTypeColor = (roomType: string) => {
  const typeColors = {
    'Laboratory': 'bg-purple-50 border-l-4 border-purple-400',
    'Classroom': 'bg-blue-50 border-l-4 border-blue-400',
    'Auditorium': 'bg-green-50 border-l-4 border-green-400',
    'Conference': 'bg-yellow-50 border-l-4 border-yellow-400',
    'Other': 'bg-gray-50 border-l-4 border-gray-400'
  };
  
  return typeColors[roomType as keyof typeof typeColors] || 'bg-gray-50 border-l-4 border-gray-400';
};

interface RoomAvailabilityProps {
  selectedRoomId?: string;
}

const RoomAvailability: React.FC<RoomAvailabilityProps> = ({ selectedRoomId }) => {
  const [mounted, setMounted] = useState(false);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState<string>(selectedRoomId || '');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Load rooms from localStorage after component mounts
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsedRooms = JSON.parse(stored);
          setRooms(parsedRooms);
        } catch (error) {
          console.error('Error parsing stored room data:', error);
        }
      }
    }
  }, []);

  // Set initial selected room if provided
  useEffect(() => {
    if (selectedRoomId && rooms.length > 0) {
      setSelectedRoom(selectedRoomId);
    }
  }, [selectedRoomId, rooms]);

  const getRoomOccupancy = (roomName: string, timeSlotId: string, day: string): TimetableEntry[] => {
    return timetableEntries.filter(entry => 
      entry.room === roomName && 
      entry.timeSlotId === timeSlotId && 
      entry.day === day
    );
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.shortName || subjectId;
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.shortName || teacherId;
  };

  const isRoomAvailable = (roomName: string, timeSlotId: string, day: string): boolean => {
    return getRoomOccupancy(roomName, timeSlotId, day).length === 0;
  };

  const getCurrentRoom = () => {
    return rooms.find(r => r.id === selectedRoom);
  };

  if (!mounted) {
    return <div className="p-6">Loading room availability...</div>;
  }

  const currentRoom = getCurrentRoom();

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Availability</h2>
        
        {/* Room and Day Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Day
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {days.map(day => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Information */}
        {currentRoom && (
          <div className={`p-4 rounded-lg mb-6 ${getRoomTypeColor(currentRoom.type || 'Other')}`}>
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
                <span className="font-medium">Programs:</span> {currentRoom.programTypes.join(', ')}
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
          {/* Weekly View Toggle */}
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedDay === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Weekly View
            </button>
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-2 rounded-md transition-colors text-sm ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Time Slot Availability */}
          {selectedDay === 'all' ? (
            // Weekly view
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
          ) : (
            // Single day view
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                {currentRoom.name} - {selectedDay}
              </h3>
              
              <div className="grid gap-3">
                {timeSlots.map(slot => {
                  const isAvailable = isRoomAvailable(currentRoom.name, slot.id, selectedDay);
                  const occupancy = getRoomOccupancy(currentRoom.name, slot.id, selectedDay);
                  
                  return (
                    <div key={slot.id} className={`p-4 rounded-lg border-2 ${
                      isAvailable 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            Period {slot.period} ({slot.start} - {slot.end})
                          </h4>
                          <div className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                            isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isAvailable ? (
                              <>
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                Available
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                                Occupied
                              </>
                            )}
                          </div>
                        </div>
                        
                        {!isAvailable && (
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">Currently scheduled:</div>
                            {occupancy.map((entry, index) => (
                              <div key={index} className="text-sm">
                                <div className="font-medium">{getSubjectName(entry.subjectId)}</div>
                                <div className="text-gray-600">Teacher: {getTeacherName(entry.teacherId)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Availability Summary */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Availability Summary for {selectedDay === 'all' ? 'This Week' : selectedDay}</h4>
            {selectedDay === 'all' ? (
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
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {(() => {
                  const availableSlots = timeSlots.filter(slot => 
                    isRoomAvailable(currentRoom.name, slot.id, selectedDay)
                  ).length;
                  const totalSlots = timeSlots.length;
                  const occupiedSlots = totalSlots - availableSlots;
                  const utilizationRate = Math.round((occupiedSlots / totalSlots) * 100);
                  
                  return (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{availableSlots}</div>
                        <div className="text-blue-800">Available Slots</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{occupiedSlots}</div>
                        <div className="text-blue-800">Occupied Slots</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{utilizationRate}%</div>
                        <div className="text-blue-800">Utilization Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{totalSlots}</div>
                        <div className="text-blue-800">Total Slots</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
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
