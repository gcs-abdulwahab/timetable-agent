'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass,
  variant = 'default',
  icon,
  children
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Default icon for warning/confirmation dialogs
  const defaultIcon = (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
      <svg
        className="h-6 w-6 text-orange-600"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {icon && (
            <div className="mb-4 flex justify-center">
              {icon}
            </div>
          )}
          {!icon && (
            <div className="mb-4 flex justify-center">
              {defaultIcon}
            </div>
          )}
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center whitespace-pre-line">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        {children && (
          <div className="my-4">
            {children}
          </div>
        )}
        
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${confirmButtonClass || ''}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
