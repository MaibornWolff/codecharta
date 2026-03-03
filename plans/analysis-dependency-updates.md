---
name: Analysis dependency updates
issue: #2443
state: complete
version: 2
---

## Goal

Update all outdated analysis dependencies listed in #2443 (excluding tree-sitter). Non-major bumps first, then major upgrades with careful validation.

## Tasks

### 1. Non-major version bumps in libs.versions.toml

Edit `analysis/gradle/libs.versions.toml` version entries:

| Key | Current | Target |
|-----|---------|--------|
| `kotlin-logging` | 7.0.13 | 8.0.01 (went straight to major) |
| `mockk` | 1.14.6 | 1.14.9 |
| `assertj` | 3.27.6 | 3.27.7 |
| `jersey` | 4.0.0 | 4.0.2 |
| `junit5` | 5.14.1 | 5.14.3 |
| `junit-platform` | 1.14.1 | 1.14.3 |
| `json` | 20250517 | 20251224 |
| `kotlin` | 2.2.21 | 2.3.10 |
| `sonarqube` | 7.1.0.6387 | 7.2.2.6593 |
| `cyclonedx` | 3.0.2 | 3.2.0 |

Also fixed inline version for `commons-text`: `1.14.0` → `1.15.0`

### 2. Gradle wrapper bump

Updated wrapper from 8.14.3 → 9.3.1 (went straight to major)

### 3. Docker base image bump

Updated `analysis/Dockerfile`: `sapmachine:25.0.1-jre-ubuntu` → `sapmachine:25.0.2-jre-ubuntu`

### 4. Major: ktlint plugin 12.3.0 → 14.0.1

- Bumped version in libs.versions.toml
- Ran `ktlintFormat` to auto-fix all violations
- One manual fix: split long comment in ProjectConverter.kt
- PR #4264 can be closed

### 5. Major: kotlin-logging-jvm 7 → 8

- Bumped to 8.0.01 — compiled and tested cleanly, no API breakage

### 6. Major: jakarta.ws.rs-api → 4.0.0

- Changed from `version = "jersey"` (bogus placeholder) to explicit `version = "4.0.0"`

### 7. Major: Gradle 9.3.1

- Updated gradle-wrapper.properties to 9.3.1
- Build, test, ktlint all pass
- PRs #4347 can be closed

### 8. JVM heap for Kotlin 2.3.10

- Added `org.gradle.jvmargs=-Xmx2g` and `kotlin.daemon.jvmargs=-Xmx2g` to gradle.properties
- Required because Kotlin 2.3.10 compiler needs more memory than 2.2.21

### 9. Major: JUnit 5 → 6

- Deferred — too new and high risk
- PR #4312 remains open

## Steps

- [x] Complete Task 1: Non-major version bumps in libs.versions.toml
- [x] Complete Task 2: Gradle wrapper bump
- [x] Complete Task 3: Docker base image bump
- [x] Verify: `./gradlew assemble && ./gradlew test` passes
- [x] Complete Task 4: Major ktlint 12 → 14
- [x] Verify: `./gradlew ktlintCheck` passes
- [x] Complete Task 5: Major kotlin-logging 7 → 8
- [x] Complete Task 6: Major jakarta.ws.rs-api fix
- [x] Complete Task 7: Major Gradle 9 upgrade
- [x] Verify: full `./gradlew build` green
- [ ] Commit all changes

## Notes

- JUnit 5 → 6 (Task 9) intentionally deferred — too new and risky
- Kotlin version bump (2.2.21 → 2.3.10) covers kotlin-test, kotlin-reflect, AND the kotlin-jvm plugin
- ktlint 14 reformatted 230+ source files — all auto-fixable except one long comment
- Tree-sitter updates excluded per user request (handled separately)
- All changes validated: `./gradlew build` passes (assemble + test + ktlintCheck)
