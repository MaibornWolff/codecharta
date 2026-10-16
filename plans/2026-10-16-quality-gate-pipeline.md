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

### 2. Workflows `quality_gate*.yml`
- `quality_gate.yml`: reusable, one job per part: JDK 25, `./gradlew installDist`, `ccsh gate <part> --quiet`,
  job summary, report and map as artifact; default exit codes, so errors fail the job and warnings do not
- `quality_gate_analysis.yml`, `quality_gate_visualization.yml`: callers with GitHub's own `paths` filter;
  the gate tool and the workflows trigger both
- Read-only token, no persisted credentials, inputs only through `env`

### 3. Merge Gatekeeper
- A skipped part must not leave a pending check: Merge Gatekeeper ignores `skipped` check runs

## Steps

- [ ] Complete Task 1: Per-part gate configs
- [x] Complete Task 2: Workflows `quality_gate*.yml`
- [x] Complete Task 3: Merge Gatekeeper
- [ ] Verify on a test PR: visualization-only, analysis-only, gate change

## Notes

- A PR that changes the gate builds ccsh once per part; simpler than a shared build job with an artifact
- Verified locally: `ccsh gate analysis --quiet` exits 1 through `tee`

- Staging image is no option: it is only published after main, so a PR would run the previous gate
- Gating only changed files is out of scope: the gate has no such mode, and cycles need the whole part
