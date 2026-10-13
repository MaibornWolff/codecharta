---
name: Staging demo sample files 404
issue: none
state: progress
version: n/a
---

## Goal

The staging demo loads its sample maps again, and a failing demo-file build stops the deploy instead of publishing a site without them.

## Tasks

### 1. Run ccsh on a supported JDK
- `ccsh` needs Java 22 since `eb44d1eba`; the runner default is 17, so every `ccsh` call in `build_demo_files.sh` failed
- Set up JDK 25 before the demo-file step in the staging and the release workflow of the visualization

### 2. Fail loudly
- `set -e` in `build_demo_files.sh`, so a failed step fails the job before `clean: true` wipes the deployed maps

### 3. One JDK for every workflow
- Staging and release of the analysis, the license scan and the Sonar scan also run on JDK 25 instead of the runner default or a pinned 17

## Steps

- [x] Complete Task 1: Run ccsh on a supported JDK
- [x] Complete Task 2: Fail loudly
- [x] Complete Task 3: One JDK for every workflow
- [ ] Commit, merge, re-run "Staging Deployment - Visualization" and check the two `.cc.json.gz` URLs

## Notes

- Production (`visualization/app`) still has its maps from the 2.8.0 release; the next release would have lost them the same way
- The license scan and the Sonar scan have not run on JDK 25 yet; the Sonar scan shows up in the PR checks, the license scan only after the merge
- The run log was not readable (no GitHub auth in the session); the cause is derived from the bytecode version (66) and the missing `setup-java`
