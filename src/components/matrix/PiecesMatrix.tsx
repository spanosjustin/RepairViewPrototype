"use client";

import * as React from "react";
import MatrixGrid from "@/components/matrix/MatrixGrid";
import type { MatrixProps, PieceRow } from "@/lib/matrix/types";
import { DEFAULT_PIECES_COLUMNS } from "@/lib/matrix/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MatrixPieceCard from "./MatrixPieceCard";

type Props = Omit<MatrixProps<PieceRow>, "columns"> & {
    columns?: MatrixProps<PieceRow>["columns"];
    turbineName?: string;
};

export default function PiecesMatrix({ 
    rows, 
    columns = DEFAULT_PIECES_COLUMNS, 
    emptyLabel,
    turbineName = "Unknown Turbine"
}: Props) {
    // Dialog state
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<PieceRow | null>(null);

    const onRowClick = (row: PieceRow) => {
        setSelected(row);
        setOpen(true);
    };

    return (
        <div className="flex flex-col gap-2">
            <MatrixGrid 
                columns={columns} 
                rows={rows} 
                emptyLabel={emptyLabel ?? "No pieces"}
                onRowClick={onRowClick}
                rowClassName="hover:bg-gray-100 cursor-pointer"
            />

            {/* Row dialog -> Piece card */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[900px] max-w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Piece Details</DialogTitle>
                    </DialogHeader>
                    <div className="w-full">
                        {selected ? (
                            <MatrixPieceCard piece={selected} turbineName={turbineName} />
                        ) : (
                            <div className="text-sm text-gray-500">No selection</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}