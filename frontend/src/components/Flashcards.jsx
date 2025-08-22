import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import Spinner from "./Spinner";

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const resp = await axios.post("/api/flashcards/generate", {
          content: "The quick brown fox jumps over the lazy dog.",
          difficulty: "easy",
          user_id: "user123",
        });

        console.log("Flashcards Response:", resp.data);
        setFlashcards(resp.data.flashcards || []); // backend should return flashcards array
      } catch (err) {
        console.error("Error fetching flashcards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  return (
    <div className="p-6 text-white">
      {loading ? (
        <>      
          <Spinner/>
        <h1>Loading...</h1>
        </>
      ) : (
        <div>
          <h1 className="text-xl font-bold mb-4">Flashcards</h1>
          {flashcards.length > 0 ? (
            <ul className="space-y-3">
              {flashcards.map((card, idx) => (
                <li
                  key={idx}
                  className="p-4 bg-slate-700 rounded-lg shadow-md"
                >
                  <p className="font-semibold">Q: {card.question}</p>
                  <p className="text-gray-300">A: {card.answer}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No flashcards generated.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
