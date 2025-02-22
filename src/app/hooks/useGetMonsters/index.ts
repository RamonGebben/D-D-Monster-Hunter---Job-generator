import { useState } from "react";

export type Monster = {
  index: string;
  name: string;
  challenge_rating: number;
  hit_points: number;
  armor_class: { value: number }[];
  image?: string;
  actions?: { name: string; desc: string }[];
};

export default function useGetMonsters(): [
  Monster[] | null,
  boolean,
  (maxCR: number) => Promise<void>
] {
  const [monsters, setMonsters] = useState<Monster[] | null>(null);
  const [loading, setLoading] = useState(false);

  const getMonsters = async (maxCR: number) => {
    try {
      setLoading(true);

      // Include fractional CRs (0.125, 0.25, 0.5) and whole numbers
      const crValues = [0.125, 0.25, 0.5, ...Array.from({ length: maxCR }, (_, i) => i + 1)].join(",");

      const response = await fetch(
        `https://www.dnd5eapi.co/api/monsters?challenge_rating=${crValues}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) {
        setLoading(false);
        throw new Error(`Error fetching monsters: ${response.statusText}`);
      }

      const data = await response.json();

      // Fetch full details for each monster
      const monsterDetails: Monster[] = await Promise.all(
        data.results.map(async (monster: { index: string; name: string; url: string }) => {
          const detailsResponse = await fetch(`https://www.dnd5eapi.co${monster.url}`);
          const details = await detailsResponse.json();
          return {
            index: details.index,
            name: details.name,
            challenge_rating: details.challenge_rating,
            hit_points: details.hit_points,
            armor_class: details.armor_class,
            image: `/monsters/${details.index}.webp`,
            actions: details.actions
              ? details.actions.map((a: { name: string; desc: string }) => ({
                  name: a.name,
                  desc: a.desc,
                }))
              : [],
          };
        })
      );

      setMonsters(monsterDetails);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch monsters", error);
      setMonsters(null);
    }
  };

  return [monsters, loading, getMonsters];
}
