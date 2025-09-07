"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useId, type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Layers3, Gauge } from "lucide-react";

const STAT_ITEMS = ["Hours", "Trips", "Starts", "Notes", "Set In", "Set Out", "From", "Before"] as const;
const COMPONENT_ITEMS = [
    "Liner Caps", "S1S", "Comb Liners", "S2S", "Tran PRC", 
    "S3S", "S1N", "S1B", "S2N", "S2B", "S3N", "S3B", "Rotor",
] as const;

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

function DateFilterRow({
    mainLabel,
}: {
    mainLabel: string;
}) {
    const id = useId();
    const [value, setValue] = useState<string>("");

    return(
        <div className="flex items-start justify-between rounded-xl border border-transparent px-3 py-2 hover:border-zinc-200 hover:bg-white/70 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50">
            <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {mainLabel}
                </span>
            </div>
            <Input
                id={id}
                type="date"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="ml-4 h-9 w-40"
            />
        </div>
    );
}

function SectionShell({
    icon: Icon,
    title,
    tone = "slate",
    children,
} : {
    icon: ComponentType<{ className?: string }>;
    title: string;
    tone?: "slate" | "amber";
    children: ReactNode;
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
                            {STAT_ITEMS.map((item) => {
                                if (item === "From") {
                                    return <DateFilterRow key={item} mainLabel={item} />;
                                }
                                if (item === "Before") {
                                    return <DateFilterRow key={item} mainLabel={item} />;
                                }
                                return <DrilldownSwitch key={item} label={item} />;
                            })}
                        </div>
                    </SectionShell>

                    <SectionShell icon={Layers3} title="Components" tone="slate">
                        <div className="grid grid-cols-2 gap-2">
                            {COMPONENT_ITEMS.map(
                                (item) => <DrilldownSwitch key={item} label={item} />
                            )}
                        </div>
                    </SectionShell>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline">
                        Reset
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button>
                            Apply Filters
                        </Button>
                        <Button>
                            Save New View
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}