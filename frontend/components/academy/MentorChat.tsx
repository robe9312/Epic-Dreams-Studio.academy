// /frontend/components/academy/MentorChat.tsx
"use client";
import { useState } from 'react';

export const MentorChat = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askMentor = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/mentor/chat?message=${message}`, {
        method: 'POST'
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse("❌ Error al conectar con el Mentor.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-[#121212] rounded-xl border border-[#333] max-w-md">
      <h3 className="text-yellow-500 font-bold mb-4">🎬 Mentor de Cine AI</h3>
      <div className="mb-4 h-48 overflow-y-auto text-sm text-gray-300">
        {loading ? "Pensando..." : response || "Pregúntame cualquier duda sobre cine o navegación..."}
      </div>
      <div className="flex gap-2">
        <input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-[#222] border border-[#444] rounded-lg px-3 py-2 text-white w-full"
          placeholder="Escribe aquí..."
        />
        <button 
          onClick={askMentor}
          className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};