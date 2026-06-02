import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload } from 'lucide-react';
import { AppData } from '@/types';

interface DataExportProps {
  data: AppData;
  onImport: (data: AppData) => void;
}

export function DataExport({ data, onImport }: DataExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runway-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as AppData;
        if (imported.expenses && imported.incomes && imported.cashPositions) {
          onImport(imported);
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Data Backup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Export your data to back it up or migrate to another device.
        </p>
      </CardContent>
    </Card>
  );
}