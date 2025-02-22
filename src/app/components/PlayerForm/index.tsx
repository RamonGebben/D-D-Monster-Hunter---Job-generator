import { useState } from "react";

type Player = {
  id: number;
  name: string;
  level: number;
};

type Props = {
  onPlayersChange: (players: Player[]) => void;
};

export default function PlayerForm({ onPlayersChange }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: Date.now(),
      name: `Player ${players.length + 1}`,
      level: 1, // Default to level 1
    };
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    onPlayersChange(updatedPlayers);
  };

  const updatePlayerLevel = (id: number, level: number) => {
    const updatedPlayers = players.map((p) =>
      p.id === id ? { ...p, level } : p
    );
    setPlayers(updatedPlayers);
    onPlayersChange(updatedPlayers);
  };

  const updatePlayerName = (id: number, name: string) => {
    const updatedPlayers = players.map((p) =>
      p.id === id ? { ...p, name } : p
    );
    setPlayers(updatedPlayers);
    onPlayersChange(updatedPlayers);
  };

  const removePlayer = (id: number) => {
    const updatedPlayers = players.filter((p) => p.id !== id);
    setPlayers(updatedPlayers);
    onPlayersChange(updatedPlayers);
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-xl">
      <h2 className="text-lg font-bold mb-3">Party Members</h2>
      <button
        onClick={addPlayer}
        className="bg-blue-600 px-4 py-2 rounded-lg mb-3"
      >
        + Add Player
      </button>
      <div>
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-3 mb-2">
            <input
              type="text"
              value={player.name}
              onChange={(e) =>
                updatePlayerName(player.id, e.target.value || player.name)
              }
              className="w-16 p-1 text-black rounded-md"
              min="1"
              max="20"
            />
            <input
              type="number"
              value={player.level}
              onChange={(e) =>
                updatePlayerLevel(player.id, parseInt(e.target.value) || 1)
              }
              className="w-16 p-1 text-black rounded-md"
              min="1"
              max="20"
            />
            <button
              onClick={() => removePlayer(player.id)}
              className="bg-red-500 px-3 py-1 rounded-md"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
