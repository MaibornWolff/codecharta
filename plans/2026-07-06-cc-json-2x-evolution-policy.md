---
name: cc.json 2.x evolution policy (finding #18)
issue: #18
state: complete
version: 2.0
---

## Goal

Establish cc.json 2.x as **downward-compatible, additive-only**: readers accept any major-2 version
(not pinned to exactly `2.0`), new minors may only *add* optional fields, and existing fields are
never removed/renamed/repurposed. A breaking change is a new major (`3.0`) that older 2.x tools
reject. This gives "newest tools read all older 2.x files"; it does **not** promise old tools read
newer files (unknown fields stay rejected by `additionalProperties: false`).

## Tasks

### 1. Unpin the version in all three schema copies
- `dev_docs/cc-json-2.0.schema.json` (source of truth): `apiVersion` `const "2.0"` → `type: string` +
  `pattern: "^2\\.\\d+$"` (major 2, any numeric minor). Add a short description pointing at the policy.
- `visualization/app/codeCharta/util/ccJson2Schema.json` (vendored viz copy): identical edit — the
  drift spec deep-compares it to the source, so it must match byte-for-byte.
- `analysis/analysers/tools/ValidationTool/src/main/resources/cc.json` (bundled `ccsh check`, an
  `anyOf` of 1.5 + 2.0): relax the 2.0 branch's `apiVersion` the same way.
- Keep every `additionalProperties: false` and `required` list untouched — strictness on known fields
  is what enforces "can't remove/change" and still catches typos.

### 2. Readers already accept major 2 — verify, don't change
- Analysis `Project.isAPIVersionCompatible` already gates on major `2`; viz `isCcJson2` already routes
  on `major === 2`. No code change; the schema `const` was the only thing pinning to `2.0`.

### 3. Document the policy
- `dev_docs/cc-json-2.0-format.md`: a "Versioning & compatibility" section stating the downward-only,
  additive-only contract and the 3.0 boundary.
- `analysis/CHANGELOG.md` + `visualization/CHANGELOG.md` + `dev_docs/CC_JSON_SCHEMA_CHANGELOG.md`:
  note the policy.

### 4. Tests
- Analysis `EveritValidatorTest`: a `2.1`-versioned 2.0-shaped file validates; a `3.0` file is rejected.
- Viz `fileValidator.spec`: a `2.1`-versioned 2.0-shaped file has no errors; a 2.0 file with an unknown
  extra field is still rejected (additive strictness intact).

## Steps

- [x] Complete Task 1: unpin version in the three schema copies (const "2.0" → pattern `^2\.\d+$`)
- [x] Complete Task 2: verify reader version gates — analysis `isAPIVersionCompatible` + viz `isCcJson2` already major-2; no code change
- [x] Complete Task 3: document the policy (format doc §Versioning, analysis+viz CHANGELOGs, CC_JSON_SCHEMA_CHANGELOG 2.0 entry)
- [x] Complete Task 4: analysis EveritValidatorTest (accept 2.7, reject 3.0) + viz fileValidator.spec (accept 2.7, reject unknown field)
- [x] Ran viz full suite (drift guard green) + analysis full suite + ValidationTool; real ccsh check accepts 2.1/2.99, rejects 3.0
- [x] Adversarial verification workflow (4 dims) — all SAFE (completeness sweep, regex, anyOf/schema consistency, reader-path coherence); plus removed a dead `TWO_POINT_ZERO = "2.0"` enum member (tsc clean) to eliminate a latent exact-"2.0" literal

## Review Feedback Addressed
