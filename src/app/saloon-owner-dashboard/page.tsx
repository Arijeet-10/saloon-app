"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

// Dummy data for services - replace with actual database integration later
const initialServices = [
  { id: 1, name: "Haircut", price: 25 },
  { id: 2, name: "Beard Trim", price: 15 },
  { id: 3, name: "Shave", price: 20 },
];

export default function SaloonOwnerDashboard() {
  const [services, setServices] = useState(initialServices);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [editServiceId, setEditServiceId] = useState<number | null>(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServicePrice, setEditServicePrice] = useState("");

  const handleAddService = () => {
    if (newServiceName && newServicePrice) {
      const newService = {
        id: Date.now(), // Temporary ID - replace with database ID
        name: newServiceName,
        price: parseFloat(newServicePrice),
      };
      setServices([...services, newService]);
      setNewServiceName("");
      setNewServicePrice("");
    }
  };

  const handleEditService = (service) => {
    setEditServiceId(service.id);
    setEditServiceName(service.name);
    setEditServicePrice(service.price.toString());
  };

  const handleSaveService = () => {
    if (editServiceId && editServiceName && editServicePrice) {
      const updatedServices = services.map((service) =>
        service.id === editServiceId
          ? { id: service.id, name: editServiceName, price: parseFloat(editServicePrice) }
          : service
      );
      setServices(updatedServices);
      setEditServiceId(null);
      setEditServiceName("");
      setEditServicePrice("");
    }
  };

  const handleDeleteService = (id) => {
    const updatedServices = services.filter((service) => service.id !== id);
    setServices(updatedServices);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">Saloon Owner Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Services */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Manage Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Add Service</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newServiceName">Name</Label>
                    <Input
                      type="text"
                      id="newServiceName"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newServicePrice">Price</Label>
                    <Input
                      type="number"
                      id="newServicePrice"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="mt-4" onClick={handleAddService}>Add Service</Button>
              </div>

              <h3 className="text-lg font-semibold mb-2">Current Services</h3>
              <ScrollArea className="h-[300px] w-full rounded-md border">
                <div className="p-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between mb-2">
                      <div>
                        {editServiceId === service.id ? (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="text"
                              value={editServiceName}
                              onChange={(e) => setEditServiceName(e.target.value)}
                            />
                            <Input
                              type="number"
                              value={editServicePrice}
                              onChange={(e) => setEditServicePrice(e.target.value)}
                            />
                          </div>
                        ) : (
                          <>
                            {service.name} - ${service.price}
                          </>
                        )}
                      </div>
                      <div>
                        {editServiceId === service.id ? (
                          <Button size="sm" onClick={handleSaveService}>Save</Button>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => handleEditService(service)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteService(service.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* View Appointments */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No appointment data available at this time.</p>
              {/* Replace with actual appointment data display later */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
