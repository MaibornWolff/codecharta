import { Group, Mesh, MeshBasicMaterial } from "three"
import { CODE_MAP_BUILDING, CODE_MAP_BUILDING_TS_NODE } from "./rendering/codeMapBuilding.mocks"
import { ThreeSceneMaterials } from "./threeScene.materials"

const SELECTION_COLOR = "#EB8319"
const HIGHLIGHTED_COLOR = 0xff_ff_ff
const NOT_HIGHLIGHTED_COLOR = 0x7a_77_77
const UNRELATED_NODE_ID = 4711
const HOVERED_NODE_ID = 4712

describe("ThreeSceneMaterials", () => {
    let mapGeometry: Group
    let materials: ThreeSceneMaterials

    beforeEach(() => {
        mapGeometry = new Group()
        materials = new ThreeSceneMaterials(mapGeometry)
        materials.setSelectionColor(SELECTION_COLOR)
    })

    function withMaterialsFor(...nodeIds: number[]) {
        const meshMaterials = nodeIds.map(nodeId => {
            const material = new MeshBasicMaterial({ color: 0x00_00_00 })
            material.userData.id = nodeId
            return material
        })
        mapGeometry.add(new Mesh(undefined, meshMaterials))
        return meshMaterials
    }

    describe("paintSelected", () => {
        it("should paint the material of the selected building in the selection color", () => {
            // Arrange
            const [selectedMaterial, otherMaterial] = withMaterialsFor(CODE_MAP_BUILDING.node.id, UNRELATED_NODE_ID)

            // Act
            materials.paintSelected(CODE_MAP_BUILDING)

            // Assert
            expect(selectedMaterial.color.getHexString()).toBe("eb8319")
            expect(otherMaterial.color.getHex()).toBe(0)
        })

        it("should not fail when the map has no materials", () => {
            // Act
            const paint = () => materials.paintSelected(CODE_MAP_BUILDING)

            // Assert
            expect(paint).not.toThrow()
        })
    })

    describe("reset", () => {
        it("should paint every material but the selected one in the highlighted color", () => {
            // Arrange
            const [selectedMaterial, otherMaterial] = withMaterialsFor(CODE_MAP_BUILDING.node.id, UNRELATED_NODE_ID)

            // Act
            materials.reset(CODE_MAP_BUILDING)

            // Assert
            expect(selectedMaterial.color.getHex()).toBe(0)
            expect(otherMaterial.color.getHex()).toBe(HIGHLIGHTED_COLOR)
        })

        it("should paint every material in the highlighted color when nothing is selected", () => {
            // Arrange
            const [material] = withMaterialsFor(CODE_MAP_BUILDING.node.id)

            // Act
            materials.reset(null)

            // Assert
            expect(material.color.getHex()).toBe(HIGHLIGHTED_COLOR)
        })

        it("should ignore a map whose mesh carries a single material", () => {
            // Arrange
            const material = new MeshBasicMaterial({ color: 0x00_00_00 })
            mapGeometry.add(new Mesh(undefined, material))

            // Act
            materials.reset(null)

            // Assert
            expect(material.color.getHex()).toBe(0)
        })
    })

    describe("highlight", () => {
        it("should paint selected, highlighted, kept and other materials in their colors", () => {
            // Arrange
            const [selectedMaterial, hoveredMaterial, keptMaterial, otherMaterial] = withMaterialsFor(
                CODE_MAP_BUILDING.node.id,
                HOVERED_NODE_ID,
                CODE_MAP_BUILDING_TS_NODE.node.id,
                UNRELATED_NODE_ID
            )
            const keptHighlight = new Map([[CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE]])

            // Act
            materials.highlight(CODE_MAP_BUILDING, new Set([HOVERED_NODE_ID]), keptHighlight)

            // Assert
            expect(selectedMaterial.color.getHexString()).toBe("eb8319")
            expect(hoveredMaterial.color.getHex()).toBe(HIGHLIGHTED_COLOR)
            expect(keptMaterial.color.getHex()).toBe(HIGHLIGHTED_COLOR)
            expect(otherMaterial.color.getHex()).toBe(NOT_HIGHLIGHTED_COLOR)
        })

        it("should not fail when the map has no materials", () => {
            // Act
            const highlight = () => materials.highlight(null, new Set(), new Map())

            // Assert
            expect(highlight).not.toThrow()
        })
    })
})
