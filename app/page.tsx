import Image from "next/image";
import { getChampionSummaries, type ChampionSummary } from "@/lib/league-data";

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  Medium: "bg-amber-900/60 text-amber-300 border-amber-700",
  Hard: "bg-rose-900/60 text-rose-300 border-rose-700",
};

function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  const style = difficulty
    ? DIFFICULTY_STYLES[difficulty]
    : "bg-zinc-800 text-zinc-400 border-zinc-700";

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

export default function Home() {
  const champions = getChampionSummaries();

  return (
    <div className="flex flex-1 flex-col bg-[#010A13] font-sans">
      <header className="flex flex-col items-center gap-3 border-b border-[#1E2328] px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0AC8B9]">
          Summoner&apos;s Rift
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[#F0E6D2] sm:text-5xl">
          New Player Guide
        </h1>
        <p className="max-w-xl text-base leading-7 text-zinc-400">
          New to League of Legends? Start here. Browse beginner-friendly
          champions, see which lane suits them, and learn why they&apos;re a
          good first pick.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {champions.map((champion) => (
            <ChampionCard key={champion.championId} champion={champion} />
          ))}
        </ul>
      </main>
    </div>
  );
}
