"use client";

import * as React from "react";
import MatrixGrid from "@/components/matrix/MatrixGrid";
import type { MatrixProps, StatRow } from "@/lib/matrix/types";
import { DEFAULT_STATS_COLUMNS } from "@/lib/matrix/constants";

type Props = Omit<MatrixProps<StatRow>, "columns"> & {
  columns?: MatrixProps<StatRow>["columns"];
};

export default function StatsMatrix({ rows, columns = DEFAULT_STATS_COLUMNS, emptyLabel }: Props) {
  return <MatrixGrid<StatRow> columns={columns} rows={rows} emptyLabel={emptyLabel ?? "No stats"} />;
}
