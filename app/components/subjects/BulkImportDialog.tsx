'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Upload, CheckCircle, AlertCircle, XCircle, Download, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FatalErrorDisplay,
  ServerErrorDisplay, 
  ValidationSummaryDisplay,
  FieldErrorDisplay
} from '@/components/ui/ErrorFeedback';
import {
  DetailedError,
  ServerErrorResponse,
  ValidationSummary as ErrorValidationSummary,
  RowValidationResult,
  handleServerError,
  FATAL_ERROR_CONDITIONS,
  exportInvalidRows
} from '@/lib/import/errorHandling';
import { validateSubjectsWithDetailedErrors } from '@/lib/import/validateSubjects';
import { parseFile, validateFileForParsing, PERFORMANCE_LIMITS } from '@/lib/import/parseFiles';

// Types
interface Semester {
  id: string;
  name: string;
  year: number;
  term: 'Spring' | 'Fall';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

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
  validationState: 'valid' | 'invalid' | 'warning';
  validationErrors: string[];
  conflictState: 'none' | 'duplicate' | 'partial_match';
  conflictResolution?: 'skip' | 'overwrite' | 'keep_both';
  includeInImport: boolean;
}

interface ImportResult {
  subject: ImportedSubject;
  status: 'added' | 'updated' | 'skipped' | 'failed';
  reason: string;
}

interface ImportSettings {
  selectedSemester: string;
  assignSelectedSemesterToAll: boolean;
  autoGenerateMissingIds: boolean;
  defaultConflictStrategy: 'skip' | 'overwrite' | 'keep_both';
  defaultDepartmentId?: string;
}

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (results: ImportResult[]) => void;
}

const IMPORT_STAGES = [
  { id: 'parsing', label: 'Parsing file', progress: 10 },
  { id: 'validation', label: 'Validating data', progress: 35 },
  { id: 'conflict_detection', label: 'Detecting conflicts', progress: 55 },
  { id: 'merging', label: 'Merging data', progress: 75 },
  { id: 'saving', label: 'Saving to database', progress: 90 },
] as const;

const COMPLETE_PROGRESS = 100;

