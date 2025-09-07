"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Layers3, Gauge } from "lucide-react";

function DrilldownSwitch({ label }: { label: string }) {
    const id = useId();
    const [checked, setChecked] = useState(false);
    return  (
        <div className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 hover:border-zinc-200 hover:bg-white/70 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50">
            <Label
                htmlFor={id}
                className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
                {label}
            </Label>
            <Switch id={id} checked={checked} onCheckedChange={setChecked} />
        </div>
    );
}

function SectionShell({
    icon: Icon,
    title,
    tone = "slate",
    children,
} : {
    icon: any;
    title: string;
    tone?: "slate" | "amber";
    children: React.ReactNode;
}) {
    const toneClasses = 
        tone === "amber"
            ? "bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
            : "bg-slate-50/70 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800";

    return (
        <div className={`rounded-2xl border ${toneClasses}`}>
            <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3 dark:border-white/5">
                <div className="rounded-xl bg-black/5 p-2 dark:bg-white/10">
                    <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

export default function DrilldownCard() {
    return (
        <Card className="w-full rounded-2xl border bg-white/70 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/40">
            <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <SectionShell icon={Gauge} title="Stats" tone="amber">
                        <div className="grid grid-cols-2 gap-2">
                            {["Hours", "Trips", "Starts", "Notes", "Set In", "Set Out"].map(
                                (item) => <DrilldownSwitch key={item} label={item} />
                            )}
                        </div>
                    </SectionShell>

                    <SectionShell icon={Layers3} title="Components" tone="slate">
                        <div className="grid grid-cols-2 gap-2">
                            {["Liner Caps", "Comb Liners", "Tran PRC", "S1N", "S2N", "S3N", "S1S",
                            "S2S", "S3S", "S1B", "S2B", "S3B", "Rotor",].map(
                                (item) => <DrilldownSwitch key={item} label={item} />
                            )}
                        </div>
                    </SectionShell>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                    <Button variant="outline">
                        Reset
                    </Button>
                    <Button>
                        Save New View
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}