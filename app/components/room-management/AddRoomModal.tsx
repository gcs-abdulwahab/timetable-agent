'use client';

import React, { useState } from 'react';
import { Room, departments } from '../data';
import BuildingSelect from '../ui/BuildingSelect';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Omit<Room, 'id'>) => void;
  editingRoom?: Room | null;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRoom
}) => {
  const [formData, setFormData] = useState<Omit<Room, 'id'>>({
    name: editingRoom?.name || '',
    capacity: editingRoom?.capacity || 0,
    type: editingRoom?.type || 'Classroom',
    building: editingRoom?.building || '',
    floor: editingRoom?.floor || 1,
    hasProjector: editingRoom?.hasProjector || false,
    hasAC: editingRoom?.hasAC || false,
    description: editingRoom?.description || '',
    programTypes: editingRoom?.programTypes || ['BS'],
    primaryDepartmentId: editingRoom?.primaryDepartmentId || '',
    availableForOtherDepartments: editingRoom?.availableForOtherDepartments ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleProgramTypeChange = (programType: 'Inter' | 'BS', checked: boolean) => {
    setFormData(prev => {
      const newProgramTypes = checked
        ? [...prev.programTypes, programType]
        : prev.programTypes.filter(type => type !== programType);
      
      return {
        ...prev,
        programTypes: newProgramTypes as ('Inter' | 'BS')[]
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (!formData.building?.trim()) {
      newErrors.building = 'Building is required';
    }

    if (formData.programTypes.length === 0) {
      newErrors.programTypes = 'At least one program type must be selected';
    }

    if (formData.programTypes.includes('BS') && !formData.primaryDepartmentId) {
      newErrors.primaryDepartmentId = 'Primary department is required for BS rooms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        capacity: 0,
        type: 'Classroom',
        building: '',
        floor: 1,
        hasProjector: false,
        hasAC: false,
        description: '',
        programTypes: ['BS'],
        primaryDepartmentId: '',
        availableForOtherDepartments: true
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRoom ? 'Edit Room' : 'Add New Room'}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                placeholder="e.g., 50"
                min="1"
                className={errors.capacity ? 'border-red-500' : ''}
              />
              {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Room Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('type', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Classroom">Classroom</option>
                <option value="Lab">Lab</option>
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Seminar Room">Seminar Room</option>
                <option value="Conference Room">Conference Room</option>
              </select>
            </div>

            <div className="space-y-2">
              <BuildingSelect
                value={formData.building || ''}
                onChange={(value) => handleInputChange('building', value)}
                error={errors.building}
                required={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('floor', parseInt(e.target.value) || 1)}
                min="0"
                max="20"
              />
            </div>

            <div className="space-y-2">
              <Label>Facilities</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasProjector}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('hasProjector', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Projector</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasAC}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('hasAC', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">AC</span>
                </label>
              </div>
            </div>
          </div>

          {/* Program Types */}
          <div className="space-y-2">
            <Label>Program Types *</Label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.programTypes.includes('Inter')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProgramTypeChange('Inter', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Intermediate</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.programTypes.includes('BS')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProgramTypeChange('BS', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Bachelor&apos;s</span>
              </label>
            </div>
            {errors.programTypes && <p className="text-red-500 text-sm">{errors.programTypes}</p>}
          </div>

          {/* Department Selection for BS */}
          {formData.programTypes.includes('BS') && (
            <div className="space-y-2">
              <Label htmlFor="primaryDepartment">Primary Department *</Label>
              <select
                id="primaryDepartment"
                value={formData.primaryDepartmentId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('primaryDepartmentId', e.target.value)}
                className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  errors.primaryDepartmentId ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select a department...</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.primaryDepartmentId && <p className="text-red-500 text-sm">{errors.primaryDepartmentId}</p>}
            </div>
          )}

          {/* Sharing Settings */}
          <div className="space-y-2">
            <Label>Sharing Settings</Label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.availableForOtherDepartments}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('availableForOtherDepartments', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Available for other departments</span>
            </label>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
              placeholder="Additional notes about the room..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              title="Press ESC to cancel"
            >
              Cancel (ESC)
            </Button>
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
