---
name: Word cloud — lay the words out in an uploaded SVG shape
issue: -
state: complete
version: vis 2.1.2
---

## Goal

The shape picker gains a **Custom SVG** entry and a file input, so the cloud can be laid out inside
any silhouette the reader uploads. The upload lasts for the session only.

## Tasks

### 1. Turn an uploaded SVG into a mask

The **M** shape already works by handing echarts an SVG as a data URI loaded into an `Image`, so an
upload is the same path with the reader's file. What it needs around it is validation, because a
mask that echarts cannot read fails silently and simply leaves the shape unapplied.

- Reject anything that is not an SVG, and anything carrying a script, a `foreignObject` or a
  reference to an external file — those taint the canvas echarts reads the mask from.
- Give the SVG intrinsic dimensions: browsers render one without `width`/`height` at a default size,
  which reads as the wrong mask. Take them from the `viewBox` when they are missing, and reject an
  SVG that has neither.

### 2. Offer it in the shape picker

- A session-scoped store holds the uploaded mask; nothing is persisted, so a reload falls back to a
  circle and says so.
- The shape popover offers **Custom SVG**, and while it is picked shows a file input, the name of the
  uploaded file, the reason an upload was rejected, and a note that the words fill the opaque areas.
- The cloud loads whichever mask the picked shape needs and re-lays out when a new one arrives.

## Steps

- [x] Complete Task 1: turn an uploaded SVG into a mask
- [x] Complete Task 2: offer it in the shape picker

## Notes

- The upload is only ever loaded into an `Image`, never inserted into the page, so script inside an
  uploaded SVG cannot run. Checked in the browser with an SVG carrying `window.__pwned = true`: it is
  refused, and the flag is never set.
- Verified in the browser with a heart silhouette over a 300-word project: the cloud takes the shape.
- The uploaded mask is UI state, so it belongs to the domain bar rather than the rendering engine:
  the popover writes it, the view reads it, and the cloud takes it as an input. The renderer stays
  sealed behind its existing facades and the dependency rules are untouched.
