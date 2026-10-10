import assert from "node:assert/strict";
import { decidePagesProductionDeploy } from "./pages_deploy_decision.mjs";

const snsOnly = decidePagesProductionDeploy({
  changedPaths: ["09-sns-bot/src/index.mjs"],
  commitMessage: "chore(sns-bot): update [skip ci]",
});
assert.equal(snsOnly.action, "skip");
assert.equal(snsOnly.reason, "sns_state_only");

const seoMerge = decidePagesProductionDeploy({
  changedPaths: [
    "src/content/whiskies/bunnahabhain-18.json",
    "src/pages/compare.astro",
  ],
  commitMessage: "[CF-Pages-Skip] source-ready updates (#13)",
});
assert.equal(seoMerge.action, "deploy");
assert.equal(seoMerge.reason, "seo_or_build_paths");

const buildConfig = decidePagesProductionDeploy({
  changedPaths: ["astro.config.mjs", "package.json"],
  commitMessage: "[CF-Pages-Skip] adjust build",
});
assert.equal(buildConfig.action, "deploy");
assert.equal(buildConfig.reason, "seo_or_build_paths");

const mixed = decidePagesProductionDeploy({
  changedPaths: [
    "09-sns-bot/src/index.mjs",
    "src/content/whiskies/aberlour-16.json",
  ],
  commitMessage: "[skip ci] mixed",
});
assert.equal(mixed.action, "deploy");
assert.equal(mixed.reason, "seo_or_build_paths");

const workflowRepair = decidePagesProductionDeploy({
  changedPaths: [
    ".github/workflows/pages-production.yml",
    "scripts/pages_deploy_decision.mjs",
  ],
  commitMessage: "[CF-Pages-Skip] path-based production deploy",
});
assert.equal(workflowRepair.action, "deploy");

const force = decidePagesProductionDeploy({
  changedPaths: ["09-sns-bot/src/index.mjs"],
  force: true,
});
assert.equal(force.action, "deploy");
assert.equal(force.reason, "explicit_publish_trigger");

const empty = decidePagesProductionDeploy({ changedPaths: [] });
assert.equal(empty.action, "skip");
assert.equal(empty.reason, "no_changed_paths");

console.log("pages_deploy_decision fixtures passed");
