'use client'
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import SaloonCard from '@/components/SaloonCard'
export default function CategoryPage({ params }: { params: { categoryName: string } }) {
  const categoryName = params.categoryName;
  console.log("categoryName: ", categoryName)
  const [filteredSaloons, setFilteredSaloons] = useState<any[]>([])
  useEffect(() => {
    const fetchSaloons = async () => {
      const saloonsRef = collection(db, 'saloons');      
      const saloonsSnapshot = await getDocs(saloonsRef);
      const allSaloons: any[] = [];
      saloonsSnapshot.forEach(doc => {
        allSaloons.push({ id: doc.id, ...doc.data() });
      });
      console.log('All Saloons:', allSaloons);

      const filteredSaloons = await Promise.all(
        allSaloons.map(async (saloon) => {
          console.log('Saloon:', saloon);
          const servicesRef = collection(db, 'saloons', saloon.id, 'services');
          const servicesSnapshot = await getDocs(servicesRef);
          const services = servicesSnapshot.docs.map(doc => doc.data());
          console.log('Services:', services);
          return {
            ...saloon, hasMatchingService: services.some((service: any) => service.name.toLowerCase() === decodeURIComponent(categoryName).toLowerCase())
          };
        })
      ).then(saloons => saloons.filter(saloon => saloon.hasMatchingService));

      setFilteredSaloons(filteredSaloons.filter(saloon => saloon.hasMatchingService));
    }
    fetchSaloons()
  }, [categoryName])
  console.log("filtered Saloons:", filteredSaloons);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Saloons for {categoryName}</h1>
      {filteredSaloons && filteredSaloons.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSaloons.map((saloon) => (             
              <SaloonCard key={saloon.id} saloon={{...saloon, imageUrl: saloon.imageUrl}} />            
          ))}          
        </ul>
      ) : (
        <p>No saloons found for {decodeURIComponent(categoryName)}</p>
      )}
    </div>
  );
}
