"use client";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useId, type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Layers3, Gauge, CalendarDays } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useFilter, type DrilldownFilter } from "@/app/FilterContext";

const STAT_ITEMS = ["Hours", "Trips", "Starts", "Notes", "Set In", "Set Out", "From", "Before"] as const;
const COMPONENT_ITEMS = [
    "Liner Caps", "S1S", "Comb Liners", "S2S", "Tran PRC",
    "S3S", "S1N", "S1B", "S2N", "S2B", "S3N", "S3B", "Rotor", "All",
] as const;

const STAT_CONFIG = {
    Hours: "float",
    Trips: "int",
    Starts: "int",
} as const;
type StatKind = (typeof STAT_CONFIG)[keyof typeof STAT_CONFIG];

const OPERATORS = [">", "<", "=", "≥", "≤"] as const;
type Operator = typeof OPERATORS[number];

function NumericToggleRow({
    label,
    kind,
    filterKey,
}: {
    label: string,
    kind: StatKind;
    filterKey: "hours" | "trips" | "starts";
}) {
    const id = useId();
    const { drilldownFilters, setDrilldownFilters } = useFilter();
    
    const currentFilter = drilldownFilters[filterKey];
    const checked = currentFilter?.enabled ?? false;
    
    // Use local state for input value and operator, sync with context
    const [localValue, setLocalValue] = useState<string>(currentFilter?.value ?? "");
    const [localOp, setLocalOp] = useState<Operator>(currentFilter?.operator ?? "=");

    // Sync local state when context changes (e.g., on reset)
    React.useEffect(() => {
        if (currentFilter) {
            setLocalValue(currentFilter.value);
            setLocalOp(currentFilter.operator);
        } else {
            setLocalValue("");
            setLocalOp("=");
        }
    }, [currentFilter]);

    const updateFilter = (enabled: boolean, value: string, operator: Operator) => {
        setDrilldownFilters(prev => ({
            ...prev,
            [filterKey]: enabled && value.trim() ? {
                enabled: true,
                operator: operator,
                value: value.trim(),
            } : null,
        }));
    };

    const handleCheckedChange = (newChecked: boolean) => {
        updateFilter(newChecked, localValue, localOp);
    };

    const handleValueChange = (newValue: string) => {
        setLocalValue(newValue);
        // Automatically enable the filter when user starts typing
        if (newValue.trim()) {
            updateFilter(true, newValue, localOp);
        } else {
            // If value is empty, disable the filter
            updateFilter(false, newValue, localOp);
        }
    };

    const handleOpChange = (newOp: Operator) => {
        setLocalOp(newOp);
        // Automatically enable if there's a value
        if (localValue.trim()) {
            updateFilter(true, localValue, newOp);
        }
    };

    const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const v = e.target.value;
        if (kind === "int") {
            if (/^-?\d*$/.test(v)) handleValueChange(v);
        } else {
            if (/^-?\d*(\.\d*)?$/.test(v)) handleValueChange(v);
        }
    };

    return (
        <div className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 hover:border-zinc-200 hover:bg-white/70 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50">
            <Label
                htmlFor={id}
                className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
                {label}
            </Label>

            <div className="ml-4 flex items-center gap-2 justify-end w-full max-w-[260px] md:max-w-[300px] min-w-0">
                <Select
                    value={localOp}
                    onValueChange={(v) => handleOpChange(v as Operator)}
                >
                    <SelectTrigger
                        className="h-9 w-12 md:w-14 justify-center px-0"
                        aria-label={`${label} comparator`}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                        {OPERATORS.map(sym => (
                            <SelectItem key={sym} value={sym}>
                                {sym}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Input
                    id={id}
                    type="text"
                    inputMode={kind === "int" ? "numeric" : "decimal"}
                    placeholder={kind === "int" ? "0" : "0.00"}
                    value={localValue}
                    onChange={onChange}
                    className="h-9 w-16 md:w-20"
                />
                <Switch id={id} checked={checked} onCheckedChange={handleCheckedChange} />
            </div>
        </div>
    );
}

function DrilldownSwitch({ label }: { label: string }) {
    const id = useId();
    const [checked, setChecked] = useState(true);
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

function ComponentFilterSwitch({ label }: { label: string }) {
    const id = useId();
    const { componentFilters, setComponentFilters } = useFilter();
    
    // For "All", check if all components (except "All") are selected
    // For individual components, check if this specific component is selected
    const checked = label === "All" 
        ? COMPONENT_ITEMS.filter(item => item !== "All").every(item => componentFilters.has(item))
        : componentFilters.has(label);
    
    const handleCheckedChange = (newChecked: boolean) => {
        if (label === "All") {
            // When "All" is toggled, select/deselect all components
            if (newChecked) {
                // Add all components except "All"
                const allComponents = new Set(COMPONENT_ITEMS.filter(item => item !== "All"));
                setComponentFilters(allComponents);
            } else {
                // Remove all components
                setComponentFilters(new Set());
            }
        } else {
            // For individual components, just toggle this one
            setComponentFilters(prev => {
                const newSet = new Set(prev);
                if (newChecked) {
                    newSet.add(label);
                } else {
                    newSet.delete(label);
                }
                return newSet;
            });
        }
    };
    
    return (
        <div className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 hover:border-zinc-200 hover:bg-white/70 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50">
            <Label
                htmlFor={id}
                className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
                {label}
            </Label>
            <Switch id={id} checked={checked} onCheckedChange={handleCheckedChange} />
        </div>
    );
}

function DateFilterRow({
    mainLabel,
}: {
    mainLabel: string;
}) {
    const id = useId();
    const [text, setText] = useState<string>("");
    const pickerRef = React.useRef<HTMLInputElement>(null);

    const PARTIAL_YMD = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

    const onTextChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        let v = e.target.value.replace(/\D/g, "");
        
        let formatted = v;
        if(v.length >= 5) {
            formatted = v.slice(0, 4) + "-" + v.slice(4);
        }
        if(formatted.length >= 8) {
            formatted = formatted.slice(0, 7) + "-" + formatted.slice(7);
        }
        if(formatted.length > 10) {
            formatted = formatted.slice(0, 10);
        }

        setText(formatted);
    }

    const onPickChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setText(e.target.value);
    };

    const openPicker = () => {
        const el = pickerRef.current;
        if(!el) return;
        el.focus();
        if(typeof el.showPicker === "function") el.showPicker();
        else el.click();
    }

    return(
        <div className="flex items-start justify-between rounded-xl border border-transparent px-3 py-2 hover:border-zinc-200 hover:bg-white/70 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50">
            <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {mainLabel}
                </span>
            </div>
            <div className="ml-4 flex items-center gap-2 pr-2">
                <div className="relative">
                    <Input
                        id={id}
                        type="text"
                        inputMode="numeric"
                        placeholder="YYYY-MM-DD"
                        value={text}
                        onChange={onTextChange}
                        className="h-9 w-40 pr-10"
                        aria-label={`${mainLabel} date input`}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7 rounded-md"
                        onClick={openPicker}
                        aria-label={`Open ${mainLabel} date picker`}
                    >
                        <CalendarDays className="h-4 w-4" />
                    </Button>
                </div>

                {/* Hidden native date input (drives the picker, syncs back to text) */}
                <input
                ref={pickerRef}
                type="date"
                value={/^\d{4}-\d{2}-\d{2}$/.test(text) ? text : ""}
                onChange={onPickChange}
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                />
            </div>
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

type DrilldownCardProps = {
    onClose?: () => void;
};

export default function DrilldownCard({ onClose }: DrilldownCardProps) {
    const { drilldownFilters, setDrilldownFilters, setSearchTerms, searchTerms, componentFilters, setComponentFilters } = useFilter();

    const handleReset = () => {
        setDrilldownFilters({
            hours: null,
            trips: null,
            starts: null,
        });
        setComponentFilters(new Set());
    };

    // Convert drilldown operator to search term format
    const operatorToSearchFormat = (op: ">" | "<" | "=" | "≥" | "≤"): string => {
        switch (op) {
            case ">": return ">";
            case "<": return "<";
            case "=": return "=";
            case "≥": return ">=";
            case "≤": return "<=";
            default: return "=";
        }
    };

    // Convert drilldown filter to search term string
    const filterToSearchTerm = (filterKey: "hours" | "trips" | "starts", filter: DrilldownFilter): string | null => {
        if (!filter?.enabled || !filter.value) return null;
        const operator = operatorToSearchFormat(filter.operator);
        return `${filterKey}${operator}${filter.value}`;
    };

    const handleApplyFilters = () => {
        const newTerms: string[] = [];
        
        // Convert each enabled filter to a search term
        if (drilldownFilters.hours?.enabled && drilldownFilters.hours.value) {
            const term = filterToSearchTerm("hours", drilldownFilters.hours);
            if (term && !searchTerms.includes(term)) {
                newTerms.push(term);
            }
        }
        
        if (drilldownFilters.trips?.enabled && drilldownFilters.trips.value) {
            const term = filterToSearchTerm("trips", drilldownFilters.trips);
            if (term && !searchTerms.includes(term)) {
                newTerms.push(term);
            }
        }
        
        if (drilldownFilters.starts?.enabled && drilldownFilters.starts.value) {
            const term = filterToSearchTerm("starts", drilldownFilters.starts);
            if (term && !searchTerms.includes(term)) {
                newTerms.push(term);
            }
        }
        
        // Add new terms to search terms
        if (newTerms.length > 0) {
            setSearchTerms([...searchTerms, ...newTerms]);
        }
        
        // Close the drilldown panel
        if (onClose) {
            onClose();
        }
    };

    return (
        <Card className="w-full rounded-2xl border bg-white/70 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/40">
            <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <SectionShell icon={Gauge} title="Stats" tone="amber">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {STAT_ITEMS.map((item) => {
                                if (item === "From") { return <DateFilterRow key={item} mainLabel={item} />; }
                                if (item === "Before") { return <DateFilterRow key={item} mainLabel={item} />; }

                                if(item in STAT_CONFIG) {
                                    const filterKey = item.toLowerCase() as "hours" | "trips" | "starts";
                                    return (
                                        <NumericToggleRow
                                            key={item}
                                            label={item}
                                            kind={STAT_CONFIG[item as keyof typeof STAT_CONFIG]}
                                            filterKey={filterKey}
                                        />
                                        
                                    );
                                }
                                return <DrilldownSwitch key={item} label={item} />;
                            })}
                        </div>
                    </SectionShell>

                    <SectionShell icon={Layers3} title="Components" tone="slate">
                        <div className="grid grid-cols-2 gap-2">
                            {COMPONENT_ITEMS.map(
                                (item) => <ComponentFilterSwitch key={item} label={item} />
                            )}
                        </div>
                    </SectionShell>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button onClick={handleApplyFilters}>
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