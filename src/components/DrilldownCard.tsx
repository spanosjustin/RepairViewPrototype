"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function DrilldownRow({ label }: { label: string }) {
    return  (
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm">{label}</span>
            <Select>
                <SelectTrigger className="w-28">
                    <SelectValue placeholder="-"></SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

}

export default function DrilldownCard() {
    return (
        <Card className="w-full rounded-2xl border bg-zinc-50/60 p-2 shadow-sm dark:bg-zinc-900/60 dark:border-zinc-800">
            <CardContent className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="mb-2 text-lg font-semibold">Stats</h3>
                    <div className="grid grid-cols-2">
                        {[
                            "Hours", "Trips", "Starts", "From (Date)",
                            "Notes", "Set In", "Set Out", "Before (Date)",
                        ].map((item) => (
                            <DrilldownRow key={item} label={item} />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-lg font-semibold">Components</h3>
                    <div className="grid grid-cols-2">
                        {[
                            "Liner Caps", "Comb Liners", "Tran PRC", "S1N", "S2N", "S3N", "S1S",
                            "S2S", "S3S", "S1B", "S2B", "S3B", "Rotor",
                        ].map((item) => (
                            <DrilldownRow key={item} label={item} />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                    <Button variant="outline">Save New View</Button>
                </div>
            </CardContent>
        </Card>
    )
}