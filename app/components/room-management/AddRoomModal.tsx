'use client';

import React, { useEffect, useState } from 'react';
import { Room } from '../../types/types';
import { Button } from '../ui/button';
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
// import { Textarea } from "../ui/textarea";

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Omit<Room, 'id'>) => void;
  editingRoom?: Room | null;
  departments: { id: number; name: string; shortName: string }[];
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRoom,
  departments
}) => {
  const [formData, setFormData] = useState<Omit<Room, 'id'>>({
    name: '',
    capacity: 0,
    type: 'Classroom',
    building: '',
    floor: 1,
    hasProjector: false,
    hasAC: false,
    description: '',
    primaryDepartmentId: undefined,
    availableForOtherDepartments: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingRoom) {
      const { id, ...rest } = editingRoom;
      setFormData({ ...rest });
    } else {
      setFormData({
        name: '',
        capacity: 0,
        type: 'Classroom',
        building: '',
        floor: 1,
        hasProjector: false,
        hasAC: false,
        description: '',
        primaryDepartmentId: undefined,
        availableForOtherDepartments: true
      });
    }
    setErrors({});
  }, [editingRoom, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Room name is required.';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1.';
    if (!formData.primaryDepartmentId) newErrors.primaryDepartmentId = 'Department is required.';
    if (!formData.type) newErrors.type = 'Room type is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingRoom ? 'Edit Room' : 'Add New Room22'}
          </DialogTitle>
          <DialogDescription>
            {editingRoom ? 'Update the room details below.' : 'Enter the details for the new room.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., CR-101, Lab-A"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                placeholder="e.g., 50"
                min="1"
                className={errors.capacity ? 'border-red-500' : ''}
              />
              {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Room Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Classroom">Classroom</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Auditorium">Auditorium</option>
                <option value="Conference">Conference</option>
                <option value="Other">Other</option>
              </select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryDepartmentId">Department *</Label>
              <select
                id="primaryDepartmentId"
                value={formData.primaryDepartmentId ?? ''}
                onChange={(e) => handleInputChange('primaryDepartmentId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.shortName}</option>
                ))}
              </select>
              {errors.primaryDepartmentId && <p className="text-red-500 text-sm">{errors.primaryDepartmentId}</p>}
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building">Building</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                placeholder="e.g., Main Block"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 1)}
                min="0"
                max="20"
                placeholder="e.g., 1"
              />
            </div>
          </div>

          {/* Facilities */}
          <div className="space-y-2">
            <Label>Facilities</Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasProjector"
                  checked={formData.hasProjector}
                  onCheckedChange={(checked) => handleInputChange('hasProjector', checked)}
                />
                <Label htmlFor="hasProjector">Has Projector</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAC"
                  checked={formData.hasAC}
                  onCheckedChange={(checked) => handleInputChange('hasAC', checked)}
                />
                <Label htmlFor="hasAC">Has AC</Label>
              </div>
            </div>
          </div>

          {/* Sharing Settings */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="availableForOtherDepartments"
                checked={formData.availableForOtherDepartments}
                onCheckedChange={(checked) => handleInputChange('availableForOtherDepartments', checked)}
              />
              <Label htmlFor="availableForOtherDepartments">Available for other departments</Label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional notes about the room..."
              className="min-h-[100px] w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter>
            <Button type="submit">
              {editingRoom ? 'Update Room' : 'Add Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomModal;