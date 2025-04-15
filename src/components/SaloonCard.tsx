"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Clock } from "lucide-react";

interface SaloonCardProps {
    saloon: {
        id: string;
        shopName: string;
        location: string;
        image?: string;
        rating?: number;
        openingHours?: string;
        description?: string;
    };
}

const SaloonCard: React.FC<SaloonCardProps> = ({ saloon }) => {
    return (
        <li className="bg-white rounded-lg shadow-md overflow-hidden">
            <Link href={`/saloon/${saloon.id}`} className="block">
                <Card className="hover:shadow-xl transition-all duration-300 ease-in-out border-0 shadow-md overflow-hidden h-full">
                    <div className="h-48 overflow-hidden relative">
                        <Image
                            src={saloon.image ? saloon.image : "https://media.istockphoto.com/id/639607852/photo/hairstylist-serving-client-at-barber-shop.jpg?s=612x612&w=0&k=20&c=-kBoMs26KIX1Hl6uh_VLRHCtLxnLYyq9a0n7X8iu5MQ="}
                            alt={saloon.shopName}
                            fill
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center shadow-md">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                            <span className="text-sm font-medium">{saloon.rating || '4.0'}</span>
                        </div>
                    </div>
                    <CardContent className="p-5">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{saloon.shopName}</h3>

                        <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{saloon.location}</span>
                        </div>

                        <div className="flex items-center text-gray-600 mb-3">
                            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{saloon.openingHours || "Mon-Sat: 9am - 7pm"}</span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">{saloon.description || "Trendy salon offering the latest hair styles."}</p>
                    </CardContent>
                </Card>
            </Link>
        </li>
    );
};
export default SaloonCard;