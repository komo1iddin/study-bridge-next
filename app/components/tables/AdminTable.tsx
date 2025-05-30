import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

// Generic type for table column definition
export interface AdminTableColumn<T> {
  header: string;
  key: string;
  cell: (item: T) => React.ReactNode;
  className?: string;
}

export interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  keyField: keyof T; // Field to use as unique key for rows
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyState?: React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
}

export function AdminTable<T>({
  columns,
  data,
  keyField,
  isLoading = false,
  error = null,
  onRetry,
  emptyState,
  loadingMessage = "Loading data...",
  errorMessage = "Failed to load data"
}: AdminTableProps<T>) {
  // Display loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-2 text-sm text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive/70" />
        <p className="mt-2 text-muted-foreground">{errorMessage}: {error}</p>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Display empty state
  if (data.length === 0 && emptyState) {
    return <div className="text-center py-8">{emptyState}</div>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={column.className}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y">
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                No data found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={String(item[keyField])}>
                {columns.map((column) => (
                  <TableCell key={`${String(item[keyField])}-${column.key}`} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Utility function to create a status badge
export function StatusBadge({ active, label = "" }: { active: boolean; label?: string }) {
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
      active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}>
      {label || (active ? "Active" : "Inactive")}
    </span>
  );
}

// Utility function to create a type badge
export function TypeBadge({ type, label }: { type: string; label: string }) {
  const colorMap: Record<string, string> = {
    province: "bg-blue-100 text-blue-700",
    city: "bg-violet-100 text-violet-700",
    university: "bg-green-100 text-green-700",
    agent: "bg-orange-100 text-orange-700",
    default: "bg-gray-100 text-gray-700"
  };

  const colorClass = colorMap[type] || colorMap.default;

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs ${colorClass}`}>
      {label}
    </span>
  );
}

// Utility function to create action buttons
export function ActionButtons({
  onEdit,
  onDelete,
  deleteWarning = "Are you sure you want to delete this item? This action cannot be undone."
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteWarning?: string;
}) {
  // This would typically include the AlertDialog for delete confirmation
  // But for simplicity, we're just showing the buttons here
  return (
    <div className="flex justify-end space-x-2">
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onEdit}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil h-4 w-4">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
          <span className="sr-only">Edit</span>
        </Button>
      )}
      
      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50"
          onClick={onDelete}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 h-4 w-4">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" x2="10" y1="11" y2="17"/>
            <line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
          <span className="sr-only">Delete</span>
        </Button>
      )}
    </div>
  );
} 