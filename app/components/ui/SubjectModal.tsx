'use client';

import React, { useEffect, useState } from 'react';
import { Department } from '../../types/Department';
import { Subject } from '../../types/Subject';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Label } from './label';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialSubject?: Subject | null;
  departmentId: number;
  semesterLevel?: number;
  departments: Department[];
  onSubmit: (subject: Subject | Omit<Subject, 'id'>) => void;
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialSubject,
  departmentId,
  semesterLevel,
  departments,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Omit<Subject, 'id'>>({
    name: '',
  shortName: '',
    code: '',
    creditHours: 3,
    departmentId: departmentId,
    isCore: true,
    isMajor: true,
    teachingDepartmentIds: [departmentId]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Initialize form data when modal opens or when props change
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialSubject) {
        // Edit mode - populate form with initial subject data
        // Department and semester level remain fixed per requirements
        // Add defensive defaults for legacy subjects missing new fields
        const isMajorValue = initialSubject.isMajor !== undefined ? initialSubject.isMajor : true;
        const teachingDepartmentIdsValue = initialSubject.teachingDepartmentIds && initialSubject.teachingDepartmentIds.length > 0 
          ? initialSubject.teachingDepartmentIds 
          : [initialSubject.departmentId];
        
        console.log('🟢 SubjectModal: Loading existing subject in edit mode', {
          subjectId: initialSubject.id,
          originalIsMajor: initialSubject.isMajor,
          originalTeachingDepartmentIds: initialSubject.teachingDepartmentIds,
          defaultedIsMajor: isMajorValue,
          defaultedTeachingDepartmentIds: teachingDepartmentIdsValue
        });
        
        setFormData({
          name: initialSubject.name,
          shortName: initialSubject.shortName || '',
          code: initialSubject.code,
          creditHours: initialSubject.creditHours,
          departmentId: initialSubject.departmentId || departmentId, // Fixed in edit mode
          isCore: initialSubject.isCore,
          isMajor: isMajorValue,
          teachingDepartmentIds: teachingDepartmentIdsValue.map(id => Number(id)),
          semesterId: initialSubject.semesterId
        });
      } else {
        // Add mode - set default values
        setFormData({
          name: '',
          shortName: '',
          code: '',
          creditHours: 3,
          departmentId,
          isCore: true,
          isMajor: true,
          teachingDepartmentIds: [departmentId]
        });
      }
      // Clear any previous errors
      setErrors({});
    }
  }, [isOpen, mode, initialSubject, departmentId, semesterLevel]);

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean | number[] | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    const key = String(field);
    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    }

    if ((formData.shortName || '').trim().length === 0) {
      newErrors.shortName = 'Short name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Subject code is required';
    }

    if (formData.creditHours <= 0) {
      newErrors.creditHours = 'Credit hours must be greater than zero';
    }

    // Validate teaching departments for minor subjects
    if (!formData.isMajor) {
      if (!formData.teachingDepartmentIds || formData.teachingDepartmentIds.length === 0) {
        newErrors.teachingDepartmentIds = 'At least one teaching department must be selected for minor subjects';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Add debug logging
        console.log('🔵 SubjectModal: Submitting subject data', {
          mode,
          formData,
          initialSubject: initialSubject?.id
        });
        
        if (mode === 'edit' && initialSubject) {
          // For edit mode, include the id
          const editData = {
            ...formData,
            id: initialSubject.id
          };
          console.log('🔵 SubjectModal: Edit data prepared', editData);
          await onSubmit(editData);
        } else {
          // For add mode, submit without id
          console.log('🔵 SubjectModal: Add data prepared', formData);
          await onSubmit(formData);
        }
        handleClose();
      } catch (error) {
        console.error('🔴 SubjectModal: Error submitting subject:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      shortName: '',
      code: '',
      creditHours: 3,
      departmentId: departmentId,
      isCore: true,
      isMajor: true,
      teachingDepartmentIds: []
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">
            {mode === 'edit' ? 'Edit Subject' : 'Add New Subject'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm">Subject Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Programming Fundamentals"
                className={`text-sm ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="shortName" className="text-sm">Short Name *</Label>
              <Input
                id="shortName"
                value={formData.shortName}
                onChange={(e) => handleInputChange('shortName', e.target.value)}
                placeholder="e.g., Prog Fund"
                className={`text-sm ${errors.shortName ? 'border-red-500' : ''}`}
              />
              {errors.shortName && <p className="text-xs text-red-500">{errors.shortName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="code" className="text-sm">Subject Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="e.g., CS-101"
                className={`text-sm ${errors.code ? 'border-red-500' : ''}`}
              />
              {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="creditHours" className="text-sm">Credit Hours *</Label>
              <Input
                id="creditHours"
                type="number"
                value={formData.creditHours}
                onChange={(e) => handleInputChange('creditHours', parseInt(e.target.value) || 0)}
                min="1"
                className={`text-sm ${errors.creditHours ? 'border-red-500' : ''}`}
              />
              {errors.creditHours && <p className="text-xs text-red-500">{errors.creditHours}</p>}
            </div>
          </div>


          <div className="space-y-1">
            <Label className="text-sm">Department *</Label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
              {(() => {
                const dept = departments.find(d => d.id === formData.departmentId);
                return dept ? `${dept.name} (${dept.shortName})` : 'Unknown Department';
              })()}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Subject Type *</Label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  handleInputChange('isMajor', true);
                  handleInputChange('teachingDepartmentIds', [formData.departmentId]);
                }}
                className={`flex-1 px-3 py-2 rounded-lg border-2 text-left transition-all ${
                  formData.isMajor
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">Major Subject</div>
                <div className="text-xs mt-1">Taught by the same department that offers it in curriculum</div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  handleInputChange('isMajor', false);
                  // Clear teaching departments when switching to minor
                  handleInputChange('teachingDepartmentIds', []);
                }}
                className={`flex-1 px-3 py-2 rounded-lg border-2 text-left transition-all ${
                  !formData.isMajor
                    ? 'border-orange-500 bg-orange-50 text-orange-900'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">Minor Subject</div>
                <div className="text-xs mt-1">Taught by other departments to their students</div>
              </button>
            </div>
          </div>

          {!formData.isMajor && (
            <div className="space-y-2">
              <Label className="text-sm">Teaching Departments *</Label>
              
              <div className="border rounded-lg p-3 max-h-32 overflow-y-auto bg-gray-50">
                {departments
                  .filter(dept => dept.offersBSDegree)
                  .map(dept => {
                    const isOwningDept = dept.id === formData.departmentId;
                    const isSelected = formData.teachingDepartmentIds?.includes(dept.id) || false;
                    const isDisabled = false; // Allow all departments to be selected
                    
                    return (
                      <div key={dept.id} className={`flex items-center space-x-2 mb-2 p-2 rounded border transition-all ${
                        isSelected 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}>
                        <Checkbox
                          id={`dept-${dept.id}`}
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={(checked) => {
                            if (isDisabled) return;
                            
                            let newIds = [...(formData.teachingDepartmentIds || [])];
                            if (checked) {
                              if (!newIds.includes(dept.id)) {
                                newIds.push(dept.id);
                              }
                            } else {
                              newIds = newIds.filter(id => id !== dept.id);
                            }
                            handleInputChange('teachingDepartmentIds', newIds);
                          }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <Label htmlFor={`dept-${dept.id}`} className={`text-xs cursor-pointer block ${isDisabled ? 'cursor-not-allowed' : ''}`}>
                            <div className="flex items-center truncate">
                              <span className="font-medium">{dept.name}</span>
                              <span className="text-gray-500 ml-1">({dept.shortName})</span>
                              {isOwningDept && (
                                <span className="ml-1 text-xs bg-blue-200 text-blue-700 px-1 py-0.5 rounded text-xs">
                                  📚 Owner
                                </span>
                              )}
                              {isSelected && !isOwningDept && (
                                <span className="ml-1 text-xs bg-green-200 text-green-700 px-1 py-0.5 rounded text-xs">
                                  ✓ Will Teach
                                </span>
                              )}
                            </div>
                          </Label>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Validation Messages */}
              {(!formData.teachingDepartmentIds || formData.teachingDepartmentIds.length === 0) && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-xs text-red-700">
                    <strong>⚠️ Selection Required:</strong> Please select at least one department that will teach this subject.
                  </div>
                </div>
              )}
              
              {formData.teachingDepartmentIds && formData.teachingDepartmentIds.length > 0 && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-xs text-green-700">
                    <strong>✓ Teaching Arrangement:</strong> This subject will be taught by: <span className="font-medium">{(formData.teachingDepartmentIds || []).map(id => departments.find(d => d.id === id)?.name).filter(Boolean).join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Simple color picker */}
          
          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              title="Press ESC to cancel"
              className="text-sm"
            >
              Cancel (ESC)
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-sm">
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Subject' : 'Add Subject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectModal;
