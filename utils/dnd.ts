/**
 * Drag and Drop Utilities for Timetable Component
 * 
 * This module provides defensive helper functions for managing drag and drop
 * operations in the timetable component, ensuring consistent ID schema and
 * preventing common drag/drop errors.
 */

// Types for drag/drop ID schema enforcement
export type DragIdParts = {
  groupKey: string;
  departmentId: string;
  timeSlotId: string;
};

// Template literal type to enforce 3-part format at compile time
export type DragId = `${string}|${string}|${string}`;

/**
 * Builds a consistent drag ID following the 3-part convention: groupKey|departmentId|timeSlotId
 * 
 * ## Why 3-part IDs?
 * 
 * The timetable uses a 3-part ID convention for drag and drop operations because:
 * 
 * 1. **groupKey**: Identifies a group of related timetable entries (same subject + teacher)
 *    - Format: `${subjectId}-${teacherId}`
 *    - Allows multiple entries to be moved together as a cohesive unit
 *    - Example: "math-101-teacher-001" represents all Math 101 classes taught by Teacher 001
 * 
 * 2. **departmentId**: Specifies which department row the entry belongs to
 *    - Enforces the constraint that entries can only be moved within the same department
 *    - Prevents cross-department scheduling conflicts
 *    - Example: "dept-cs" for Computer Science department
 * 
 * 3. **timeSlotId**: Indicates the current time slot of the entry
 *    - Used to detect when an entry is being moved to a different time
 *    - Essential for conflict detection and validation
 *    - Example: "slot-09-00" for 9:00 AM time slot
 * 
 * ## Why pipe (|) separator?
 * 
 * - Pipe characters are rare in typical IDs, reducing collision risk
 * - Easy to split programmatically with string.split('|')
 * - Visually distinct from hyphens used within individual ID components
 * - All components are sanitized to replace any internal pipes with hyphens
 * 
 * @param groupKey - Unique identifier for the group of related entries (subject-teacher combination)
 * @param departmentId - Department identifier (enforces same-department constraint)
 * @param timeSlotId - Time slot identifier (for conflict detection)
 * @returns Formatted drag ID string or empty string if validation fails
 * 
 * @example
 * ```typescript
 * // Valid usage
 * const dragId = buildDragId("math-101-teacher-001", "dept-cs", "slot-09-00");
 * // Returns: "math-101-teacher-001|dept-cs|slot-09-00"
 * 
 * // Invalid usage (empty parameters)
 * const dragId = buildDragId("", "dept-cs", "slot-09-00");
 * // Returns: "" (empty string) and logs warning
 * ```
 */
export const buildDragId = (
  groupKey: string,
  departmentId: string,
  timeSlotId: string
): DragId | '' => {
  // Validate inputs to prevent undefined/null values
  if (!groupKey || !departmentId || !timeSlotId) {
    console.warn('buildDragId: Invalid parameters', { groupKey, departmentId, timeSlotId });
    return '';
  }
  
  // Ensure no pipe characters in components to avoid parsing issues
  // This is critical because we use pipe as the delimiter
  const safeGroupKey = groupKey.replace(/\|/g, '-');
  const safeDepartmentId = departmentId.replace(/\|/g, '-');
  const safeTimeSlotId = timeSlotId.replace(/\|/g, '-');
  
  return `${safeGroupKey}|${safeDepartmentId}|${safeTimeSlotId}` as DragId;
};

