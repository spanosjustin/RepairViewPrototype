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

    // State for edit piece form
    const [editPieceForm, setEditPieceForm] = useState({
        id: "",
        sn: "",
        pn: "",
        component: "",
        position: "",
        status: "OK" as "OK" | "Monitor" | "Replace Soon" | "Replace Now" | "Spare" | "Degraded" | "Unknown",
        state: "In Service" as "In Service" | "Out of Service" | "Standby" | "Repair" | "On Order",
        hours: 0,
        starts: 0,
        trips: 0,
        repairJob: "",
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

    // State for turbine/site form
    const [turbineSiteForm, setTurbineSiteForm] = useState({
        type: "turbine" as "turbine" | "site",
        turbineName: "",
        plantLocation: "",
        assignedComponents: [] as string[],
        // Site-specific fields
        siteName: "",
        address: "",
        contacts: [] as Array<{name: string, phone: string, title: string, email: string}>
    })

    // State for event form
    const [eventForm, setEventForm] = useState({
        type: "outage" as "outage" | "repair",
        // Outage form fields
        turbine: "",
        eventName: "",
        date: "",
        hours: 0,
        target: 0,
        intFh: 0,
        starts: 0,
        trips: 0,
        intFh2: 0,
        intTrips: 0,
        notes: "",
        setIn: [] as string[],
        setOut: [] as string[],
        // Repair form fields
        repairNumber: "",
        repairComponent: "",
        preEventTitle: "",
        repairIntHours: 0,
        repairIntFS: 0,
        repairIntTrips: 0,
        repairPieces: [] as Array<{
            pieceId: string;
            conditionDetails: string;
            repairDetails: string;
        }>
    })

    // State for set in/out assignment forms
    const [setInAssignmentForm, setSetInAssignmentForm] = useState({
        selectedComponent: ""
    })

    const [setOutAssignmentForm, setSetOutAssignmentForm] = useState({
        selectedComponent: ""
    })

    // State for repair piece assignment form
    const [repairPieceForm, setRepairPieceForm] = useState({
        selectedPiece: "",
        conditionDetails: "",
        repairDetails: ""
    })

    // State for turbine component assignment form
    const [turbineComponentForm, setTurbineComponentForm] = useState({
        selectedComponent: ""
    })

    // State for site contact form
    const [siteContactForm, setSiteContactForm] = useState({
        name: "",
        phone: "",
        title: "",
        email: ""
    })

    // Available components from mock data
    const availableComponents = [
        "Comb Liner",
        "Tran PRC", 
        "S1N",
        "S2N",
        "Rotor",
        "S3S",
        "Liner Caps",
        "Comb Liners",
        "S3N"
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

    // Available repair jobs with associated details
    const availableRepairJobs = [
        {
            id: "RJ-001",
            name: "Hot Section Inspection",
            repairDetails: "Complete hot section inspection including combustor liner, transition piece, and first stage nozzle. Check for cracks, erosion, and thermal fatigue. Replace any damaged components as needed.",
            conditionDetails: "Combustor liner shows minor erosion on inner surface. Transition piece has small crack at weld joint. First stage nozzle vanes are in good condition with minimal wear."
        },
        {
            id: "RJ-002", 
            name: "Combustor Overhaul",
            repairDetails: "Full combustor overhaul including liner replacement, fuel nozzle cleaning and calibration, and igniter system maintenance. Rebuild fuel distribution system and test all components.",
            conditionDetails: "Combustor liner severely eroded with multiple burn-through points. Fuel nozzles partially clogged with carbon deposits. Igniter system functioning but showing signs of wear."
        },
        {
            id: "RJ-003",
            name: "Compressor Cleaning",
            repairDetails: "Online compressor cleaning using detergent and water wash. Clean inlet filters and check compressor blade condition. Perform vibration analysis and balance check.",
            conditionDetails: "Compressor blades heavily fouled with dirt and oil deposits. Inlet filters 80% clogged. Vibration levels elevated but within acceptable limits. No blade damage detected."
        },
        {
            id: "RJ-004",
            name: "Turbine Blade Replacement",
            repairDetails: "Replace all first and second stage turbine blades. Check blade root condition and perform dimensional inspection. Balance rotor assembly and perform overspeed test.",
            conditionDetails: "First stage blades show severe erosion and tip rub. Second stage blades have stress cracks at root. Blade root condition acceptable. Rotor balance within specifications."
        },
        {
            id: "RJ-005",
            name: "Fuel System Maintenance",
            repairDetails: "Complete fuel system overhaul including pump rebuild, valve replacement, and line cleaning. Calibrate fuel flow meters and test emergency shutdown systems.",
            conditionDetails: "Fuel pump showing reduced efficiency and increased vibration. Control valves sticking intermittently. Fuel lines have minor corrosion. Emergency systems functional."
        },
        {
            id: "RJ-006",
            name: "Generator Overhaul",
            repairDetails: "Generator stator and rotor inspection. Replace worn bearings and check winding insulation. Perform electrical tests and recalibrate protection systems.",
            conditionDetails: "Generator bearings showing excessive wear and increased temperature. Stator windings in good condition with minor insulation degradation. Rotor balance acceptable."
        },
        {
            id: "RJ-007",
            name: "Auxiliary System Check",
            repairDetails: "Comprehensive auxiliary system inspection including lube oil system, cooling system, and control systems. Replace filters and check all sensors and actuators.",
            conditionDetails: "Lube oil system functioning normally with clean oil. Cooling system has minor leaks at connections. Control system sensors need calibration. All actuators operational."
        },
        {
            id: "RJ-008",
            name: "Emergency Repair",
            repairDetails: "Emergency repair due to unexpected failure. Immediate assessment and temporary fix to restore operation. Schedule follow-up comprehensive repair.",
            conditionDetails: "Critical component failure requiring immediate attention. System operating in degraded mode. Safety systems activated. Temporary repair implemented to maintain operation."
        }
    ]

    // Available turbines
    const availableTurbines = [
        "Turbine A",
        "Turbine B", 
        "Turbine C",
        "Turbine D",
        "Turbine E"
    ]

    // Available plant locations
    const availablePlantLocations = [
        "Plant Alpha",
        "Plant Beta",
        "Plant Gamma",
        "Plant Delta",
        "Plant Epsilon"
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
        // Reset edit piece form when opening edit piece dialog
        if (cardType === 'editPiece') {
            setEditPieceForm({
                id: "",
                sn: "",
                pn: "",
                component: "",
                position: "",
                status: "OK",
                state: "In Service",
                hours: 0,
                starts: 0,
                trips: 0,
                repairJob: "",
                repairDetails: "",
                conditionDetails: "",
                notes: ""
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

    const handleEditPieceFormChange = (field: string, value: string | number) => {
        setEditPieceForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleEditPieceFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically update the piece data in your backend/database
        console.log("Edit piece form submitted:", editPieceForm)
        // Reset form
        setEditPieceForm({
            id: "",
            sn: "",
            pn: "",
            component: "",
            position: "",
            status: "OK",
            state: "In Service",
            hours: 0,
            starts: 0,
            trips: 0,
            repairJob: "",
            repairDetails: "",
            conditionDetails: "",
            notes: ""
        })
        setOpenDialog(null)
    }

    const handleSelectPieceToEdit = (pieceId: string) => {
        // Find the piece in available pieces and populate the form
        const piece = availablePieces.find(p => p.id === pieceId)
        if (piece) {
            setEditPieceForm({
                id: piece.id,
                sn: piece.id, // Using ID as SN for demo
                pn: piece.pn,
                component: piece.name,
                position: "Position 1", // Default position
                status: "OK",
                state: "In Service",
                hours: 0,
                starts: 0,
                trips: 0,
                repairJob: "",
                repairDetails: "",
                conditionDetails: "",
                notes: ""
            })
        }
    }

    const handleRepairJobChange = (repairJobId: string) => {
        const selectedRepairJob = availableRepairJobs.find(job => job.id === repairJobId)
        if (selectedRepairJob) {
            setEditPieceForm(prev => ({
                ...prev,
                repairJob: repairJobId,
                repairDetails: selectedRepairJob.repairDetails,
                conditionDetails: selectedRepairJob.conditionDetails
            }))
        }
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

    const handleTurbineSiteFormChange = (field: string, value: string | number) => {
        setTurbineSiteForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleAddComponentToTurbine = () => {
        if (turbineComponentForm.selectedComponent) {
            setTurbineSiteForm(prev => ({
                ...prev,
                assignedComponents: [...prev.assignedComponents, turbineComponentForm.selectedComponent]
            }))
            setTurbineComponentForm({
                selectedComponent: ""
            })
        }
    }

    const handleRemoveComponentFromTurbine = (component: string) => {
        setTurbineSiteForm(prev => ({
            ...prev,
            assignedComponents: prev.assignedComponents.filter(c => c !== component)
        }))
    }

    const handleAddContactToSite = () => {
        if (siteContactForm.name && siteContactForm.phone) {
            setTurbineSiteForm(prev => ({
                ...prev,
                contacts: [...prev.contacts, {
                    name: siteContactForm.name,
                    phone: siteContactForm.phone,
                    title: siteContactForm.title,
                    email: siteContactForm.email
                }]
            }))
            // Reset the contact form
            setSiteContactForm({
                name: "",
                phone: "",
                title: "",
                email: ""
            })
        }
    }

    const handleRemoveContactFromSite = (index: number) => {
        setTurbineSiteForm(prev => ({
            ...prev,
            contacts: prev.contacts.filter((_, i) => i !== index)
        }))
    }

    const handleTurbineSiteFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically save the turbine/site data to your backend/database
        console.log("Turbine/Site form submitted:", turbineSiteForm)
        // Reset form
        setTurbineSiteForm({
            type: "turbine",
            turbineName: "",
            plantLocation: "",
            assignedComponents: [],
            // Reset site-specific fields
            siteName: "",
            address: "",
            contacts: []
        })
        setTurbineComponentForm({
            selectedComponent: ""
        })
        setSiteContactForm({
            name: "",
            phone: "",
            title: "",
            email: ""
        })
        setOpenDialog(null)
    }

    const handleEventFormChange = (field: string, value: string | number) => {
        setEventForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleAddSetInComponent = () => {
        if (setInAssignmentForm.selectedComponent) {
            setEventForm(prev => ({
                ...prev,
                setIn: [...prev.setIn, setInAssignmentForm.selectedComponent]
            }))
            setSetInAssignmentForm({
                selectedComponent: ""
            })
        }
    }

    const handleRemoveSetInComponent = (component: string) => {
        setEventForm(prev => ({
            ...prev,
            setIn: prev.setIn.filter(item => item !== component)
        }))
    }

    const handleAddSetOutComponent = () => {
        if (setOutAssignmentForm.selectedComponent) {
            setEventForm(prev => ({
                ...prev,
                setOut: [...prev.setOut, setOutAssignmentForm.selectedComponent]
            }))
            setSetOutAssignmentForm({
                selectedComponent: ""
            })
        }
    }

    const handleAddBothComponents = () => {
        const setInComponent = setInAssignmentForm.selectedComponent
        const setOutComponent = setOutAssignmentForm.selectedComponent
        
        if (setInComponent || setOutComponent) {
            setEventForm(prev => ({
                ...prev,
                setIn: setInComponent ? [...prev.setIn, setInComponent] : prev.setIn,
                setOut: setOutComponent ? [...prev.setOut, setOutComponent] : prev.setOut
            }))
            
            setSetInAssignmentForm({
                selectedComponent: ""
            })
            setSetOutAssignmentForm({
                selectedComponent: ""
            })
        }
    }

    const handleRemoveSetOutComponent = (component: string) => {
        setEventForm(prev => ({
            ...prev,
            setOut: prev.setOut.filter(item => item !== component)
        }))
    }

    const handleAddRepairPiece = () => {
        if (repairPieceForm.selectedPiece && repairPieceForm.conditionDetails && repairPieceForm.repairDetails) {
            setEventForm(prev => ({
                ...prev,
                repairPieces: [...prev.repairPieces, {
                    pieceId: repairPieceForm.selectedPiece,
                    conditionDetails: repairPieceForm.conditionDetails,
                    repairDetails: repairPieceForm.repairDetails
                }]
            }))
            // Reset the repair piece form
            setRepairPieceForm({
                selectedPiece: "",
                conditionDetails: "",
                repairDetails: ""
            })
        }
    }

    const handleRemoveRepairPiece = (pieceId: string) => {
        setEventForm(prev => ({
            ...prev,
            repairPieces: prev.repairPieces.filter(p => p.pieceId !== pieceId)
        }))
    }

    const handleEventFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically save the event data to your backend/database
        console.log("Event form submitted:", eventForm)
        // Reset form
        setEventForm({
            type: "outage",
            turbine: "",
            eventName: "",
            date: "",
            hours: 0,
            target: 0,
            intFh: 0,
            starts: 0,
            trips: 0,
            intFh2: 0,
            intTrips: 0,
            notes: "",
            setIn: [],
            setOut: [],
            // Reset repair fields
            repairNumber: "",
            repairComponent: "",
            preEventTitle: "",
            repairIntHours: 0,
            repairIntFS: 0,
            repairIntTrips: 0,
            repairPieces: []
        })
        setSetInAssignmentForm({
            selectedComponent: ""
        })
        setSetOutAssignmentForm({
            selectedComponent: ""
        })
        setRepairPieceForm({
            selectedPiece: "",
            conditionDetails: "",
            repairDetails: ""
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

                {/* Edit boxes */}
                <div className="flex gap-6">
                    <div 
                        className="flex-1 h-32 bg-blue-100 border border-blue-200 flex items-center justify-center text-lg font-bold text-blue-700 rounded-lg shadow-sm cursor-pointer hover:bg-blue-200 transition-colors"
                        onClick={() => handleCardClick('editPiece')}
                    >
                        Edit a piece
                    </div>
                    <div 
                        className="flex-1 h-32 bg-green-100 border border-green-200 flex items-center justify-center text-lg font-bold text-green-700 rounded-lg shadow-sm cursor-pointer hover:bg-green-200 transition-colors"
                        onClick={() => handleCardClick('editComponent')}
                    >
                        Edit a Component
                    </div>
                    <div 
                        className="flex-1 h-32 bg-yellow-100 border border-yellow-200 flex items-center justify-center text-lg font-bold text-yellow-700 rounded-lg shadow-sm cursor-pointer hover:bg-yellow-200 transition-colors"
                        onClick={() => handleCardClick('editEvent')}
                    >
                        Edit an event
                    </div>
                    <div 
                        className="flex-1 h-32 bg-purple-100 border border-purple-200 flex items-center justify-center text-lg font-bold text-purple-700 rounded-lg shadow-sm cursor-pointer hover:bg-purple-200 transition-colors"
                        onClick={() => handleCardClick('editTurbine')}
                    >
                        Edit a Turbine or Site
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

            {/* Dialog for Edit a piece */}
            <Dialog open={openDialog === 'editPiece'} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit a Piece</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditPieceFormSubmit} className="space-y-6">
                        {/* Piece Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="selectPiece">Select Piece to Edit</Label>
                            <Select 
                                value={editPieceForm.id} 
                                onValueChange={(pieceId) => handleSelectPieceToEdit(pieceId)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a piece to edit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availablePieces.map((piece) => (
                                        <SelectItem key={piece.id} value={piece.id}>
                                            {piece.name} ({piece.pn}) - {piece.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editSn">Serial Number (SN)</Label>
                                <Input
                                    id="editSn"
                                    value={editPieceForm.sn}
                                    onChange={(e) => handleEditPieceFormChange('sn', e.target.value)}
                                    placeholder="Enter serial number"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editPn">Part Number (PN)</Label>
                                <Input
                                    id="editPn"
                                    value={editPieceForm.pn}
                                    onChange={(e) => handleEditPieceFormChange('pn', e.target.value)}
                                    placeholder="Enter part number"
                                    required
                                />
                            </div>
                        </div>

                        {/* Component and Position */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editComponent">Component</Label>
                                <Select value={editPieceForm.component} onValueChange={(value) => handleEditPieceFormChange('component', value)}>
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
                                <Label htmlFor="editPosition">Position</Label>
                                <Select 
                                    value={editPieceForm.position} 
                                    onValueChange={(value) => {
                                        handleEditPieceFormChange('position', value)
                                        handleEditPieceFormChange('state', 'In Service')
                                    }}
                                    disabled={!editPieceForm.component}
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
                                <Label htmlFor="editStatus">Status</Label>
                                <Select value={editPieceForm.status} onValueChange={(value) => handleEditPieceFormChange('status', value)}>
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
                                <Label htmlFor="editState">State</Label>
                                <Select value={editPieceForm.state} onValueChange={(value) => handleEditPieceFormChange('state', value)}>
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
                                <Label htmlFor="editHours">Hours</Label>
                                <Input
                                    id="editHours"
                                    type="number"
                                    value={editPieceForm.hours}
                                    onChange={(e) => handleEditPieceFormChange('hours', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editStarts">Starts</Label>
                                <Input
                                    id="editStarts"
                                    type="number"
                                    value={editPieceForm.starts}
                                    onChange={(e) => handleEditPieceFormChange('starts', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editTrips">Trips</Label>
                                <Input
                                    id="editTrips"
                                    type="number"
                                    value={editPieceForm.trips}
                                    onChange={(e) => handleEditPieceFormChange('trips', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Repair Job Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="editRepairJob">Repair Job</Label>
                            <Select 
                                value={editPieceForm.repairJob} 
                                onValueChange={handleRepairJobChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a repair job" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRepairJobs.map((job) => (
                                        <SelectItem key={job.id} value={job.id}>
                                            {job.name} ({job.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Text Areas for Details */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="editRepairDetails">Repair Details</Label>
                                <textarea
                                    id="editRepairDetails"
                                    value={editPieceForm.repairDetails}
                                    onChange={(e) => handleEditPieceFormChange('repairDetails', e.target.value)}
                                    placeholder="Enter repair details..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editConditionDetails">Condition Details</Label>
                                <textarea
                                    id="editConditionDetails"
                                    value={editPieceForm.conditionDetails}
                                    onChange={(e) => handleEditPieceFormChange('conditionDetails', e.target.value)}
                                    placeholder="Enter condition details..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editNotes">Notes</Label>
                                <textarea
                                    id="editNotes"
                                    value={editPieceForm.notes}
                                    onChange={(e) => handleEditPieceFormChange('notes', e.target.value)}
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
                            <Button type="submit" disabled={!editPieceForm.id}>
                                Update Piece
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
                                    <Label htmlFor="intervalFH">Interval FH</Label>
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
                                    <Label htmlFor="intervalFS">Interval FS</Label>
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add an Event</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEventFormSubmit} className="space-y-6">
                        {/* Event Type Toggle */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Event Type</Label>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={eventForm.type === "outage" ? "default" : "outline"}
                                    onClick={() => handleEventFormChange('type', 'outage')}
                                    className="flex-1"
                                >
                                    Outage
                                </Button>
                                <Button
                                    type="button"
                                    variant={eventForm.type === "repair" ? "default" : "outline"}
                                    onClick={() => handleEventFormChange('type', 'repair')}
                                    className="flex-1"
                                >
                                    Repair
                                </Button>
                            </div>
                        </div>

                        {/* Form Content Based on Type */}
                        <div className="min-h-[300px] p-6 border border-gray-200 rounded-lg bg-gray-50">
                            {eventForm.type === "outage" ? (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Outage Form</h3>
                                    
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="turbine">Turbine</Label>
                                            <Select value={eventForm.turbine} onValueChange={(value) => handleEventFormChange('turbine', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select turbine" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableTurbines.map((turbine) => (
                                                        <SelectItem key={turbine} value={turbine}>
                                                            {turbine}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="eventName">Event Name</Label>
                                            <Input
                                                id="eventName"
                                                value={eventForm.eventName}
                                                onChange={(e) => handleEventFormChange('eventName', e.target.value)}
                                                placeholder="Enter event name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={eventForm.date}
                                                onChange={(e) => handleEventFormChange('date', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hours">Hours</Label>
                                            <Input
                                                id="hours"
                                                type="number"
                                                value={eventForm.hours}
                                                onChange={(e) => handleEventFormChange('hours', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="target">Target</Label>
                                        <Input
                                            id="target"
                                            type="number"
                                            value={eventForm.target}
                                            onChange={(e) => handleEventFormChange('target', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>

                                    {/* Interval Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="intFh">Int FH</Label>
                                            <Input
                                                id="intFh"
                                                type="number"
                                                value={eventForm.intFh}
                                                onChange={(e) => handleEventFormChange('intFh', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="starts">Starts</Label>
                                            <Input
                                                id="starts"
                                                type="number"
                                                value={eventForm.starts}
                                                onChange={(e) => handleEventFormChange('starts', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="trips">Trips</Label>
                                            <Input
                                                id="trips"
                                                type="number"
                                                value={eventForm.trips}
                                                onChange={(e) => handleEventFormChange('trips', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="intFh2">Int FH</Label>
                                            <Input
                                                id="intFh2"
                                                type="number"
                                                value={eventForm.intFh2}
                                                onChange={(e) => handleEventFormChange('intFh2', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="intTrips">Int Trips</Label>
                                        <Input
                                            id="intTrips"
                                            type="number"
                                            value={eventForm.intTrips}
                                            onChange={(e) => handleEventFormChange('intTrips', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>

                                    {/* Set In/Set Out Components */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-semibold">Component Replacement</h4>
                                            <div className="text-sm text-gray-600">
                                                Components being set in will replace components being set out
                                            </div>
                                        </div>
                                        
                                        {/* Current Assignments */}
                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Set In Components */}
                                            <div className="space-y-3">
                                                <h5 className="font-medium text-green-600 flex items-center gap-2">
                                                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                                    Set In (New Components)
                                                </h5>
                                                {eventForm.setIn.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {eventForm.setIn.map((component, index) => (
                                                            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                                                <span className="text-sm font-medium">{component}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveSetInComponent(component)}
                                                                    className="h-4 w-4 p-0 text-green-600 hover:text-green-800"
                                                                >
                                                                    ×
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 italic">No components selected</div>
                                                )}
                                            </div>

                                            {/* Set Out Components */}
                                            <div className="space-y-3">
                                                <h5 className="font-medium text-red-600 flex items-center gap-2">
                                                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                                    Set Out (Removed Components)
                                                </h5>
                                                {eventForm.setOut.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {eventForm.setOut.map((component, index) => (
                                                            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                                                                <span className="text-sm font-medium">{component}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveSetOutComponent(component)}
                                                                    className="h-4 w-4 p-0 text-red-600 hover:text-red-800"
                                                                >
                                                                    ×
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 italic">No components selected</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Add Components */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Select Component</Label>
                                                        <Select 
                                                            value={setInAssignmentForm.selectedComponent}
                                                            onValueChange={(component) => {
                                                                setSetInAssignmentForm(prev => ({
                                                                    ...prev,
                                                                    selectedComponent: component
                                                                }))
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Choose a component" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableComponents
                                                                    .filter(component => 
                                                                        !eventForm.setIn.includes(component) && 
                                                                        !eventForm.setOut.includes(component)
                                                                    )
                                                                    .map((component) => (
                                                                        <SelectItem key={component} value={component}>
                                                                            {component}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Select Component</Label>
                                                        <Select 
                                                            value={setOutAssignmentForm.selectedComponent}
                                                            onValueChange={(component) => {
                                                                setSetOutAssignmentForm(prev => ({
                                                                    ...prev,
                                                                    selectedComponent: component
                                                                }))
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Choose a component" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableComponents
                                                                    .filter(component => 
                                                                        !eventForm.setIn.includes(component) && 
                                                                        !eventForm.setOut.includes(component)
                                                                    )
                                                                    .map((component) => (
                                                                        <SelectItem key={component} value={component}>
                                                                            {component}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="flex justify-center">
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddBothComponents}
                                                        disabled={!setInAssignmentForm.selectedComponent && !setOutAssignmentForm.selectedComponent}
                                                        size="sm"
                                                        className="bg-slate-600 hover:bg-slate-700"
                                                    >
                                                        Add Components
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <textarea
                                            id="notes"
                                            value={eventForm.notes}
                                            onChange={(e) => handleEventFormChange('notes', e.target.value)}
                                            placeholder="Enter notes..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Repair Form</h3>
                                    
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="repairNumber">Repair #</Label>
                                            <Input
                                                id="repairNumber"
                                                value={eventForm.repairNumber}
                                                onChange={(e) => handleEventFormChange('repairNumber', e.target.value)}
                                                placeholder="Enter repair number"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="repairComponent">Component</Label>
                                            <Select value={eventForm.repairComponent} onValueChange={(value) => handleEventFormChange('repairComponent', value)}>
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="preEventTitle">Pre-Event Title</Label>
                                        <Input
                                            id="preEventTitle"
                                            value={eventForm.preEventTitle}
                                            onChange={(e) => handleEventFormChange('preEventTitle', e.target.value)}
                                            placeholder="Enter pre-event title"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="repairDate">Date</Label>
                                        <Input
                                            id="repairDate"
                                            type="date"
                                            value={eventForm.date}
                                            onChange={(e) => handleEventFormChange('date', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Interval Fields */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="repairIntHours">Int Hours</Label>
                                            <Input
                                                id="repairIntHours"
                                                type="number"
                                                value={eventForm.repairIntHours}
                                                onChange={(e) => handleEventFormChange('repairIntHours', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="repairIntFS">Int FS</Label>
                                            <Input
                                                id="repairIntFS"
                                                type="number"
                                                value={eventForm.repairIntFS}
                                                onChange={(e) => handleEventFormChange('repairIntFS', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="repairIntTrips">Int Trips</Label>
                                            <Input
                                                id="repairIntTrips"
                                                type="number"
                                                value={eventForm.repairIntTrips}
                                                onChange={(e) => handleEventFormChange('repairIntTrips', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Pieces Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold">Pieces</h4>
                                        
                                        {/* Current Pieces */}
                                        <div className="space-y-3">
                                            {eventForm.repairPieces.map((repairPiece, index) => {
                                                const piece = availablePieces.find(p => p.id === repairPiece.pieceId)
                                                return (
                                                    <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h5 className="font-medium text-gray-900">
                                                                    {piece?.name} ({piece?.pn}) - {piece?.id}
                                                                </h5>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRemoveRepairPiece(repairPiece.pieceId)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <Label className="text-sm font-medium text-gray-700">Condition Details</Label>
                                                                <div className="mt-1 p-2 bg-white border border-gray-300 rounded text-sm">
                                                                    {repairPiece.conditionDetails}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label className="text-sm font-medium text-gray-700">Repair Details</Label>
                                                                <div className="mt-1 p-2 bg-white border border-gray-300 rounded text-sm">
                                                                    {repairPiece.repairDetails}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        
                                        {/* Add New Piece */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <h5 className="font-medium text-gray-700 mb-3">Add New Piece</h5>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Select Piece</Label>
                                                    <Select 
                                                        value={repairPieceForm.selectedPiece}
                                                        onValueChange={(pieceId) => {
                                                            setRepairPieceForm(prev => ({
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
                                                                .filter(piece => !eventForm.repairPieces.some(rp => rp.pieceId === piece.id))
                                                                .map((piece) => (
                                                                    <SelectItem key={piece.id} value={piece.id}>
                                                                        {piece.name} ({piece.pn}) - {piece.id}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="newConditionDetails">Condition Details</Label>
                                                    <textarea
                                                        id="newConditionDetails"
                                                        value={repairPieceForm.conditionDetails}
                                                        onChange={(e) => setRepairPieceForm(prev => ({
                                                            ...prev,
                                                            conditionDetails: e.target.value
                                                        }))}
                                                        placeholder="Enter condition details..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                                        rows={3}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="newRepairDetails">Repair Details</Label>
                                                    <textarea
                                                        id="newRepairDetails"
                                                        value={repairPieceForm.repairDetails}
                                                        onChange={(e) => setRepairPieceForm(prev => ({
                                                            ...prev,
                                                            repairDetails: e.target.value
                                                        }))}
                                                        placeholder="Enter repair details..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                                        rows={3}
                                                    />
                                                </div>
                                                
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddRepairPiece}
                                                        disabled={!repairPieceForm.selectedPiece || !repairPieceForm.conditionDetails || !repairPieceForm.repairDetails}
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        Add Piece
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                Add Event
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog for Add a Turbine or Site */}
            <Dialog open={openDialog === 'turbine'} onOpenChange={() => setOpenDialog(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add a Turbine or Site</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTurbineSiteFormSubmit} className="space-y-6">
                        {/* Type Toggle */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Type</Label>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={turbineSiteForm.type === "turbine" ? "default" : "outline"}
                                    onClick={() => handleTurbineSiteFormChange('type', 'turbine')}
                                    className="flex-1"
                                >
                                    Add a Turbine
                                </Button>
                                <Button
                                    type="button"
                                    variant={turbineSiteForm.type === "site" ? "default" : "outline"}
                                    onClick={() => handleTurbineSiteFormChange('type', 'site')}
                                    className="flex-1"
                                >
                                    Add a Site
                                </Button>
                            </div>
                        </div>

                        {/* Form Content Based on Type */}
                        <div className="min-h-[300px] p-6 border border-gray-200 rounded-lg bg-gray-50">
                            {turbineSiteForm.type === "turbine" ? (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Add a Turbine</h3>
                                    
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="turbineName">Turbine Name</Label>
                                            <Input
                                                id="turbineName"
                                                value={turbineSiteForm.turbineName}
                                                onChange={(e) => handleTurbineSiteFormChange('turbineName', e.target.value)}
                                                placeholder="Enter turbine name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="plantLocation">Plant Location</Label>
                                            <Select value={turbineSiteForm.plantLocation} onValueChange={(value) => handleTurbineSiteFormChange('plantLocation', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select plant location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availablePlantLocations.map((location) => (
                                                        <SelectItem key={location} value={location}>
                                                            {location}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Component Assignment */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold">Assigned Components</h4>
                                        
                                        {/* Current Components */}
                                        <div className="space-y-3">
                                            {turbineSiteForm.assignedComponents.map((component, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <span className="font-medium">{component}</span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveComponentFromTurbine(component)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                            
                                            {/* Add new component */}
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                <div className="space-y-3">
                                                    <Label>Add Component</Label>
                                                    <div className="flex gap-3">
                                                        <Select 
                                                            value={turbineComponentForm.selectedComponent}
                                                            onValueChange={(component) => {
                                                                setTurbineComponentForm(prev => ({
                                                                    ...prev,
                                                                    selectedComponent: component
                                                                }))
                                                            }}
                                                        >
                                                            <SelectTrigger className="flex-1">
                                                                <SelectValue placeholder="Choose a component" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableComponents
                                                                    .filter(component => !turbineSiteForm.assignedComponents.includes(component))
                                                                    .map((component) => (
                                                                        <SelectItem key={component} value={component}>
                                                                            {component}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            onClick={handleAddComponentToTurbine}
                                                            disabled={!turbineComponentForm.selectedComponent}
                                                            size="sm"
                                                        >
                                                            Add Component
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Add a Site</h3>
                                    
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="siteName">Site Name</Label>
                                            <Input
                                                id="siteName"
                                                value={turbineSiteForm.siteName}
                                                onChange={(e) => handleTurbineSiteFormChange('siteName', e.target.value)}
                                                placeholder="Enter site name"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <textarea
                                                id="address"
                                                value={turbineSiteForm.address}
                                                onChange={(e) => handleTurbineSiteFormChange('address', e.target.value)}
                                                placeholder="Enter full address"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                                rows={3}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Points of Contact */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold">Points of Contact</h4>
                                        
                                        {/* Current Contacts */}
                                        <div className="space-y-3">
                                            {turbineSiteForm.contacts.map((contact, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{contact.name}</div>
                                                        {contact.title && <div className="text-sm text-gray-500">{contact.title}</div>}
                                                        <div className="text-sm text-gray-600">{contact.phone}</div>
                                                        {contact.email && <div className="text-sm text-gray-600">{contact.email}</div>}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveContactFromSite(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                            
                                            {/* Add new contact */}
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="newContactName">Contact Name</Label>
                                                            <Input
                                                                id="newContactName"
                                                                value={siteContactForm.name}
                                                                onChange={(e) => setSiteContactForm(prev => ({
                                                                    ...prev,
                                                                    name: e.target.value
                                                                }))}
                                                                placeholder="Enter contact name"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="newContactPhone">Phone Number</Label>
                                                            <Input
                                                                id="newContactPhone"
                                                                value={siteContactForm.phone}
                                                                onChange={(e) => setSiteContactForm(prev => ({
                                                                    ...prev,
                                                                    phone: e.target.value
                                                                }))}
                                                                placeholder="Enter phone number"
                                                                type="tel"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="newContactTitle">Title</Label>
                                                            <Input
                                                                id="newContactTitle"
                                                                value={siteContactForm.title}
                                                                onChange={(e) => setSiteContactForm(prev => ({
                                                                    ...prev,
                                                                    title: e.target.value
                                                                }))}
                                                                placeholder="Enter job title"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="newContactEmail">Email</Label>
                                                            <Input
                                                                id="newContactEmail"
                                                                value={siteContactForm.email}
                                                                onChange={(e) => setSiteContactForm(prev => ({
                                                                    ...prev,
                                                                    email: e.target.value
                                                                }))}
                                                                placeholder="Enter email address"
                                                                type="email"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <Button
                                                            type="button"
                                                            onClick={handleAddContactToSite}
                                                            disabled={!siteContactForm.name || !siteContactForm.phone}
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            Add Contact
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                Add {turbineSiteForm.type === "turbine" ? "Turbine" : "Site"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}