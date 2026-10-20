import { Group, Material } from "three"
import { ColorConverter } from "../../util/color/colorConverter"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"

export class FolderLabelMaterials {
    // Hardcoded color values — no runtime theming system (CSS custom properties) exists in this project.
    // These do not adapt to dark mode or theme changes.
    private readonly highlightedColor = ColorConverter.convertHexToNumber("#FFFFFF")
    private readonly notHighlightedColor = ColorConverter.convertHexToNumber("#7A7777")
    private selectedColor: number

    constructor(private readonly mapGeometryOf: () => Group) {}

    useSelectedColor(hexColor: string) {
        this.selectedColor = ColorConverter.convertHexToNumber(hexColor)
    }

    select(selected: CodeMapBuilding) {
        const selectedMaterial = this.materials()?.find(({ userData }) => userData.id === selected.node.id)
        selectedMaterial?.["color"].setHex(this.selectedColor)
    }

    reset(selected: CodeMapBuilding | null) {
        const selectedId = selected ? selected.node.id : -1
        for (const material of this.materials() ?? []) {
            if (material.userData.id !== selectedId) {
                material["color"]?.setHex(this.highlightedColor)
            }
        }
    }

    highlight(selected: CodeMapBuilding | null, isHighlighted: (nodeId: number) => boolean) {
        for (const material of this.materials() ?? []) {
            const materialNodeId = material.userData.id
            if (selected && materialNodeId === selected.node.id) {
                material["color"].setHex(this.selectedColor)
            } else if (isHighlighted(materialNodeId)) {
                material["color"].setHex(this.highlightedColor)
            } else {
                material["color"]?.setHex(this.notHighlightedColor)
            }
        }
    }

    private materials(): Material[] | null {
        const child = this.mapGeometryOf().children[0]
        if (!child) {
            return null
        }
        const material = (child as unknown as { material: unknown }).material
        return Array.isArray(material) ? (material as Material[]) : null
    }
}
