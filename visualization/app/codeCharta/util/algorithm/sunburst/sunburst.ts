import { CcState, CodeMapNode } from "../../../codeCharta.model"
import { SortingOption } from "../squarifyLayoutImproved/squarify"
import { LayoutNode } from "../layoutNode"

export function generateSunburstDiagram(map: CodeMapNode, state: CcState, sortingOption: SortingOption): LayoutNode {
    const floorLabelsEnabled = state.appSettings.enableFloorLabels
    const areaMetric = state.dynamicSettings.areaMetric
    const margin = (state.dynamicSettings.margin * map.attributes[areaMetric]) / 5_000

    return layout(map, 0, areaMetric, margin, 0, sortingOption, floorLabelsEnabled, map.attributes[areaMetric])
}

function layout(
    map: CodeMapNode,
    depth: number,
    areaMetric: string,
    margin: number,
    relativeX: number,
    sortingOption: SortingOption,
    floorLabelsEnabled: boolean,
    size: number
): LayoutNode | undefined {
    const isLeaf = map.children ? map.children.length === 0 : true
    const labelLength = floorLabelsEnabled ? size / 100 : 0

    const layoutNode = new LayoutNode(map.name, 1, 1, depth, isLeaf, map.attributes)
    layoutNode.updatedValue = map.attributes[areaMetric]
    layoutNode.isLeaf = isLeaf

    if (!isLeaf) {
        let xOffset = margin
        xOffset = 0
        const codeMapChildren = map.children.filter(child => child.attributes[areaMetric] > 0) || []

        if (sortingOption === SortingOption.ASCENDING) {
            codeMapChildren.sort((a, b) => a.attributes[areaMetric] - b.attributes[areaMetric])
        } else if (sortingOption === SortingOption.DESCENDING) {
            codeMapChildren.sort((a, b) => b.attributes[areaMetric] - a.attributes[areaMetric])
        } else if (sortingOption === SortingOption.MIDDLE) {
            const middleIndex = Math.floor(codeMapChildren.length / 2)
            codeMapChildren.sort((a, b) => a.attributes[areaMetric] - b.attributes[areaMetric])
            const leftChildren = codeMapChildren.filter((_, index) => index % 2 === 0)
            const rightChildren = codeMapChildren.filter((_, index) => index % 2 !== 0).reverse()
            codeMapChildren.length = 0
            codeMapChildren.push(...leftChildren, ...rightChildren)
        }

        layoutNode.children = codeMapChildren.map(child => {
            const childLayout = layout(child, depth + 1, areaMetric, margin, xOffset, sortingOption, floorLabelsEnabled, size)
            xOffset += childLayout.width + margin
            return childLayout
        })

        layoutNode.width = layoutNode.children.reduce((currentWidth, child) => currentWidth + child.width + margin, -margin) //+ 2 * margin
        /*layoutNode.length = layoutNode.children.reduce(
            (maxLength, child) => (maxLength < child.length + labelLength + margin ? child.length + labelLength + margin : maxLength),
            labelLength
        )*/
        layoutNode.length = labelLength + size / 100
    } else {
        layoutNode.width = map.attributes[areaMetric]
        layoutNode.length = labelLength + size / 100
    }

    layoutNode.relativeY = labelLength + size / 100
    layoutNode.relativeX = relativeX

    return layoutNode
}
