// ECharts reuses an element by its position among the drawn ones and keeps whatever an option leaves out, and an
// element of another kind taking that position inherits the transform of the one it replaces. So every element
// states its whole transform: a mark left with the scale of the sign it replaced would be drawn smaller and
// nearer to the corner of the graph.
export const UNTRANSFORMED = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }

/** One drawn item. ECharts' own hover would lift it ten layers up, and an open folder would then cover
 * its children and catch every hover and click meant for them; the scene marks the hovered box itself.
 *
 * ECharts leaves an item alone that is handed no children, so the name of a box that got too small to carry one
 * would stay on the canvas where it was last drawn, while the graph moves on under it. Such an item says outright
 * that its children are not to be merged, which is what removes them. */
export function drawnItem(children: object[]) {
    const item = { type: "group", ...UNTRANSFORMED, emphasisDisabled: true, children }
    return children.length === 0 ? { ...item, $mergeChildren: false } : item
}

/** ECharts paints the elements it first creates in a later draw over all it drew before, whatever their place in
 * the data; an item shown again would then cover the edges and the edges the boxes. The rank pins each element
 * to its item's place in the paint order. */
export function atPaintRank<Item extends { children: object[] }>(item: Item, rank: number): Item {
    return { ...item, children: item.children.map(child => ({ ...child, z2: rank })) }
}