const BulkImportDialog: React.FC<BulkImportDialogProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  // State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importSettings, setImportSettings] = useState<ImportSettings>({
    selectedSemester: '',
    assignSelectedSemesterToAll: false,
    autoGenerateMissingIds: true,
    defaultConflictStrategy: 'skip',
  });
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [importedSubjects, setImportedSubjects] = useState<ImportedSubject[]>([]);
  const [isImportInProgress, setIsImportInProgress] = useState(false);
  const [currentStage, setCurrentStage] = useState<typeof IMPORT_STAGES[number]['id'] | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [isCancellable, setIsCancellable] = useState(true);
  const [isCancelled, setIsCancelled] = useState(false);

  // Error handling state
  const [fatalErrors, setFatalErrors] = useState<DetailedError[]>([]);
  const [serverError, setServerError] = useState<ServerErrorResponse | null>(null);
  const [validationSummary, setValidationSummary] = useState<ErrorValidationSummary | null>(null);
  const [invalidRows, setInvalidRows] = useState<RowValidationResult[]>([]);
  const [fieldErrorCounts, setFieldErrorCounts] = useState<Record<string, number>>({});
  const [hasRetriableError, setHasRetriableError] = useState(false);
  
  // Performance and display state
  const [showAllRows, setShowAllRows] = useState(false);
  const [hasPerformanceWarnings, setHasPerformanceWarnings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch semesters on dialog open
  useEffect(() => {
    if (isOpen) {
      fetchSemesters();
    }
  }, [isOpen]);

  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/semesters');
      if (response.ok) {
        const data = await response.json();
        setSemesters(data);
      }
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSelectedFile(null);
      setImportSettings({
        selectedSemester: '',
        assignSelectedSemesterToAll: false,
        autoGenerateMissingIds: true,
        defaultConflictStrategy: 'skip',
      });
      setImportedSubjects([]);
      setIsImportInProgress(false);
      setCurrentStage(null);
      setImportProgress(0);
      setImportResults([]);
      setExpandedResults(new Set());
      setIsCancellable(true);
      setIsCancelled(false);
      
      // Reset error state
      setFatalErrors([]);
      setServerError(null);
      setValidationSummary(null);
      setInvalidRows([]);
      setFieldErrorCounts({});
      setHasRetriableError(false);
    }
  }, [isOpen]);

  // File handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['.csv', '.xlsx', '.json'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (validTypes.includes(fileExtension)) {
        setSelectedFile(file);
      } else {
        alert('Please select a valid file type (.csv, .xlsx, .json)');
        event.target.value = '';
      }
    }
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const validTypes = ['csv', 'xlsx', 'json'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (validTypes.includes(fileExtension || '')) {
        setSelectedFile(file);
      } else {
        alert('Please drop a valid file type (.csv, .xlsx, .json)');
      }
    }
  };

  // Parse file and validate data
  const parseFile = async () => {
    if (!selectedFile) return;

    try {
      setIsImportInProgress(true);
      setCurrentStage('parsing');
      setImportProgress(IMPORT_STAGES.find(s => s.id === 'parsing')?.progress || 10);

      // Simulate file parsing (replace with actual parsing logic)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock parsed data (replace with actual parsing)
      const mockSubjects: ImportedSubject[] = [
        {
          id: '1',
          name: 'Data Structures and Algorithms',
          shortName: 'DSA',
          code: 'CS-201',
          creditHours: 3,
          color: '#3B82F6',
          departmentId: 'd6',
          semesterLevel: 3,
          isCore: true,
          validationState: 'valid',
          validationErrors: [],
          conflictState: 'none',
          includeInImport: true,
        },
        {
          id: '2',
          name: 'Database Systems',
          shortName: 'DB',
          code: 'CS-301',
          creditHours: 3,
          color: '#10B981',
          departmentId: 'd6',
          semesterLevel: 5,
          isCore: true,
          validationState: 'valid',
          validationErrors: [],
          conflictState: 'duplicate',
          includeInImport: true,
        },
        {
          id: '',
          name: 'Web Development',
          shortName: '',
          code: 'CS-401',
          creditHours: 0,
          color: '#EF4444',
          departmentId: '',
          semesterLevel: 7,
          isCore: false,
          validationState: 'invalid',
          validationErrors: ['Missing subject ID', 'Missing short name', 'Invalid credit hours', 'Missing department'],
          conflictState: 'none',
          includeInImport: false,
        },
      ];

      setCurrentStage('validation');
      setImportProgress(IMPORT_STAGES.find(s => s.id === 'validation')?.progress || 35);
      await new Promise(resolve => setTimeout(resolve, 800));

      setCurrentStage('conflict_detection');
      setImportProgress(IMPORT_STAGES.find(s => s.id === 'conflict_detection')?.progress || 55);
      await new Promise(resolve => setTimeout(resolve, 600));

      setImportedSubjects(mockSubjects);
      setCurrentStep(2);
      setIsImportInProgress(false);
      setCurrentStage(null);
      setImportProgress(0);
    } catch (error) {
      console.error('Failed to parse file:', error);
      setIsImportInProgress(false);
      setCurrentStage(null);
      setImportProgress(0);
    }
  };

  // Calculate validation stats
  const validationStats = useMemo(() => {
    const valid = importedSubjects.filter(s => s.validationState === 'valid').length;
    const invalid = importedSubjects.filter(s => s.validationState === 'invalid').length;
    const duplicates = importedSubjects.filter(s => s.conflictState === 'duplicate').length;
    
    return { valid, invalid, duplicates };
  }, [importedSubjects]);

  // Bulk actions for conflict resolution
  const handleBulkConflictResolution = (resolution: 'skip' | 'overwrite' | 'keep_both') => {
    setImportedSubjects(prev => 
      prev.map(subject => 
        subject.conflictState !== 'none' 
          ? { ...subject, conflictResolution: resolution }
          : subject
      )
    );
  };

  // Toggle subject inclusion
  const toggleSubjectInclusion = (subjectId: string) => {
    setImportedSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId || (subject.id === '' && subject.code === subjectId)
          ? { ...subject, includeInImport: !subject.includeInImport }
          : subject
      )
    );
  };

  // Cancel import process
  const cancelImport = () => {
    setIsCancelled(true);
    setIsImportInProgress(false);
    setCurrentStage(null);
    setImportProgress(0);
    setCurrentStep(2); // Go back to preview step
  };

  // Start import process
  const startImport = async () => {
    const subjectsToImport = importedSubjects.filter(s => s.includeInImport);
    
    if (subjectsToImport.length === 0) {
      alert('No subjects selected for import');
      return;
    }

    setCurrentStep(3);
    setIsImportInProgress(true);
    setIsCancelled(false);
    setIsCancellable(true);

    try {
      const results: ImportResult[] = [];

      // Process through each stage with specific progress values
      for (let i = 0; i < IMPORT_STAGES.length; i++) {
        if (isCancelled) break;
        
        const stage = IMPORT_STAGES[i];
        setCurrentStage(stage.id);
        setImportProgress(stage.progress);
        
        // Disable cancellation during saving phase
        if (stage.id === 'saving') {
          setIsCancellable(false);
        }
        
        // Simulate processing time for each stage
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check for cancellation after each delay
        if (isCancelled) break;
      }
      
      // If not cancelled, complete the import
      if (!isCancelled) {
        setImportProgress(COMPLETE_PROGRESS);
        
        // Mock results
        subjectsToImport.forEach((subject, index) => {
          let status: ImportResult['status'];
          let reason: string;

          if (subject.validationState === 'invalid') {
            status = 'failed';
            reason = subject.validationErrors.join(', ');
          } else if (subject.conflictState === 'duplicate') {
            if (subject.conflictResolution === 'skip') {
              status = 'skipped';
              reason = 'Duplicate subject, set to skip';
            } else if (subject.conflictResolution === 'overwrite') {
              status = 'updated';
              reason = 'Existing subject updated';
            } else {
              status = 'added';
              reason = 'Added as new subject with modified name';
            }
          } else {
            status = 'added';
            reason = 'Successfully added new subject';
          }

          results.push({
            subject,
            status,
            reason,
          });
        });

        setImportResults(results);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      if (!isCancelled) {
        setIsImportInProgress(false);
        setCurrentStage(null);
        setImportProgress(0);
      }
      setIsCancellable(true);
    }
  };

  // Download report
  const downloadReport = (format: 'json' | 'csv') => {
    const results = importResults.map(result => ({
      subjectName: result.subject.name,
      subjectCode: result.subject.code,
      status: result.status,
      reason: result.reason,
    }));

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
      filename = `import_report_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      const headers = 'Subject Name,Subject Code,Status,Reason\n';
      const csvContent = results.map(r => 
        `"${r.subjectName}","${r.subjectCode}","${r.status}","${r.reason}"`
      ).join('\n');
      content = headers + csvContent;
      filename = `import_report_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Complete import
  const completeImport = () => {
    onImportComplete(importResults);
    onClose();
  };

  // Step navigation
  const canProceedToStep2 = selectedFile && importSettings.selectedSemester;
  const canProceedToStep3 = importedSubjects.some(s => s.includeInImport);

  // Result stats
  const resultStats = useMemo(() => {
    const added = importResults.filter(r => r.status === 'added').length;
    const updated = importResults.filter(r => r.status === 'updated').length;
    const skipped = importResults.filter(r => r.status === 'skipped').length;
    const failed = importResults.filter(r => r.status === 'failed').length;
    
    return { added, updated, skipped, failed };
  }, [importResults]);

  // Error handling functions
  const clearErrors = () => {
    setFatalErrors([]);
    setServerError(null);
    setValidationSummary(null);
    setInvalidRows([]);
    setFieldErrorCounts({});
    setHasRetriableError(false);
  };

  const handleRetry = () => {
    clearErrors();
    if (hasRetriableError) {
      // Retry the last failed operation
      if (currentStep === 1) {
        parseFile();
      } else if (currentStep === 3) {
        startImport();
      }
    }
  };

  const handleDownloadInvalidRows = (format: 'csv' | 'json') => {
    if (invalidRows.length > 0) {
      const { content, filename, mimeType } = exportInvalidRows(invalidRows, format);
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFieldFocus = (field: string) => {
    // Focus on specific field in the table or form
    // This could scroll to the field or highlight it
    console.log('Focusing on field:', field);
  };

  // Performance and display calculations
  const displayedSubjects = useMemo(() => {
    if (showAllRows || importedSubjects.length <= PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS) {
      return importedSubjects;
    }
    return importedSubjects.slice(0, PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS);
  }, [importedSubjects, showAllRows]);
  
  const isLargeDataset = importedSubjects.length > PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS;
  const hasPerformanceConcerns = importedSubjects.length > PERFORMANCE_LIMITS.RECOMMENDED_MAX_ROWS;
  
  // Export full validation report
  const exportFullValidationReport = (format: 'csv' | 'json') => {
    const reportData = importedSubjects.map((subject, index) => ({
      rowNumber: index + 1,
      name: subject.name,
      shortName: subject.shortName,
      code: subject.code,
      creditHours: subject.creditHours,
      departmentId: subject.departmentId,
      semesterLevel: subject.semesterLevel,
      isCore: subject.isCore,
      validationState: subject.validationState,
      validationErrors: subject.validationErrors.join('; '),
      conflictState: subject.conflictState,
      includeInImport: subject.includeInImport
    }));
    
    let content: string;
    let filename: string;
    let mimeType: string;
    
    if (format === 'json') {
      content = JSON.stringify(reportData, null, 2);
      filename = `validation_report_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      const headers = 'Row,Name,Short Name,Code,Credit Hours,Department ID,Semester Level,Is Core,Validation State,Validation Errors,Conflict State,Include in Import\n';
      const csvContent = reportData.map(r => 
        `${r.rowNumber},"${r.name}","${r.shortName}","${r.code}",${r.creditHours},"${r.departmentId}",${r.semesterLevel},${r.isCore},"${r.validationState}","${r.validationErrors}","${r.conflictState}",${r.includeInImport}`
      ).join('\n');
      content = headers + csvContent;
      filename = `validation_report_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check if there are any errors to display
  const hasErrors = fatalErrors.length > 0 || serverError !== null;
  const hasValidationIssues = validationSummary !== null && !validationSummary.canProceed;
  const hasFieldErrors = Object.keys(fieldErrorCounts).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Subjects</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2",
                  step === currentStep
                    ? "bg-primary text-primary-foreground border-primary"
                    : step < currentStep
                    ? "bg-green-100 text-green-800 border-green-500"
                    : "bg-gray-100 text-gray-500 border-gray-300"
                )}
              >
                {step < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep}: {
              currentStep === 1 ? 'Upload and Settings' :
              currentStep === 2 ? 'Preview and Resolve' :
              currentStep === 3 ? 'Import Progress' :
              'Results'
            }
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-1">
          {/* Error Display Components */}
          {hasErrors && (
            <div className="space-y-4 mb-6">
              {fatalErrors.length > 0 && (
                <FatalErrorDisplay
                  errors={fatalErrors}
                  onRetry={hasRetriableError ? handleRetry : undefined}
                  onDismiss={() => setFatalErrors([])}
                />
              )}
              {serverError && (
                <ServerErrorDisplay
                  error={serverError}
                  onRetry={serverError.retryable ? handleRetry : undefined}
                  onDismiss={() => setServerError(null)}
                />
              )}
            </div>
          )}

          {/* Validation Issues Display */}
          {hasValidationIssues && validationSummary && (
            <div className="mb-6">
              <ValidationSummaryDisplay
                summary={validationSummary}
                invalidRows={invalidRows}
                onDownloadInvalidRows={handleDownloadInvalidRows}
                onDismiss={() => {
                  setValidationSummary(null);
                  setInvalidRows([]);
                }}
              />
            </div>
          )}

          {/* Field Error Display */}
          {hasFieldErrors && (
            <div className="mb-6">
              <FieldErrorDisplay
                fieldErrors={fieldErrorCounts}
                onFieldFocus={handleFieldFocus}
                onDismiss={() => setFieldErrorCounts({})}
              />
            </div>
          )}

          {/* Step 1: Upload and Settings */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Import File</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.json"
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {selectedFile ? (
                      <span className="text-green-600 font-medium">{selectedFile.name}</span>
                    ) : (
                      <>Drop your file here or click to browse</>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: CSV, XLSX, JSON
                  </p>
                </div>
                
                {/* Template Download Links */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium mb-2">Download Templates:</p>
                  <div className="flex flex-wrap gap-2">
                    <a 
                      href="/import-templates/subjects-template.csv" 
                      download="subjects-template.csv"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      <Download className="w-3 h-3" />
                      CSV Template
                    </a>
                    <a 
                      href="/import-templates/subjects-template.xlsx" 
                      download="subjects-template.xlsx"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      <Download className="w-3 h-3" />
                      Excel Template
                    </a>
                    <a 
                      href="/import-templates/subjects-sample.json" 
                      download="subjects-sample.json"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      <Download className="w-3 h-3" />
                      JSON Sample
                    </a>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Required fields: id, name, shortName, code, creditHours, color, departmentId, semesterLevel, isCore, semesterId
                  </p>
                </div>
              </div>

              {/* Import Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Semester Selector */}
                <div className="space-y-2">
                  <Label>Default Semester</Label>
                  <Select
                    value={importSettings.selectedSemester}
                    onValueChange={(value) => setImportSettings(prev => ({ ...prev, selectedSemester: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name} ({semester.year} {semester.term})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Default Conflict Strategy */}
                <div className="space-y-2">
                  <Label>Default Conflict Strategy</Label>
                  <Select
                    value={importSettings.defaultConflictStrategy}
                    onValueChange={(value: 'skip' | 'overwrite' | 'keep_both') => 
                      setImportSettings(prev => ({ ...prev, defaultConflictStrategy: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip duplicates</SelectItem>
                      <SelectItem value="overwrite">Overwrite existing</SelectItem>
                      <SelectItem value="keep_both">Keep both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assignSemester"
                    checked={importSettings.assignSelectedSemesterToAll}
                    onCheckedChange={(checked) => 
                      setImportSettings(prev => ({ ...prev, assignSelectedSemesterToAll: !!checked }))
                    }
                  />
                  <Label htmlFor="assignSemester">Assign selected semester to all subjects</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoGenerateIds"
                    checked={importSettings.autoGenerateMissingIds}
                    onCheckedChange={(checked) => 
                      setImportSettings(prev => ({ ...prev, autoGenerateMissingIds: !!checked }))
                    }
                  />
                  <Label htmlFor="autoGenerateIds">Auto-generate missing IDs</Label>
                </div>
              </div>

              {/* Department Override */}
              <div className="space-y-2">
                <Label>Default Department (Optional)</Label>
                <Select
                  value={importSettings.defaultDepartmentId || ''}
                  onValueChange={(value) => 
                    setImportSettings(prev => ({ ...prev, defaultDepartmentId: value || undefined }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department override" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No override</SelectItem>
                    <SelectItem value="d6">Computer Science</SelectItem>
                    <SelectItem value="d2">Chemistry</SelectItem>
                    <SelectItem value="d3">Economics</SelectItem>
                    {/* Add more departments as needed */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Preview and Resolve */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{validationStats.valid}</div>
                  <div className="text-xs text-gray-600">Valid</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">{validationStats.invalid}</div>
                  <div className="text-xs text-gray-600">Invalid</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">{validationStats.duplicates}</div>
                  <div className="text-xs text-gray-600">Duplicates</div>
                </div>
              </div>

              {/* Bulk Actions */}
              {validationStats.duplicates > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Bulk conflict resolution:</span>
                  <Button size="sm" variant="outline" onClick={() => handleBulkConflictResolution('skip')}>
                    Skip All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkConflictResolution('overwrite')}>
                    Overwrite All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkConflictResolution('keep_both')}>
                    Keep Both
                  </Button>
                </div>
              )}

              {/* Performance Warning for Large Datasets */}
              {hasPerformanceConcerns && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-orange-800 font-medium mb-1">
                        Large Dataset Warning
                      </p>
                      <p className="text-xs text-orange-700">
                        This file contains {importedSubjects.length} rows, which exceeds the recommended limit of {PERFORMANCE_LIMITS.RECOMMENDED_MAX_ROWS} rows. 
                        Consider splitting your file into smaller chunks for better performance. Large files may cause browser slowdowns during processing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Optimization Notice */}
              {isLargeDataset && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        Displaying first {PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS} rows of {importedSubjects.length} total rows
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        For performance reasons, only the first {PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS} rows are shown. All rows will be processed during import.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowAllRows(!showAllRows)}
                        className="text-xs"
                      >
                        {showAllRows ? 'Show First 500' : 'Show All Rows'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => exportFullValidationReport('csv')}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export All
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Table */}
              <div className="border rounded-lg">
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="w-12 p-2">
                          <Checkbox
                            checked={importedSubjects.every(s => s.includeInImport)}
                            onCheckedChange={(checked) => {
                              setImportedSubjects(prev => 
                                prev.map(s => ({ ...s, includeInImport: !!checked }))
                              );
                            }}
                          />
                        </th>
                        <th className="text-left p-2">Subject</th>
                        <th className="text-left p-2">Code</th>
                        <th className="text-left p-2">Credits</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Conflicts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSubjects.map((subject, index) => (
                        <tr key={index} className={cn(
                          "border-t",
                          subject.validationState === 'invalid' && "bg-red-50",
                          subject.conflictState !== 'none' && "bg-yellow-50"
                        )}>
                          <td className="p-2">
                            <Checkbox
                              checked={subject.includeInImport}
                              onCheckedChange={() => toggleSubjectInclusion(subject.id || subject.code)}
                              disabled={subject.validationState === 'invalid'}
                            />
                          </td>
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{subject.name}</div>
                              <div className="text-xs text-gray-500">{subject.shortName}</div>
                            </div>
                          </td>
                          <td className="p-2">{subject.code}</td>
                          <td className="p-2">{subject.creditHours}</td>
                          <td className="p-2">
                            {subject.validationState === 'valid' && (
                              <Badge variant="success">Valid</Badge>
                            )}
                            {subject.validationState === 'invalid' && (
                              <Badge variant="error">Invalid</Badge>
                            )}
                            {subject.validationState === 'warning' && (
                              <Badge variant="warning">Warning</Badge>
                            )}
                          </td>
                          <td className="p-2">
                            {subject.conflictState === 'duplicate' && (
                              <div className="space-y-1">
                                <Badge variant="warning">Duplicate</Badge>
                                <Select
                                  value={subject.conflictResolution || 'skip'}
                                  onValueChange={(value: 'skip' | 'overwrite' | 'keep_both') => {
                                    setImportedSubjects(prev =>
                                      prev.map(s =>
                                        s.id === subject.id ? { ...s, conflictResolution: value } : s
                                      )
                                    );
                                  }}
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="skip">Skip</SelectItem>
                                    <SelectItem value="overwrite">Overwrite</SelectItem>
                                    <SelectItem value="keep_both">Keep Both</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {subject.conflictState === 'none' && (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {isLargeDataset && !showAllRows && (
                    <div className="p-3 bg-gray-50 border-t text-center">
                      <p className="text-xs text-gray-600">
                        Showing {displayedSubjects.length} of {importedSubjects.length} rows
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Errors */}
              {importedSubjects.some(s => s.validationErrors.length > 0) && (
                <div className="space-y-2">
                  <Label>Validation Issues</Label>
                  <div className="max-h-24 overflow-auto border rounded p-2 bg-red-50">
                    {importedSubjects.map((subject, index) => 
                      subject.validationErrors.map((error, errorIndex) => (
                        <div key={`${index}-${errorIndex}`} className="text-sm text-red-600">
                          <strong>{subject.name || subject.code}:</strong> {error}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Import Progress */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <div className="text-lg font-medium">
                  {currentStage ? `${IMPORT_STAGES.find(s => s.id === currentStage)?.label}...` : 'Preparing import...'}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                
                <div className="text-sm text-gray-600">{Math.round(importProgress)}% complete</div>

                <div className="space-y-2 text-sm">
                  {IMPORT_STAGES.map((stage, index) => (
                    <div 
                      key={stage.id}
                      className={cn(
                        "flex items-center justify-center gap-2",
                        currentStage === stage.id && "text-primary font-medium",
                        IMPORT_STAGES.findIndex(s => s.id === currentStage) > index && "text-green-600"
                      )}
                    >
                      {IMPORT_STAGES.findIndex(s => s.id === currentStage) > index ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : currentStage === stage.id ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                      )}
                      {stage.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{resultStats.added}</div>
                  <div className="text-sm text-green-700">Added</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{resultStats.updated}</div>
                  <div className="text-sm text-blue-700">Updated</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{resultStats.skipped}</div>
                  <div className="text-sm text-yellow-700">Skipped</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{resultStats.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              </div>

              {/* Download Reports */}
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => downloadReport('json')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON Report
                </Button>
                <Button variant="outline" onClick={() => downloadReport('csv')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Report
                </Button>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                <Label>Detailed Results</Label>
                <div className="max-h-64 overflow-auto border rounded">
                  {importResults.map((result, index) => (
                    <div key={index} className="border-b last:border-b-0">
                      <div 
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          const newExpanded = new Set(expandedResults);
                          if (newExpanded.has(result.subject.id)) {
                            newExpanded.delete(result.subject.id);
                          } else {
                            newExpanded.add(result.subject.id);
                          }
                          setExpandedResults(newExpanded);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {expandedResults.has(result.subject.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <div>
                            <div className="font-medium">{result.subject.name}</div>
                            <div className="text-sm text-gray-500">{result.subject.code}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.status === 'added' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {result.status === 'updated' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                          {result.status === 'skipped' && <XCircle className="w-4 h-4 text-yellow-500" />}
                          {result.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                          <Badge 
                            variant={
                              result.status === 'added' ? 'success' :
                              result.status === 'updated' ? 'secondary' :
                              result.status === 'skipped' ? 'warning' :
                              'error'
                            }
                          >
                            {result.status}
                          </Badge>
                        </div>
                      </div>
                      {expandedResults.has(result.subject.id) && (
                        <div className="px-10 pb-3 text-sm text-gray-600">
                          <strong>Reason:</strong> {result.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            <div>
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1) as 1 | 2 | 3 | 4)}
                  disabled={isImportInProgress}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {/* Dynamic button based on current step and state */}
              {currentStep === 3 && isImportInProgress ? (
                <Button 
                  variant="outline" 
                  onClick={cancelImport} 
                  disabled={!isCancellable}
                >
                  {isCancellable ? 'Cancel Import' : 'Saving...'}
                </Button>
              ) : (
                <Button variant="outline" onClick={onClose} disabled={isImportInProgress}>
                  {currentStep === 4 ? 'Close' : 'Cancel'}
                </Button>
              )}
              {currentStep === 1 && (
                <Button 
                  onClick={parseFile} 
                  disabled={!canProceedToStep2 || isImportInProgress}
                >
                  {isImportInProgress ? 'Parsing...' : 'Parse'}
                </Button>
              )}
              {currentStep === 2 && (
                <Button 
                  onClick={startImport}
                  disabled={!canProceedToStep3}
                >
                  Start Import ({importedSubjects.filter(s => s.includeInImport).length} subjects)
                </Button>
              )}
              {currentStep === 4 && (
                <Button onClick={completeImport}>
                  Complete
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportDialog;
