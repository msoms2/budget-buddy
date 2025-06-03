import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  ArrowUpDown,
  MoreHorizontal,
  CheckSquare,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DataTable Component
 * 
 * A reusable table component with sorting, filtering, pagination, and bulk actions
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Array of column definitions
 * @param {Object} props.pagination - Pagination object from Laravel
 * @param {Function} props.onSort - Sort handler function
 * @param {Function} props.onFilter - Filter handler function
 * @param {Function} props.onBulkAction - Bulk action handler function
 * @param {Array} props.bulkActions - Array of bulk action definitions
 * @param {boolean} props.loading - Loading state
 * @param {string} props.searchPlaceholder - Search input placeholder
 * @param {boolean} props.selectable - Enable row selection
 * @param {string} props.className - Additional CSS classes
 */
export default function DataTable({
  data = [],
  columns = [],
  pagination = null,
  onSort,
  onFilter,
  onBulkAction,
  bulkActions = [],
  loading = false,
  searchPlaceholder = "Search...",
  selectable = false,
  className = ""
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    onSort && onSort(key, direction);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    onFilter && onFilter({ search: value });
  };

  // Handle row selection
  const handleRowSelect = (rowId, checked) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    setSelectedRows(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = data.map(row => row.id);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedRows.size === 0) return;
    onBulkAction && onBulkAction(action, Array.from(selectedRows));
    setSelectedRows(new Set()); // Clear selection after action
  };

  // Sort icon component
  const SortIcon = ({ column, sortConfig }) => {
    if (!column.sortable) return null;
    
    if (sortConfig.key === column.key) {
      return sortConfig.direction === 'asc' ? 
        <ChevronUp className="h-4 w-4" /> : 
        <ChevronDown className="h-4 w-4" />;
    }
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  // Check if all rows are selected
  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and bulk actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Bulk actions */}
        {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              {selectedRows.size} selected
            </Badge>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => handleBulkAction(action)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate ? true : undefined}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.sortable && "cursor-pointer hover:bg-muted/80 transition-colors",
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      <SortIcon column={column} sortConfig={sortConfig} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {selectable && (
                      <TableCell>
                        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (selectable ? 1 : 0)} 
                    className="text-center py-8 text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                data.map((row, index) => (
                  <TableRow 
                    key={row.id || index}
                    className={cn(
                      "group hover:bg-muted/50 transition-colors",
                      selectedRows.has(row.id) && "bg-muted/30"
                    )}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={(checked) => handleRowSelect(row.id, checked)}
                          aria-label={`Select row ${index + 1}`}
                          indeterminate={undefined}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell 
                        key={column.key}
                        className={column.cellClassName}
                      >
                        {column.render ? 
                          column.render(row[column.key], row, index) : 
                          row[column.key]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.links && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
          </div>
          <div className="flex gap-1">
            {pagination.links.map((link, index) => (
              <Button
                key={index}
                variant={link.active ? "default" : "outline"}
                size="sm"
                className={cn(
                  "px-3",
                  !link.url && "opacity-50 cursor-not-allowed"
                )}
                asChild={!!link.url}
                disabled={!link.url || loading}
              >
                {link.url ? (
                  <a
                    href={link.url}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: link.label }} />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to create column definitions
 */
export const createColumn = ({
  key,
  label,
  sortable = false,
  render = null,
  width = null,
  className = "",
  cellClassName = ""
}) => ({
  key,
  label,
  sortable,
  render,
  width,
  className,
  cellClassName
});