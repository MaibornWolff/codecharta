---
categories:
  - ADR
tags:
  - visualization
  - typescript
title: "ADR 7: Pick Visualization Language"
---

In [ADR-3]({% post_url adr/2017-01-02-ADR_3_pick_visualization_language %}) we picked our visualization language JavaScript.
The missing static typing of that language has become a minor issue:

- Some refactorings don't have IDE support.
- It's sometimes tricky to discern what methods and fields the passed function parameters sport.

# Status

accepted

# Decision

CodeCharta will use [TypeScript](https://www.typescriptlang.org/). It's developed since 2012 by a well-known company, has static types, tool support is increasing every day and many frontend frameworks support it.
Plus CodeCharta already requires a build pipeline so no change there.

# Consequences

- Existing JavaScript code needs to be migrated.
- Untyped libraries that don't have types need to be supplied with them, custom written if necessary.
- Because TypeScript is a superset of JavaScript, it does introduce new syntax that is unfamiliar to JavaScript developers. This increases the learning curve for now and old developers.
- While Angular 2+ has first-class support for TypeScript, the same cannot be said for Angular 1.x. We'll need to rely on the [definitely typed community types](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/angular).
