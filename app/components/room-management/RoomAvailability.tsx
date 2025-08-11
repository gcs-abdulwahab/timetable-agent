'use client';

import React, { useEffect, useState } from 'react';
import { Room, Subject, Teacher, TimetableEntry, timeSlots } from '../data';

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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>(selectedRoomId || '');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [semesters, setSemesters] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Load rooms and allocations from API (always fetch fresh data)
  useEffect(() => {
    const loadData = async () => {
      try {
        setMounted(true);
        setLoading(true);
        console.log('Loading rooms and allocation data from API...');
        
        // Fetch both rooms and allocations in parallel
        const [roomsResponse, allocationsResponse, semestersResponse, subjectsResponse, teachersResponse] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/allocations'),
          fetch('/api/semesters'),
          fetch('/api/subjects'),
          fetch('/api/teachers')
        ]);
        
        console.log('Rooms fetch response status:', roomsResponse.status);
        console.log('Allocations fetch response status:', allocationsResponse.status);
        
        if (!roomsResponse.ok) {
          throw new Error(`Failed to fetch rooms data: ${roomsResponse.status} ${roomsResponse.statusText}`);
        }
        
        if (!allocationsResponse.ok) {
          throw new Error(`Failed to fetch allocations data: ${allocationsResponse.status} ${allocationsResponse.statusText}`);
        }

        if (!semestersResponse.ok) throw new Error(`Failed to fetch semesters data: ${semestersResponse.status} ${semestersResponse.statusText}`);
        if (!subjectsResponse.ok) throw new Error(`Failed to fetch subjects data: ${subjectsResponse.status} ${subjectsResponse.statusText}`);
        if (!teachersResponse.ok) throw new Error(`Failed to fetch teachers data: ${teachersResponse.status} ${teachersResponse.statusText}`);
        
        const roomsData = await roomsResponse.json();
        const allocationsData = await allocationsResponse.json();
        const semestersData = await semestersResponse.json();
        const subjectsData = await subjectsResponse.json();
        const teachersData = await teachersResponse.json();
        
        console.log('Fetched rooms data:', roomsData.length, 'rooms');
        console.log('Fetched allocations data:', allocationsData.length, 'allocations');
        console.log('Fetched semesters data:', semestersData.length, 'semesters');
        console.log('Fetched subjects data:', subjectsData.length, 'subjects');
        console.log('Fetched teachers data:', teachersData.length, 'teachers');
        console.log('First room:', roomsData[0]);
        console.log('First allocation:', allocationsData[0]);
        
        setRooms(roomsData);
        setAllocations(allocationsData);
        setSemesters(semestersData);
        setSubjects(subjectsData);
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error loading data:', error);
        setRooms([]);
        setAllocations([]);
        setSemesters([]);
        setSubjects([]);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
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
                <span className="font-medium">Programs:</span> {(currentRoom.programTypes || []).join(', ') || 'N/A'}
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