/**
 * Parses a drag ID string back into its component parts
 * 
 * This function is the inverse of buildDragId and is used to extract
 * the individual components from a drag ID for validation and processing.
 * 
 * ## Validation Rules
 * 
 * 1. **Format Validation**: Must contain exactly 3 parts separated by pipes
 * 2. **Non-empty Parts**: All three components must be non-empty strings
 * 3. **Type Safety**: Returns null if any validation fails (fail-fast approach)
 * 
 * ## Error Handling
 * 
 * The function uses defensive programming principles:
 * - Validates input type and format before processing
 * - Logs warnings for debugging when validation fails
 * - Returns null instead of throwing exceptions (graceful degradation)
 * - Caller is responsible for handling null return values
 * 
 * @param dragId - The drag ID string to parse (should follow format: groupKey|departmentId|timeSlotId)
 * @returns Object with parsed components, or null if parsing fails
 * 
 * @example
 * ```typescript
 * // Valid parsing
 * const parts = parseDragId("math-101-teacher-001|dept-cs|slot-09-00");
 * // Returns: { groupKey: "math-101-teacher-001", departmentId: "dept-cs", timeSlotId: "slot-09-00" }
 * 
 * // Invalid format
 * const parts = parseDragId("invalid-format");
 * // Returns: null and logs warning
 * 
 * // Usage with null checking
 * const parts = parseDragId(dragId);
 * if (parts) {
 *   // Safe to use parts.groupKey, parts.departmentId, parts.timeSlotId
 *   console.log(`Moving ${parts.groupKey} to ${parts.timeSlotId}`);
 * } else {
 *   console.error('Invalid drag ID format');
 * }
 * ```
 */
export const parseDragId = (dragId: string): DragIdParts | null => {
  if (!dragId || typeof dragId !== 'string') {
    console.warn('parseDragId: Invalid drag ID', dragId);
    return null;
  }
  
  const parts = dragId.split('|');
  if (parts.length !== 3) {
    console.warn('parseDragId: Invalid ID format - expected 3 parts separated by |', { 
      dragId, 
      parts,
      expectedFormat: 'groupKey|departmentId|timeSlotId'
    });
    return null;
  }
  
  const [groupKey, departmentId, timeSlotId] = parts;
  
  // Validate that all parts are non-empty
  if (!groupKey || !departmentId || !timeSlotId) {
    console.warn('parseDragId: Empty parts detected', { 
      groupKey, 
      departmentId, 
      timeSlotId,
      originalDragId: dragId 
    });
    return null;
  }
  
  return { groupKey, departmentId, timeSlotId };
};

/**
 * Validates a drag ID without parsing it (lighter weight check)
 * 
 * This is a utility function for quick validation when you only need
 * to know if a drag ID is valid without actually parsing it.
 * 
 * @param dragId - The drag ID string to validate
 * @returns true if the drag ID has valid format, false otherwise
 * 
 * @example
 * ```typescript
 * if (isValidDragId(someId)) {
 *   // Safe to use parseDragId or proceed with drag operation
 *   const parts = parseDragId(someId);
 * }
 * ```
 */
export const isValidDragId = (dragId: string): dragId is DragId => {
  if (!dragId || typeof dragId !== 'string') {
    return false;
  }
  
  const parts = dragId.split('|');
  return parts.length === 3 && parts.every(part => part.trim().length > 0);
};

/**
 * Creates a group key from subject and teacher IDs
 * 
 * This is a convenience function that standardizes how group keys are created
 * throughout the application. It ensures consistent formatting and handles
 * edge cases.
 * 
 * @param subjectId - The subject identifier
 * @param teacherId - The teacher identifier
 * @returns Formatted group key
 * 
 * @example
 * ```typescript
 * const groupKey = createGroupKey("math-101", "teacher-001");
 * // Returns: "math-101-teacher-001"
 * ```
 */
export const createGroupKey = (subjectId: string, teacherId: string): string => {
  if (!subjectId || !teacherId) {
    console.warn('createGroupKey: Invalid parameters', { subjectId, teacherId });
    return '';
  }
  
  // Sanitize inputs to ensure no pipe characters
  const safeSubjectId = subjectId.replace(/\|/g, '-');
  const safeTeacherId = teacherId.replace(/\|/g, '-');
  
  return `${safeSubjectId}-${safeTeacherId}`;
};
