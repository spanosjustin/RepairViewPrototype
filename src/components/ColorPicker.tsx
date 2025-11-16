"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ColorPickerProps {
  currentColor: string
  onColorChange: (color: string) => void
  statusName: string
}

const colorOptions = [
  // Reds (3) - Starting with warm colors
  { name: "Red", value: "red", bgClass: "bg-red-400", borderClass: "border-red-500" },
  { name: "Rose", value: "rose", bgClass: "bg-rose-400", borderClass: "border-rose-500" },
  { name: "Pink", value: "pink", bgClass: "bg-pink-400", borderClass: "border-pink-500" },
  
  // Oranges (3)
  { name: "Orange", value: "orange", bgClass: "bg-orange-400", borderClass: "border-orange-500" },
  { name: "Amber", value: "amber", bgClass: "bg-amber-400", borderClass: "border-amber-500" },
  { name: "Coral", value: "coral", bgClass: "bg-orange-300", borderClass: "border-orange-400" },
  
  // Yellows (3)
  { name: "Yellow", value: "yellow", bgClass: "bg-yellow-400", borderClass: "border-yellow-500" },
  { name: "Gold", value: "gold", bgClass: "bg-yellow-300", borderClass: "border-yellow-400" },
  { name: "Cream", value: "cream", bgClass: "bg-yellow-200", borderClass: "border-yellow-300" },
  
  // Greens (3)
  { name: "Green", value: "green", bgClass: "bg-green-400", borderClass: "border-green-500" },
  { name: "Emerald", value: "emerald", bgClass: "bg-emerald-400", borderClass: "border-emerald-500" },
  { name: "Lime", value: "lime", bgClass: "bg-lime-400", borderClass: "border-lime-500" },
  
  // Blues (3)
  { name: "Blue", value: "blue", bgClass: "bg-blue-400", borderClass: "border-blue-500" },
  { name: "Sky", value: "sky", bgClass: "bg-sky-400", borderClass: "border-sky-500" },
  { name: "Indigo", value: "indigo", bgClass: "bg-indigo-400", borderClass: "border-indigo-500" },
  
  // Purples (3)
  { name: "Purple", value: "purple", bgClass: "bg-purple-400", borderClass: "border-purple-500" },
  { name: "Violet", value: "violet", bgClass: "bg-violet-400", borderClass: "border-violet-500" },
  { name: "Fuchsia", value: "fuchsia", bgClass: "bg-fuchsia-400", borderClass: "border-fuchsia-500" },
  
  // Grays (3) - Ending with neutrals
  { name: "Gray", value: "gray", bgClass: "bg-gray-300", borderClass: "border-gray-400" },
  { name: "Slate", value: "slate", bgClass: "bg-slate-300", borderClass: "border-slate-400" },
  { name: "Stone", value: "stone", bgClass: "bg-stone-300", borderClass: "border-stone-400" },
]

export function ColorPicker({ currentColor, onColorChange, statusName }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentColorOption = colorOptions.find(option => option.value === currentColor) || colorOptions[0]
  
  const handleColorSelect = useCallback((colorValue: string) => {
    // Only call onColorChange if the color actually changed
    if (colorValue !== currentColor) {
      onColorChange(colorValue)
    }
    setIsOpen(false)
  }, [currentColor, onColorChange])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button 
          className={`w-6 h-6 ${currentColorOption.bgClass} rounded-full border-2 ${currentColorOption.borderClass} cursor-pointer hover:scale-110 transition-transform`}
          aria-label={`Change color for ${statusName}`}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Color for {statusName}</DialogTitle>
          <DialogDescription>
            Choose a color to represent the {statusName} state
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-6 gap-3 py-4">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorSelect(color.value)}
              className={`w-12 h-12 ${color.bgClass} rounded-full border-2 ${color.borderClass} hover:scale-110 transition-transform flex items-center justify-center`}
              aria-label={`Select ${color.name} color`}
            >
              {currentColor === color.value && (
                <div className="w-3 h-3 bg-white rounded-full opacity-80" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
