---
name: Clear the visualization gate warnings
state: progress
version: 1
---

## Goal

Fix every `ccsh gate` warning in `visualization/` for complexity, max_complexity_per_function, rloc and
comment_lines, one commit per file, then lower the error ceilings in `.codecharta.yml` to the new worst file.

## Tasks

### 1. Complexity > 100
- Split `dependencyMap.component.spec.ts` and `codeMap.mouseEvent.service.spec.ts` along their units
- Split responsibilities out of `loadInitialFile.store.ts`, `inspectorModel.ts`, `threeSceneService.ts`, `fileValidator.ts`

### 2. max_complexity_per_function > 20
- `loadInitialFile.store.ts`: guard clauses and named helpers

### 3. rloc > 500
- Split `.dependency-cruiser.js` into rule modules it requires

### 4. comment_lines > 25
- Keep only WHY comments in `reconcileAfterLoad.effect.ts`, `loadFiles.useCase.ts`, `geometryGenerationHelper.ts`,
  `indexedDBWriter.ts`, `domain.model.ts`, `axisWindow.ts`

### 5. Lower the error ceilings
- Each error max = highest remaining value, in its own commit

## Steps

- [ ] Complete Task 1: Complexity > 100
- [ ] Complete Task 2: max_complexity_per_function > 20
- [ ] Complete Task 3: rloc > 500
- [ ] Complete Task 4: comment_lines > 25
- [ ] Complete Task 5: Lower the error ceilings

## Notes

- Checks per commit: format:check, related specs, tsc; full npm test, lint and both gates before the ceiling commit
