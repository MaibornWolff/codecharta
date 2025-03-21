---
categories:
  - ADR
tags:
  - visualization
  - angular
  - redux
  - ngrx
title: "ADR 8: Angular Migration"
---

According to official [version-support-status](https://docs.angularjs.org/misc/version-support-status) AngularJS will have end of life with the end of this year 2021. Therefore we need to migrate away from it, to maintain the following goals:

- Stay browser compatible with new browser versions.
- Continue to get security updates.
- Continue to stay in sync with best practice regarding tooling support, dependencies and community support.
- Keep being an attractive project for developers and community to contribute.

Migration to Angular, which can be done component wise, has already started via [#2318](https://github.com/MaibornWolff/codecharta/issues/2318).

Following two questions arose from the start of the migration:

1. Some shared state is not in redux store, but handled via broadcasting through `$rootScope`, like the currently selected building in _visualization/app/codeCharta/ui/codeMap/threeViewer/threeSceneService.ts_. `$rootScope` is AngularJS specific and cannot be used in new Angular components. We could:
   1. Use Event Emitters in an Angular Service and temporarily upgrade `$rootScope` to sync between both worlds.
   2. Move this and similar shared state into existing redux store. This would align with [our docs](https://maibornwolff.github.io/codecharta/docs/new-to-code/#state-management), that the redux store is the only single state.
2. Do we continue to use plain redux, or do we migrate to Angular's [NgRx](https://ngrx.io/guide/store)?
   - Advantage of **plain redux**:
     - New developers don't need to learn concepts of NgRx and RxJs's Observables.
     - Example of a migrated [component](https://github.com/MaibornWolff/codecharta/blob/refactor/2318/migrate-metric-delta-selected/visualization/app/codeCharta/ui/metricDeltaSelected/metricDeltaSelected.component.ts) and a [template](https://github.com/MaibornWolff/codecharta/blob/refactor/2318%2Fmigrate-metric-delta-selected/visualization/app/codeCharta/ui/metricDeltaSelected/metricDeltaSelected.component.html)
   - Advantage of **NgRx**:
     - Angular community strongly recommends the use of NgRx and RxJs's Observables. Therefore better tooling and Angular support is to be expected.
     - It fits naturally into Angular's internal update model. That makes it more performant and less likely to memory leaks / endless cyclic update loops.
     - Example of a migrated [component](https://github.com/MaibornWolff/codecharta/blob/refactor/2318/migrate-metric-delta-selected-and-rework-redux-connect/visualization/app/codeCharta/ui/metricDeltaSelected/metricDeltaSelected.component.ts) and a [template](https://github.com/MaibornWolff/codecharta/blob/refactor/2318/migrate-metric-delta-selected-and-rework-redux-connect/visualization/app/codeCharta/ui/metricDeltaSelected/metricDeltaSelected.component.html)

# Status

accepted

# Decision

1. We move all global state into the store, to have one single place and only one mechanism for global state.
2. We favor to migrate to NgRx.

# Consequences

- All AngularJS components, services ect need to be migrated (see [#2318](https://github.com/MaibornWolff/codecharta/issues/2318) for progress).
- All AngularJS dependencies should be removed like `angular`, `@types/angular` (Angular has built-in type definitions), `babel-plugin-angularjs-annotate`, ...
