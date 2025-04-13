"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default function BookAppointmentPage() {
    const params = useParams();
    const saloonId = parseInt(params.id as string);

    const [date, setDate] = React.useState<Date | undefined>(new Date());

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-semibold mb-4">Book Appointment</h1>
            <p className="mb-4">Saloon ID: {saloonId}</p>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Select Date:</h2>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            {date ? (
                                date?.toLocaleDateString()
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center" side="bottom">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) =>
                                date < new Date()
                            }
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Select Time:</h2>
                <Input type="time" className="w-64" />
            </div>

            <Button>Confirm Appointment</Button>
        </div>
    );
}
