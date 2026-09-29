// ECharts reuses an element by its position among the drawn ones and keeps whatever an option leaves out,
// so every element states its transform.
export const UNTRANSFORMED = { x: 0, y: 0, rotation: 0 }

/** One drawn item. ECharts' own hover would lift it ten layers up, and an open folder would then cover
 * its children and catch every hover and click meant for them; the scene marks the hovered box itself. */
export function drawnItem(children: object[]) {
    return { type: "group", ...UNTRANSFORMED, emphasisDisabled: true, children }
}

/** ECharts paints the elements it first creates in a later draw over all it drew before, whatever their place in
 * the data; an item shown again would then cover the edges and the edges the boxes. The rank pins each element
 * to its item's place in the paint order. */
export function atPaintRank<Item extends { children: object[] }>(item: Item, rank: number): Item {
    return { ...item, children: item.children.map(child => ({ ...child, z2: rank })) }
}
