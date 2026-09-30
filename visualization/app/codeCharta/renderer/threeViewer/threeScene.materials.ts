import { Group, Material } from "three"
import { ColorConverter } from "../../util/color/colorConverter"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"

// Hardcoded color values — no runtime theming system (CSS custom properties) exists in this project.
// These do not adapt to dark mode or theme changes.
const FOLDER_LABEL_COLOR_HIGHLIGHTED = ColorConverter.convertHexToNumber("#FFFFFF")
const FOLDER_LABEL_COLOR_NOT_HIGHLIGHTED = ColorConverter.convertHexToNumber("#7A7777")

export class ThreeSceneMaterials {
    private selectionColor: number

    constructor(private readonly mapGeometry: Group) {}

    setSelectionColor(hexColor: string) {
        this.selectionColor = ColorConverter.convertHexToNumber(hexColor)
    }

    paintSelected(selected: CodeMapBuilding) {
        const selectedMaterial = this.getMapMaterials()?.find(({ userData }) => userData.id === selected.node.id)
        selectedMaterial?.["color"].setHex(this.selectionColor)
    }

    reset(selected: CodeMapBuilding | null) {
        const materials = this.getMapMaterials()
        if (!materials) {
            return
        }
        const selectedId = selected ? selected.node.id : -1
        for (const material of materials) {
            if (material.userData.id !== selectedId) {
                material["color"]?.setHex(FOLDER_LABEL_COLOR_HIGHLIGHTED)
            }
        }
    }

    highlight(selected: CodeMapBuilding | null, highlightedNodeIds: Set<number>, constantHighlight: Map<number, CodeMapBuilding>) {
        const materials = this.getMapMaterials()
        if (!materials) {
            return
        }
        const constantHighlightedNodeIds = new Set<number>([...constantHighlight.values()].map(({ node }) => node.id))
        for (const material of materials) {
            const materialNodeId = material.userData.id
            if (selected && materialNodeId === selected.node.id) {
                material["color"].setHex(this.selectionColor)
            } else if (highlightedNodeIds.has(materialNodeId) || constantHighlightedNodeIds.has(materialNodeId)) {
                material["color"].setHex(FOLDER_LABEL_COLOR_HIGHLIGHTED)
            } else {
                material["color"]?.setHex(FOLDER_LABEL_COLOR_NOT_HIGHLIGHTED)
            }
        }
    }

    private getMapMaterials(): Material[] | null {
        const child = this.mapGeometry.children[0]
        if (!child) {
            return null
        }
        const material = (child as unknown as { material: unknown }).material
        return Array.isArray(material) ? (material as Material[]) : null
    }
}
