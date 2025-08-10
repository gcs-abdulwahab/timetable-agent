'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronRight, 
  Download,
  RefreshCw,
  CheckCircle,
  Copy,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DetailedError,
  ServerErrorResponse,
  ValidationSummary,
  RowValidationResult,
  ErrorSeverity,
  ErrorCategory,
  exportInvalidRows,
  getUserFriendlyMessage
} from '@/lib/import/errorHandling';

interface ErrorFeedbackProps {
  title?: string;
  className?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  maxHeight?: string;
}

interface FatalErrorDisplayProps extends ErrorFeedbackProps {
  errors: DetailedError[];
}

interface ServerErrorDisplayProps extends ErrorFeedbackProps {
  error: ServerErrorResponse;
}

interface ValidationSummaryDisplayProps extends ErrorFeedbackProps {
  summary: ValidationSummary;
  invalidRows?: RowValidationResult[];
  onDownloadInvalidRows?: (format: 'csv' | 'json') => void;
}

interface FieldErrorDisplayProps extends ErrorFeedbackProps {
  fieldErrors: Record<string, number>;
  onFieldFocus?: (field: string) => void;
}

/**
 * Get icon and color for error severity
 */
function getErrorSeverityDisplay(severity: ErrorSeverity) {
  switch (severity) {
    case ErrorSeverity.FATAL:
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    case ErrorSeverity.ERROR:
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    case ErrorSeverity.WARNING:
      return {
        icon: AlertTriangle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    case ErrorSeverity.INFO:
      return {
        icon: Info,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    default:
      return {
        icon: AlertCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
  }
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Fatal Error Display Component
 */
export const FatalErrorDisplay: React.FC<FatalErrorDisplayProps> = ({
  errors,
  title = 'Critical Errors',
  className = '',
  onRetry,
  onDismiss,
  maxHeight = 'max-h-96'
}) => {
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [copiedErrorId, setCopiedErrorId] = useState<string | null>(null);

  const toggleErrorExpansion = (errorId: string) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(errorId)) {
      newExpanded.delete(errorId);
    } else {
      newExpanded.add(errorId);
    }
    setExpandedErrors(newExpanded);
  };

  const handleCopyError = async (error: DetailedError) => {
    const errorText = `
Error ID: ${error.id}
Type: ${error.severity.toUpperCase()} - ${error.category}
Message: ${error.message}
${error.details ? `Details: ${error.details}` : ''}
${error.suggestion ? `Suggestion: ${error.suggestion}` : ''}
Timestamp: ${error.timestamp.toISOString()}
    `.trim();

    const success = await copyToClipboard(errorText);
    if (success) {
      setCopiedErrorId(error.id);
      setTimeout(() => setCopiedErrorId(null), 2000);
    }
  };

  if (errors.length === 0) return null;

  const fatalErrors = errors.filter(e => e.severity === ErrorSeverity.FATAL);
  const otherErrors = errors.filter(e => e.severity !== ErrorSeverity.FATAL);

  return (
    <div className={cn(
      'border rounded-lg bg-red-50 border-red-200 p-4',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-medium text-red-800">{title}</h3>
          <Badge variant="error" size="sm">
            {errors.length} {errors.length === 1 ? 'Error' : 'Errors'}
          </Badge>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className={cn('overflow-auto space-y-2', maxHeight)}>
        {/* Fatal Errors - Always show first */}
        {fatalErrors.map((error) => {
          const display = getErrorSeverityDisplay(error.severity);
          const Icon = display.icon;
          const isExpanded = expandedErrors.has(error.id);

          return (
            <div
              key={error.id}
              className={cn(
                'border rounded p-3 transition-colors',
                display.bgColor,
                display.borderColor
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', display.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {error.message}
                      </p>
                      {error.field && (
                        <p className="text-xs text-gray-600 mt-1">
                          Field: <code className="bg-gray-100 px-1 rounded">{error.field}</code>
                          {error.row !== undefined && ` (Row ${error.row + 1})`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyError(error)}
                        className="h-6 px-1"
                      >
                        {copiedErrorId === error.id ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleErrorExpansion(error.id)}
                        className="h-6 px-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                      {error.details && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Details:</p>
                          <p className="text-xs text-gray-600 bg-white/50 p-2 rounded">
                            {error.details}
                          </p>
                        </div>
                      )}
                      {error.suggestion && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Suggested Fix:</p>
                          <p className="text-xs text-blue-700 bg-blue-100/50 p-2 rounded">
                            {error.suggestion}
                          </p>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Error ID: {error.id} • {error.timestamp.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Other Errors */}
        {otherErrors.map((error) => {
          const display = getErrorSeverityDisplay(error.severity);
          const Icon = display.icon;
          const isExpanded = expandedErrors.has(error.id);

          return (
            <div
              key={error.id}
              className={cn(
                'border rounded p-3 transition-colors',
                display.bgColor,
                display.borderColor
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', display.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {error.message}
                      </p>
                      {error.field && (
                        <p className="text-xs text-gray-600 mt-1">
                          Field: <code className="bg-gray-100 px-1 rounded">{error.field}</code>
                          {error.row !== undefined && ` (Row ${error.row + 1})`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyError(error)}
                        className="h-6 px-1"
                      >
                        {copiedErrorId === error.id ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleErrorExpansion(error.id)}
                        className="h-6 px-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                      {error.details && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Details:</p>
                          <p className="text-xs text-gray-600 bg-white/50 p-2 rounded">
                            {error.details}
                          </p>
                        </div>
                      )}
                      {error.suggestion && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Suggested Fix:</p>
                          <p className="text-xs text-blue-700 bg-blue-100/50 p-2 rounded">
                            {error.suggestion}
                          </p>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Error ID: {error.id} • {error.timestamp.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-red-200">
        {onRetry && fatalErrors.some(e => e.retryable) && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Server Error Display Component
 */
export const ServerErrorDisplay: React.FC<ServerErrorDisplayProps> = ({
  error,
  title = 'Server Error',
  className = '',
  onRetry,
  onDismiss,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyError = async () => {
    const errorText = `
Server Error (${error.status}):
${error.error}
${error.details ? `Details: ${error.details}` : ''}
${error.code ? `Code: ${error.code}` : ''}
Timestamp: ${error.timestamp.toISOString()}
Retryable: ${error.retryable ? 'Yes' : 'No'}
    `.trim();

    const success = await copyToClipboard(errorText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getErrorColor = () => {
    if (error.status >= 500) return 'red';
    if (error.status >= 400) return 'yellow';
    return 'gray';
  };

  const colorClass = getErrorColor();

  return (
    <div className={cn(
      'border rounded-lg p-4',
      colorClass === 'red' && 'bg-red-50 border-red-200',
      colorClass === 'yellow' && 'bg-yellow-50 border-yellow-200',
      colorClass === 'gray' && 'bg-gray-50 border-gray-200',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className={cn(
            'w-5 h-5',
            colorClass === 'red' && 'text-red-600',
            colorClass === 'yellow' && 'text-yellow-600',
            colorClass === 'gray' && 'text-gray-600'
          )} />
          <h3 className={cn(
            'font-medium',
            colorClass === 'red' && 'text-red-800',
            colorClass === 'yellow' && 'text-yellow-800',
            colorClass === 'gray' && 'text-gray-800'
          )}>
            {title}
          </h3>
          <Badge variant={colorClass === 'red' ? 'error' : 'warning'} size="sm">
            {error.status}
          </Badge>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900">{error.error}</p>
        
        {error.details && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="p-0 h-auto font-normal"
            >
              <div className="flex items-center gap-1">
                {showDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span className="text-xs">Show details</span>
              </div>
            </Button>
            {showDetails && (
              <div className="mt-2 p-3 bg-white/50 rounded border text-xs text-gray-600 font-mono">
                {error.details}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">
          {error.timestamp.toLocaleString()}
          {error.code && ` • Code: ${error.code}`}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyError}
          className="text-xs"
        >
          {copied ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy Error
            </>
          )}
        </Button>

        <div className="flex gap-2">
          {error.retryable && onRetry && (
            <Button size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Validation Summary Display Component
 */
export const ValidationSummaryDisplay: React.FC<ValidationSummaryDisplayProps> = ({
  summary,
  invalidRows = [],
  title = 'Validation Results',
  className = '',
  onDownloadInvalidRows,
  onDismiss,
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleDownloadInvalidRows = (format: 'csv' | 'json') => {
    if (onDownloadInvalidRows) {
      onDownloadInvalidRows(format);
    } else {
      // Fallback: generate download directly
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

  const getStatusColor = () => {
    if (!summary.canProceed) return 'red';
    if (summary.invalidRows > 0 || summary.rowsWithWarnings > 0) return 'yellow';
    return 'green';
  };

  const statusColor = getStatusColor();

  return (
    <div className={cn(
      'border rounded-lg p-4',
      statusColor === 'red' && 'bg-red-50 border-red-200',
      statusColor === 'yellow' && 'bg-yellow-50 border-yellow-200',
      statusColor === 'green' && 'bg-green-50 border-green-200',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {statusColor === 'red' && <XCircle className="w-5 h-5 text-red-600" />}
          {statusColor === 'yellow' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
          {statusColor === 'green' && <CheckCircle className="w-5 h-5 text-green-600" />}
          <h3 className={cn(
            'font-medium',
            statusColor === 'red' && 'text-red-800',
            statusColor === 'yellow' && 'text-yellow-800',
            statusColor === 'green' && 'text-green-800'
          )}>
            {title}
          </h3>
          <Badge
            variant={statusColor === 'green' ? 'success' : statusColor === 'yellow' ? 'warning' : 'error'}
            size="sm"
          >
            {summary.validationRate}% Valid
          </Badge>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{summary.validRows}</div>
          <div className="text-xs text-gray-600">Valid</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">{summary.invalidRows}</div>
          <div className="text-xs text-gray-600">Invalid</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">{summary.rowsWithWarnings}</div>
          <div className="text-xs text-gray-600">Warnings</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-600">{summary.totalRows}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>

      {/* Recommended Actions */}
      {summary.recommendedActions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</p>
          <ul className="space-y-1">
            {summary.recommendedActions.map((action, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      {summary.invalidRows > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            className="w-full"
          >
            {showActions ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
            Download Invalid Rows for Offline Correction
          </Button>
          
          {showActions && (
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadInvalidRows('csv')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadInvalidRows('json')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Field Error Display Component
 */
export const FieldErrorDisplay: React.FC<FieldErrorDisplayProps> = ({
  fieldErrors,
  title = 'Field Errors',
  className = '',
  onFieldFocus,
  onDismiss,
}) => {
  const sortedFields = Object.entries(fieldErrors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Show top 10 most problematic fields

  if (sortedFields.length === 0) return null;

  return (
    <div className={cn(
      'border rounded-lg bg-orange-50 border-orange-200 p-4',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="font-medium text-orange-800">{title}</h3>
          <Badge variant="warning" size="sm">
            {sortedFields.length} Fields
          </Badge>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {sortedFields.map(([field, count]) => (
          <div
            key={field}
            className="flex items-center justify-between p-2 bg-white/50 rounded border border-orange-100"
          >
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                {field}
              </code>
              <span className="text-sm text-gray-600">
                {count} {count === 1 ? 'error' : 'errors'}
              </span>
            </div>
            {onFieldFocus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFieldFocus(field)}
                className="h-6 text-xs"
              >
                Focus Field
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
