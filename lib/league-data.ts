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
  beginnerRating: number | null;
  difficulty: Difficulty | null;
  playStyle: string | null;
  recommended: "Yes" | "No";
  why: string;
}

export interface Item {
  itemId: string;
  name: string;
  description: string | null;
  imageFileName: string | null;
  sourceUrl: string | null;
}

export interface Build {
  buildId: string;
  recommendationId: string;
  name: string;
  description: string | null;
  isPrimary: "Yes" | "No";
  sourceUrl: string | null;
}

export interface BuildItem {
  buildId: string;
  itemId: string;
  stage: string;
  sortOrder: number;
  reason: string | null;
}

interface LeagueData {
  champions: Champion[];
  lanes: Lane[];
  recommendations: Recommendation[];
  items: Item[];
  builds: Build[];
  buildItems: BuildItem[];
}

const data = rawData as LeagueData;

/** A build item paired with its item details. */
export interface BuildItemDetail extends BuildItem {
  item: Item;
}

/** An item build paired with its ordered list of items. */
export interface BuildDetail extends Build {
  items: BuildItemDetail[];
}

/** A recommendation paired with its lane and any recommended item builds. */
export interface RecommendationDetail extends Recommendation {
  lane: Lane;
  builds: BuildDetail[];
}

/** A champion paired with all of its lane recommendations, if any exist. */
export interface ChampionSummary extends Champion {
  /** The top recommended (and actually recommended) lane, if one exists. */
  bestRecommendation: RecommendationDetail | null;
  /** Every recommendation for this champion, recommended lanes first, highest rated first. */
  recommendations: RecommendationDetail[];
}

function compareRecommendations(a: Recommendation, b: Recommendation) {
  const aRecommended = a.recommended === "Yes";
  const bRecommended = b.recommended === "Yes";
  if (aRecommended !== bRecommended) return aRecommended ? -1 : 1;
  return (b.beginnerRating ?? -1) - (a.beginnerRating ?? -1);
}

/**
 * Champions enriched with all of their lane recommendations, lane details
 * and recommended item builds, sorted with the most beginner-friendly
 * champions first.
 */
export function getChampionSummaries(): ChampionSummary[] {
  // LaneId casing is inconsistent in the source data (e.g. "Jungle" vs "JUNGLE").
  const lanesById = new Map(
    data.lanes.map((lane) => [lane.laneId.toUpperCase(), lane])
  );
  const itemsById = new Map(data.items.map((item) => [item.itemId, item]));

  function getBuildsFor(recommendationId: string): BuildDetail[] {
    return data.builds
      .filter((build) => build.recommendationId === recommendationId)
      .map((build) => ({
        ...build,
        items: data.buildItems
          .filter((buildItem) => buildItem.buildId === build.buildId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .flatMap((buildItem) => {
            const item = itemsById.get(buildItem.itemId);
            return item ? [{ ...buildItem, item }] : [];
          }),
      }))
      .sort(
        (a, b) => (b.isPrimary === "Yes" ? 1 : 0) - (a.isPrimary === "Yes" ? 1 : 0)
      );
  }

  const summaries = data.champions.map((champion) => {
    const recommendations: RecommendationDetail[] = data.recommendations
      .filter((recommendation) => recommendation.championId === champion.championId)
      .map((recommendation) => {
        const lane = lanesById.get(recommendation.laneId.toUpperCase()) ?? {
          laneId: recommendation.laneId,
          displayName: recommendation.laneId,
          description: "",
          sortOrder: 0,
        };

        return {
          ...recommendation,
          lane,
          builds: getBuildsFor(recommendation.recommendationId),
        };
      })
      .sort(compareRecommendations);

    const best =
      recommendations[0]?.recommended === "Yes" ? recommendations[0] : null;

    return {
      ...champion,
      bestRecommendation: best,
      recommendations,
    };
  });

  return summaries.sort(
    (a, b) =>
      (b.bestRecommendation?.beginnerRating ?? 0) -
      (a.bestRecommendation?.beginnerRating ?? 0)
  );
}


/** All lanes, ordered for display in menus and filters. */
export function getLanes(): Lane[] {
  return [...data.lanes].sort((a, b) => a.sortOrder - b.sortOrder);
}
