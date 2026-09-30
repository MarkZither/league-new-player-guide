"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ChampionSummary, Difficulty, Lane } from "@/lib/league-data";

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  Medium: "bg-amber-900/60 text-amber-300 border-amber-700",
  Hard: "bg-rose-900/60 text-rose-300 border-rose-700",
};
const FALLBACK_DIFFICULTY_STYLE =
  "bg-zinc-800 text-zinc-400 border-zinc-700";
const ALL_LANES_VALUE = "all";
const ALL_DIFFICULTIES_VALUE = "all";

function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  const style = difficulty
    ? (DIFFICULTY_STYLES[difficulty] ?? FALLBACK_DIFFICULTY_STYLE)
    : FALLBACK_DIFFICULTY_STYLE;

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {difficulty ?? "Unrated"}
    </span>
  );
}

function BeginnerRating({ rating }: { rating: number }) {
  return (
    <span aria-label={`Beginner friendliness: ${rating} out of 5`} className="text-[#C89B3C]">
      {"★".repeat(rating)}
      <span className="text-zinc-700">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function ChampionAvatar({ champion }: { champion: ChampionSummary }) {
  if (champion.imageFileName) {
    return (
      <Image
        src={`/${champion.imageFileName}`}
        alt={champion.name}
        width={96}
        height={96}
        className="h-24 w-24 rounded-full border-2 border-[#C89B3C] object-cover"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[#785A28] bg-[#091428] text-3xl font-semibold text-[#C89B3C]"
    >
      {champion.name.charAt(0)}
    </div>
  );
}

function ChampionCard({ champion }: { champion: ChampionSummary }) {
  const recommendation = champion.bestRecommendation;

  return (
    <li className="flex flex-col items-center gap-3 rounded-lg border border-[#1E2328] bg-[#0A1428] p-6 text-center transition-colors hover:border-[#C89B3C]">
      <ChampionAvatar champion={champion} />
      <div>
        <h2 className="text-lg font-semibold text-[#F0E6D2]">{champion.name}</h2>
        {champion.title && (
          <p className="text-sm italic text-zinc-400">{champion.title}</p>
        )}
      </div>
      <DifficultyBadge difficulty={champion.difficulty} />
      {recommendation && (
        <div className="mt-1 flex flex-col items-center gap-1 text-sm">
          <BeginnerRating rating={recommendation.beginnerRating} />
          <p className="text-zinc-400">
            Recommended for{" "}
            <span className="font-medium text-[#0AC8B9]">
              {recommendation.lane.displayName}
            </span>
          </p>
          <p className="max-w-[16rem] text-xs text-zinc-500">{recommendation.why}</p>
        </div>
      )}
    </li>
  );
}

const selectClassName =
  "rounded-md border border-[#1E2328] bg-[#0A1428] px-3 py-2 text-sm text-[#F0E6D2] focus:border-[#C89B3C] focus:outline-none";

export default function ChampionBrowser({
  champions,
  lanes,
}: {
  champions: ChampionSummary[];
  lanes: Lane[];
}) {
  const [selectedLane, setSelectedLane] = useState(ALL_LANES_VALUE);
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    ALL_DIFFICULTIES_VALUE
  );

  const difficulties = useMemo(() => {
    const values = new Set(
      champions
        .map((champion) => champion.difficulty)
        .filter((difficulty): difficulty is Difficulty => difficulty !== null)
    );
    return Array.from(values).sort();
  }, [champions]);

  const filteredChampions = useMemo(() => {
    return champions.filter((champion) => {
      const matchesLane =
        selectedLane === ALL_LANES_VALUE ||
        champion.bestRecommendation?.lane.laneId === selectedLane;
      const matchesDifficulty =
        selectedDifficulty === ALL_DIFFICULTIES_VALUE ||
        champion.difficulty === selectedDifficulty;
      return matchesLane && matchesDifficulty;
    });
  }, [champions, selectedLane, selectedDifficulty]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          Lane
          <select
            className={selectClassName}
            value={selectedLane}
            onChange={(event) => setSelectedLane(event.target.value)}
          >
            <option value={ALL_LANES_VALUE}>All lanes</option>
            {lanes.map((lane) => (
              <option key={lane.laneId} value={lane.laneId}>
                {lane.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-zinc-400">
          Difficulty
          <select
            className={selectClassName}
            value={selectedDifficulty}
            onChange={(event) => setSelectedDifficulty(event.target.value)}
          >
            <option value={ALL_DIFFICULTIES_VALUE}>All difficulties</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredChampions.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChampions.map((champion) => (
            <ChampionCard key={champion.championId} champion={champion} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-zinc-500">
          No champions match the selected filters.
        </p>
      )}
    </div>
  );
}
