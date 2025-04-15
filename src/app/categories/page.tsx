import React from 'react';
import CategoryCard from '@/components/CategoryCard';

interface Category {
    name: string;
    description: string;
    image: string;
}

const categories: Category[] = [
    {
        name: 'Hair Styling',
        description: 'Expert hair styling services for all occasions.',
        image: '/images/category/hair.jpg',
    },
    {
        name: 'Spa',
        description: 'Manicures, pedicures, and nail art services.',
        image: '/images/category/spa.jpg',
    },
    {
        name: 'Makeup',
        description: 'Professional makeup application for events and photoshoots.',
        image: '/images/category/makeup.jpg'
    },
    {
        name: 'Eyebrows & Eyelashes',
        description: 'Enhance your eyes with professional eyebrow and eyelash services.',
        image: '/images/category/eyebrow.jpg'
    },
    {
        name: 'Massage',
        description: 'Relaxing and therapeutic massage treatments.',
        image: '/images/category/massage.jpg'
    },
    {
        name: 'Barbering',
        description: 'Classic and modern barber services for men.',
        image: '/images/category/barbering.jpg'
    },
    {
        name: 'Hair Removal',
        description: 'Effective and gentle hair removal services.',
        image: '/images/category/hair-remove.jpg'
    },
    {
        name: 'Facials & Skincare',
        description: 'Rejuvenating facials and personalized skincare treatments.',
        image: '/images/category/facial.jpg'
    },
    {
        name: 'Injectables & Fillers',
        description: 'Advanced cosmetic procedures for a refreshed look.',
        image: '/images/category/filler.jpg'
    },
];


export default function ServiceCategories() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Service Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
        {categories.map((category) => {
          return (
            <CategoryCard key={category.name} category={category} />
          );
        })}
      </div>
    </div>
  );
}