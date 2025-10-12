"use client"

import { useState } from "react"
import { ColorPicker } from "@/components/ColorPicker"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
    // State for managing colors for each status
    const [statusColors, setStatusColors] = useState({
        good: "green",
        monitor: "yellow", 
        replaceSoon: "orange",
        replaceNow: "red",
        spare: "slate",
        degraded: "gray"
    })

    // State for managing dialog visibility
    const [openDialog, setOpenDialog] = useState<string | null>(null)

    // State for piece form
    const [pieceForm, setPieceForm] = useState({
        sn: "",
        pn: "",
        component: "",
        position: "",
        status: "OK" as "OK" | "Monitor" | "Replace Soon" | "Replace Now" | "Spare" | "Degraded" | "Unknown",
        state: "In Service" as "In Service" | "Out of Service" | "Standby" | "Repair" | "On Order",
        hours: 0,
        starts: 0,
        trips: 0,
        repairDetails: "",
        conditionDetails: "",
        notes: ""
    })

    // State for component form
    const [componentForm, setComponentForm] = useState({
        name: "",
        type: "" as "fuel" | "comb" | "turbine" | "compressor" | "generator" | "auxiliary",
        intervalFH: 0,
        intervalFS: 0,
        intervalTrips: 0,
        assignedPieces: [] as Array<{pieceId: string, position: string}>,
        pastEvents: [] as string[]
    })

    // State for piece assignment form
    const [pieceAssignmentForm, setPieceAssignmentForm] = useState({
        selectedPiece: "",
        selectedPosition: ""
    })

    // Available components from mock data
    const availableComponents = [
        "Comb Liner",
        "Tran PRC", 
        "S1N",
        "S2N",
        "Rotor",
        "S3S"
    ]

    // Available positions (you can customize this based on your needs)
    const availablePositions = [
        "Position 1",
        "Position 2", 
        "Position 3",
        "Position 4",
        "Position 5"
    ]

    // Available component types
    const availableComponentTypes = [
        "fuel",
        "comb", 
        "turbine",
        "compressor",
        "generator",
        "auxiliary"
    ]

    // Available pieces from mock data (for component assignment)
    const availablePieces = [
        { id: "SN-00123", name: "Liner Caps", pn: "PN-AX45" },
        { id: "SN-00456", name: "Comb Liners", pn: "PN-QZ19" },
        { id: "SN-00789", name: "Tran PRC", pn: "PN-TX88" },
        { id: "SN-01011", name: "S1N", pn: "PN-S1N1" },
        { id: "SN-01314", name: "S2N", pn: "PN-S2N2" },
        { id: "SN-01617", name: "Rotor", pn: "PN-RTR1" },
        { id: "SN-01920", name: "Spare Liner", pn: "PN-SPR1" },
        { id: "SN-02122", name: "S3S", pn: "PN-UNK1" }
    ]

    // Available past events
    const availablePastEvents = [
        "Hot Section Inspection",
        "Combustor Overhaul", 
        "Compressor Cleaning",
        "Turbine Blade Replacement",
        "Fuel System Maintenance",
        "Generator Overhaul",
        "Auxiliary System Check",
        "Emergency Repair"
    ]

    const handleColorChange = (status: keyof typeof statusColors, color: string) => {
        setStatusColors(prev => ({
            ...prev,
            [status]: color
        }))
    }

    const handleCardClick = (cardType: string) => {
        setOpenDialog(cardType)
        // Reset piece assignment form when opening component dialog
        if (cardType === 'component') {
            setPieceAssignmentForm({
                selectedPiece: "",
                selectedPosition: ""
            })
        }
    }

    const handlePieceFormChange = (field: string, value: string | number) => {
        setPieceForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handlePieceFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically save the piece data to your backend/database
        console.log("Piece form submitted:", pieceForm)
        // Reset form
        setPieceForm({
            sn: "",
            pn: "",
            component: "",
            position: "",
            status: "OK",
            state: "In Service",
            hours: 0,
            starts: 0,
            trips: 0,
            repairDetails: "",
            conditionDetails: "",
            notes: ""
        })
        setOpenDialog(null)
    }

    const handleComponentFormChange = (field: string, value: string | number) => {
        setComponentForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleAddPieceToComponent = (pieceId: string, position: string) => {
        setComponentForm(prev => ({
            ...prev,
            assignedPieces: [...prev.assignedPieces, { pieceId, position }]
        }))
        // Reset the assignment form
        setPieceAssignmentForm({
            selectedPiece: "",
            selectedPosition: ""
        })
    }

    const handleAddPieceAssignment = () => {
        if (pieceAssignmentForm.selectedPiece && pieceAssignmentForm.selectedPosition) {
            handleAddPieceToComponent(pieceAssignmentForm.selectedPiece, pieceAssignmentForm.selectedPosition)
        }
    }

    const handleRemovePieceFromComponent = (pieceId: string) => {
        setComponentForm(prev => ({
            ...prev,
            assignedPieces: prev.assignedPieces.filter(p => p.pieceId !== pieceId)
        }))
    }

    const handleAddPastEvent = (eventName: string) => {
        setComponentForm(prev => ({
            ...prev,
            pastEvents: [...prev.pastEvents, eventName]
        }))
    }

    const handleRemovePastEvent = (eventName: string) => {
        setComponentForm(prev => ({
            ...prev,
            pastEvents: prev.pastEvents.filter(e => e !== eventName)
        }))
    }

    const handleComponentFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically save the component data to your backend/database
        console.log("Component form submitted:", componentForm)
        // Reset forms
        setComponentForm({
            name: "",
            type: "" as "fuel" | "comb" | "turbine" | "compressor" | "generator" | "auxiliary",
            intervalFH: 0,
            intervalFS: 0,
            intervalTrips: 0,
            assignedPieces: [],
            pastEvents: []
        })
        setPieceAssignmentForm({
            selectedPiece: "",
            selectedPosition: ""
        })
        setOpenDialog(null)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12">
            <div className="w-full max-w-6xl space-y-8">
                {/* A, B, C, D squares */}
                <div className="flex gap-6">
                    <div 
                        className="flex-1 h-32 bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-lg font-bold text-blue-600 rounded-lg shadow-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleCardClick('piece')}
                    >
                        Add a piece
                    </div>
                    <div 
                        className="flex-1 h-32 bg-green-50 border-2 border-green-200 flex items-center justify-center text-lg font-bold text-green-600 rounded-lg shadow-sm cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => handleCardClick('component')}
                    >
                        Add a Component
                    </div>
                    <div 
                        className="flex-1 h-32 bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center text-lg font-bold text-yellow-600 rounded-lg shadow-sm cursor-pointer hover:bg-yellow-100 transition-colors"
                        onClick={() => handleCardClick('event')}
                    >
                        Add an event
                    </div>
                    <div 
                        className="flex-1 h-32 bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-lg font-bold text-purple-600 rounded-lg shadow-sm cursor-pointer hover:bg-purple-100 transition-colors"
                        onClick={() => handleCardClick('turbine')}
                    >
                        Add a Turbine or Site
                    </div>
                </div>

                {/* Status Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                    {/* Table Header */}
                    <div className="bg-slate-600 text-white grid grid-cols-5 gap-8 p-4">
                        <div className="font-semibold">Status</div>
                        <div className="font-semibold">Hours</div>
                        <div className="font-semibold">Trips</div>
                        <div className="font-semibold">Starts</div>
                        <div className="font-semibold">Color ID</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-gray-200">
                        {/* Good */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium">Good</div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <ColorPicker 
                                currentColor={statusColors.good}
                                onColorChange={(color) => handleColorChange('good', color)}
                                statusName="Good"
                            />
                        </div>

                        {/* Monitor */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-yellow-500 text-white px-3 py-2 rounded text-sm font-medium">Monitor</div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <ColorPicker 
                                currentColor={statusColors.monitor}
                                onColorChange={(color) => handleColorChange('monitor', color)}
                                statusName="Monitor"
                            />
                        </div>

                        {/* Replace Soon */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-orange-500 text-white px-3 py-2 rounded text-sm font-medium">Replace Soon</div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <ColorPicker 
                                currentColor={statusColors.replaceSoon}
                                onColorChange={(color) => handleColorChange('replaceSoon', color)}
                                statusName="Replace Soon"
                            />
                        </div>

                        {/* Replace Now */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium">Replace Now</div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <ColorPicker 
                                currentColor={statusColors.replaceNow}
                                onColorChange={(color) => handleColorChange('replaceNow', color)}
                                statusName="Replace Now"
                            />
                        </div>

                        {/* Separator line */}
                        <div className="border-t-2 border-gray-400"></div>

                        {/* Spare */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-slate-500 text-white px-3 py-2 rounded text-sm font-medium">Spare</div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <ColorPicker 
                                currentColor={statusColors.spare}
                                onColorChange={(color) => handleColorChange('spare', color)}
                                statusName="Spare"
                            />
                        </div>

                        {/* Degraded */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-gray-500 text-white px-3 py-2 rounded text-sm font-medium">Degraded</div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <ColorPicker 
                                currentColor={statusColors.degraded}
                                onColorChange={(color) => handleColorChange('degraded', color)}
                                statusName="Degraded"
                            />
                        </div>
                    </div>
                </div>

                {/* Excel File Button */}
                <div className="flex justify-center">
                    <button className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-4 rounded-lg shadow-lg transition-colors font-medium">
                        Select Excel File to save entire project to
                    </button>
                </div>
            </div>

            {/* Dialog for Add a piece */}
            <Dialog open={openDialog === 'piece'} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add a Piece</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePieceFormSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sn">Serial Number (SN)</Label>
                                <Input
                                    id="sn"
                                    value={pieceForm.sn}
                                    onChange={(e) => handlePieceFormChange('sn', e.target.value)}
                                    placeholder="Enter serial number"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pn">Part Number (PN)</Label>
                                <Input
                                    id="pn"
                                    value={pieceForm.pn}
                                    onChange={(e) => handlePieceFormChange('pn', e.target.value)}
                                    placeholder="Enter part number"
                                    required
                                />
                            </div>
                        </div>

                        {/* Component and Position */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="component">Component</Label>
                                <Select value={pieceForm.component} onValueChange={(value) => handlePieceFormChange('component', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select component" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableComponents.map((component) => (
                                            <SelectItem key={component} value={component}>
                                                {component}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <Select 
                                    value={pieceForm.position} 
                                    onValueChange={(value) => {
                                        handlePieceFormChange('position', value)
                                        handlePieceFormChange('state', 'In Service')
                                    }}
                                    disabled={!pieceForm.component}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePositions.map((position) => (
                                            <SelectItem key={position} value={position}>
                                                {position}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Status and State */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={pieceForm.status} onValueChange={(value) => handlePieceFormChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OK">OK</SelectItem>
                                        <SelectItem value="Monitor">Monitor</SelectItem>
                                        <SelectItem value="Replace Soon">Replace Soon</SelectItem>
                                        <SelectItem value="Replace Now">Replace Now</SelectItem>
                                        <SelectItem value="Spare">Spare</SelectItem>
                                        <SelectItem value="Degraded">Degraded</SelectItem>
                                        <SelectItem value="Unknown">Unknown</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Select value={pieceForm.state} onValueChange={(value) => handlePieceFormChange('state', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="In Service">In Service</SelectItem>
                                        <SelectItem value="Out of Service">Out of Service</SelectItem>
                                        <SelectItem value="Standby">Standby</SelectItem>
                                        <SelectItem value="Repair">Repair</SelectItem>
                                        <SelectItem value="On Order">On Order</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Hours, Starts, Trips */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="hours">Hours</Label>
                                <Input
                                    id="hours"
                                    type="number"
                                    value={pieceForm.hours}
                                    onChange={(e) => handlePieceFormChange('hours', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="starts">Starts</Label>
                                <Input
                                    id="starts"
                                    type="number"
                                    value={pieceForm.starts}
                                    onChange={(e) => handlePieceFormChange('starts', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="trips">Trips</Label>
                                <Input
                                    id="trips"
                                    type="number"
                                    value={pieceForm.trips}
                                    onChange={(e) => handlePieceFormChange('trips', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Text Areas for Details */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="repairDetails">Repair Details</Label>
                                <textarea
                                    id="repairDetails"
                                    value={pieceForm.repairDetails}
                                    onChange={(e) => handlePieceFormChange('repairDetails', e.target.value)}
                                    placeholder="Enter repair details..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="conditionDetails">Condition Details</Label>
                                <textarea
                                    id="conditionDetails"
                                    value={pieceForm.conditionDetails}
                                    onChange={(e) => handlePieceFormChange('conditionDetails', e.target.value)}
                                    placeholder="Enter condition details..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    value={pieceForm.notes}
                                    onChange={(e) => handlePieceFormChange('notes', e.target.value)}
                                    placeholder="Enter additional notes..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setOpenDialog(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Add Piece
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog for Add a Component */}
            <Dialog open={openDialog === 'component'} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add a Component</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleComponentFormSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="componentName">Component Name</Label>
                                <Input
                                    id="componentName"
                                    value={componentForm.name}
                                    onChange={(e) => handleComponentFormChange('name', e.target.value)}
                                    placeholder="Enter component name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="componentType">Component Type</Label>
                                <Select value={componentForm.type} onValueChange={(value) => handleComponentFormChange('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select component type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableComponentTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Interval Fields */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Intervals</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="intervalFH">Interval FH (Flight Hours)</Label>
                                    <Input
                                        id="intervalFH"
                                        type="number"
                                        value={componentForm.intervalFH}
                                        onChange={(e) => handleComponentFormChange('intervalFH', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="intervalFS">Interval FS (Flight Starts)</Label>
                                    <Input
                                        id="intervalFS"
                                        type="number"
                                        value={componentForm.intervalFS}
                                        onChange={(e) => handleComponentFormChange('intervalFS', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="intervalTrips">Interval Trips</Label>
                                    <Input
                                        id="intervalTrips"
                                        type="number"
                                        value={componentForm.intervalTrips}
                                        onChange={(e) => handleComponentFormChange('intervalTrips', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Piece Assignment */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Assign Pieces to Positions</h3>
                            <div className="space-y-3">
                                {componentForm.assignedPieces.map((assignment, index) => {
                                    const piece = availablePieces.find(p => p.id === assignment.pieceId)
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <span className="font-medium">{piece?.name}</span>
                                                <span className="text-gray-500 ml-2">({piece?.pn})</span>
                                                <span className="text-blue-600 ml-2">→ {assignment.position}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemovePieceFromComponent(assignment.pieceId)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )
                                })}
                                
                                {/* Add new piece assignment */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label>Select Piece</Label>
                                                <Select 
                                                    value={pieceAssignmentForm.selectedPiece}
                                                    onValueChange={(pieceId) => {
                                                        setPieceAssignmentForm(prev => ({
                                                            ...prev,
                                                            selectedPiece: pieceId
                                                        }))
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a piece" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availablePieces
                                                            .filter(piece => !componentForm.assignedPieces.some(ap => ap.pieceId === piece.id))
                                                            .map((piece) => (
                                                                <SelectItem key={piece.id} value={piece.id}>
                                                                    {piece.name} ({piece.pn})
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Position</Label>
                                                <Select 
                                                    value={pieceAssignmentForm.selectedPosition}
                                                    onValueChange={(position) => {
                                                        setPieceAssignmentForm(prev => ({
                                                            ...prev,
                                                            selectedPosition: position
                                                        }))
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select position" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availablePositions.map((position) => (
                                                            <SelectItem key={position} value={position}>
                                                                {position}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={handleAddPieceAssignment}
                                                disabled={!pieceAssignmentForm.selectedPiece || !pieceAssignmentForm.selectedPosition}
                                                size="sm"
                                            >
                                                Add Assignment
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Past Events */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Past Events</h3>
                            <div className="space-y-3">
                                {componentForm.pastEvents.map((event, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <span className="font-medium">{event}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemovePastEvent(event)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                
                                {/* Add new past event */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <div className="space-y-2">
                                        <Label>Add Past Event</Label>
                                        <Select onValueChange={(eventName) => {
                                            if (!componentForm.pastEvents.includes(eventName)) {
                                                handleAddPastEvent(eventName)
                                            }
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a past event" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availablePastEvents
                                                    .filter(event => !componentForm.pastEvents.includes(event))
                                                    .map((event) => (
                                                        <SelectItem key={event} value={event}>
                                                            {event}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setOpenDialog(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Add Component
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog for Add an event */}
            <Dialog open={openDialog === 'event'} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add an event</DialogTitle>
                    </DialogHeader>
                    <p>Add an event</p>
                </DialogContent>
            </Dialog>

            {/* Dialog for Add a Turbine or Site */}
            <Dialog open={openDialog === 'turbine'} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a Turbine or Site</DialogTitle>
                    </DialogHeader>
                    <p>Add a Turbine or Site</p>
                </DialogContent>
            </Dialog>
        </div>
    );
}