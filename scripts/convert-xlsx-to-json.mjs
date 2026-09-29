/**
 * Converts data/league-new-player-data-template-populated.xlsx into
 * data/league-data.json, matching the shape described by data/data-schema.json.
 *
 * Run with: npm run data:convert
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const publicDir = path.join(__dirname, "..", "public");
const workbookPath = path.join(
  dataDir,
  "league-new-player-data-template-populated.xlsx"
);
const outputPath = path.join(dataDir, "league-data.json");

const KEBAB_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function emptyToNull(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}

function toInt(value) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Reads a worksheet as an array of row objects keyed by header text. */
function readSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Expected worksheet "${sheetName}" was not found.`);
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

function convertChampions(rows) {
  const warnings = [];
  const seenIds = new Set();

  const champions = rows.map((row) => {
    const name = String(row.Name ?? "").trim();
    let championId = String(row.ChampionId ?? "").trim();

    if (!KEBAB_ID_PATTERN.test(championId)) {
      const derived = slugify(name);
      warnings.push(
        `Champion "${name}": ChampionId "${championId}" is not kebab-case; using derived id "${derived}" instead.`
      );
      championId = derived;
    }

    if (seenIds.has(championId)) {
      warnings.push(`Duplicate champion id "${championId}" after conversion.`);
    }
    seenIds.add(championId);

    let imageFileName = emptyToNull(row.ImageFileName);
    if (imageFileName && !fs.existsSync(path.join(publicDir, imageFileName))) {
      warnings.push(
        `Champion "${name}": imageFileName "${imageFileName}" was not found in public/; setting to null.`
      );
      imageFileName = null;
    }

    return {
      championId,
      name,
      title: emptyToNull(row.Title),
      difficulty: emptyToNull(row.Difficulty),
      description: emptyToNull(row.Description),
      imageFileName,
      sourceUrl: emptyToNull(row.SourceUrl),
      researchNotes: emptyToNull(row.ResearchNotes),
      lastReviewed: emptyToNull(row.LastReviewed),
    };
  });

  return { champions, warnings };
}

function convertLanes(rows) {
  return rows.map((row) => {
    let imageFileName = emptyToNull(row.ImageFileName);
    if (imageFileName && !fs.existsSync(path.join(publicDir, imageFileName))) {
      imageFileName = null;
    }
    return {
      laneId: String(row.LaneId ?? "").trim(),
      name: String(row.Name ?? "").trim(),
      displayName: String(row.DisplayName ?? "").trim(),
      description: String(row.Description ?? "").trim(),
      sortOrder: toInt(row.SortOrder),
      imageFileName,
      sourceUrl: emptyToNull(row.SourceUrl),
    };
  });
}

function convertRecommendations(rows, knownChampionIds) {
  const warnings = [];

  const recommendations = rows.map((row) => {
    const championId = String(row.ChampionId ?? "").trim();
    if (!knownChampionIds.has(championId)) {
      warnings.push(
        `Recommendation "${row.RecommendationId}" references unknown championId "${championId}".`
      );
    }

    return {
      recommendationId: String(row.RecommendationId ?? "").trim(),
      championId,
      laneId: String(row.LaneId ?? "").trim(),
      beginnerRating: toInt(row.BeginnerRating),
      difficulty: emptyToNull(row.Difficulty),
      playStyle: emptyToNull(row.PlayStyle),
      recommended: String(row.Recommended ?? "").trim(),
      why: String(row.Why ?? "").trim(),
      sourceUrl: emptyToNull(row.SourceUrl),
      researchNotes: emptyToNull(row.ResearchNotes),
      reviewedBy: emptyToNull(row.ReviewedBy),
      lastReviewed: emptyToNull(row.LastReviewed),
    };
  });

  return { recommendations, warnings };
}

function convertItems(rows) {
  return rows.map((row) => {
    let imageFileName = emptyToNull(row.ImageFileName);
    if (imageFileName && !fs.existsSync(path.join(publicDir, imageFileName))) {
      imageFileName = null;
    }
    return {
      itemId: String(row.ItemId ?? "").trim(),
      name: String(row.Name ?? "").trim(),
      description: emptyToNull(row.Description),
      imageFileName,
      sourceUrl: emptyToNull(row.SourceUrl),
      researchNotes: emptyToNull(row.ResearchNotes),
      lastReviewed: emptyToNull(row.LastReviewed),
    };
  });
}

function convertBuilds(rows) {
  return rows.map((row) => ({
    buildId: String(row.BuildId ?? "").trim(),
    recommendationId: String(row.RecommendationId ?? "").trim(),
    name: String(row.Name ?? "").trim(),
    description: emptyToNull(row.Description),
    isPrimary: String(row.IsPrimary ?? "").trim(),
    sourceUrl: emptyToNull(row.SourceUrl),
    researchNotes: emptyToNull(row.ResearchNotes),
    lastReviewed: emptyToNull(row.LastReviewed),
  }));
}

function convertBuildItems(rows) {
  return rows.map((row) => ({
    buildId: String(row.BuildId ?? "").trim(),
    itemId: String(row.ItemId ?? "").trim(),
    stage: String(row.Stage ?? "").trim(),
    sortOrder: toInt(row.SortOrder),
    reason: emptyToNull(row.Reason),
  }));
}

function main() {
  const workbook = XLSX.readFile(workbookPath);

  const { champions, warnings: championWarnings } = convertChampions(
    readSheet(workbook, "Champions")
  );
  const lanes = convertLanes(readSheet(workbook, "Lanes"));
  const knownChampionIds = new Set(champions.map((c) => c.championId));
  const { recommendations, warnings: recommendationWarnings } =
    convertRecommendations(readSheet(workbook, "Recommendations"), knownChampionIds);
  const items = convertItems(readSheet(workbook, "Items"));
  const builds = convertBuilds(readSheet(workbook, "Builds"));
  const buildItems = convertBuildItems(readSheet(workbook, "BuildItems"));

  const warnings = [...championWarnings, ...recommendationWarnings];
  if (warnings.length > 0) {
    console.warn("Data conversion warnings:");
    for (const warning of warnings) {
      console.warn(`  - ${warning}`);
    }
  }

  const output = { champions, lanes, recommendations, items, builds, buildItems };
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
}

main();
