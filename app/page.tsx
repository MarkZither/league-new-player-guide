import { getChampionSummaries, getLanes } from "@/lib/league-data";
import ChampionBrowser from "@/app/components/ChampionBrowser";

export default function Home() {
  const champions = getChampionSummaries();
  const lanes = getLanes();

  return (
    <div className="flex flex-1 flex-col bg-[#010A13] font-sans">
      <header className="flex flex-col items-center gap-3 border-b border-[#1E2328] px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0AC8B9]">
          Summoner&apos;s Rift
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[#F0E6D2] sm:text-5xl">
          New Player Guide
        </h1>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C89B3C]">
          made by Jan Luca and Mark
        </p>
        <p className="max-w-xl text-base leading-7 text-zinc-400">
          New to League of Legends? Start here. Browse beginner-friendly
          champions, see which lane suits them, and learn why they&apos;re a
          good first pick.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <ChampionBrowser champions={champions} lanes={lanes} />
      </main>
    </div>
  );
}
