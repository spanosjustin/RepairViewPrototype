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

    const handleColorChange = (status: keyof typeof statusColors, color: string) => {
        setStatusColors(prev => ({
            ...prev,
            [status]: color
        }))
    }

    const handleCardClick = (cardType: string) => {
        setOpenDialog(cardType)
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a Component</DialogTitle>
                    </DialogHeader>
                    <p>Add a Component</p>
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