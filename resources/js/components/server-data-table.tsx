import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type DtResponse<T> = {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: T[];
};

type Props<T> = {
    columns: ColumnDef<T>[];
    apiUrl: string;
    extraParams?: Record<string, string | number | undefined>;
    /** Called after each successful fetch — useful for refreshing sibling state */
    onDataLoaded?: (data: T[]) => void;
    /** Force a refetch when this value changes (e.g. after a mutation) */
    refreshKey?: number;
};

export function ServerDataTable<T>({ columns, apiUrl, extraParams, onDataLoaded, refreshKey }: Props<T>) {
    const [data, setData] = useState<T[]>([]);
    const [recordsTotal, setRecordsTotal] = useState(0);
    const [recordsFiltered, setRecordsFiltered] = useState(0);
    const [loading, setLoading] = useState(false);

    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const drawRef = useRef(0);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        drawRef.current += 1;
        const currentDraw = drawRef.current;

        const params = new URLSearchParams();
        params.set('draw', String(currentDraw));
        params.set('start', String(pageIndex * pageSize));
        params.set('length', String(pageSize));
        params.set('search[value]', globalFilter);
        params.set('search[regex]', 'false');

        if (sorting.length > 0) {
            params.set('order[0][column]', String(
                columns.findIndex((c) => (c as { accessorKey?: string }).accessorKey === sorting[0].id)
            ));
            params.set('order[0][dir]', sorting[0].desc ? 'desc' : 'asc');
        }

        // Column definitions for Yajra
        columns.forEach((col, i) => {
            const key = (col as { accessorKey?: string }).accessorKey ?? String(i);
            params.set(`columns[${i}][data]`, key);
            params.set(`columns[${i}][name]`, key);
            params.set(`columns[${i}][searchable]`, 'true');
            params.set(`columns[${i}][orderable]`, 'true');
        });

        // Extra params (e.g. date range, vehicle_type filter)
        if (extraParams) {
            Object.entries(extraParams).forEach(([k, v]) => {
                if (v !== undefined && v !== '') params.set(k, String(v));
            });
        }

        try {
            const res = await fetch(`${apiUrl}?${params.toString()}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const json: DtResponse<T> = await res.json();

            // Ignore stale responses
            if (json.draw !== currentDraw) return;

            setData(json.data);
            setRecordsTotal(json.recordsTotal);
            setRecordsFiltered(json.recordsFiltered);
            onDataLoaded?.(json.data);
        } catch {
            // Network error — keep previous data
        } finally {
            setLoading(false);
        }
    }, [apiUrl, pageIndex, pageSize, globalFilter, sorting, extraParams, columns, onDataLoaded]);

    // Debounce search, instant for other changes
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(fetchData, globalFilter ? 300 : 0);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [fetchData, globalFilter]);

    // Reset page on filter/sort/extraParams change
    useEffect(() => { setPageIndex(0); }, [globalFilter, sorting, extraParams]);

    // Refresh when key changes (after mutation)
    useEffect(() => { if (refreshKey !== undefined) fetchData(); }, [refreshKey, fetchData]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        pageCount: Math.ceil(recordsFiltered / pageSize),
    });

    const pageCount = Math.ceil(recordsFiltered / pageSize);

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
                <Input
                    placeholder="Cari..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-xs"
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Tampilkan
                    <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPageIndex(0); }}>
                        <SelectTrigger className="w-16">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 25, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    baris
                </div>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto rounded-md border">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                )}
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                header.column.getIsSorted() === 'asc' ? <ChevronUp className="h-3 w-3" /> :
                                                header.column.getIsSorted() === 'desc' ? <ChevronDown className="h-3 w-3" /> :
                                                <ChevronsUpDown className="h-3 w-3 opacity-40" />
                                            )}
                                        </span>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                                    Tidak ada data
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    {recordsFiltered > 0
                        ? `Menampilkan ${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, recordsFiltered)} dari ${recordsFiltered} data`
                        : 'Tidak ada data'}
                    {recordsFiltered !== recordsTotal && ` (difilter dari ${recordsTotal} total)`}
                </span>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>«</Button>
                    <Button variant="outline" size="sm" onClick={() => setPageIndex((p) => p - 1)} disabled={pageIndex === 0}>‹</Button>
                    <span className="px-2">
                        Hal {pageIndex + 1} / {pageCount || 1}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setPageIndex((p) => p + 1)} disabled={pageIndex >= pageCount - 1}>›</Button>
                    <Button variant="outline" size="sm" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>»</Button>
                </div>
            </div>
        </div>
    );
}
