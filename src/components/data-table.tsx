"use client"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    SortingState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty';
import { FolderOpen, Search, ArrowUpDown, ArrowUp, ArrowDown, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Input } from './ui/input';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserEmail } from '@/hooks/useUserEmail';

// Interface générique pour les props
interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    perPage?: number;
    filename?: string;
}

export function DataTable<TData>({
    columns,
    data,
    perPage = 5,
    filename = "export"
}: DataTableProps<TData>) {
    const { user } = useUserEmail();
    const userEmail = user?.email || '';

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: perPage,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: {
            pagination,
            sorting,
            globalFilter,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: 'includesString',
    });

    const getExportData = () => {
        return table.getFilteredRowModel().rows.map(row => {
            const rowData: any = {};
            columns.forEach(col => {
                const columnId = (col as any).accessorKey || col.id;
                if (columnId && col.id !== 'actions') {
                    // Try to get header text
                    let headerText: string = "";
                    if (typeof col.header === 'string') {
                        headerText = col.header;
                    } else {
                        headerText = col.id || (typeof (col as any).accessorKey === 'string' ? (col as any).accessorKey : 'ID');
                    }

                    let value;

                    // Try to get value - for columns with only id, access original directly
                    if ((col as any).accessorKey) {
                        try {
                            value = row.getValue(columnId);
                        } catch (e) {
                            value = (row.original as any)[columnId];
                        }
                    } else {
                        // For columns with only id, access original data directly
                        const original = row.original as any;
                        value = original[columnId];

                        // Special handling for common nested paths based on column id
                        if (value === undefined || value === null) {
                            // Try common nested paths
                            if (columnId === 'email' && original.user) {
                                value = original.user.email;
                            } else if (columnId === 'user' && original.user) {
                                value = original.user.name || original.user.email;
                            } else if (columnId === 'order' && original.order) {
                                value = original.order.order_number;
                            } else if (columnId === 'pack' && original.order?.pack) {
                                value = original.order.pack.name;
                            }
                        }
                    }

                    // Fallback for missing value
                    if (value === undefined || value === null) {
                        const original = row.original as any;
                        value = original[columnId];
                    }

                    // Special handling for common nested structures or arrays
                    if (Array.isArray(value)) {
                        value = value.map(item => (typeof item === 'object' && item !== null) ? (item.feature_name || item.name || item.title || item.label || JSON.stringify(item)) : item).join(', ');
                    } else if (typeof value === 'object' && value !== null) {
                        // Extract a meaningful string from the object
                        const objValue = value as any;
                        value = objValue.order_number ||
                            objValue.name ||
                            objValue.title ||
                            objValue.label ||
                            objValue.email ||
                            objValue.number ||
                            objValue.value ||
                            (objValue.toString && objValue.toString() !== '[object Object]' ? objValue.toString() : JSON.stringify(objValue));
                    }

                    rowData[headerText] = value || '';
                }
            });
            return rowData;
        });
    };

    const exportToExcel = () => {
        const rows = getExportData();
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    const exportToPDF = async () => {
        const doc = new jsPDF();

        try {
            // Add Logo
            const logoUrl = '/images/BVT-horizontal.png';
            const img = new Image();
            img.src = logoUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            // Add logo correctly - doubled size
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                // Logo size doubled: 40 instead of 20
                doc.addImage(dataUrl, 'PNG', 14, 10, 60, 60 * (img.height / img.width));
            }
        } catch (error) {
            console.error('Failed to load logo for PDF export', error);
        }

        // Add Title - positioned to the right
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        // doc.text(filename.charAt(0).toUpperCase() + filename.slice(1), 120, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        // doc.text(`Généré le: ${new Date().toLocaleString('fr-FR', {
        //     day: '2-digit',
        //     month: '2-digit',
        //     year: 'numeric',
        //     hour: '2-digit',
        //     minute: '2-digit'
        // })}`, 120, 26);
        doc.setTextColor(0);

        const exportColumns = columns
            .filter(col => {
                const columnId = (col as any).accessorKey || col.id;
                return columnId && col.id !== 'actions';
            })
            .map(col => {
                const columnId = (col as any).accessorKey || col.id;
                const header = typeof col.header === 'string' ? col.header : (col.id || columnId);
                return {
                    header: header,
                    dataKey: header // Must match keys in getExportData()
                };
            });

        const rows = getExportData();

        autoTable(doc, {
            columns: exportColumns,
            body: rows,
            startY: 50, // Increased from 40 to accommodate larger logo
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didDrawPage: (data) => {
                // Footer
                const pageHeight = doc.internal.pageSize.height;
                const pageWidth = doc.internal.pageSize.width;

                doc.setFontSize(7);
                doc.setTextColor(100);

                // Email on the left
                doc.text(userEmail || 'info@bluevaloristech.com', 14, pageHeight - 10);

                // Date and time on the right
                const exportDateTime = new Date().toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                const dateText = ` ${exportDateTime}`;
                const dateTextWidth = doc.getTextWidth(dateText);
                doc.text(dateText, pageWidth - dateTextWidth - 14, pageHeight - 10);

                doc.setTextColor(0);
            }
        });

        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="space-y-4">
            {/* Header with Search and Export */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 rounded-xl h-10" />}>
                            <Download className="w-4 h-4" />
                            <span>Exporter</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="rounded-xl">
                            <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer">
                                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
                                <FileText className="w-4 h-4 text-red-600" />
                                PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 max-w-sm w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher..."
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10 h-10 border-gray-200 focus:ring-primary/20 rounded-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-center p-0">
                                        <div
                                            className={`flex items-center justify-center p-3 cursor-pointer select-none gap-2 hover:bg-gray-50 transition-colors dark:hover:bg-slate-800 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            {header.column.getCanSort() && (
                                                <span className="text-gray-400">
                                                    {{
                                                        asc: <ArrowUp className="w-3 h-3" />,
                                                        desc: <ArrowDown className="w-3 h-3" />,
                                                    }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="w-3 h-3" />}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-center">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <FolderOpen />
                                            </EmptyMedia>
                                            <EmptyTitle>{"Aucun résultat trouvé."}</EmptyTitle>
                                        </EmptyHeader>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} {"sur"}{" "}
                        {table.getPageCount()}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        Total: {data.length} elements
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {"Précédent"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {"Suivant"}
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{"Lignes par page"}:</span>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Si "all" est sélectionné, définir la taille de page sur la longueur totale des données
                            if (value === "all") {
                                table.setPageSize(data.length);
                            } else {
                                table.setPageSize(Number(value));
                            }
                        }}
                        className="border rounded p-1 text-sm"
                    >
                        {[3, 5, 10, 20, 30, 40, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>

                        ))}
                        <option key="all" value="all">
                            {"Tous"}
                        </option>
                    </select>
                </div>
            </div>
        </div>
    );
}
