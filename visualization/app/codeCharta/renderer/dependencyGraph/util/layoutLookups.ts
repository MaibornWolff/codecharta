import { IsInside, nestingOf } from "./boxNesting"
import { DependencyGraphLayout, LayoutBox } from "./layoutModel"

/** What every redraw looks up in the layout, the redraw of a hover included. */
export interface LayoutLookups {
    byPath: ReadonlyMap<string, LayoutBox>
    isInside: IsInside
}

const lookupsByLayout = new WeakMap<DependencyGraphLayout, LayoutLookups>()

/** Built once for a layout and kept for as long as the layout is. */
export function lookupsOf(layout: DependencyGraphLayout): LayoutLookups {
    const known = lookupsByLayout.get(layout)
    if (known) {
        return known
    }
    const lookups = { byPath: new Map(layout.boxes.map(box => [box.path, box])), isInside: nestingOf(layout.boxes) }
    lookupsByLayout.set(layout, lookups)
    return lookups
}
