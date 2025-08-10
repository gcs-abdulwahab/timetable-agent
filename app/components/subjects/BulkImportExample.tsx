'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import BulkImportDialog from './BulkImportDialog';

const BulkImportExample: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImportComplete = (results: any[]) => {
    console.log('Import completed with results:', results);
    // Handle the import results here
    // e.g., refresh the subjects list, show notifications, etc.
  };

  return (
    <div className="p-4">
      <Button onClick={() => setIsDialogOpen(true)}>
        Bulk Import Subjects
      </Button>
      
      <BulkImportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default BulkImportExample;
