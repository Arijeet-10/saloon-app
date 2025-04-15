
"use client";

import Image from 'next/image';
import Link from 'next/link';

interface Category {
  name: string;
  description: string;
  image: string;
}

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Link href={`/categories/${category.name.toLowerCase()}`}>
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
        <div className="relative w-full h-48">
          <Image
            src={category.image || '/placeholder.jpg'}
            alt={category.name}
            fill
            className="object-cover"
          />
         </div>
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <p className="text-gray-600">{category.description}</p>
       </div>
    </Link>
  );
};

export default CategoryCard;