/**
 * GitHub Actions entrypoint for path-based production deploy.
 * Keeps workflow YAML free of nested scripts so Actions can parse it.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { decidePagesProductionDeploy } from "./pages_deploy_decision.mjs";

function changedPaths() {
  const eventName = process.env.EVENT_NAME || "";
  const before = process.env.BEFORE_SHA || "";
  const head = process.env.GITHUB_SHA || "HEAD";
  let range = ["HEAD~1", "HEAD"];
  if (eventName === "push" && before && before !== "0000000000000000000000000000000000000000") {
    range = [before, head];
  }
  try {
    const output = execFileSync("git", ["diff", "--name-only", range[0], range[1]], {
      encoding: "utf8",
    });
    return output.split("\n").map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

const force = process.env.FORCE === "true";
const decision = decidePagesProductionDeploy({
  changedPaths: changedPaths(),
  commitMessage: process.env.COMMIT_MESSAGE || "",
  force,
});
const outputPath = process.env.GITHUB_OUTPUT;
if (!outputPath) {
  console.log(JSON.stringify(decision));
  process.exit(0);
}
appendFileSync(outputPath, `action=${decision.action}\n`);
appendFileSync(outputPath, `reason=${decision.reason}\n`);
console.log(JSON.stringify(decision));
