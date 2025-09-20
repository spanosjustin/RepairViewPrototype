"use client";

import * as React from "react";
import { Search } from "lucide-react";

const cx = (...parts: Array<string | false  | undefined>) => parts.filter(Boolean).join(" ");

type EmptyStateProps = {
    message?: string;
    className?: string;
}

export default function EmptyState({ message = "No results", className }: EmptyStateProps) {
    return (
        <div
            className={cx(
                "flex flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center",
                className
            )}
            aria-live="polite"
        >
            <Search className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}