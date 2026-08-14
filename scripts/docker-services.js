#!/usr/bin/env node
// Starts/stops only the Docker services this project actually needs locally,
// based on the *_MODE variables in .env.local (or .env). Each service in
// docker-compose.yml is tagged with a Compose "profile" matching the mode it
// backs, so services left in "cloud" mode are never started.

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const MODE_TO_PROFILE = {
  MONGODB_MODE: "mongodb",
  QDRANT_MODE: "qdrant",
  NEO4J_MODE: "neo4j",
  STORAGE_MODE: "storage",
  AI_MODE: "ai",
};

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function main() {
  const command = process.argv[2];
  if (command !== "up" && command !== "down") {
    console.error("Usage: node scripts/docker-services.js <up|down>");
    process.exit(1);
  }

  const localEnvPath = path.join(process.cwd(), ".env.local");
  const envPath = fs.existsSync(localEnvPath)
    ? localEnvPath
    : path.join(process.cwd(), ".env");

  // Real environment variables (e.g. set by CI) take precedence over the file
  const env = { ...loadEnvFile(envPath), ...process.env };

  const profiles = Object.entries(MODE_TO_PROFILE)
    .filter(([envVar]) => env[envVar] === "local")
    .map(([, profile]) => profile);

  if (profiles.length === 0) {
    console.log(
      `No *_MODE variable in ${path.basename(envPath)} is set to "local" — every service is (or defaults to) cloud, so there's nothing to ${
        command === "up" ? "start" : "stop"
      }.`,
    );
    return;
  }

  const profileArgs = profiles.flatMap((profile) => ["--profile", profile]);
  const args = [
    "compose",
    ...profileArgs,
    command,
    ...(command === "up" ? ["-d"] : []),
  ];

  console.log(
    `Active local services (from ${path.basename(envPath)}): ${profiles.join(", ")}`,
  );
  console.log(`> docker ${args.join(" ")}`);

  const result = spawnSync("docker", args, { stdio: "inherit" });
  process.exit(result.status ?? 1);
}

main();
