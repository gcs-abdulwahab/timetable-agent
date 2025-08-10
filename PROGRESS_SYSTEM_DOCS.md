# Progress Indicator and State Management Implementation

## Overview

This document describes the implementation of the progress indicator and state management system for the BulkImportDialog component as per Step 12 requirements.

## Progress Values

The system uses specific determinate progress values for each import phase:

- **10%** - Parse done (file parsing completed)
- **35%** - Validation done (data validation completed) 
- **55%** - Conflict analysis done (conflict detection completed)
- **75%** - Merging done (data merging completed)
- **90%** - Saving (database write in progress)
- **100%** - Complete (entire import process finished)

## Implementation Details

### Progress Stages Configuration

```typescript
const IMPORT_STAGES = [
  { id: 'parsing', label: 'Parsing file', progress: 10 },
  { id: 'validation', label: 'Validating data', progress: 35 },
  { id: 'conflict_detection', label: 'Detecting conflicts', progress: 55 },
  { id: 'merging', label: 'Merging data', progress: 75 },
  { id: 'saving', label: 'Saving to database', progress: 90 },
] as const;

const COMPLETE_PROGRESS = 100;
```

### State Management

The system maintains several state variables to control progress and cancellation:

```typescript
const [isImportInProgress, setIsImportInProgress] = useState(false);
const [currentStage, setCurrentStage] = useState<typeof IMPORT_STAGES[number]['id'] | null>(null);
const [importProgress, setImportProgress] = useState(0);
const [isCancellable, setIsCancellable] = useState(true);
const [isCancelled, setIsCancelled] = useState(false);
```

### Progress Updates

Progress is updated per phase using the predefined progress values:

```typescript
for (let i = 0; i < IMPORT_STAGES.length; i++) {
  if (isCancelled) break;
  
  const stage = IMPORT_STAGES[i];
  setCurrentStage(stage.id);
  setImportProgress(stage.progress); // Uses specific progress value
  
  // Disable cancellation during saving phase
  if (stage.id === 'saving') {
    setIsCancellable(false);
  }
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (isCancelled) break;
}
```

## Cancellation System

### Cancellable State Management

- **Before saving phase**: User can cancel the import operation
- **During saving phase**: Cancel button is disabled (shows "Saving...")
- **After cancellation**: Returns user to the preview step (step 2)

### Cancel Implementation

```typescript
const cancelImport = () => {
  setIsCancelled(true);
  setIsImportInProgress(false);
  setCurrentStage(null);
  setImportProgress(0);
  setCurrentStep(2); // Return to preview step
};
```

### UI Components

#### Progress Bar
```typescript
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-primary h-2 rounded-full transition-all duration-300"
    style={{ width: `${importProgress}%` }}
  />
</div>
```

#### Stage Indicators
```typescript
{IMPORT_STAGES.map((stage, index) => (
  <div className={cn(
    "flex items-center justify-center gap-2",
    currentStage === stage.id && "text-primary font-medium",
    IMPORT_STAGES.findIndex(s => s.id === currentStage) > index && "text-green-600"
  )}>
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
```

#### Cancel Button
```typescript
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
```

## Key Features

1. **Determinate Progress**: Uses specific percentage values for each phase instead of generic calculations
2. **Visual Feedback**: Progress bar, percentage display, and stage-specific indicators
3. **Controlled Cancellation**: 
   - Enabled during most phases
   - Disabled during file writing for data integrity
   - Clear visual feedback with button text change
4. **State Consistency**: Proper cleanup and state management on cancellation
5. **User Experience**: Returns to logical step (preview) when cancelled

## Integration Points

The progress system integrates with the existing import workflow:
- File parsing phase (parseFile function)
- Import execution phase (startImport function)  
- State cleanup on dialog close
- Error handling and recovery

This implementation provides a robust, user-friendly progress tracking system with appropriate cancellation controls for the bulk import process.
