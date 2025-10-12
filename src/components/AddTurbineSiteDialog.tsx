"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TurbineSiteForm {
  type: "turbine" | "site";
  turbineName: string;
  plantLocation: string;
  assignedComponents: string[];
  // Site-specific fields
  siteName: string;
  address: string;
  contacts: Array<{name: string, phone: string, title: string, email: string}>;
}

interface SiteContactForm {
  name: string;
  phone: string;
  title: string;
  email: string;
}

interface AddTurbineSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: "turbine" | "site";
}

export default function AddTurbineSiteDialog({ 
  open, 
  onOpenChange, 
  initialType = "turbine" 
}: AddTurbineSiteDialogProps) {
  // State for turbine/site form
  const [turbineSiteForm, setTurbineSiteForm] = useState<TurbineSiteForm>({
    type: initialType,
    turbineName: "",
    plantLocation: "",
    assignedComponents: [],
    // Site-specific fields
    siteName: "",
    address: "",
    contacts: []
  });

  // Update form type when initialType changes or dialog opens
  React.useEffect(() => {
    if (open) {
      setTurbineSiteForm(prev => ({
        ...prev,
        type: initialType
      }));
    }
  }, [open, initialType]);

  // State for turbine component assignment form
  const [turbineComponentForm, setTurbineComponentForm] = useState({
    selectedComponent: ""
  });

  // State for site contact form
  const [siteContactForm, setSiteContactForm] = useState<SiteContactForm>({
    name: "",
    phone: "",
    title: "",
    email: ""
  });

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
  ];

  // Available plant locations
  const availablePlantLocations = [
    "Plant Alpha",
    "Plant Beta",
    "Plant Gamma",
    "Plant Delta",
    "Plant Epsilon"
  ];

  const handleTurbineSiteFormChange = (field: string, value: string | number) => {
    setTurbineSiteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddComponentToTurbine = () => {
    if (turbineComponentForm.selectedComponent) {
      setTurbineSiteForm(prev => ({
        ...prev,
        assignedComponents: [...prev.assignedComponents, turbineComponentForm.selectedComponent]
      }));
      setTurbineComponentForm({
        selectedComponent: ""
      });
    }
  };

  const handleRemoveComponentFromTurbine = (component: string) => {
    setTurbineSiteForm(prev => ({
      ...prev,
      assignedComponents: prev.assignedComponents.filter(c => c !== component)
    }));
  };

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
      }));
      // Reset the contact form
      setSiteContactForm({
        name: "",
        phone: "",
        title: "",
        email: ""
      });
    }
  };

  const handleRemoveContactFromSite = (index: number) => {
    setTurbineSiteForm(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const handleTurbineSiteFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the turbine/site data to your backend/database
    console.log("Turbine/Site form submitted:", turbineSiteForm);
    // Reset form
    setTurbineSiteForm({
      type: initialType,
      turbineName: "",
      plantLocation: "",
      assignedComponents: [],
      // Reset site-specific fields
      siteName: "",
      address: "",
      contacts: []
    });
    setTurbineComponentForm({
      selectedComponent: ""
    });
    setSiteContactForm({
      name: "",
      phone: "",
      title: "",
      email: ""
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                              }));
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
              onClick={() => onOpenChange(false)}
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
  );
}
