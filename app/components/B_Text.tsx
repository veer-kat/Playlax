'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ScoreRecord {
  score: number;
  // Add other properties if your scores have more fields
}

const B_Text = () => {
  const [maxScore, setMaxScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  console.log("Maxscore", maxScore);
  
  useEffect(() => {
    const getMaxScore = async () => {
      try {
        // Check if IndexedDB is available
        if (!window.indexedDB) {
          console.log("IndexedDB is not supported in this browser");
          setIsLoading(false);
          return;
        }

        // Open the database with the correct name "GameDB"
        const request = indexedDB.open("GameDB", 1);
        
        request.onerror = (event) => {
          console.error("IndexedDB error:", (event.target as IDBRequest).error);
          setIsLoading(false);
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBRequest).result;
          
          // Check if the Scores table exists
          if (!db.objectStoreNames.contains('Scores')) {
            console.log("Scores table does not exist");
            setIsLoading(false);
            return;
          }
          
          const transaction = db.transaction(['Scores'], 'readonly');
          const store = transaction.objectStore('Scores');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const scores = getAllRequest.result as ScoreRecord[];
            console.log("All scores from DB:", scores);
            
            if (scores && scores.length > 0) {
              const max = Math.max(...scores.map(item => item.score));
              console.log("Calculated max score:", max);
              setMaxScore(max);
            } else {
              console.log("No scores found in database");
              setMaxScore(0);
            }
            setIsLoading(false);
          };
          
          getAllRequest.onerror = () => {
            console.error("Error fetching scores");
            setIsLoading(false);
          };
        };
        
        request.onupgradeneeded = (event) => {
          // This will be called if the database doesn't exist or version changes
          const db = (event.target as IDBRequest).result;
          console.log("Database upgrade needed - creating store if it doesn't exist");
          
          // Create the object store if it doesn't exist
          if (!db.objectStoreNames.contains('Scores')) {
            db.createObjectStore('Scores', { keyPath: 'id', autoIncrement: true });
          }
          setIsLoading(false);
        };
      } catch (error) {
        console.error("Error accessing IndexedDB:", error);
        setIsLoading(false);
      }
    };

    getMaxScore();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-[150px] h-[150px] bg-gray-200 animate-pulse rounded-full"></div>
      </div>
    );
  }

  const trophyImage = maxScore >= 15 ? "/text/baby.png" : "/text/baby.png";
  const trophyAlt = maxScore >= 15 ? "Adult Trophy Achieved" : "Adult Trophy Not Achieved";

  return (
    <div className="flex items-center justify-center">
      <Image 
        src={trophyImage} 
        alt={trophyAlt} 
        width={200} 
        height={200} 
        priority 
        className="scale-125 transition-transform duration-300"
      />
    </div>
  );
};

export default B_Text;