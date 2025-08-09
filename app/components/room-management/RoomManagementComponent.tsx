'use client';

import React, { useEffect, useState } from 'react';
import { Room, departments, rooms as initialRooms } from '../data';
import { Button } from '../ui/button';
import AddRoomModal from './AddRoomModal';

const STORAGE_KEY = 'room-data';

// Function to generate background colors for different rooms
const getRoomBackgroundColor = (index: number, roomType: string) => {
  const colorVariations = [
    'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-300',
    'bg-green-50 hover:bg-green-100 border-l-4 border-green-300', 
    'bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-300',
    'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-300',
    'bg-pink-50 hover:bg-pink-100 border-l-4 border-pink-300',
    'bg-indigo-50 hover:bg-indigo-100 border-l-4 border-indigo-300',
    'bg-red-50 hover:bg-red-100 border-l-4 border-red-300',
    'bg-teal-50 hover:bg-teal-100 border-l-4 border-teal-300',
    'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-300',
    'bg-cyan-50 hover:bg-cyan-100 border-l-4 border-cyan-300'
  ];
  
  // Add type-specific base colors
  const typeColors = {
    'Laboratory': 'bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-400',
    'Classroom': 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400',
    'Auditorium': 'bg-green-50 hover:bg-green-100 border-l-4 border-green-400',
    'Conference': 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400',
    'Other': 'bg-gray-50 hover:bg-gray-100 border-l-4 border-gray-400'
  };
  
  // Use type-specific color if available, otherwise cycle through variations
  return typeColors[roomType as keyof typeof typeColors] || colorVariations[index % colorVariations.length];
};

interface RoomManagementComponentProps {
  onRoomSelect?: (roomId: string) => void;
}

const RoomManagementComponent: React.FC<RoomManagementComponentProps> = ({ onRoomSelect }) => {
  const [mounted, setMounted] = useState(false);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Load rooms from localStorage after component mounts
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedRooms = JSON.parse(stored);
        setRooms(parsedRooms);
      } catch (error) {
        console.error('Error parsing stored room data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever rooms change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    }
  }, [rooms, mounted]);

  const generateRoomId = (name: string) => {
    return `room-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setShowAddModal(true);
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    setShowAddModal(true);
  };

  // Save room (add or update)
  const handleSaveRoom = (roomData: Omit<Room, 'id'>) => {
    if (editingRoom) {
      // Update existing room
      setRooms(prev => prev.map(room => 
        room.id === editingRoom.id 
          ? { ...roomData, id: editingRoom.id } as Room
          : room
      ));
    } else {
      // Add new room
      const newRoom: Room = {
        ...roomData,
        id: generateRoomId(roomData.name),
      };

      // Check if room with same name already exists
      if (rooms.some(room => room.name.toLowerCase() === newRoom.name.toLowerCase())) {
        alert('A room with this name already exists');
        return;
      }

      setRooms(prev => [...prev, newRoom]);
    }

    setEditingRoom(null);
  };

  const handleDelete = (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      setRooms(prev => prev.filter(room => room.id !== roomId));
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || room.type === filterType;
    const matchesProgram = filterProgram === 'all' || room.programTypes.includes(filterProgram as 'Inter' | 'BS');
    const matchesDepartment = filterDepartment === 'all' || room.primaryDepartmentId === filterDepartment;
    
    return matchesSearch && matchesType && matchesProgram && matchesDepartment;
  });

  const roomTypes = ['all', 'Classroom', 'Laboratory', 'Auditorium', 'Conference', 'Other'];
  const programTypes = ['all', 'Inter', 'BS'];

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'General';
    const dept = departments.find(d => d.id === departmentId);
    return dept?.shortName || 'Unknown';
  };

  if (!mounted) {
    return <div className="p-6">Loading rooms...</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
        <Button onClick={handleAddRoom} className="bg-blue-600 hover:bg-blue-700">
          Add New Room
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roomTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {programTypes.map(program => (
              <option key={program} value={program}>
                {program === 'all' ? 'All Programs' : program}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Room Modal */}
      <AddRoomModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveRoom}
        editingRoom={editingRoom}
      />

      {/* Rooms Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredRooms.length} of {rooms.length} rooms
      </div>

      {/* Color Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Room Type Color Legend:</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-400 rounded"></div>
            <span>Classroom</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border-l-4 border-purple-400 rounded"></div>
            <span>Laboratory</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-l-4 border-green-400 rounded"></div>
            <span>Auditorium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-l-4 border-yellow-400 rounded"></div>
            <span>Conference</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-l-4 border-gray-400 rounded"></div>
            <span>Other</span>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Room Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Capacity</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Programs</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Department</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Building</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Facilities</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Shared</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room, index) => (
              <tr key={room.id} className={`${getRoomBackgroundColor(index, room.type || 'Other')} border-b border-gray-200 transition-colors`}>
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {room.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    room.type === 'Laboratory' ? 'bg-purple-100 text-purple-800' :
                    room.type === 'Classroom' ? 'bg-blue-100 text-blue-800' :
                    room.type === 'Auditorium' ? 'bg-green-100 text-green-800' :
                    room.type === 'Conference' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {room.type}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">{room.capacity}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex space-x-1">
                    {room.programTypes.map(program => (
                      <span key={program} className={`px-2 py-1 rounded text-xs ${
                        program === 'Inter' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {program}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {getDepartmentName(room.primaryDepartmentId)}
                </td>
                <td className="border border-gray-300 px-4 py-2">{room.building || 'N/A'}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex space-x-1">
                    {room.hasProjector && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Projector</span>
                    )}
                    {room.hasAC && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">AC</span>
                    )}
                    {!room.hasProjector && !room.hasAC && (
                      <span className="text-gray-500 text-xs">None</span>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    room.availableForOtherDepartments 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {room.availableForOtherDepartments ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                    {onRoomSelect && (
                      <button
                        onClick={() => onRoomSelect(room.id)}
                        className="bg-emerald-500 text-white px-3 py-1 rounded text-sm hover:bg-emerald-600 transition-colors"
                      >
                        View Availability
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No rooms found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default RoomManagementComponent;
