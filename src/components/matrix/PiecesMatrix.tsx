"use client";

import * as React from "react";
import MatrixGrid from "@/components/matrix/MatrixGrid";
import type { MatrixProps, PieceRow } from "@/lib/matrix/types";
import { DEFAULT_PIECES_COLUMNS } from "@/lib/matrix/constants";

type Props = Omit<MatrixProps<PieceRow>, "columns"> & {
    columns?: MatrixProps<PieceRow>["columns"];
};

export default function PiecesMatrix({ rows, columns = DEFAULT_PIECES_COLUMNS, emptyLabel }: Props) {
    return <MatrixGrid columns={columns} rows={rows} emptyLabel={emptyLabel ?? "No pieces"} />;
}