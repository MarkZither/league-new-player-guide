import rawData from "@/data/league-data.json";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Champion {
  championId: string;
  name: string;
  title: string | null;
  difficulty: Difficulty | null;
  description: string | null;
  imageFileName: string | null;
  sourceUrl: string | null;
}

export interface Lane {
  laneId: string;
  displayName: string;
  description: string;
  sortOrder: number;
}

export interface Recommendation {
  recommendationId: string;
  championId: string;
  laneId: string;
  beginnerRating: number;
  difficulty: Difficulty | null;
  playStyle: string | null;
  recommended: "Yes" | "No";
  why: string;
}

interface LeagueData {
  champions: Champion[];
  lanes: Lane[];
  recommendations: Recommendation[];
}

const data = rawData as LeagueData;

/** A champion paired with its best beginner recommendation, if one exists. */
export interface ChampionSummary extends Champion {
  bestRecommendation: (Recommendation & { lane: Lane }) | null;
}

/**
 * Champions enriched with their highest-rated beginner recommendation and
 * lane details, sorted with the most beginner-friendly champions first.
 */
export function getChampionSummaries(): ChampionSummary[] {
  const lanesById = new Map(data.lanes.map((lane) => [lane.laneId, lane]));

  const summaries = data.champions.map((champion) => {
    const recommendationsForChampion = data.recommendations.filter(
      (recommendation) => recommendation.championId === champion.championId
    );

    const best = recommendationsForChampion.reduce<Recommendation | null>(
      (highest, current) =>
        !highest || current.beginnerRating > highest.beginnerRating
          ? current
          : highest,
      null
    );

    const lane = best ? lanesById.get(best.laneId) : undefined;

    return {
      ...champion,
      bestRecommendation: best && lane ? { ...best, lane } : null,
    };
  });

  return summaries.sort(
    (a, b) =>
      (b.bestRecommendation?.beginnerRating ?? 0) -
      (a.bestRecommendation?.beginnerRating ?? 0)
  );
}
