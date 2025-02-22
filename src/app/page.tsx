"use client"
import { useState } from "react";
import PlayerForm from "./components/PlayerForm";
import EncounterForm from "./components/EncounterForm";

export default function Home() {
  const [players, setPlayers] = useState<{ id: number; name: string; level: number }[]>([]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">D&D Encounter Generator</h1>
      <PlayerForm onPlayersChange={setPlayers} />
      {players.length > 0 && (
        <EncounterForm players={players} />
      )}
    </div>
  );
}
