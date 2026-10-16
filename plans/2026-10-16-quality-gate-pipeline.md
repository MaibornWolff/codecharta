---
name: Run the CodeCharta quality gate in the pipeline
state: progress
version: 1
---

## Goal

Run `ccsh gate`, built from the PR itself, on every PR and push to main, gating only the part (analysis,
visualization) the change touches. Errors block the merge through Merge Gatekeeper.

## Tasks

### 1. Per-part gate configs
- Christian writes `analysis/.codecharta.yml` and `visualization/.codecharta.yml` himself
- Gitignore `.codecharta-gate-output/`; a part without a `.codecharta.yml` is skipped with a notice

### 2. Workflow `quality_gate.yml`
- Triggers: `pull_request` and `push` to main
- `changes` job: `git diff` against the base decides which parts run, no new third-party action
  - `analysis/**` → analysis, `visualization/**` → visualization
  - gate tool, a gate config or the workflow itself → both
- `gate` job, matrix over the selected parts: JDK 25, `./gradlew installDist` (no tests), then
  `ccsh gate <part> --quiet`; default exit codes, so errors fail the job and warnings do not
- Upload `report.json` and `map.cc.json.gz` as an artifact per part, also when the gate fails
- Job summary: the gate's console report

### 3. Merge Gatekeeper
- A skipped part must not leave a pending check: Merge Gatekeeper ignores `skipped` check runs

## Steps

- [ ] Complete Task 1: Per-part gate configs
- [x] Complete Task 2: Workflow `quality_gate.yml`
- [x] Complete Task 3: Merge Gatekeeper
- [ ] Verify on a test PR: visualization-only, analysis-only, gate change

## Notes

- One `build_ccsh` job runs `distTar` and shares the tar with the gate jobs of both parts
- Verified locally: part selection on real commits, and `ccsh gate analysis --quiet` exits 1 through `tee`

- Staging image is no option: it is only published after main, so a PR would run the previous gate
- Gating only changed files is out of scope: the gate has no such mode, and cycles need the whole part
