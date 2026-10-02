"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { BuildDetail, ChampionSummary, Difficulty, Lane } from "@/lib/league-data";

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

function BeginnerRating({ rating }: { rating: number | null }) {
  if (rating === null) return null;

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

function ChampionCard({
  champion,
  onSelect,
}: {
  champion: ChampionSummary;
  onSelect: (champion: ChampionSummary) => void;
}) {
  const recommendation = champion.bestRecommendation;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(champion)}
        className="flex w-full flex-col items-center gap-3 rounded-lg border border-[#1E2328] bg-[#0A1428] p-6 text-center transition-colors hover:border-[#C89B3C] focus:outline-none focus-visible:border-[#C89B3C] focus-visible:ring-2 focus-visible:ring-[#C89B3C]/50"
      >
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
        <span className="mt-1 text-sm font-semibold text-[#C89B3C]">
          View item builds
        </span>
      </button>
    </li>
  );
}

const selectClassName =
  "rounded-md border border-[#1E2328] bg-[#0A1428] px-3 py-2 text-sm text-[#F0E6D2] focus:border-[#C89B3C] focus:outline-none";

function BuildCard({ build }: { build: BuildDetail }) {
  const itemsByStage = useMemo(() => {
    const groups = new Map<string, BuildDetail["items"]>();
    for (const buildItem of build.items) {
      const existing = groups.get(buildItem.stage) ?? [];
      groups.set(buildItem.stage, [...existing, buildItem]);
    }
    return groups;
  }, [build.items]);

  return (
    <div className="rounded-lg border border-[#1E2328] bg-[#091428] p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-[#F0E6D2]">{build.name}</h4>
        {build.isPrimary === "Yes" && (
          <span className="rounded-full border border-[#C89B3C] px-2 py-0.5 text-xs font-medium text-[#C89B3C]">
            Primary
          </span>
        )}
      </div>
      {build.description && (
        <p className="mt-1 text-sm text-zinc-400">{build.description}</p>
      )}
      {build.items.length > 0 ? (
        <div className="mt-3 flex flex-col gap-3">
          {Array.from(itemsByStage.entries()).map(([stage, items]) => (
            <div key={stage}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0AC8B9]">
                {stage}
              </p>
              <ul className="mt-1 flex flex-col gap-2">
                {items.map((buildItem) => (
                  <li key={buildItem.itemId} className="text-sm">
                    <span className="font-medium text-[#F0E6D2]">
                      {buildItem.item.name}
                    </span>
                    {buildItem.reason && (
                      <span className="text-zinc-400"> — {buildItem.reason}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">No items documented yet.</p>
      )}
    </div>
  );
}

function ChampionDialog({
  champion,
  onClose,
}: {
  champion: ChampionSummary | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (champion) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [champion]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100vh-4rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-[#1E2328] bg-[#0A1428] p-0 text-[#F0E6D2] shadow-2xl shadow-black/60 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {champion && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <ChampionAvatar champion={champion} />
              <div>
                <h3 className="text-xl font-semibold">{champion.name}</h3>
                {champion.title && (
                  <p className="text-sm italic text-zinc-400">{champion.title}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full border border-[#1E2328] px-2.5 py-1 text-sm text-zinc-400 transition-colors hover:border-[#C89B3C] hover:text-[#C89B3C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]/50"
            >
              ✕
            </button>
          </div>

          {champion.description && (
            <p className="text-sm text-zinc-400">{champion.description}</p>
          )}

          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Lane recommendations
            </h4>
            {champion.recommendations.length > 0 ? (
              <div className="flex flex-col gap-2">
                {champion.recommendations.map((recommendation, index) => (
                  <details
                    key={recommendation.recommendationId}
                    open={index === 0}
                    className="group rounded-lg border border-[#1E2328] bg-[#091428]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-zinc-500 transition-transform group-open:rotate-90">
                          ▸
                        </span>
                        <span className="font-medium text-[#0AC8B9]">
                          {recommendation.lane.displayName}
                        </span>
                        {recommendation.playStyle && (
                          <span className="text-xs text-zinc-500">
                            {recommendation.playStyle}
                          </span>
                        )}
                      </span>
                      {recommendation.recommended === "Yes" ? (
                        <BeginnerRating rating={recommendation.beginnerRating} />
                      ) : (
                        <span className="rounded-full border border-rose-700 bg-rose-900/60 px-2 py-0.5 text-xs font-medium text-rose-300">
                          Not recommended
                        </span>
                      )}
                    </summary>
                    <div className="flex flex-col gap-3 border-t border-[#1E2328] p-3 text-sm">
                      {recommendation.why && (
                        <p className="text-zinc-400">{recommendation.why}</p>
                      )}
                      {recommendation.keystoneRune && (
                        <section className="border-l-2 border-[#C89B3C] pl-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#C89B3C]">
                            Keystone rune
                          </p>
                          <p className="mt-1 font-medium text-[#F0E6D2]">
                            {recommendation.keystoneRune.name} · {recommendation.keystoneRune.path}
                          </p>
                          {recommendation.keystoneRune.description && (
                            <p className="mt-1 text-zinc-400">
                              {recommendation.keystoneRune.description}
                            </p>
                          )}
                          {recommendation.runeReason && (
                            <p className="mt-1 text-zinc-300">
                              {recommendation.runeReason}
                            </p>
                          )}
                        </section>
                      )}
                      {recommendation.recommended === "Yes" && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Item builds
                          </p>
                          {recommendation.builds.length > 0 ? (
                            <div className="flex flex-col gap-3">
                              {recommendation.builds.map((build) => (
                                <BuildCard key={build.buildId} build={build} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-500">
                              No item build documented yet for this lane.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                No lane recommendation documented yet for this champion.
              </p>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

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
  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(
    null
  );

  const selectedChampion =
    champions.find((champion) => champion.championId === selectedChampionId) ??
    null;

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
        champion.recommendations.some(
          (recommendation) =>
            recommendation.recommended === "Yes" &&
            recommendation.lane.laneId === selectedLane
        );
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
            <ChampionCard
              key={champion.championId}
              champion={champion}
              onSelect={(selected) => setSelectedChampionId(selected.championId)}
            />
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-zinc-500">
          No champions match the selected filters.
        </p>
      )}

      <ChampionDialog
        champion={selectedChampion}
        onClose={() => setSelectedChampionId(null)}
      />
    </div>
  );
}
