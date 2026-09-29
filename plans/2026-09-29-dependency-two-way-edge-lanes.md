---
name: Two-way dependency edges keep their lanes
issue: -
state: complete
version: -
---

## Goal

The two edges of a dependency running both ways bowed towards each other, or crossed, whenever the box whose
path sorts first sat above the other. They should run apart, each bowing outward, whichever box is above.

## Tasks

### 1. Lane by direction of travel
- Each edge keeps to the half of a side on the left of its travel, the same side the straight style bows it to
- Curved: both ends of an edge in its lane (no more left-out, right-in crossing)
- Spread and straight: edges to the same box order by lane instead of by path

## Steps

- [x] Complete Task 1: Lane by direction of travel

## Notes

- Cause: spread ports broke ties by edge id (path order); the bow follows the direction of travel
- Browser check: a cycle added between stores and util runs as two lanes in curved, straight and spread
