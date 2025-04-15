"use client"
import  { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface User {
  name: string;
  email: string;
  id: string;
}

interface Booking {
  id: string;
  date: string;
  service: string;
  saloon:string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>('');
  const [editedEmail, setEditedEmail] = useState<string>('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const userId = authUser.uid;
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({
            name: userData.name,
            email: authUser.email ?? '', 
            id: userId,
          });
          setEditedName(userData.name); setEditedEmail(userData.email);
          
          // Fetch bookings (assuming you have a 'bookings' collection)
          //  Adjust the query according to your actual database structure
          //  This is a placeholder and might need adjustments
          // const bookingsRef = collection(db, "bookings");
          // const q = query(bookingsRef, where("userId", "==", userId));
          // const querySnapshot = await getDocs(q);
          // const bookingsList: Booking[] = [];
          // querySnapshot.forEach((doc) => {
          //   bookingsList.push({ id: doc.id, ...doc.data() } as Booking);
          // });
          // setBookings(bookingsList);
          setBookings([]) // setting empty for now
        } else {
          console.log("No such document!");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    if (user) {
      
      setEditedName(user.name);
      setEditedEmail(user.email)
    }
  };

  if (!user) {
    return <div>Please log in first.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-4">
        {isEditing ? (
          <div>
             <div className="mb-2">
              <label className="block mb-1">Name:</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Email:</label>
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveClick}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button onClick={handleCancelClick} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
             <button
              onClick={handleEditClick}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2">Booking History</h2>
      {bookings.length > 0 ? (
        <ul className="list-disc pl-5">
          {bookings.map((booking) => (
            <li key={booking.id} className="mb-1">
              {booking.date} - {booking.service} at {booking.saloon}
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
      {/*  Need to implement update user name  */}
      {/* <button onClick={handleSaveClick} disabled={!isEditing} className="bg-blue-500 text-white px-4 py-2 rounded mt-4 disabled:bg-gray-300">
        Update Profile
      </button> */}
    </div>
  );
};

export default ProfilePage;