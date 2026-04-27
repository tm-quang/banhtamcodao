/**
 * DataTable component với TanStack Table và Tailwind CSS
 * Cần cài đặt: npm install @tanstack/react-table
 */
'use client';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox, Package } from 'lucide-react';
import { SkeletonTableRow } from './Skeleton';

export default function DataTable({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Tìm kiếm...',
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  emptyStateIcon,
  emptyStateTitle = 'Không có dữ liệu',
  emptyStateDescription = 'Chưa có thông tin nào để hiển thị',
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const getSortIcon = (column) => {
    if (!column.getCanSort()) return null;
    const sorted = column.getIsSorted();
    if (sorted === 'asc') return <ChevronUp size={16} className="text-blue-600" />;
    if (sorted === 'desc') return <ChevronDown size={16} className="text-blue-600" />;
    return <ChevronsUpDown size={16} className="text-gray-400" />;
  };

  return (
    <div className="w-full space-y-4">
      {/* Search */}
      {searchable && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={searchPlaceholder}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b border-gray-300">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`
                        px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600
                        ${header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-gray-100' : ''}
                      `}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {getSortIcon(header.column)}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                // Skeleton Loading
                Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonTableRow
                    key={index}
                    columns={columns}
                    showSubline={index % 3 === 0}
                  />
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                          {emptyStateIcon ? (
                            <div className="text-gray-400">{emptyStateIcon}</div>
                          ) : (
                            <Inbox size={48} className="text-gray-400" />
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900 mb-1">{emptyStateTitle}</p>
                        <p className="text-sm text-gray-500">{emptyStateDescription}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-200 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap px-3 py-2 text-sm text-gray-900"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-gray-700">
          Hiển thị{' '}
          <span className="font-semibold">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          </span>{' '}
          -{' '}
          <span className="font-semibold">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </span>{' '}
          / <span className="font-semibold">{table.getFilteredRowModel().rows.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} / trang
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

