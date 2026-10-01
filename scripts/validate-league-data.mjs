/**
 * Validates data/league-data.json for structural integrity.
 *
 * Checks:
 *  - Duplicate IDs within each collection
 *  - Missing foreign key references (champion, lane, recommendation, item)
 *  - Invalid lane values
 *  - Invalid rune references
 *  - Invalid build references
 *
 * Run with: npm run validate-data
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "league-data.json");

const VALID_LANE_IDS = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

function loadData() {
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

/** Returns one error message per ID that appears more than once. */
function findDuplicateIds(records, idField, collectionName) {
  const counts = new Map();
  for (const record of records) {
    const id = record[idField];
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(
      ([id, count]) =>
        `[Duplicate ID] ${collectionName}: "${id}" appears ${count} times`
    );
}

function validate(data) {
  const errors = [];

  errors.push(
    ...findDuplicateIds(data.champions, "championId", "champions"),
    ...findDuplicateIds(data.lanes, "laneId", "lanes"),
    ...findDuplicateIds(data.recommendations, "recommendationId", "recommendations"),
    ...findDuplicateIds(data.items, "itemId", "items"),
    ...findDuplicateIds(data.builds, "buildId", "builds"),
    ...findDuplicateIds(data.runes, "runeId", "runes")
  );

  const championIds = new Set(data.champions.map((c) => c.championId));
  const laneIds = new Set(data.lanes.map((l) => l.laneId));
  const recommendationIds = new Set(
    data.recommendations.map((r) => r.recommendationId)
  );
  const itemIds = new Set(data.items.map((i) => i.itemId));
  const buildIds = new Set(data.builds.map((b) => b.buildId));
  const runeIds = new Set(data.runes.map((r) => r.runeId));

  // Invalid lane values on the lane reference table itself.
  for (const lane of data.lanes) {
    if (!VALID_LANE_IDS.includes(lane.laneId)) {
      errors.push(
        `[Invalid lane] lanes: "${lane.laneId}" is not one of ${VALID_LANE_IDS.join(", ")}`
      );
    }
  }

  for (const recommendation of data.recommendations) {
    const { recommendationId, laneId, championId, keystoneRuneId } = recommendation;

    if (!VALID_LANE_IDS.includes(laneId)) {
      errors.push(
        `[Invalid lane] recommendations "${recommendationId}": laneId "${laneId}" is not one of ${VALID_LANE_IDS.join(", ")}`
      );
    } else if (!laneIds.has(laneId)) {
      errors.push(
        `[Missing reference] recommendations "${recommendationId}": laneId "${laneId}" not found in lanes`
      );
    }

    if (!championIds.has(championId)) {
      errors.push(
        `[Missing reference] recommendations "${recommendationId}": championId "${championId}" not found in champions`
      );
    }

    if (keystoneRuneId && !runeIds.has(keystoneRuneId)) {
      errors.push(
        `[Invalid rune reference] recommendations "${recommendationId}": keystoneRuneId "${keystoneRuneId}" not found in runes`
      );
    }
  }

  for (const build of data.builds) {
    if (!recommendationIds.has(build.recommendationId)) {
      errors.push(
        `[Missing reference] builds "${build.buildId}": recommendationId "${build.recommendationId}" not found in recommendations`
      );
    }
  }

  for (const buildItem of data.buildItems) {
    if (!buildIds.has(buildItem.buildId)) {
      errors.push(
        `[Invalid build reference] buildItems: buildId "${buildItem.buildId}" not found in builds`
      );
    }
    if (!itemIds.has(buildItem.itemId)) {
      errors.push(
        `[Missing reference] buildItems (build "${buildItem.buildId}"): itemId "${buildItem.itemId}" not found in items`
      );
    }
  }

  return errors;
}

function main() {
  const data = loadData();
  const errors = validate(data);

  if (errors.length > 0) {
    console.error(`\u2717 league-data.json validation failed with ${errors.length} issue(s):\n`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("\u2713 league-data.json passed validation.");
}

main();
