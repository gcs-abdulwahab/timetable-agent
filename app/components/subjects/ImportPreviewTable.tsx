'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for the imported subject data
interface ImportedSubject {
  id: string;
  name: string;
  shortName: string;
  code: string;
  creditHours: number;
  color: string;
  departmentId: string;
  semesterLevel: number;
  isCore: boolean;
  semesterId: string;
  conflict: 'none' | 'duplicate' | 'partial_match';
  include: boolean;
  resolution?: 'skip' | 'overwrite' | 'keep_both';
  validationErrors?: string[];
  conflictDetails?: string;
}

interface TooltipState {
  show: boolean;
  content: string;
  x: number;
  y: number;
  type: 'error' | 'conflict' | 'info';
}

interface ImportPreviewTableProps {
  subjects: ImportedSubject[];
  onSubjectChange: (subjectIndex: number, field: keyof ImportedSubject, value: any) => void;
  onToggleInclude: (subjectIndex: number) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  className?: string;
}

const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({
  subjects,
  onSubjectChange,
  onToggleInclude,
  onToggleAll,
  allSelected,
  className = ''
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: '',
    x: 0,
    y: 0,
    type: 'info'
  });

  // Helper function to determine row validation state
  const getRowValidationState = (subject: ImportedSubject): 'valid' | 'invalid' | 'conflict' => {
    if (subject.validationErrors && subject.validationErrors.length > 0) {
      return 'invalid';
    }
    if (subject.conflict !== 'none') {
      return 'conflict';
    }
    return 'valid';
  };

  // Helper function to get row background color
  const getRowClassName = (subject: ImportedSubject): string => {
    const validationState = getRowValidationState(subject);
    switch (validationState) {
      case 'invalid':
        return 'bg-red-50 border-red-200';
      case 'conflict':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  // Helper function to show tooltip
  const showTooltip = (event: React.MouseEvent, content: string, type: TooltipState['type']) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    let tooltipX = rect.left + rect.width / 2;
    let tooltipY = rect.top - 10;

    // Ensure tooltip doesn't go off-screen horizontally
    if (typeof window !== 'undefined') {
      const tooltipWidth = 300; // Approximate tooltip width
      if (tooltipX - tooltipWidth / 2 < 10) {
        tooltipX = tooltipWidth / 2 + 10;
      } else if (tooltipX + tooltipWidth / 2 > window.innerWidth - 10) {
        tooltipX = window.innerWidth - tooltipWidth / 2 - 10;
      }
    }

    // Ensure tooltip doesn't go off-screen vertically
    if (tooltipY < 100) {
      tooltipY = rect.bottom + 20; // Show below if not enough space above
    }

    setTooltip({
      show: true,
      content,
      x: tooltipX,
      y: tooltipY,
      type
    });

    // Auto-close tooltip after 5 seconds
    setTimeout(() => {
      setTooltip(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Helper function to hide tooltip
  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  // Helper function to format validation errors
  const formatValidationErrors = (errors: string[]): string => {
    return errors.join('\n• ');
  };

  // Helper function to get conflict resolution label
  const getConflictResolutionLabel = (resolution: string): string => {
    switch (resolution) {
      case 'skip':
        return 'Skip';
      case 'overwrite':
        return 'Overwrite';
      case 'keep_both':
        return 'Keep Both';
      default:
        return 'Not Set';
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Table Container */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            {/* Table Header */}
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="w-12 p-2 text-center border-r">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onToggleAll}
                    title="Toggle all subjects"
                  />
                </th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">ID</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Name</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Short Name</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Code</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Credits</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Color</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Dept ID</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Level</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Core</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Semester ID</th>
                <th className="text-left p-2 font-medium text-gray-700 border-r">Status</th>
                <th className="text-left p-2 font-medium text-gray-700">Resolution</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {subjects.map((subject, index) => {
                const validationState = getRowValidationState(subject);
                const hasErrors = subject.validationErrors && subject.validationErrors.length > 0;
                const hasConflict = subject.conflict !== 'none';

                return (
                  <tr
                    key={index}
                    className={cn(
                      "border-t transition-colors duration-200",
                      getRowClassName(subject)
                    )}
                  >
                    {/* Include Checkbox */}
                    <td className="p-2 text-center border-r">
                      <Checkbox
                        checked={subject.include}
                        onCheckedChange={() => onToggleInclude(index)}
                        disabled={validationState === 'invalid'}
                      />
                    </td>

                    {/* ID */}
                    <td className="p-2 border-r">
                      <div className="font-mono text-xs">{subject.id || '-'}</div>
                    </td>

                    {/* Name */}
                    <td className="p-2 border-r">
                      <div className="font-medium text-gray-900 max-w-40 truncate" title={subject.name}>
                        {subject.name}
                      </div>
                    </td>

                    {/* Short Name */}
                    <td className="p-2 border-r">
                      <div className="text-gray-700 max-w-20 truncate" title={subject.shortName}>
                        {subject.shortName || '-'}
                      </div>
                    </td>

                    {/* Code */}
                    <td className="p-2 border-r">
                      <div className="font-mono text-xs font-medium">{subject.code}</div>
                    </td>

                    {/* Credit Hours */}
                    <td className="p-2 text-center border-r">
                      <div className="font-medium">{subject.creditHours}</div>
                    </td>

                    {/* Color */}
                    <td className="p-2 border-r">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: subject.color }}
                          title={subject.color}
                        />
                        <span className="font-mono text-xs text-gray-600">
                          {subject.color}
                        </span>
                      </div>
                    </td>

                    {/* Department ID */}
                    <td className="p-2 border-r">
                      <div className="font-mono text-xs">{subject.departmentId || '-'}</div>
                    </td>

                    {/* Semester Level */}
                    <td className="p-2 text-center border-r">
                      <Badge variant="secondary" size="sm">
                        {subject.semesterLevel}
                      </Badge>
                    </td>

                    {/* Is Core */}
                    <td className="p-2 text-center border-r">
                      {subject.isCore ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400 mx-auto" />
                      )}
                    </td>

                    {/* Semester ID */}
                    <td className="p-2 border-r">
                      <div className="font-mono text-xs">{subject.semesterId || '-'}</div>
                    </td>

                    {/* Status Column with Validation/Conflict Indicators */}
                    <td className="p-2 border-r">
                      <div className="flex items-center gap-2">
                        {validationState === 'valid' && (
                          <Badge variant="success" size="sm" className="bg-green-100 text-green-800 border border-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                            <span className="font-medium">Valid</span>
                          </Badge>
                        )}
                        
                        {validationState === 'invalid' && (
                          <div className="flex items-center gap-1">
                            <Badge variant="error" size="sm" className="bg-red-100 text-red-800 border border-red-300">
                              <XCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                              <span className="font-medium">Error</span>
                            </Badge>
                            {hasErrors && (
                              <button
                                className="bg-red-50 text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded border border-red-300 transition-all duration-200"
                                onClick={(e) => showTooltip(
                                  e,
                                  `Validation Errors:\n• ${formatValidationErrors(subject.validationErrors!)}`,
                                  'error'
                                )}
                                title="Click for error details"
                                aria-label="View validation error details"
                              >
                                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                <span className="sr-only">View error details</span>
                              </button>
                            )}
                          </div>
                        )}

                        {validationState === 'conflict' && (
                          <div className="flex items-center gap-1">
                            <Badge variant="warning" size="sm" className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                              <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
                              <span className="font-medium">Conflict</span>
                            </Badge>
                            {hasConflict && subject.conflictDetails && (
                              <button
                                className="bg-yellow-50 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 p-1 rounded border border-yellow-300 transition-all duration-200"
                                onClick={(e) => showTooltip(
                                  e,
                                  `Conflict Details:\n${subject.conflictDetails}`,
                                  'conflict'
                                )}
                                title="Click for conflict details"
                                aria-label="View conflict details"
                              >
                                <Info className="w-4 h-4" aria-hidden="true" />
                                <span className="sr-only">View conflict details</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Resolution Column */}
                    <td className="p-2">
                      {hasConflict ? (
                        <Select
                          value={subject.resolution || 'skip'}
                          onValueChange={(value: 'skip' | 'overwrite' | 'keep_both') =>
                            onSubjectChange(index, 'resolution', value)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs w-full min-w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">Skip</SelectItem>
                            <SelectItem value="overwrite">Overwrite</SelectItem>
                            <SelectItem value="keep_both">Keep Both</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className={cn(
            "fixed z-50 max-w-xs p-3 text-sm rounded-lg shadow-lg border pointer-events-none transition-opacity duration-200",
            tooltip.type === 'error' && "bg-red-50 border-red-200 text-red-800",
            tooltip.type === 'conflict' && "bg-yellow-50 border-yellow-200 text-yellow-800",
            tooltip.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800"
          )}
          style={{
            left: tooltip.x - 150, // Center the tooltip
            top: tooltip.y - 10,
          }}
        >
          <div className="whitespace-pre-line font-medium">
            {tooltip.content}
          </div>
          <div
            className={cn(
              "absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent",
              tooltip.type === 'error' && "border-t-red-200",
              tooltip.type === 'conflict' && "border-t-yellow-200",
              tooltip.type === 'info' && "border-t-blue-200"
            )}
            style={{
              left: '50%',
              bottom: '-4px',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImportPreviewTable;
