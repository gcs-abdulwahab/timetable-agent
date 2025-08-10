'use client';

import { useState } from 'react';
import RoomAvailability from '../components/room-management/RoomAvailability';
import RoomManagementComponent from '../components/room-management/RoomManagementComponent';

export default function RoomManagement() {
  const [activeTab, setActiveTab] = useState<'management' | 'availability'>('management');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('availability');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Room Management System
          </h1>
          <p className="text-gray-600">
            Manage room inventory, assignments, and track availability across all facilities
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-1">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('management')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'management'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Room Management
              </button>
              <button
                onClick={() => setActiveTab('availability')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'availability'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Room Availability
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'management' && (
            <RoomManagementComponent onRoomSelect={handleRoomSelect} />
          )}
          {activeTab === 'availability' && (
            <RoomAvailability selectedRoomId={selectedRoomId || undefined} />
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {/* We'll update this with actual room count */}
                27
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                <p className="text-xs text-gray-400">Across all buildings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                15
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Classrooms</p>
                <p className="text-xs text-gray-400">General purpose</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-purple-600">
                8
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Labs</p>
                <p className="text-xs text-gray-400">Computer & specialized</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-orange-600">
                4
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Inter Rooms</p>
                <p className="text-xs text-gray-400">Intermediate level</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Room Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add, edit, and delete rooms</li>
                <li>• Set room capacity and facilities</li>
                <li>• Categorize by program type (Inter/BS)</li>
                <li>• Assign primary departments for BS rooms</li>
                <li>• Configure sharing permissions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Availability Tracking</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View room schedules by day or week</li>
                <li>• Check real-time availability</li>
                <li>• See current occupancy details</li>
                <li>• Calculate utilization rates</li>
                <li>• Filter by room type and department</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
