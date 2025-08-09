'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

interface BuildingSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const defaultBuildings = [
  'Computer Science Block',
  'Main Academic Block',
  'Science Block',
  'Mathematics Block',
  'Humanities Block',
  'Business Block',
  'Intermediate Block',
  'Main Block',
  'Administrative Block',
  'Library Block'
];

const BuildingSelect: React.FC<BuildingSelectProps> = ({
  value,
  onChange,
  error,
  required = false
}) => {
  const [buildings, setBuildings] = useState<string[]>(defaultBuildings);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBuildingName, setNewBuildingName] = useState('');
  const [addError, setAddError] = useState('');

  const handleAddBuilding = () => {
    const trimmedName = newBuildingName.trim();
    
    if (!trimmedName) {
      setAddError('Building name is required');
      return;
    }

    if (buildings.includes(trimmedName)) {
      setAddError('Building already exists');
      return;
    }

    // Add the new building to the list
    const updatedBuildings = [...buildings, trimmedName].sort();
    setBuildings(updatedBuildings);
    
    // Select the new building
    onChange(trimmedName);
    
    // Close modal and reset
    setIsAddModalOpen(false);
    setNewBuildingName('');
    setAddError('');
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setNewBuildingName('');
    setAddError('');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="building">
        Building {required && '*'}
      </Label>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a building..." />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((building) => (
                <SelectItem key={building} value={building}>
                  {building}
                </SelectItem>
              ))}
              <div className="border-t mt-1 pt-1">
                <button
                  className="w-full text-left px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  + Add new building
                </button>
              </div>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3"
        >
          +
        </Button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Add Building Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Building</DialogTitle>
            <DialogDescription>
              Enter the name of the new building to add to the list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newBuilding">Building Name</Label>
              <Input
                id="newBuilding"
                value={newBuildingName}
                onChange={(e) => {
                  setNewBuildingName(e.target.value);
                  setAddError('');
                }}
                placeholder="e.g., Engineering Block, Arts Block"
                className={addError ? 'border-red-500' : ''}
              />
              {addError && <p className="text-red-500 text-sm">{addError}</p>}
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddBuilding}
            >
              Add Building
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildingSelect;
