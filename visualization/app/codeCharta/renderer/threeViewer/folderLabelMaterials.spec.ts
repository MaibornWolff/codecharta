import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from "three"
import { FolderLabelMaterials } from "./folderLabelMaterials"
import { CODE_MAP_BUILDING } from "./rendering/codeMapBuilding.mocks"

const SELECTED_HEX = "#00FF00"
const SELECTED_COLOR = 0x00_ff_00
const HIGHLIGHTED_COLOR = 0xff_ff_ff
const NOT_HIGHLIGHTED_COLOR = 0x7a_77_77
const INITIAL_COLOR = 0x12_34_56

function materialOfNode(nodeId: number): MeshBasicMaterial {
    const material = new MeshBasicMaterial({ color: INITIAL_COLOR })
    material.userData.id = nodeId
    return material
}

function mapGeometryWith(materials: MeshBasicMaterial[]): Group {
    return new Group().add(new Mesh(new BoxGeometry(), materials))
}

describe("FolderLabelMaterials", () => {
    const selectedNodeId = CODE_MAP_BUILDING.node.id
    const highlightedNodeId = selectedNodeId + 1
    const otherNodeId = selectedNodeId + 2
    let selectedMaterial: MeshBasicMaterial
    let highlightedMaterial: MeshBasicMaterial
    let otherMaterial: MeshBasicMaterial
    let folderLabelMaterials: FolderLabelMaterials

    beforeEach(() => {
        selectedMaterial = materialOfNode(selectedNodeId)
        highlightedMaterial = materialOfNode(highlightedNodeId)
        otherMaterial = materialOfNode(otherNodeId)
        const mapGeometry = mapGeometryWith([selectedMaterial, highlightedMaterial, otherMaterial])
        folderLabelMaterials = new FolderLabelMaterials(() => mapGeometry)
        folderLabelMaterials.useSelectedColor(SELECTED_HEX)
    })

    it("should paint only the material of the selected node in the selected color", () => {
        // Act
        folderLabelMaterials.select(CODE_MAP_BUILDING)

        // Assert
        expect(selectedMaterial.color.getHex()).toBe(SELECTED_COLOR)
        expect(otherMaterial.color.getHex()).toBe(INITIAL_COLOR)
    })

    it("should paint every material but the selected one in the highlighted color on reset", () => {
        // Act
        folderLabelMaterials.reset(CODE_MAP_BUILDING)

        // Assert
        expect(selectedMaterial.color.getHex()).toBe(INITIAL_COLOR)
        expect(highlightedMaterial.color.getHex()).toBe(HIGHLIGHTED_COLOR)
        expect(otherMaterial.color.getHex()).toBe(HIGHLIGHTED_COLOR)
    })

    it("should paint every material in the highlighted color on reset without a selection", () => {
        // Act
        folderLabelMaterials.reset(null)

        // Assert
        expect(selectedMaterial.color.getHex()).toBe(HIGHLIGHTED_COLOR)
    })

    it("should paint the selected, highlighted and remaining materials in their own colors", () => {
        // Act
        folderLabelMaterials.highlight(CODE_MAP_BUILDING, nodeId => nodeId === highlightedNodeId)

        // Assert
        expect(selectedMaterial.color.getHex()).toBe(SELECTED_COLOR)
        expect(highlightedMaterial.color.getHex()).toBe(HIGHLIGHTED_COLOR)
        expect(otherMaterial.color.getHex()).toBe(NOT_HIGHLIGHTED_COLOR)
    })

    it("should paint nothing when the map holds no mesh", () => {
        // Arrange
        const emptyMaterials = new FolderLabelMaterials(() => new Group())

        // Act & Assert
        expect(() => emptyMaterials.highlight(null, () => true)).not.toThrow()
    })

    it("should paint nothing when the mesh has a single material", () => {
        // Arrange
        const singleMaterial = materialOfNode(selectedNodeId)
        const singleMaterialMap = new FolderLabelMaterials(() => new Group().add(new Mesh(new BoxGeometry(), singleMaterial)))

        // Act
        singleMaterialMap.reset(null)

        // Assert
        expect(singleMaterial.color.getHex()).toBe(INITIAL_COLOR)
    })
})
