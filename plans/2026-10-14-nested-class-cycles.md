---
name: show cycles between a class and its nested classes correctly
issue: none
state: complete
version: 1
---

## Goal

A cycle between a class and a class nested in it (`Ccsh ↔ ManifestVersionProvider`) has an edge that closes it,
the one from the nested class back to its host, and a Kotlin `inner class` depends on its host as it does when
compiled. Cases A–H as agreed with Christian on 2026-10-14.

## Tasks

### 1. Closing edge of a nested cycle (shared, `LogicalProjection`)
- An edge from a nested declaration to a declaration it is nested in points upwards when it is cyclic
- Non-cyclic edges between the two keep the flag off (fix of 2026-10-13 stands)

### 2. `inner class` depends on its host (Kotlin)
- The declaration of an `inner class` uses the class around it

### 3. A bare call of a member is no top-level function (Kotlin)
- A lowercase call whose name is a function of the enclosing class (or the declaration itself) is not a used name

### 4. Wrap up
- Re-run on `analysis/`, check `Ccsh ↔ ManifestVersionProvider`; CHANGELOG, docs; ktlint and tests

## Steps

- [x] Complete Task 1: Closing edge of a nested cycle
- [x] Complete Task 2: `inner class` depends on its host
- [x] Complete Task 3: A bare call of a member is no top-level function
- [x] Complete Task 4: Wrap up

## Notes

- Cases: A outer → nested, B nested → outer, C both (plain nested), D/E/F inner class used by its host (with
  `this@Outer`, implicit member call, no use at all), G inner class its host never uses, H member call sharing its
  name with a top-level function.
- Verified on `analysis/`: `Ccsh -> ManifestVersionProvider` cyclic, `ManifestVersionProvider -> Ccsh` cyclic and
  upward; each of the 9 cyclic groups has a closing edge. `./gradlew ktlintCheck test` green.
