---
name: Explorer search finds paths and several terms, and its rules hit exactly what it shows
issue: none
state: complete
version: 1
---

## Goal

The explorer search finds files by partial paths and by several terms at once. Flatten/Exclude from the
search affects exactly the nodes the search showed. Excluding a folder never takes along a sibling whose
name merely starts with it (`src/app` must not take `src/application`).

## Tasks

### 1. One query compiler
- `compileSearchQuery(text)` is the only place that turns typed text into gitignore patterns
- Terms are separated by comma or whitespace and OR-ed together; every term is fully trimmed
- `app`: fuzzy, any name containing `app`
- `src/app`: fuzzy path fragment at any depth (`**/*src/app*`)
- `"src/app"`, `"My File.ts"`: quotes mean exact segments at any depth (`**/src/app`) and keep spaces
- `/root/src/app`: exact full path from the root, never fuzzy at the end
- `!term` anywhere removes its matches from the result; only `!` terms means "everything except"
- Explicit `*` / `**` globs are passed through as typed

### 2. The search and all rule producers use the compiler
- `searchedNodes.selector` matches with the compiled query
- Flatten/Exclude from the search saves the compiled query as one rule
- The extension bar stores its patterns as they are; `parseNodeRules`/`unifyWildCard` go away

### 3. Rule evaluation keeps exact paths exact
- Evaluating a rule no longer wraps a `/`-anchored path in `*…*`. This fixes saved context-menu rules
  and cc.json blacklist entries without a migration
- A rule containing a `!` term gets its own engine so it cannot un-match other rules

### 4. Guarantee search == rule
- A spec table of queries asserts: the nodes a rule hits are the nodes the search showed
- Prefix-sibling cases (`app` vs `application`) for search, context-menu rules and quoted terms

## Steps

- [x] Complete Task 1: One query compiler
- [x] Complete Task 2: The search and all rule producers use the compiler
- [x] Complete Task 3: Rule evaluation keeps exact paths exact
- [x] Complete Task 4: Guarantee search == rule
- [x] CHANGELOG entries (Changed: search syntax; Fixed: excluding a folder excludes similarly named folders)

## Notes

- Decided with the user: whitespace means OR; quotes keep spaces in names; fragments are fuzzy
- Verified today: a context-menu exclude of `/root/src/app` is evaluated as `*root/src/app*` and also
  excludes `/root/src/application`
- Saved rules keep their meaning: they are read by `parseNodeRule`, not by the search compiler. Only
  saved rules holding a full path change, and only by no longer hitting look-alike siblings
- The search syntax changed: `!a, b` used to mean "neither a nor b", it now means "b without a";
  "neither" is `!a !b`
- Known limit: a comma inside quotes still splits the stored rule
