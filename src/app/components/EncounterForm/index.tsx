"use client"
import { useState, useRef } from "react";
import useGetMonsters, { Monster } from "../../hooks/useGetMonsters";
import Image from "next/image";

type SelectedMonster = Monster & { uniqueName: string };

type Props = {
  players: { id: number; name: string; level: number }[];
};

export default function EncounterForm({ players }: Props) {
  const [monsters, loading, getMonsters] = useGetMonsters();
  const [selectedMonsters, setSelectedMonsters] = useState<SelectedMonster[]>([]);
  const [finalized, setFinalized] = useState(false);

  // Calculate max allowed CR
  const totalLevels = players.reduce((sum, p) => sum + p.level, 0);
  const maxCR = players.length > 0 ? Math.floor(totalLevels / players.length) : 0;
  const totalSelectedCR = selectedMonsters.reduce((sum, m) => sum + m.challenge_rating, 0);
  const remainingCR = maxCR - totalSelectedCR;

  // Helper function to group monsters by CR
  const groupByCR = (monstersList: Monster[]) => {
    return monstersList.reduce((acc, monster) => {
      if (!acc[monster.challenge_rating]) acc[monster.challenge_rating] = [];
      acc[monster.challenge_rating].push(monster);
      return acc;
    }, {} as Record<number, Monster[]>);
  };

  const groupedMonsters = monsters ? groupByCR(monsters) : {};
  const crRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleGenerate = () => {
    getMonsters(maxCR);
  };

  const handleSelectMonster = (monster: Monster) => {
    if (remainingCR - monster.challenge_rating >= 0) {
      const monsterCount = selectedMonsters.filter((m) => m.index === monster.index).length;
      const uniqueName = monsterCount > 0 ? `${monster.name} ${monsterCount + 1}` : monster.name;
      setSelectedMonsters((prev) => [...prev, { ...monster, uniqueName }]);
    }
  };

  const handleRemoveMonster = (index: number) => {
    const updatedMonsters = selectedMonsters.filter((_, i) => i !== index);

    // Renumber instances when removing a monster
    const renumberedMonsters = updatedMonsters.map((monster, i, arr) => {
      const count = arr.filter((m) => m.index === monster.index).indexOf(monster) + 1;
      return { ...monster, uniqueName: count > 1 ? `${monster.name} ${count}` : monster.name };
    });

    setSelectedMonsters(renumberedMonsters);
  };

  const handleFinalize = () => {
    if (selectedMonsters.length > 0) {
      setFinalized(true);
    }
  };

  const scrollToCR = (cr: string) => {
    if (crRefs.current[cr]) {
      crRefs.current[cr]?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-xl mt-4 pb-24 relative">
      <h2 className="text-lg font-bold mb-3">Encounter Settings</h2>

      {!finalized ? (
        <>
          <p className="text-sm mb-2">
            Max CR: <strong>{maxCR}</strong> | Selected CR: <strong>{totalSelectedCR}</strong> | Remaining CR: <strong>{remainingCR}</strong>
          </p>

          <button onClick={handleGenerate} className="bg-green-600 px-4 py-2 rounded-lg mb-3">
            Fetch Monsters
          </button>

          {loading && <p>Loading...</p>}

          {monsters && !loading && (
            <div className="relative mt-4">
              {/* Quick Navigation Sidebar */}
              <div className="fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col space-y-2 bg-gray-900 p-2 rounded-md shadow-lg">
                {Object.keys(groupedMonsters)
                  .sort((a, b) => parseFloat(a) - parseFloat(b))
                  .map((cr) => (
                    <button
                      key={cr}
                      onClick={() => scrollToCR(cr)}
                      className="bg-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-600"
                    >
                      CR {cr}
                    </button>
                  ))}
              </div>

              <h3 className="text-lg font-bold">Available Monsters:</h3>
              {Object.keys(groupedMonsters)
                .sort((a, b) => parseFloat(a) - parseFloat(b))
                .map((cr) => (
                  <div key={cr} ref={(el) => {if (el)crRefs.current[cr] = el}} className="mt-4">
                    <h4 className="text-md font-semibold text-gray-300 sticky top-0 bg-gray-800 py-2 px-4 shadow-md">
                      CR {cr}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {groupedMonsters[parseFloat(cr)].map((monster) => (
                        <div key={monster.index} className="bg-gray-700 p-3 rounded-lg text-center">
                          {monster.image && (
                            <Image
                              src={monster.image}
                              alt={monster.name}
                              width={200}
                              height={200}
                              className="w-24 h-24 rounded-md inline"
                            />
                          )}
                          <p className="text-sm mt-2">
                            <strong>{monster.name}</strong>
                          </p>
                          <button
                            onClick={() => handleSelectMonster(monster)}
                            disabled={monster.challenge_rating > remainingCR}
                            className={`w-full mt-2 px-3 py-1 rounded-md ${
                              monster.challenge_rating > remainingCR ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"
                            }`}
                          >
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Fixed Toolbar */}
          {selectedMonsters.length > 0 && (
            <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white py-3 px-6 flex justify-between items-center shadow-md">
              <div>
                <h3 className="text-lg font-bold">Selected Monsters:</h3>
                <div className="flex gap-2">
                  {selectedMonsters.map((monster, index) => (
                    <button
                      key={index}
                      onClick={() => handleRemoveMonster(index)}
                      className="bg-gray-700 px-2 py-1 rounded-md text-sm"
                    >
                      ❌ {monster.uniqueName}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p>Remaining CR: <strong>{remainingCR}</strong></p>
                <button
                  onClick={handleFinalize}
                  className="bg-yellow-500 px-4 py-2 rounded-lg"
                >
                  Generate Encounter
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4">
          <h3 className="text-lg font-bold">Finalized Encounter</h3>
          <div className="grid grid-cols-2 gap-4">
            {selectedMonsters.map((monster, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  {monster.image && (
                    <Image
                      src={monster.image}
                      alt={monster.name}
                      className="w-24 h-24 rounded-md inline"
                      width={200}
                      height={200}
                    />
                  )}
                  <div>
                    <h4 className="text-xl font-bold">{monster.uniqueName} (CR {monster.challenge_rating})</h4>
                    <p>HP: {monster.hit_points} | AC: {monster.armor_class.map(ac => ac.value).join(", ")}</p>
                  </div>
                </div>
                {monster.actions && (
                  <div className="mt-2">
                    <h5 className="text-lg font-bold">Actions</h5>
                    <ul>
                      {monster.actions.map((action, i) => (
                        <li key={i} className="text-sm">
                          <strong>{action.name}:</strong> {action.desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
